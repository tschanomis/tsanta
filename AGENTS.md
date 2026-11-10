
# AGENTS.md

## Project
Next.js application using:
- Next.js App Router
- TypeScript (strict mode)
- Tailwind CSS
- React Server Components
- Postgres

## Architecture
- `src/app/` — Routes, layouts, pages
- `src/components/` — Reusable UI components
- `src/lib/` — Utilities and shared logic
- `src/hooks/` — Custom React hooks
- `src/types/` — Shared TypeScript types

## Coding Rules
- Use TypeScript. Avoid `any`.
- Prefer Server Components by default.
- Use Client Components only when necessary.
- Keep components small and focused.
- Avoid duplication and overengineering.
- Prefer simple, readable solutions.
- Follow existing project conventions.
- Do not add dependencies without justification.

## Next.js
- Use App Router conventions.
- Prefer Server Actions for simple mutations.
- Validate inputs on the server.
- Handle loading and error states.
- Use `next/image` and `next/link`.
- Never expose secrets to the client.

## Styling
- Use Tailwind CSS.
- Use clsx.
- Build responsive, accessible interfaces.
- Reuse existing components.
- Avoid unnecessary custom CSS.

## Workflow
Before coding:
1. Inspect relevant files.
2. Explain the proposed approach.
3. Identify potential impacts.

After coding:
1. Run `npm run lint`.
2. Run `npx tsc --noEmit`.
3. Run `npm run build` when relevant.
4. Summarize changes and remaining issues.

## Restrictions
- Do not modify unrelated files.
- Do not introduce unnecessary abstractions.
- Do not refactor working code without reason.
- Do not change database schemas without approval.
- Never commit secrets or `.env` files.
- Ask before making major architectural decisions.

## Priorities
1. Correctness
2. Simplicity
3. Maintainability
4. Performance
5. Developer experience
