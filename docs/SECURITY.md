# Security headers

Astraa sends a Content-Security-Policy on every route. The policy keeps executable
code and network connections on explicit origins, allows local `blob:` previews and
the Markdown PDF export iframe, and retains the external APIs and media used by the
application. Markdown documents can reference images from arbitrary HTTPS origins. The
development policy also permits HTTP images so local HTTP fixtures behave like the
production policy after its `upgrade-insecure-requests` rewrite; HTTP is not allowed
for scripts, styles, fonts, media, workers, or connections.
The intentionally scheme-scoped `https:` frame source is limited to the terminal
browser panel, which is an explicit user-facing arbitrary HTTPS browser surface.
Production also permits the narrower `wasm-unsafe-eval` capability required by
Shiki's bundled Oniguruma WebAssembly engine. `unsafe-eval` is enabled only for the
development server because Next.js uses eval-based source maps there; it is absent
from production responses.

Strict-Transport-Security is sent only when `NODE_ENV` is `production`, where the
application is expected to be served over HTTPS. It is intentionally omitted from
development responses so `http://localhost:3000` and local WebSocket connections are
not upgraded to HTTPS. Browsers cache HSTS, so a deployed host must have HTTPS working
before this header is enabled; local development does not opt a developer's browser
into HSTS.
