# Portlinks CHA Job Workspace

Interactive Import and Export job-creation prototype built with Next.js, React, TypeScript, Tailwind CSS v4 and shadcn-style UI primitives (Radix Dialog, CVA buttons, inputs, badges and compact tables).

## Run locally

npm install
npm run dev

Open the Local URL printed by Next.js. Choose Import or Export to open its eight-step workflow. The Import vessel step includes both existing-voyage search and new-voyage entry.

## Verify

npm run typecheck
npm test
npm run test:browser
npm run build

Browser tests default to http://localhost:3001 and an installed Chrome browser. Set TEST_URL to use a different preview address. Tests cover all 17 screen states, both local job-creation flows, editable table rows and totals, draft restoration, validation, and mobile overflow. Screenshots are written to ignored test-results/.

## Data and prototype behavior

Import and Export drafts are independent and saved in localStorage when Save Draft is clicked. Created jobs and saved templates also stay in this browser. Clearing site storage removes them. Uploaded files remain local, can be viewed during the session, and save metadata only in drafts. No authentication, backend, customs gateway or shipping service is connected. Integration-dependent actions explain this limitation in a dialog.

Tables follow the supplied references, with inline cargo editing, dropdowns, selection, row actions, and computed totals. Other financial and duty rows use edit dialogs. Totals are calculated from actual rows: the supplied Import expense amounts sum to INR 146,000, even though its screenshot displays INR 146,500.

The build generates out/ for static hosting. Run npm run preview (or npm start) after building to serve it at http://127.0.0.1:4173. The existing development server may use port 3001 if 3000 is occupied. Print Preview uses browser print; choose Save as PDF to export the summary.
