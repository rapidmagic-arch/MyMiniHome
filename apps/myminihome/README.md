# MyMiniHome MCP Thread Panel — local adapter

## Source of truth
- GitHub single-scene: `scenes/forest-village-v1/index.html` (8 actors, 7 interaction zones).
- The local MCP server `apps/myminihome/server.mjs` loads the clone's scene HTML when present. A standalone plugin can fetch the **public** scene from the MyMiniHome GitHub `main` branch.
- Relative `../../assets/` references become public `raw.githubusercontent.com` URLs. Private ChatGPT project or GPT links are **never embedded in the repository** and can be pasted into individual profiles for the current view only.

## Host integration
- MCP tool `open_forest_village`: annotated `_meta.ui.resourceUri` and `_meta["openai/ui"].entrypoints=[{type:"thread"}]`.
- MCP resource `ui://myminihome/forest-v1.html`: `text/html;profile=mcp-app`, with resource/connect CSP limited to public GitHub assets.
- The widget uses ChatGPT's native conversation composer. It does not implement, replace, or send messages through a second AI chat window.
- When `window.openai.openExternal` is present, the user clicking a configured ChatGPT link invokes the host external-link method. Otherwise standard `https://chatgpt.com/` anchors are used.

## Usage (local MCP / desktop)
Requires Node.js 22 or newer and a supported local MCP plugin runtime. Import the package rooted at `myminihome/` or register the `stdio` MCP command from `mcp.json`. In a repository clone:

```powershell
node apps/myminihome/server.mjs
```

The server speaks newline-delimited MCP JSON-RPC on standard input/output; it is **not** an HTTP service and should not be publicly exposed.

## Verification & limitations
- The local Node transport smoke test checks `initialize`, `tools/list`, `tools/call`, `resources/list`, `resources/read`. It does not prove real ChatGPT panel opening.
- Hosting/publishing/connecting a plugin still requires a supported runtime and user's connection action. Web ChatGPT does not automatically execute a local `stdio` server. A cloud version requires a deployed remote MCP endpoint or supported Sites tooling.
- A thread entrypoint is **declared**, not actually installed. The UI must be tested on a host before production approval.
- Current animation art and layer quality are still marked candidate until reviewed.
