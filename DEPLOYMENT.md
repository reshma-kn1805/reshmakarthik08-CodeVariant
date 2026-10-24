# Live Deployment Documentation

## Live Application URL
**Live Demo:** [https://reshma-kn1805.github.io/reshmakarthik08-CodeVariant/](https://reshma-kn1805.github.io/reshmakarthik08-CodeVariant/)

- **Repository:** `reshma-kn1805/reshmakarthik08-CodeVariant`
- **Deployment Platform:** GitHub Pages
- **Deployment Trigger:** Automated GitHub Actions on every push to `main`
- **Last Verified Timestamp:** 2026-10-24 20:10:00 UTC+05:30 (Verified HTTP 200 OK)
- **Release Version:** The Canvas Protocol Twist Release (Phases 0–9 Complete)
- **Automated Verification:** 61 tests passing across 4 Vitest suites; `npm run build` passing cleanly.

---

## How Deployments Work

1. **Trigger:** Every push or merge to the `main` branch automatically triggers the `.github/workflows/deploy.yml` workflow.
2. **Build Pipeline:**
   - Runs in an isolated `ubuntu-latest` container.
   - Sets up Node.js v20 with dependency caching.
   - Executes `npm ci` for deterministic reproducible dependencies.
   - Runs the complete automated test suite (`npm test` via Vitest).
   - Generates production bundles via `npm run build` with Vite `base` set to `/reshmakarthik08-CodeVariant/`.
   - Packages and uploads `./dist` using `actions/upload-pages-artifact@v3`.
3. **Deployment Pipeline:**
   - Uses `actions/configure-pages@v5` and `actions/deploy-pages@v4`.
   - Directly publishes to the GitHub Pages environment with OIDC authorization (`id-token: write`).
4. **Client-Side Routing:**
   - Uses `HashRouter` from `react-router-dom` to ensure deep links (e.g. `#/assess`, `#/verdict/:id`, `#/history`) and browser reloads work reliably on static GitHub Pages hosting without requiring server-side URL rewrite proxies.
