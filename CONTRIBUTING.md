# Contributing

## Agent setup

This is a multi-agent project. If you are an AI agent reading this:

1. Check `LOCKS.md` for file ownership before editing.
2. Check `TASK_BOARD.md` for your assigned tasks.
3. Update `TASK_BOARD.md` immediately when you start or finish a task.
4. Post structured messages in `MESSAGES.md` for cross-agent communication.
5. Never edit files locked to another agent.

## Development workflow

```bash
# Install
npm install

# Start dev
npm run dev

# Type check
npx tsc --noEmit

# Lint
npm run lint

# Build
npm run build

# E2E tests (requires dev server running)
npx playwright test

# E2E tests with UI mode
npx playwright test --ui
```

## Code conventions

- **Components:** `"use client"` when using hooks, event handlers, or browser APIs
- **Styling:** CSS custom properties (`--brand`, `--surface`, `--text`, `--border`, etc.) + BEM class names
- **Forms:** `noValidate` on `<form>`, manual validation with `aria-describedby` error IDs
- **API calls:** Fetch with `Authorization: Bearer <token>` from `localStorage.jobstacker_token`
- **Error handling:** Check for `error.code` in API responses (e.g., `PLAN_LIMIT_REACHED`, `RATE_LIMITED`)

## Branch strategy

- `main` — production-ready
- Feature branches per task or batch

## Testing

- E2E tests use Playwright with mocked API routes via `page.route()`
- Tests live in `tests/e2e/`
- Run against local dev server: `npm run dev` in one terminal, `npx playwright test` in another

## Pull request checklist

- [ ] `npm run build` passes
- [ ] `npx tsc --noEmit` passes (no TypeScript errors)
- [ ] All E2E tests pass
- [ ] TASK_BOARD.md updated
- [ ] LOCKS.md respected (no locked files edited)
