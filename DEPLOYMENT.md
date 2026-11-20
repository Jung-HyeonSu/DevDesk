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

## Cloudflare Web Analytics

The checked-in manual beacon is included in both root layouts, covering `/` and all localized pages. Its site token is public client-side configuration, not a secret. Cloudflare Web Analytics sends page-view and page-load performance measurements to Cloudflare; tool inputs and results are not included. The localized Privacy Policy describes this behavior and links to Cloudflare's [data collection documentation](https://developers.cloudflare.com/web-analytics/data-metrics/data-origin-and-collection/) and [overview](https://developers.cloudflare.com/web-analytics/about/).

Use only one beacon per page. If enabling Web Analytics through the Cloudflare Pages dashboard, disable automatic snippet injection while this manual snippet is installed. Confirm that the registered analytics hostname matches the deployed hostname. To use a different analytics site, replace the public token in `src/components/analytics/cloudflare-web-analytics.tsx`.

## Public build-time settings

Copy `.env.example` to `.env.local` for local builds or configure the values in the Pages project's build environment:

| Variable | Purpose | Repository default / production state |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Canonical origin used by page metadata, sitemap, and robots | `https://devdesk.example`; replace before deployment |
| `NEXT_PUBLIC_SITE_NAME` | Open Graph site name and localized title suffix | `DevDesk` |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Adds a `mailto:` address to the contact page | unset; contact page shows a launch note |
| `NEXT_PUBLIC_ADS_ENABLED` | Master AdSense switch | `false` / `true` in Pages Production |
| `NEXT_PUBLIC_ADSENSE_APPROVED` | Operator confirmation that the site is approved | `true` (owner reported approval on 2026-11-20; Production is `true`) |
| `NEXT_PUBLIC_ADS_CONSENT_READY` | Operator confirmation that required consent messaging is configured | `false` / `true` in Pages Production |
| `NEXT_PUBLIC_ADSENSE_CLIENT_ID` | Real publisher ID supplied by the AdSense account | `ca-pub-9509272737484634` in Pages Production |
| `NEXT_PUBLIC_ADSENSE_TOOL_SLOT_ID` | Real slot ID for the area below the tool | unset |
| `NEXT_PUBLIC_ADSENSE_CONTENT_SLOT_ID` | Reserved ID for a possible later content placement | unset and currently unused |

All of these values are public build settings, not secrets. The site URL and name affect the next static build, so rebuild and redeploy after changing them. A contact email must belong to the operator; the project does not invent one.

## AdSense activation and current state

Advertising remains disabled in checked-in defaults. Both root layouts load the Auto ads script only when the master switch, approval flag, consent-readiness flag, and publisher ID are valid. `AdSlot` reuses that loader and requires a separate slot ID; Auto ads does not need a manual slot ID. Cloudflare Pages Production currently has all three flags set to `true` and the approved publisher ID. Automatic deployment is enabled for `main`, so a push will deploy these code and policy updates.

Account configuration completed on 2026-11-20:

1. The owner reported approval and supplied publisher ID `ca-pub-9509272737484634`.
2. Google AdSense Privacy & Messaging has a published EEA/UK/Switzerland consent message and published US state privacy message. For personalized ads in the EEA, UK, or Switzerland, Google requires a certified CMP integrated with the IAB TCF; see Google's [publisher CMP requirements](https://support.google.com/adsense/answer/13554116?hl=en) and [European regulations messages](https://support.google.com/adsense/answer/10961068?hl=en). The EU message uses English by default with Japanese and Simplified Chinese; the US message uses English and Spanish. Korean is unavailable in the current message-language picker.
3. The consent message links to `https://devdesk-7e7.pages.dev/en/privacy/`; the DevDesk logo was taken from `src/app/icon.svg`. The localized privacy policy and terms now describe AdSense data flows, storage technologies, consent and available choices. The notice reflects known behavior; it is not a legal review.
4. Production already has the three activation flags and publisher ID set. `NEXT_PUBLIC_ADS_CONSENT_READY=true` is an operator-controlled build gate; it does not implement or verify a CMP. After deployment, inspect the public pages, browser console, consent display and AdSense request.
5. Add an `ads.txt` file only if the approved account supplies its exact contents. The repository intentionally does not generate a placeholder. Manual `AdSlot` placements remain inactive while their slot IDs are unset.

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
