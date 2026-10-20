# Static deployment and operations

DevDesk is built for Cloudflare Pages static hosting. It does not need Pages Functions, Workers, D1, KV, or R2. Next.js static export writes files to `out/`; deploy that directory as a static asset site. [Next.js static export documentation](https://nextjs.org/docs/app/guides/static-exports) describes the export model, and Cloudflare's [Next.js static site guide](https://developers.cloudflare.com/pages/framework-guides/nextjs/deploy-a-static-nextjs-site/) documents the Pages setup.

## Cloudflare Pages setup

1. Push the repository to its Git host and choose the intended production branch.
2. In Cloudflare, open **Workers & Pages → Create application → Pages → Import an existing Git repository**.
3. Choose the **Next.js (Static HTML Export)** framework preset. Set the build command to `npm run build` and the build output directory to `out`.
4. Select the Free plan and check the account billing page to confirm that no paid Workers or other paid services are enabled.
5. Choose the Pages project name and resulting `*.pages.dev` URL. Add that exact HTTPS URL as `NEXT_PUBLIC_SITE_URL` in the build environment before the production build so canonical links, `hreflang`, sitemap, and robots use the deployed domain.
6. Add any other public build-time values from `.env.example`. Do not add private API keys; every `NEXT_PUBLIC_` value is public in the generated site.
7. Deploy, then open the generated `sitemap.xml`, `robots.txt`, and localized pages. Test direct visits and reloads for `/`, `/ko/`, `/en/`, `/ja/`, `/zh/`, every tool route, and every guide route.
8. Use the preview deployment to review changes before merging them to the production branch. A Git push triggers the Pages build and deployment.

Cloudflare's documentation, checked on 2026-10-19, lists the Free plan limits as one build at a time, 500 builds per month, 20,000 files per site, and 25 MiB per individual asset. These limits can change; confirm the [current Pages limits](https://developers.cloudflare.com/pages/platform/limits/) and the account plan before launch.

## Public build-time settings

Copy `.env.example` to `.env.local` for local builds or configure the values in the Pages project's build environment:

| Variable | Purpose | Default / launch state |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Canonical origin used by page metadata, sitemap, and robots | `https://devdesk.example`; replace before deployment |
| `NEXT_PUBLIC_SITE_NAME` | Open Graph site name and localized title suffix | `DevDesk` |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Adds a `mailto:` address to the contact page | unset; contact page shows a launch note |
| `NEXT_PUBLIC_ADS_ENABLED` | Master AdSense switch | `false` |
| `NEXT_PUBLIC_ADSENSE_APPROVED` | Operator confirmation that the site is approved | `false` |
| `NEXT_PUBLIC_ADS_CONSENT_READY` | Operator confirmation that required consent messaging is configured | `false` |
| `NEXT_PUBLIC_ADSENSE_CLIENT_ID` | Real publisher ID supplied by the AdSense account | unset |
| `NEXT_PUBLIC_ADSENSE_TOOL_SLOT_ID` | Real slot ID for the area below the tool | unset |
| `NEXT_PUBLIC_ADSENSE_CONTENT_SLOT_ID` | Reserved ID for a possible later content placement | unset and currently unused |

All of these values are public build settings, not secrets. The site URL and name affect the next static build, so rebuild and redeploy after changing them. A contact email must belong to the operator; the project does not invent one.

## AdSense activation checklist

Advertising is disabled in the checked-in defaults. `AdSlot` emits no markup or script unless the master switch, approval flag, consent-readiness flag, publisher ID, and placement slot ID are all valid. The current slot sits below the workbench and before the guide content; it is never inserted between tool inputs, outputs, or actions. The disabled state is covered by a browser test that checks for both missing ad markup and missing external AdSense requests.

Before setting the flags to `true`:

1. Obtain actual site approval and publisher/slot IDs from the operator's AdSense account. Do not copy example IDs from documentation or use placeholders.
2. Configure and publish AdSense Privacy & Messaging or another consent solution appropriate to the audience. For personalized ads in the EEA, UK, or Switzerland, Google requires a certified CMP integrated with the IAB TCF. See Google's [publisher CMP requirements](https://support.google.com/adsense/answer/13554116?hl=en) and [European regulations messages](https://support.google.com/adsense/answer/10961068?hl=en). `NEXT_PUBLIC_ADS_CONSENT_READY=true` is only an operator-controlled build gate; it does not implement or verify a CMP.
3. Review the published privacy policy and terms for the service jurisdictions and actual operator identity, contact route, hosting/log-retention settings, enabled ad vendors, cookies or similar storage, and consent/withdrawal flow. The pages now describe the current browser processing and the planned Google advertising behavior; update them to match the final account and consent settings, and complete legal review before ads are served.
4. Add real IDs and set `NEXT_PUBLIC_ADSENSE_APPROVED=true`, `NEXT_PUBLIC_ADS_CONSENT_READY=true`, and `NEXT_PUBLIC_ADS_ENABLED=true` only after those steps are complete. Rebuild, test the deployed routes, and review the browser console and network requests.
5. Add an `ads.txt` file only with the exact content supplied by the approved AdSense account. This repository intentionally does not generate a placeholder `ads.txt`.

The AdSense script sends requests to Google when enabled. A user with an ad blocker may block those requests; the tool itself remains available. Ad approval and revenue are not guaranteed. See Google's current [site approval guidance](https://support.google.com/adsense/answer/7299563?hl=en) and [program policies](https://support.google.com/adsense/answer/48182?hl=en).

## Release checks

Run these commands from a clean checkout before publishing:

```bash
npm ci
npm run lint
npm run typecheck
npm run test
npm run build
npm run verify:static
npm run verify:i18n
npx playwright install chromium
npm run test:e2e
```

`verify:static` checks the exported paths, 48 tool pages, 48 guides, sitemap, robots, metadata, and internal links. `test:e2e` starts the project's static preview server over `out/`, so build first. Lighthouse is an optional one-off tool rather than a project dependency; run it against the running static preview, not `next dev`, and record the form factor with the scores.

For dependency hygiene, review package licenses when versions change and run `npm audit` against the lockfile. Do not publish with unresolved high or critical advisories unless an owner has documented why the affected path is not applicable.
