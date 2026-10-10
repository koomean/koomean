# Koo Mean SITE

This repository publishes **link.koomean.com** from `main` at the repository root using the existing GitHub Pages configuration.

## Editing and publishing

Edit `src/index.html`, `src/settings.css`, or `src/preferences.js`, then run:

```sh
npm ci
npm run build
npm test
npm run verify
```

Commit the generated root `index.html`, `build-manifest.json` and its versioned assets together with the source. Check the remote is `koomean/koomean` and CNAME is `link.koomean.com` before pushing. Do not copy another application's root HTML into this repository.

## Preferences

- `koomean_site_theme_v1`: `auto`, `light`, or `dark`. Existing selections are retained. `auto` follows the device, including changes while the page is open.
- `koomean_site_prefs_v1`: motion, data saver, featured video visibility. Only display preferences are saved in localStorage; storage failures keep the page usable for the current visit.
- The maintenance screen inherits the website's preference and offers no separate theme selector.
- Same-origin tabs synchronize display preferences. Preferences are separate for each application's origin.

## Security and loading

Google ID tokens use tab-scoped sessionStorage (`koomean_session_v4`). The old localStorage session is removed on startup, requiring one sign-in again for existing sessions. Tokens remain accessible to trusted page JavaScript; sessionStorage is not a replacement for server-side verification or protection against XSS. The Worker verifies Google signatures, expiry, audience and access roles.

A restrictive script CSP is included in generated HTML. Inline styles remain permitted to preserve existing UI behavior. Frame-ancestor protection and other response headers must be configured at the hosting layer; they cannot be enforced with a CSP meta tag.

Fonts/icons are hosted locally, with upstream licenses in `licenses/`. YouTube loads its player only after a click, using the privacy-enhanced domain and an origin referrer. Google sign-in code loads only when Sign In is opened. API requests have bounded timeouts, transient read retries, rate-limit backoff, deduplicated status probes, and identity checks to ignore responses after logout. Mutations are not automatically retried.
