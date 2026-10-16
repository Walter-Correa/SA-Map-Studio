import asyncio
import json
import os
import shutil
import subprocess
import sys
import urllib.request
import websockets
import base64

OUT_DIR = r"C:\Users\Walter\.gemini\antigravity\brain\4cd19909-7d31-4065-8fd1-7f123de41715"
PORT = 8777
CDP_PORT = 9265

class CDP:
    def __init__(self, ws):
        self.ws = ws
        self.msg_id = 0

    async def call(self, method, **params):
        self.msg_id += 1
        mid = self.msg_id
        await self.ws.send(json.dumps({"id": mid, "method": method, "params": params}))
        while True:
            raw = await self.ws.recv()
            data = json.loads(raw)
            if data.get("id") == mid:
                if "error" in data:
                    raise RuntimeError(f"CDP error in {method}: {data['error']}")
                return data.get("result", {})

    async def eval(self, expr, await_promise=True):
        res = await self.call(
            "Runtime.evaluate",
            expression=expr,
            returnByValue=True,
            awaitPromise=await_promise,
        )
        if "exceptionDetails" in res:
            raise RuntimeError(f"JS exception: {res['exceptionDetails']}")
        return res.get("result", {}).get("value")

    async def screenshot(self, filename):
        res = await self.call("Page.captureScreenshot", format="png")
        b64 = res["data"]
        path = os.path.join(OUT_DIR, filename)
        with open(path, "wb") as f:
            f.write(base64.b64decode(b64))
        print(f"Saved screenshot: {path}")
        return path

async def main():
    print("Starting serve.py on port 8777...")
    server = subprocess.Popen(
        [r".venv-build\Scripts\python.exe", "serve.py", "--no-browser", "--port", str(PORT)],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        cwd=r"d:\SERVIDOR GTA MULTIPLAYER\SA Map Studio\SA-Map-Studio"
    )

    browser = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
    profile_dir = os.path.join(OUT_DIR, "scratch", "chrome_profile_skin0")
    if os.path.exists(profile_dir):
        try: shutil.rmtree(profile_dir)
        except: pass
    os.makedirs(profile_dir, exist_ok=True)

    chrome_cmd = [
        browser,
        f"--remote-debugging-port={CDP_PORT}",
        f"--user-data-dir={profile_dir}",
        "--headless=new",
        "--window-size=1600,900",
        "--enable-webgl",
        "--ignore-gpu-blocklist",
        "--no-first-run",
        "--no-default-browser-check",
        "--disk-cache-size=0",
        f"http://127.0.0.1:{PORT}/",
    ]

    chrome_proc = None
    try:
        # Wait for server
        for _ in range(15):
            try:
                with urllib.request.urlopen(f"http://127.0.0.1:{PORT}/api/test_info", timeout=1) as r:
                    if r.status == 200:
                        print("Server is up!")
                        break
            except Exception:
                await asyncio.sleep(1)

        print("Launching Chrome...")
        chrome_proc = subprocess.Popen(chrome_cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        await asyncio.sleep(3)

        req = urllib.request.urlopen(f"http://127.0.0.1:{CDP_PORT}/json")
        tabs = json.loads(req.read().decode())
        target_tab = next((t for t in tabs if t.get("type") == "page" and str(PORT) in t.get("url", "")), tabs[0])
        ws_url = target_tab["webSocketDebuggerUrl"]
        print(f"Connecting to tab: {target_tab.get('url')} ({ws_url})")

        async with websockets.connect(ws_url, max_size=50_000_000) as ws:
            cdp = CDP(ws)
            await cdp.call("Page.enable")
            await cdp.call("Runtime.enable")
            await cdp.call("Network.enable")
            await cdp.call("Network.clearBrowserCache")

            print("Waiting for SA Map Studio to boot...")
            for i in range(60):
                url = await cdp.eval("location.href")
                ready = await cdp.eval("Boolean(window.app && window.app.project)")
                if ready:
                    print(f"App ready after {i*0.5}s!")
                    break
                await asyncio.sleep(0.5)
            else:
                curr_url = await cdp.eval("location.href")
                app_defined = await cdp.eval("typeof window.app")
                raise RuntimeError(f"App timed out waiting to be ready! URL={curr_url}, typeof app={app_defined}")

            print("Configuring scene to view Skin 0...")
            info = await cdp.eval("""(async () => {
                const app = window.app;
                let actor = app.project.actors.find(a => a.skin === 0);
                if (!actor) {
                    const uids = app.project.addItems('Adicionar actor', [{ kind: 'actors', skin: 0, x: 2491.17, y: -1671.92, z: 13.36, rz: 0 }]);
                    actor = app.project.actors.find(a => a.uid === uids[0]);
                } else {
                    actor.x = 2491.17; actor.y = -1671.92; actor.z = 13.36; actor.rz = 180;
                    app.project.emit({ type: 'transact', label: 'Move CJ', uids: [actor.uid] });
                }
                app.editor.syncAll();
                
                // Clear selection so we see CJ's clothes and shading clearly
                app.editor.clearSelection();
                
                // Camera at eye level in front of CJ, looking directly at him
                app.vp.camera.position.set(2491.17, -1674.5, 14.1);
                const target = new app.vp.camera.position.constructor(2491.17, -1671.92, 14.1);
                app.vp.fly.lookAt(target);
                app.vp.requestRender();
                
                // Wait for render
                await new Promise(r => setTimeout(r, 2000));
                
                const node = app.editor.nodes?.get(actor.uid);
                const materials = [];
                let nodePos = null;
                let worldPos = null;
                let visible = false;
                let geoBox = null;
                let meshDetails = null;
                if (node) {
                    visible = node.visible;
                    nodePos = [node.position.x, node.position.y, node.position.z];
                    const wp = new app.vp.camera.position.constructor();
                    node.getWorldPosition(wp);
                    worldPos = [wp.x, wp.y, wp.z];
                    node.traverse(child => {
                        if (child.isMesh && !child.userData.isHelper) {
                            if (child.geometry?.boundingBox) {
                                const b = child.geometry.boundingBox;
                                geoBox = { min: [b.min.x, b.min.y, b.min.z], max: [b.max.x, b.max.y, b.max.z] };
                            }
                            const mats = Array.isArray(child.material) ? child.material : [child.material];
                            for (const m of mats) {
                                materials.push({
                                    type: m.type,
                                    color: m.color?.getHexString(),
                                    opacity: m.opacity,
                                    transparent: m.transparent,
                                    alphaTest: m.alphaTest,
                                    hasMap: Boolean(m.map),
                                    mapW: m.map?.image?.width || (m.map?.mipmaps ? m.map.mipmaps[0]?.width : 0),
                                    mapH: m.map?.image?.height || (m.map?.mipmaps ? m.map.mipmaps[0]?.height : 0)
                                });
                            }
                            meshDetails = {
                                vertCount: child.geometry.attributes.position?.count,
                                indexCount: child.geometry.index?.count,
                                groups: child.geometry.groups
                            };
                        }
                    });
                }
                
                return {
                    actorUid: actor.uid,
                    skin: actor.skin,
                    visible,
                    nodePos,
                    worldPos,
                    geoBox,
                    meshDetails,
                    materials: materials
                };
            })()""")
            print("Skin 0 Render Info:", json.dumps(info, indent=2))

            await asyncio.sleep(1)
            await cdp.screenshot("test_r11_skin0_cj_ped.png")

    finally:
        if chrome_proc:
            try: chrome_proc.terminate()
            except: pass
        if server:
            try: server.terminate()
            except: pass

if __name__ == "__main__":
    asyncio.run(main())
