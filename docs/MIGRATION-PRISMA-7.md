# Migración Prisma 6.10.1 → 7.x

Branch sugerida: `feat/prisma-7`.

## Pre-requisitos

- [ ] Mergear `fix/prisma-version` y `fix/login-form-parse-error` primero.
- [ ] Resolver los 15 errores TS pre-existentes (al menos los críticos en server actions).
- [ ] Backup de BD producción + branch staging para validar.

## Decisión bloqueante: ¿qué adapter usar?

Prisma 7 elimina el query engine binario por defecto. Hay que elegir:

| Opción | Cuándo usar | Cambios runtime |
|---|---|---|
| `@prisma/adapter-pg` (driver adapter, `pg` directo) | Postgres self-hosted o gestionado normal (Neon, Supabase, Vercel Postgres) | `new PrismaClient({ adapter: new PrismaPg({...}) })` |
| Prisma Accelerate (`accelerateUrl`) | Quieres edge runtime + connection pooling gestionado por Prisma | `new PrismaClient({ accelerateUrl: env.PRISMA_ACCELERATE_URL })` |
| Prisma Postgres | Migrar la BD entera al servicio gestionado de Prisma | Cambio de provider |

**Recomendación para dyd-shop**: `@prisma/adapter-pg`. Mantienes Vercel Postgres patrón pool/non-pool, mínima fricción.

## Fases

### Fase 1 — Preparación

1. Crear branch `feat/prisma-7` desde `main` actualizado.
2. Validar que `prisma generate` y `prisma migrate dev` funcionan en 6.10.1.
3. Snapshot de migraciones: `npx prisma migrate status > prisma-state-pre7.txt`.

### Fase 2 — Bump dependencias

```bash
npm install prisma@^7 @prisma/client@^7 @prisma/adapter-pg pg
npm install -D @types/pg
```

`package.json`:
```json
"prisma": "7.x.x",
"@prisma/client": "7.x.x",
"@prisma/adapter-pg": "^1.x"
```

### Fase 3 — Crear `prisma.config.ts`

Raíz del repo:
```ts
import 'dotenv/config';
import path from 'node:path';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: path.join('prisma', 'schema.prisma'),
  migrate: {
    datasource: {
      url: process.env.POSTGRES_URL_NON_POOLING!, // direct, para migrate
    },
  },
});
```

### Fase 4 — Actualizar `prisma/schema.prisma`

```prisma
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["driverAdapters"]
  binaryTargets   = ["native", "rhel-openssl-3.0.x"]
}

datasource db {
  provider = "postgresql"
}
```

Eliminar `url` y `directUrl` del bloque `datasource`.

### Fase 5 — Refactor `src/lib/prisma.ts`

```ts
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.POSTGRES_PRISMA_URL!;
const adapter = new PrismaPg({ connectionString });

const globalForPrisma = global as unknown as { prisma?: PrismaClient };

const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
```

### Fase 6 — Validar runtime

- [ ] `npm run typecheck` — limpio en archivos de Prisma.
- [ ] `npm run dev` — login, listado productos, carrito, checkout.
- [ ] Webhook Mercado Pago (sandbox).
- [ ] Admin: crear/editar producto, ver órdenes.
- [ ] Server actions con `prisma.$transaction` — validar que sigan funcionando con adapter.

### Fase 7 — Migraciones

- [ ] `npx prisma migrate dev` (sin cambios) — verificar que detecta `prisma.config.ts`.
- [ ] `npx prisma migrate deploy` en staging.
- [ ] `npx prisma generate` — verificar tipos correctos.

### Fase 8 — Deploy

- [ ] Verificar Vercel ENV vars: `POSTGRES_PRISMA_URL`, `POSTGRES_URL_NON_POOLING`.
- [ ] `npm run build` local OK.
- [ ] Deploy a preview. Smoke test.
- [ ] Promote a prod.

## Riesgos conocidos

| Riesgo | Mitigación |
|---|---|
| `$transaction` API cambia con adapter | Probar todas las acciones en `src/actions/payments/`, `src/actions/orders/` |
| Tipos generados pueden diferir (`Decimal`, `Json`) | typecheck completo + tests manuales en checkout |
| `next-auth@5-beta` puede chocar con tipos nuevos | Validar login/register tras bump |
| Edge runtime / middleware: `pg` no corre en edge | Si usas edge, cambiar a `@prisma/adapter-neon` o Accelerate |
| Seed script (`ts-node`) puede romper con nuevo client | Probar `npm run seed` en BD vacía |

## Rollback

```bash
git revert <merge-commit>
npm install prisma@6.10.1 @prisma/client@6.10.1 --save-exact
npm uninstall @prisma/adapter-pg pg @types/pg
rm prisma.config.ts
# Restaurar url/directUrl en schema.prisma
git push
```

## Plan de ejecución sugerido

- **Semana 1**: Fases 1-5 en branch local. No tocar producción.
- **Semana 2**: Fase 6-7 en staging. Smoke test exhaustivo.
- **Semana 3**: Fase 8. Deploy preview → producción con monitoring.

**Tiempo estimado**: 4-6 horas de trabajo activo + 1 semana de soak en staging.
