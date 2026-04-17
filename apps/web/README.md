# Fidooo Chat Web

Next.js 16 frontend for Fidooo Chat.

## Development

```bash
pnpm install
cp apps/web/.env.example apps/web/.env.local
pnpm --filter @fidooo/web dev
```

The app expects Firebase Auth, Firestore and the NestJS API URL configured in
`apps/web/.env.local`.

## Checks

```bash
pnpm --filter @fidooo/web typecheck
pnpm --filter @fidooo/web lint
pnpm --filter @fidooo/web test
pnpm --filter @fidooo/web build
```
