# Checkout Unification (Phase 3 handoff)

Goal: one checkout + one order-view flow for both authenticated and guest
users, removing the parallel `/payment/*` and `/orderswithoutsession/*` trees.

> Do the remaining steps with `npm run dev` running. Each step touches the
> payment/auth path and must be clicked through, not just typechecked.

## Done (committed on `roadmap-automation`)
- `7b88642` createOrder helper — both place-order actions share it.
- `88ab3c7` single address store (fixed the `"address-storage"` key collision; deleted dead stores).
- `e72f6c9` single `AddressForm` with `mode: 'auth' | 'guest'` (deleted `FormWithoutSession`).
- `52e480f` `getOrderById(id, token?)` (owner/admin OR guest token) + fixed `user!.email` crash on guest pending/failure pages.

## Root cause being removed
`src/auth-config.ts` `authorized()` blocks `/checkout`, `/orders`, `/profile`,
`/admin` for guests. The guest tree exists only to dodge that gate.

## Remaining steps

### 1. Session-aware `/checkout` (the big one)
- [ ] `src/app/(shop)/checkout/address/page.tsx` — read session; render
      `<AddressForm mode={session ? 'auth' : 'guest'} />`; skip `getUserAddress`
      for guests.
- [ ] `src/app/(shop)/checkout/(checkout)/ui/PlaceOrder.tsx` — branch on
      `useSession()`: logged-in → `placeOrder` → `/orders/{id}`; guest →
      `placeOrderWithoutSession(items, address, address.email)` →
      `/orders/{id}?token={accessToken}`.

### 2. Pass token to order pages
- [ ] `src/app/(shop)/orders/[id]/{page,success,pending,failure}/page.tsx` —
      add `searchParams`, read `token`, call `getOrderById(id, token)`.

### 3. Middleware (security — review carefully)
- [ ] `src/auth-config.ts` `authorized()`:
  ```ts
  const isProtected =
    pathname.startsWith('/profile') ||
    pathname.startsWith('/admin') ||
    pathname === '/orders'; // list only; /orders/[id] is access-checked in getOrderById
  ```
  Removes `/checkout`; `/orders/[id]` now reachable but data access is still
  enforced server-side by `getOrderById`.

### 4. Guest redirect + legacy compatibility
- [ ] Fix guest order redirect `?email=` → `?token={accessToken}` (the
      `?email=` redirect in `payment/(payment)/ui/PlaceOrder.tsx` is currently broken).
- [ ] 301 `/payment/*` and `/orderswithoutsession/*` → unified routes
      (existing guest emails contain those URLs).

### 5. Cart entry + cleanup (Phase 4)
- [ ] Cart "Comprar como invitado" → `/checkout/address` (drop the separate entry).
- [ ] Delete legacy trees + `placeOrderWithoutSession` / `getOrderByIdWithoutSession`
      once unreferenced.

## Guardrails (must verify)
- `/orders/{another-users-id}` with no token/session → redirect, never shows.
- `/orders/{id}?token=wrong` → redirect.
- `order.total` charged correctly by **both** Wompi and Mercado Pago (webhooks
  already verify against `order.total`).
- Old `/orderswithoutsession/...` links still resolve via 301.

## Test matrix (run before merge)
| # | Flow | Expect |
|---|------|--------|
| 1 | Auth + Wompi | order created, total correct, marked paid |
| 2 | Auth + Mercado Pago | same |
| 3 | Guest + Wompi | email required at form, order has token, viewable via `?token=`, paid |
| 4 | Guest + Mercado Pago | same |
| 5 | Access control | another user's order / wrong token → redirect |

## Rollback
All changes are commits on `roadmap-automation` (not pushed). Revert the
relevant commit if a step regresses checkout.
