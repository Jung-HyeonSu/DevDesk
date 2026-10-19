# DevDesk

DevDesk is a static, multilingual collection of developer tools. All twelve tools run in the browser; the project has no application server, account system, database, or input-conversion API.

The site ships Korean (`ko`), English (`en`), Japanese (`ja`), and Simplified Chinese (`zh`, HTML language `zh-CN`). It includes localized tool pages and guides, static SEO metadata, sitemap and robots files, a responsive tool catalog, favorites, recent tools, keyboard search, and light/dark/system themes.

## Tools

- JSON formatter and validator
- SQL formatter
- JWT decoder (it does not verify signatures)
- Linux cron generator
- Text diff
- Base64 encoder and decoder
- URL component encoder and decoder
- Unix timestamp converter
- UUID v4 generator
- SHA-2 hash generator
- Regex tester with a terminating Web Worker
- YAML ↔ JSON converter

## Privacy model

Tool values stay in page memory while a tool is open. Explicit tool handoffs pass a value through application memory once; they do not put it in a URL, `localStorage`, or `sessionStorage`. Browser storage is limited to non-sensitive preferences such as theme, favorite tool IDs, and recent tool IDs. No analytics integration is included. Ads are disabled by default and make no network request unless an operator configures and enables them as described in [DEPLOYMENT.md](./DEPLOYMENT.md).

The privacy and terms pages are localized drafts. They describe the current implementation and need operator and legal review before public launch, especially before activating advertising.

## Requirements

- Node.js version supported by the selected Next.js release
- npm

## Local development

```bash
npm ci
npm run dev
```

Open `http://localhost:3000/`. Set `NEXT_PUBLIC_SITE_URL` before generating production metadata. `.env.example` contains public, non-secret build-time settings; copy it to `.env.local` and replace example values as needed.

## Verification

```bash
npm run lint
npm run typecheck
npm run test
npm run build
npm run verify:static
npm run verify:i18n
npx playwright install chromium
npm run test:e2e
```

The Playwright suite serves the generated `out/` folder using the static preview server. Run `npm run build` first; `npm run dev` is not a substitute for checking the exported site. For manual inspection, run `npm run preview` and open `http://127.0.0.1:4173/`.

To measure Lighthouse, start `npm run preview` in one terminal and run Lighthouse against `http://127.0.0.1:4173/en/` or a tool route in another. Lighthouse is not a project dependency. Record the selected form factor and scores because mobile and desktop results differ.

## Project structure

- `src/app/` — statically generated localized routes and metadata
- `src/components/` — responsive shell, editors, tool cards, ads, and workbenches
- `src/data/` — tool registry, examples, guides, and localized page content
- `src/i18n/` — locale configuration and translated UI strings
- `src/lib/tools/` — browser-side tool logic and input limits
- `tests/unit/` — tool logic, localization, and SEO tests
- `tests/e2e/` — browser workflows against the static export
- `scripts/` — static preview, exported-page checks, and i18n checks

## Static deployment

This project uses Next.js App Router with `output: 'export'`; `npm run build` writes HTML, CSS, and JavaScript files to `out/`. Deploy that directory as a static site. No Pages Functions, Workers, D1, KV, or R2 are required. Follow [DEPLOYMENT.md](./DEPLOYMENT.md) for Cloudflare Pages setup, public environment variables, and the operator checklist.

## Dependency checks

Use `npm ci` to install the exact lockfile versions. Before adding or upgrading a dependency, review its license in the installed package and upstream license file, then check for known vulnerabilities with `npm audit`. `npm ls --depth=0` shows the direct dependency set. Resolve high or critical advisories before release, or record why a finding is not reachable or applicable.

## Implementation record

See [IMPLEMENTATION_REPORT.md](./IMPLEMENTATION_REPORT.md) for the completed implementation, exact verification results, Git commits, and phase push status.
