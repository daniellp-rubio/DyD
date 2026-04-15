# DyD Shop

E-commerce fullstack con Next.js 15, autenticación, carrito persistente, panel admin y pagos con Mercado Pago.

## Stack

- **Framework**: Next.js 15 (App Router) + React 19 + TypeScript
- **Estilos**: Tailwind CSS 4
- **DB / ORM**: PostgreSQL + Prisma 6
- **Auth**: NextAuth v5 (credentials + bcrypt, bloqueo por intentos fallidos)
- **Estado cliente**: Zustand
- **Formularios**: React Hook Form + Zod
- **Imágenes**: Cloudinary (`next-cloudinary`)
- **Pagos**: Mercado Pago (checkout + webhook)
- **UI**: Framer Motion, Swiper, React Icons

## Features

- Catálogo con categorías, tags, stock y galería de imágenes
- Carrito y sesión persistente (Zustand + cookies)
- Checkout con dirección de envío y creación de orden transaccional
- Integración Mercado Pago + webhook de confirmación de pago
- Autenticación con roles (`admin` / `user`) y protección por middleware
- Panel admin: productos, órdenes, usuarios
- Verificación de email con tokens hasheados y expiración
- Seed de base de datos

## Requisitos

- Node.js 20+
- Docker (para Postgres local)
- Cuenta Cloudinary
- Credenciales Mercado Pago

## Variables de entorno

Crear `.env` en la raíz:

```env
# Postgres
DB_USER=postgres
DB_NAME=dydshop
DB_PASSWORD=secret
POSTGRES_PRISMA_URL=postgresql://postgres:secret@localhost:5432/dydshop?schema=public
POSTGRES_URL_NON_POOLING=postgresql://postgres:secret@localhost:5432/dydshop?schema=public

# NextAuth
AUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3000

# Cloudinary
CLOUDINARY_URL=cloudinary://...
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=...

# Mercado Pago
MP_ACCESS_TOKEN=...
MP_PUBLIC_KEY=...
```

## Instalación

```bash
git clone <repo>
cd dyd-shop
npm install
docker compose up -d
npx prisma migrate deploy
npx prisma generate
npm run seed
npm run dev
```

App en `http://localhost:3000`.

## Scripts

| Script | Acción |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Migra Prisma + build producción |
| `npm start` | Servidor producción |
| `npm run lint` | Lint |
| `npm run seed` | Poblar base de datos |
| `npm run prisma:deploy` | Aplicar migraciones |

## Estructura

```
src/
├── actions/          # Server actions (auth, products, orders, payments)
├── app/
│   ├── (shop)/       # Rutas públicas + admin
│   ├── api/          # Webhooks (mercadopago) + auth
│   └── auth/
├── components/
├── lib/              # prisma client, utils
├── store/            # Zustand stores
├── interfaces/
├── seed/
└── middleware.ts     # Protección de rutas
prisma/
└── schema.prisma
```

## Modelo de datos

`User` · `UserAddress` · `VerificationToken` · `Category` · `Product` · `ProductImage` · `Order` · `OrderItem` · `OrderAddress`

## Deploy

Compatible con Vercel. Configurar las variables de entorno y un Postgres gestionado (Neon, Supabase o Vercel Postgres).

## Licencia

© 2026 Daniel Felipe Lopez Rubio. Todos los derechos reservados.

Código publicado con fines de portafolio. Queda prohibido su uso, copia, modificación, redistribución o explotación comercial, total o parcial, sin autorización escrita del autor. Ver [`LICENSE`](../LICENSE).
