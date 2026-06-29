# SaaS Playwright Regression Framework

A production-pattern Playwright framework built around login and core auth flows.
Built as a personal initiative to close the hands-on automation gap and demonstrate
framework architecture decisions, not just test writing.

---

## Structure

```
playwright-framework/
├── tests/
│   ├── login.spec.ts         # UI login regression suite (happy path, negative, security)
│   └── auth.api.spec.ts      # API auth suite (status codes, schema, security)
├── pages/
│   ├── BasePage.ts           # Shared navigation and wait logic
│   ├── LoginPage.ts          # Login UI interactions and locators
│   └── DashboardPage.ts      # Post-auth verification
├── fixtures/
│   └── users.ts              # Centralized test data and credentials
├── utils/
│   ├── AuthHelper.ts         # API-level auth bypass for non-login tests
│   └── ApiClient.ts          # Reusable HTTP client for API test layer
├── playwright.config.ts      # Multi-browser, multi-device config
└── package.json
```

---

## Key Design Decisions

### Page Object Model
Selectors live in one place. When the UI changes, you update the page object —
not 20 test files. This is the single biggest maintenance win in any framework.

### Role-Based Locators
Uses `getByRole()` over CSS selectors wherever possible.
Role-based locators are more resilient to UI changes and test accessibility simultaneously.
This is the approach the Playwright team recommends and it mirrors how MABL's
self-healing works — resolving elements by semantic meaning, not brittle paths.

### Two-Layer Testing Strategy
UI tests verify the user experience. API tests verify the contract.
`auth.api.spec.ts` tests the auth endpoints directly — faster, more stable,
and catches issues UI tests miss entirely. Both layers run in CI on every push.

### API Auth Bypass
Tests that don't test login shouldn't use the login UI.
`AuthHelper.ts` seeds auth state via API so downstream tests start authenticated.
Faster suite. Less coupling. Fewer false failures when login UI changes.

### Arrange / Act / Assert
Every test follows the same structure. Makes failures readable.
A broken test should tell you what went wrong in under 30 seconds.

### Independent Tests
No shared state between tests. Each test sets up and tears down its own context.
Flaky tests almost always trace back to shared state.

---

## Running the Suite

```bash
npm install
npx playwright install
npm test                   # Run all tests headless
npm run test:login         # Run login suite only
npm run test:headed        # Run with browser visible
npm run test:ci            # Run with HTML report output
npm run report             # Open last HTML report
```

---

## Why I Built This

I've led teams that built and maintained Playwright frameworks at scale.
At VelocityEHS we moved automation coverage from 65% to 85% using this
pattern as the foundation. I wanted to demonstrate I can architect it —
not just direct others to build it.

This is a starting pattern. In a real engagement I'd extend it with:
- API test layer (Postman/Playwright API testing)
- Visual regression hooks
- CI/CD integration via GitHub Actions
- Slack/webhook alerting on failure
- AI-assisted selector healing via MABL or similar
