# Tecnovate 🚀
E-commerce de tecnología para Paraguay — Next.js 14, Prisma, Supabase, Cloudinary, Bancard, PayPal.

## Stack
| Capa | Tecnología |
|------|-----------|
| Frontend | Next.js 14 App Router + Tailwind CSS |
| Backend | Next.js API Routes |
| Base de datos | PostgreSQL via Supabase (gratis) |
| ORM | Prisma |
| Autenticación | NextAuth.js (Google + Email/Password) |
| Imágenes | Cloudinary (gratis 25 GB) |
| Pago local | Bancard (Paraguay) |
| Pago internacional | PayPal |
| Estado del carrito | Zustand (persistido en localStorage) |
| Deploy | Vercel + GitHub |

## Estructura de carpetas

```
tecnovate/
├── app/
│   ├── api/
│   │   ├── auth/         # NextAuth + registro
│   │   ├── products/     # CRUD productos
│   │   ├── orders/       # Gestión de pedidos
│   │   ├── payments/     # Bancard + PayPal
│   │   ├── upload/       # Subida de imágenes a Cloudinary
│   │   └── pc-builder/   # Armador de PC + compatibilidad
│   ├── admin/            # Panel admin (protegido)
│   │   ├── page.tsx      # Dashboard con stats
│   │   ├── products/     # Listar + crear productos
│   │   └── orders/       # Gestión de pedidos
│   ├── gamer/            # Zona Gamer — armador de PC
│   ├── products/         # Catálogo + detalle de producto
│   ├── cart/             # Carrito de compras
│   ├── checkout/         # Proceso de pago
│   └── login/            # Login + registro
├── components/
│   ├── layout/           # Navbar, Footer
│   ├── ui/               # ProductCard, ProductGrid, Hero, etc.
│   └── admin/            # Sidebar, acciones admin
├── lib/
│   ├── prisma.ts         # Cliente Prisma singleton
│   ├── products.ts       # Funciones de acceso a datos
│   ├── utils.ts          # Formateo de precios, slugify
│   └── store/cart.ts     # Zustand store del carrito
└── prisma/
    └── schema.prisma     # Modelos de base de datos
```

## Setup paso a paso

### 1. Clonar y configurar

```bash
git clone https://github.com/TU_USUARIO/tecnovate.git
cd tecnovate
npm install
cp .env.example .env
```

### 2. Crear base de datos en Supabase (gratis)

1. Ir a [supabase.com](https://supabase.com) → New Project
2. Copiar la **Connection string** desde Settings → Database
3. Pegar en `.env` como `DATABASE_URL`

```bash
npx prisma db push      # Crea las tablas
npx prisma generate     # Genera el cliente
```

### 3. Configurar Cloudinary (imágenes)

1. Registrarse en [cloudinary.com](https://cloudinary.com) — plan gratis = 25 GB
2. Dashboard → copiar Cloud name, API Key, API Secret
3. Pegar en `.env`

### 4. Configurar Google OAuth

1. Ir a [console.cloud.google.com](https://console.cloud.google.com)
2. APIs & Services → Credentials → Create OAuth 2.0 Client
3. Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
4. Pegar Client ID y Secret en `.env`

### 5. Bancard (pagos en Paraguay)

Contactar a **Bancard** en [bancard.com.py](https://bancard.com.py) para obtener credenciales de sandbox y luego producción.

URL del webhook que hay que registrar en Bancard:
```
https://TU_DOMINIO/api/payments/bancard-confirm
```

### 6. PayPal

1. Ir a [developer.paypal.com](https://developer.paypal.com)
2. Apps & Credentials → Create App (Sandbox primero)
3. Pegar Client ID y Secret en `.env`

### 7. Primer usuario admin

```bash
# Abre Prisma Studio para editar directamente la BD
npx prisma studio
# En la tabla users, cambiar el campo "role" de CLIENT a ADMIN
```

O agregar este script en `prisma/seed.ts`:
```ts
await prisma.user.update({
  where: { email: 'tu@email.com' },
  data: { role: 'ADMIN' }
})
```

### 8. Correr en desarrollo

```bash
npm run dev
# → http://localhost:3000
# → Panel admin: http://localhost:3000/admin
```

## Deploy en Vercel

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel

# Configurar variables de entorno en vercel.com → Project → Settings → Environment Variables
# (copiar todas las del .env)

# Dominio personalizado
vercel domains add tecnovate.com.py
```

## Funcionalidades incluidas

### Tienda
- [x] Catálogo de productos con filtros por categoría
- [x] Búsqueda en tiempo real
- [x] Página de detalle con imágenes, specs y reseñas
- [x] Carrito persistido en localStorage
- [x] Lista de deseos (wishlist)

### Zona Gamer
- [x] Armador de PC por slots (CPU, MB, RAM, GPU, Storage, PSU, Case, Cooling)
- [x] Verificación de compatibilidad CPU↔Motherboard (socket)
- [x] Cálculo de consumo vs potencia de fuente
- [x] Agregar build completa al carrito con un click

### Autenticación
- [x] Login con email y contraseña
- [x] Registro de usuarios
- [x] Login con Google OAuth
- [x] Sesiones JWT
- [x] Rutas protegidas por rol (ADMIN / CLIENT)

### Pagos
- [x] Bancard (Visa, Mastercard, Amex en Paraguay)
- [x] PayPal (internacional)
- [x] Transferencia bancaria / Tigo Money
- [x] Pago en efectivo / coordinar por WhatsApp
- [x] Webhook de confirmación Bancard

### Panel Admin
- [x] Dashboard con stats en tiempo real (ventas, pedidos, usuarios)
- [x] Subida de productos con imágenes a Cloudinary
- [x] Configuración para PC Builder por producto
- [x] Gestión y cambio de estado de pedidos
- [x] Lista de usuarios

## Variables de entorno necesarias

Ver `.env.example` para descripción completa de cada variable.

## Contacto

Tecnovate — Ciudad del Este, Paraguay  
ventas@tecnovate.com.py
