// Viewport 3D: renderer, cena, céu, água e câmera livre estilo editor.
import * as THREE from 'three';

THREE.Object3D.DEFAULT_UP.set(0, 0, 1);
THREE.ColorManagement.enabled = false;

const MOVE_KEYS = new Set(['KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyQ', 'KeyE', 'Space', 'KeyC',
  'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ShiftLeft', 'ShiftRight', 'AltLeft']);
const SKY_TOP = new THREE.Color(0x6f9fd0);
const SKY_HORIZON = new THREE.Color(0xd8c9a8);

export class FlyCamera {
  constructor(camera, dom) {
    this.camera = camera;
    this.dom = dom;
    this.yaw = 0; this.pitch = -0.2;
    this.speed = 25;           // unidades por segundo
    this.keys = new Set();
    this.looking = false;
    this.panning = false;
    this.enabled = true;
    this.onMove = null;
    this.onActivity = null;
    this._movingState = false;
    this._stopTimer = null;

    this.updateCursorVisibility = () => {
      const shouldHide = this.looking || this.panning || (this.keys.size > 0 && this._movingState);
      if (shouldHide) {
        document.body.classList.add('cursor-hidden');
        if (this.dom) this.dom.style.cursor = 'none';
      } else {
        document.body.classList.remove('cursor-hidden');
        if (this.dom) this.dom.style.cursor = '';
      }
    };

    const setMoving = (active) => {
      if (active) {
        if (this._stopTimer) { clearTimeout(this._stopTimer); this._stopTimer = null; }
        if (!this._movingState) {
          this._movingState = true;
          this.onActivity?.(true);
        }
        this.updateCursorVisibility();
      } else {
        if (this.looking || this.panning || this.keys.size > 0) return;
        if (this._stopTimer) clearTimeout(this._stopTimer);
        this._stopTimer = setTimeout(() => {
          this._stopTimer = null;
          if (!this.looking && !this.panning && this.keys.size === 0) {
            this._movingState = false;
            this.onActivity?.(false);
            this.updateCursorVisibility();
          }
        }, 180);
      }
    };
    this.notifyActivity = setMoving;

    const kd = (e) => {
      if (!this.enabled || isTyping(e)) return;
      if (e.ctrlKey || e.metaKey) return;
      const k = e.code;
      if (MOVE_KEYS.has(k)) {
        this.keys.add(k);
        setMoving(true);
        this.updateCursorVisibility();
        if (k === 'Space' || k.startsWith('Arrow') || k === 'AltLeft') e.preventDefault();
      }
    };
    const ku = (e) => {
      this.keys.delete(e.code);
      setMoving(false);
      this.updateCursorVisibility();
    };
    window.addEventListener('keydown', kd);
    window.addEventListener('keyup', ku);
    window.addEventListener('blur', () => {
      this.keys.clear();
      this.looking = false;
      this.panning = false;
      if (document.exitPointerLock && document.pointerLockElement === dom) {
        try { document.exitPointerLock(); } catch (_) {}
      }
      this.updateCursorVisibility();
      setMoving(false);
    });
    window.addEventListener('mouseup', () => {
      if (this.looking || this.panning) {
        this.looking = false;
        this.panning = false;
        if (document.exitPointerLock && document.pointerLockElement === dom) {
          try { document.exitPointerLock(); } catch (_) {}
        }
        this.centerCursor();
        setMoving(false);
        this.updateCursorVisibility();
      }
    });
    document.addEventListener('pointerlockchange', () => {
      const isLocked = document.pointerLockElement === dom;
      if (!isLocked && this.looking) {
        this.looking = false;
        setMoving(false);
        this.updateCursorVisibility();
      }
    });
    dom.addEventListener('contextmenu', e => e.preventDefault());
    dom.addEventListener('pointerdown', (e) => {
      if (!this.enabled) return;
      if (e.button === 2) {
        this.looking = true;
        this.lastX = e.clientX;
        this.lastY = e.clientY;
        this._lockedInitial = true;
        if (dom.requestPointerLock) {
          try {
            const p = dom.requestPointerLock();
            if (p && p.catch) p.catch(() => {
              try { dom.setPointerCapture(e.pointerId); } catch (_) {}
            });
          } catch (_) {
            try { dom.setPointerCapture(e.pointerId); } catch (_) {}
          }
        } else {
          try { dom.setPointerCapture(e.pointerId); } catch (_) {}
        }
        setMoving(true);
        this.updateCursorVisibility();
      }
      if (e.button === 1) {
        this.panning = true;
        this.lastX = e.clientX;
        this.lastY = e.clientY;
        try { dom.setPointerCapture(e.pointerId); } catch (_) {}
        e.preventDefault();
        setMoving(true);
        this.updateCursorVisibility();
      }
    });
    dom.addEventListener('pointerup', (e) => {
      if (e.button === 2) {
        this.looking = false;
        if (document.exitPointerLock && document.pointerLockElement === dom) {
          try { document.exitPointerLock(); } catch (_) {}
        }
        try { dom.releasePointerCapture(e.pointerId); } catch (_) {}
        this.centerCursor();
        setMoving(false);
        this.updateCursorVisibility();
      }
      if (e.button === 1) {
        this.panning = false;
        try { dom.releasePointerCapture(e.pointerId); } catch (_) {}
        this.centerCursor();
        setMoving(false);
        this.updateCursorVisibility();
      }
    });
    dom.addEventListener('pointercancel', (e) => {
      if (this.looking || this.panning) {
        this.looking = false;
        this.panning = false;
        if (document.exitPointerLock && document.pointerLockElement === dom) {
          try { document.exitPointerLock(); } catch (_) {}
        }
        try { dom.releasePointerCapture(e.pointerId); } catch (_) {}
        this.centerCursor();
        setMoving(false);
        this.updateCursorVisibility();
      }
    });
    dom.addEventListener('pointermove', (e) => {
      let dx = 0;
      let dy = 0;
      const isLocked = document.pointerLockElement === dom;
      if (isLocked) {
        dx = e.movementX || 0;
        dy = e.movementY || 0;
        if (this._lockedInitial && (Math.abs(dx) > 200 || Math.abs(dy) > 200)) {
          dx = 0;
          dy = 0;
        }
        this._lockedInitial = false;
      } else {
        dx = (e.movementX !== undefined && e.movementX !== 0) ? e.movementX : (this.lastX !== undefined ? e.clientX - this.lastX : 0);
        dy = (e.movementY !== undefined && e.movementY !== 0) ? e.movementY : (this.lastY !== undefined ? e.clientY - this.lastY : 0);
      }
      this.lastX = e.clientX;
      this.lastY = e.clientY;

      if (this.looking) {
        this.yaw -= dx * 0.0035;
        this.pitch = Math.max(-1.55, Math.min(1.55, this.pitch - dy * 0.0035));
        this.apply();
      } else if (this.panning) {
        const right = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 0);
        const up = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 1);
        const s = this.speed * 0.01;
        camera.position.addScaledVector(right, -dx * s).addScaledVector(up, dy * s);
        this.onMove?.();
      }
    });
    dom.addEventListener('wheel', (e) => {
      if (!this.enabled) return;
      e.preventDefault();
      setMoving(true);
      if (this.looking) {
        this.speed = Math.max(2, Math.min(800, this.speed * (e.deltaY < 0 ? 1.2 : 1 / 1.2)));
        this.onSpeed?.(this.speed);
        setMoving(false);
        return;
      }
      const dir = new THREE.Vector3(); camera.getWorldDirection(dir);
      camera.position.addScaledVector(dir, (e.deltaY < 0 ? 1 : -1) * Math.max(2, this.speed * 0.25));
      this.onMove?.();
      setMoving(false);
    }, { passive: false });
    this.apply();
  }

  centerCursor() {
    const appLeft = window.screenX !== undefined ? window.screenX : (window.screenLeft || 0);
    const appTop = window.screenY !== undefined ? window.screenY : (window.screenTop || 0);
    const appW = window.outerWidth || window.innerWidth || 1200;
    const appH = window.outerHeight || window.innerHeight || 800;
    const sx = Math.round(appLeft + appW / 2);
    const sy = Math.round(appTop + appH / 2);
    try {
      fetch('/api/center_mouse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ x: sx, y: sy }),
      }).catch(() => {});
    } catch (_) {}
  }

  direction(out = new THREE.Vector3()) {
    return out.set(Math.cos(this.pitch) * Math.cos(this.yaw), Math.cos(this.pitch) * Math.sin(this.yaw), Math.sin(this.pitch));
  }

  apply() {
    const target = this.camera.position.clone().add(this.direction());
    this.camera.up.set(0, 0, 1);
    this.camera.lookAt(target);
    this.camera.updateMatrixWorld();
  }

  lookAt(point) {
    const d = new THREE.Vector3().subVectors(point, this.camera.position);
    if (d.lengthSq() < 1e-6) return;
    d.normalize();
    this.yaw = Math.atan2(d.y, d.x);
    this.pitch = Math.asin(Math.max(-1, Math.min(1, d.z)));
    this.apply();
  }

  setPose(pos, yaw, pitch) {
    this.camera.position.copy(pos);
    this.yaw = yaw; this.pitch = pitch;
    this.apply();
  }

  update(dt) {
    if (!this.enabled || !this.keys.size) return false;
    const k = this.keys;
    let mult = 1;
    if (k.has('ShiftLeft') || k.has('ShiftRight')) mult = 4;
    if (k.has('AltLeft')) mult = 0.25;
    const fwd = this.direction();
    const right = new THREE.Vector3(Math.sin(this.yaw), -Math.cos(this.yaw), 0);
    const v = new THREE.Vector3();
    if (k.has('KeyW') || k.has('ArrowUp')) v.add(fwd);
    if (k.has('KeyS') || k.has('ArrowDown')) v.sub(fwd);
    if (k.has('KeyD') || k.has('ArrowRight')) v.add(right);
    if (k.has('KeyA') || k.has('ArrowLeft')) v.sub(right);
    if (k.has('KeyE') || k.has('Space')) v.z += 1;
    if (k.has('KeyQ') || k.has('KeyC')) v.z -= 1;
    if (v.lengthSq() === 0) return false;
    v.normalize().multiplyScalar(this.speed * mult * dt);
    this.camera.position.add(v);
    this.camera.updateMatrixWorld();
    this.onMove?.();
    return true;
  }
}

export function isTyping(e) {
  const t = e.target;
  return t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable);
}

export class Viewport {
  constructor(container) {
    this.container = container;
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance', preserveDrawingBuffer: false });
    renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.0));
    container.appendChild(renderer.domElement);
    this.renderer = renderer;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(65, 1, 0.3, 6000);
    this.camera.position.set(2495, -1700, 30);
    this.scene.add(this.camera);
    this.setupSky();
    this.hemiLight = new THREE.HemisphereLight(0xfff4e0, 0x8a8880, 2.0);
    this.hemiLight.position.set(0, 0, 1);
    this.scene.add(this.hemiLight);
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    this.scene.add(this.ambientLight);
    this.sun = new THREE.DirectionalLight(0xffffff, 0.95);
    this.sun.position.set(40, -60, 100);
    this.scene.add(this.sun);
    this.fly = new FlyCamera(this.camera, renderer.domElement);
    this.fly.setPose(new THREE.Vector3(2510, -1720, 40), Math.PI * 0.6, -0.35);
    this.frameCallbacks = [];
    this.timer = new THREE.Timer();
    this.timer.connect(document);
    this.fps = 0; this._fpsT = 0; this._fpsN = 0;
    this.renderRequested = true;
    new ResizeObserver(() => this.resize()).observe(container);
    this.resize();

    let lastRenderTime = 0;
    const loop = (timestamp) => {
      requestAnimationFrame(loop);

      // Controle dinâmico de taxa de quadros (FPS) para economia inteligente de CPU:
      const isHidden = document.hidden;
      const isModalOpen = Boolean(document.querySelector('dialog.open, dialog[open]'));
      const isCameraActive = this.fly?._movingState || this.fly?.looking || this.fly?.panning || (this.fly?.keys?.size > 0);
      const isInteracting = isCameraActive || this.renderRequested;

      let targetFps = 60; // Limite padrão de 60 FPS (fluido e suave, eliminando desperdício de 144Hz/240Hz)
      if (isHidden) {
        targetFps = 2; // Aba oculta ou minimizado: 2 FPS (quase 0% CPU)
      } else if (isModalOpen) {
        targetFps = 5; // Modais abertos (TextDraws, GangZones, etc): 5 FPS
      } else if (!isInteracting) {
        targetFps = 30; // Ocioso (sem mover a câmera): 30 FPS (animação de pickups perfeita com CPU baixíssimo)
      }

      const minInterval = 1000 / targetFps;
      const elapsed = timestamp - lastRenderTime;
      if (elapsed < minInterval) return;

      lastRenderTime = timestamp - (elapsed % minInterval);

      this.timer.update();
      const dt = Math.min(0.1, this.timer.getDelta());
      for (const cb of this.frameCallbacks) cb(dt);
      this.fly.update(dt);
      this.renderer.render(this.scene, this.camera);
      this._fpsT += dt; this._fpsN++;
      if (this._fpsT >= 0.5) { this.fps = Math.round(this._fpsN / this._fpsT); this._fpsT = 0; this._fpsN = 0; }
      this.renderRequested = false;
    };
    requestAnimationFrame(loop);
  }

  requestRender() {
    this.renderRequested = true;
  }

  setupSky() {
    // Degradê do céu como fundo (cor do horizonte também é a cor da névoa)
    const c = document.createElement('canvas'); c.width = 2; c.height = 256;
    const g = c.getContext('2d');
    this.skyCanvas = c;
    this.skyContext = g;
    const grad = g.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, '#' + SKY_TOP.getHexString());
    grad.addColorStop(0.62, '#a9c2d9');
    grad.addColorStop(1, '#' + SKY_HORIZON.getHexString());
    g.fillStyle = grad; g.fillRect(0, 0, 2, 256);
    this.skyTexture = new THREE.CanvasTexture(c);
    this.scene.background = this.skyTexture;
    this.scene.fog = new THREE.Fog(0xc7c6b8, 400, 2400);
    this._baseFogFar = 2400;
  }

  setFogDistance(far) {
    this._baseFogFar = Math.max(3000, far * 1.25);
    this.scene.fog.near = far * 0.45;
    this.scene.fog.far = this._baseFogFar;
    this.camera.far = Math.max(4000, far * 1.6);
    this.camera.updateProjectionMatrix();
  }

  setEnvironment(weatherId = 10, hour = 10, minute = 0, isInteriors = false) {
    if (isInteriors) {
      this.scene.background = new THREE.Color(0x0a0a0a);
      this.scene.fog.color.setHex(0x0a0a0a);
      this.hemiLight.color.setHex(0xffffff);
      this.hemiLight.groundColor.setHex(0x808080);
      this.hemiLight.intensity = 2.0;
      if (this.ambientLight) this.ambientLight.intensity = 1.0;
      this.sun.intensity = 0.6;
      this.sun.position.set(0, 0, 100);
      return;
    }

    this.scene.background = this.skyTexture;
    const time = hour + minute / 60.0;
    const w = Math.max(0, Math.min(45, weatherId | 0));

    // Ângulo do sol: 6h = Leste (+X), 12h = Zênite (+Z), 18h = Oeste (-X)
    const rad = ((time - 6) / 12) * Math.PI;
    const isDay = time >= 5.5 && time <= 19.5;
    const isDawn = time >= 4.8 && time < 6.8;
    const isDusk = time >= 18.0 && time < 20.5;
    const isNight = time < 4.8 || time >= 21.0;

    let sunX = -Math.cos(rad);
    let sunY = 0.3 * Math.sin(rad * 2);
    let sunZ = Math.sin(rad);

    if (!isDay) {
      // Posiciona a lua suave à noite
      sunZ = Math.max(0.3, -sunZ * 0.8);
      sunX = -sunX;
    }
    this.sun.position.set(sunX * 60, sunY * 60, Math.max(30, sunZ * 80));

    // Condições de clima do SA-MP (0 a 45)
    const isRain = w === 8 || w === 16 || w === 33;
    const isFog = w === 4 || w === 9 || w === 20 || w === 44;
    const isSand = w === 19;
    const isOvercast = w === 3 || w === 21;

    let topColor, midColor, horizColor, hemiSky, hemiGround, sunColor, hemiInt, sunInt, ambientInt;

    if (isNight) {
      topColor = '#080d1a';
      midColor = '#0f172a';
      horizColor = '#1e293b';
      hemiSky = 0x64748b;
      hemiGround = 0x334155;
      sunColor = 0xa5b4fc;
      hemiInt = 1.4;
      sunInt = 0.6;
      ambientInt = 0.75;
    } else if (isDawn) {
      topColor = '#2b3a67';
      midColor = '#8d5b4c';
      horizColor = '#e28743';
      hemiSky = 0xf4a261;
      hemiGround = 0x6b5b52;
      sunColor = 0xffb703;
      hemiInt = 1.8;
      sunInt = 0.95;
      ambientInt = 0.85;
    } else if (isDusk) {
      topColor = '#1f2041';
      midColor = '#69306d';
      horizColor = '#e0533c';
      hemiSky = 0xf26419;
      hemiGround = 0x5a485a;
      sunColor = 0xf3722c;
      hemiInt = 1.8;
      sunInt = 0.95;
      ambientInt = 0.85;
    } else if (isRain) {
      topColor = '#33373d';
      midColor = '#4a5059';
      horizColor = '#606770';
      hemiSky = 0x9ca3af;
      hemiGround = 0x6b7280;
      sunColor = 0xd1d5db;
      hemiInt = 1.7;
      sunInt = 0.7;
      ambientInt = 0.85;
    } else if (isFog) {
      if (w === 44) {
        topColor = '#3b4d3c'; midColor = '#506652'; horizColor = '#708a73';
        hemiSky = 0x86efac; hemiGround = 0x4d5a4e; sunColor = 0xbbf7d0;
      } else {
        topColor = '#5b6169'; midColor = '#787f88'; horizColor = '#9aa0a6';
        hemiSky = 0xd1d5db; hemiGround = 0x6b7280; sunColor = 0xe5e7eb;
      }
      hemiInt = 1.8;
      sunInt = 0.7;
      ambientInt = 0.85;
    } else if (isSand) {
      topColor = '#8c6239';
      midColor = '#b3824b';
      horizColor = '#cca066';
      hemiSky = 0xfde047;
      hemiGround = 0x78552b;
      sunColor = 0xfef08a;
      hemiInt = 1.8;
      sunInt = 0.8;
      ambientInt = 0.85;
    } else if (isOvercast) {
      topColor = '#5c6b77';
      midColor = '#7c8d99';
      horizColor = '#a8b6bf';
      hemiSky = 0xcbd5e1;
      hemiGround = 0x64748b;
      sunColor = 0xf1f5f9;
      hemiInt = 1.9;
      sunInt = 0.85;
      ambientInt = 0.85;
    } else {
      // Dia claro / ensolarado
      topColor = '#4a8fe7';
      midColor = '#8dc0f2';
      horizColor = '#d9e7f8';
      hemiSky = 0xfff4e0;
      hemiGround = 0x8a8880;
      sunColor = 0xffffff;
      hemiInt = 2.0;
      sunInt = 1.0;
      ambientInt = 0.95;
    }

    if (this.skyContext) {
      const g = this.skyContext;
      const grad = g.createLinearGradient(0, 0, 0, 256);
      grad.addColorStop(0, topColor);
      grad.addColorStop(0.55, midColor);
      grad.addColorStop(1, horizColor);
      g.fillStyle = grad;
      g.fillRect(0, 0, 2, 256);
      this.skyTexture.needsUpdate = true;
    }

    const cHoriz = new THREE.Color(horizColor);
    this.scene.fog.color.copy(cHoriz);

    const baseFar = this._baseFogFar || 2400;
    if (isFog) {
      this.scene.fog.near = 10;
      this.scene.fog.far = Math.min(baseFar, 450);
    } else if (isRain || isSand) {
      this.scene.fog.near = 30;
      this.scene.fog.far = Math.min(baseFar, 800);
    } else {
      this.scene.fog.near = baseFar * 0.35;
      this.scene.fog.far = baseFar;
    }

    this.hemiLight.color.setHex(hemiSky);
    this.hemiLight.groundColor.setHex(hemiGround);
    this.hemiLight.intensity = hemiInt;
    this.hemiLight.position.set(0, 0, 1);

    this.sun.color.setHex(sunColor);
    this.sun.intensity = sunInt;

    if (this.ambientLight) {
      this.ambientLight.intensity = ambientInt;
    }
  }

  resize() {
    const w = this.container.clientWidth, h = this.container.clientHeight;
    if (!w || !h) return;
    this.renderer.setSize(w, h);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  onFrame(cb) { this.frameCallbacks.push(cb); }

  ndc(e) {
    const r = this.renderer.domElement.getBoundingClientRect();
    return new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  }

  raycast(ndc, objects, far = Math.max(4000, this.camera.far)) {
    const rc = new THREE.Raycaster();
    rc.setFromCamera(ndc, this.camera);
    rc.far = far;
    const hits = rc.intersectObjects(objects, true);
    return hits.find(h => h.object.visible && !h.object.userData.noPick) || null;
  }
}

// Água do water.dat (quadriláteros e triângulos)
export function buildWater(text) {
  const pos = [];
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || /^[a-z]/i.test(line)) continue;
    const n = line.split(/\s+/).map(Number).filter(v => Number.isFinite(v));
    if (n.length >= 29) {
      const v = [0, 1, 2, 3].map(i => [n[i * 7], n[i * 7 + 1], n[i * 7 + 2]]);
      pos.push(...v[0], ...v[1], ...v[2], ...v[1], ...v[3], ...v[2]);
    } else if (n.length >= 22) {
      const v = [0, 1, 2].map(i => [n[i * 7], n[i * 7 + 1], n[i * 7 + 2]]);
      pos.push(...v[0], ...v[1], ...v[2]);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  const mat = new THREE.MeshBasicMaterial({ color: 0x3f6f86, transparent: true, opacity: 0.72, side: THREE.DoubleSide, depthWrite: false });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.name = 'agua';
  mesh.renderOrder = 2;
  mesh.userData.noPick = true;
  return mesh;
}
