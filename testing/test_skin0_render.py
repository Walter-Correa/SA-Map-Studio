import os
import sys
import time
import json
import base64
import asyncio
import subprocess
import urllib.request
import websockets

class CDP:
    def __init__(self, ws_url):
        self.ws_url = ws_url
        self.ws = None
        self._id = 0

    async def connect(self):
        self.ws = await websockets.connect(self.ws_url, max_size=50 * 1024 * 1024)

    async def send(self, method, params=None):
        self._id += 1
        msg_id = self._id
        payload = {"id": msg_id, "method": method, "params": params or {}}
        await self.ws.send(json.dumps(payload))
        while True:
            resp = json.loads(await self.ws.recv())
            if resp.get("id") == msg_id:
                if "error" in resp:
                    raise RuntimeError(resp["error"])
                return resp.get("result", {})

    async def eval(self, expr):
        res = await self.send("Runtime.evaluate", {
            "expression": expr,
            "returnByValue": True,
            "awaitPromise": True
        })
        val = res.get("result", {})
        return val.get("value")

    async def screenshot(self, path):
        res = await self.send("Page.captureScreenshot", {"format": "png"})
        data = base64.b64decode(res["data"])
        with open(path, "wb") as f:
            f.write(data)
        print(f"Screenshot saved to {path} ({len(data)} bytes)")

async def run():
    print("Starting serve.py on port 8788...")
    ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    server = subprocess.Popen(
        [os.path.join(ROOT_DIR, "compile-sources", ".venv-build", "Scripts", "python.exe"), "serve.py", "--no-browser", "--port", "8788"],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        cwd=ROOT_DIR
    )

    chrome = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
    artifact_dir = r"C:\Users\Walter\.gemini\antigravity\brain\4cd19909-7d31-4065-8fd1-7f123de41715"
    out_png = os.path.join(artifact_dir, "test_r11_skin0_cj_ped.png")
    chrome_proc = None

    try:
        for _ in range(15):
            try:
                with urllib.request.urlopen("http://127.0.0.1:8788/api/test_info", timeout=1) as r:
                    if r.status == 200:
                        print("Server is up!")
                        break
            except Exception:
                await asyncio.sleep(1)

        print("Launching Chrome...")
        chrome_proc = subprocess.Popen([
            chrome,
            "--headless=new",
            "--remote-debugging-port=9223",
            "--window-size=1600,1000",
            "--enable-webgl",
            "--ignore-gpu-blocklist",
            "http://127.0.0.1:8788"
        ])

        await asyncio.sleep(4)

        with urllib.request.urlopen("http://127.0.0.1:9223/json", timeout=5) as r:
            tabs = json.loads(r.read().decode())
            ws_url = tabs[0]["webSocketDebuggerUrl"]

        cdp = CDP(ws_url)
        await cdp.connect()

        # Wait for app ready
        print("Waiting for app.ready...")
        for _ in range(30):
            ready = await cdp.eval("Boolean(window.app && window.app.ready)")
            if ready:
                break
            await asyncio.sleep(1)

        print("App is ready! Inspecting Skin 0...")
        info = await cdp.eval("""
            (async () => {
                // Ensure an actor with skin 0 is in the scene
                const app = window.app;
                let actor = app.project.actors.find(a => a.skin === 0);
                if (!actor) {
                    actor = app.createActor({ skin: 0, x: 2491, y: -1670, z: 13.5, angle: 0 });
                }
                app.select(actor);
                
                // Position camera right in front of CJ at chest height
                app.vp.fly.setPose(new THREE.Vector3(2491, -1672.8, 14.2), 0, -0.05);
                app.vp.requestRender();
                await new Promise(r => setTimeout(r, 1500));
                
                // Check actor 3D object details
                const node = app.nodes?.get(actor);
                let matDetails = [];
                if (node) {
                    node.traverse(child => {
                        if (child.isMesh) {
                            const mats = Array.isArray(child.material) ? child.material : [child.material];
                            for (const m of mats) {
                                matDetails.push({
                                    type: m.type,
                                    hasMap: Boolean(m.map),
                                    transparent: m.transparent,
                                    vertexColors: m.vertexColors
                                });
                            }
                        }
                    });
                }
                
                return {
                    actorId: actor.id,
                    skin: actor.skin,
                    cameraPos: [app.vp.camera.position.x, app.vp.camera.position.y, app.vp.camera.position.z],
                    materials: matDetails
                };
            })()
        """)
        print("Actor 0 Scene Info:", json.dumps(info, indent=2))

        await asyncio.sleep(1)
        await cdp.screenshot(out_png)

    finally:
        if chrome_proc:
            chrome_proc.terminate()
        if server:
            server.terminate()

if __name__ == "__main__":
    asyncio.run(run())
