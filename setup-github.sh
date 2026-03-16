#!/bin/bash

# ╔══════════════════════════════════════════════════════════════════╗
# ║          TECNOVATE — Script de setup en GitHub + Vercel         ║
# ║  Ejecutar con: bash setup-github.sh                             ║
# ╚══════════════════════════════════════════════════════════════════╝

set -e

GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo ""
echo -e "${CYAN}╔══════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║       TECNOVATE — Setup Automático           ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════╝${NC}"
echo ""

# ── 1. Verificar dependencias ────────────────────────────────────────
echo -e "${YELLOW}[1/7] Verificando dependencias...${NC}"

command -v node >/dev/null 2>&1 || { echo -e "${RED}✗ Node.js no encontrado. Instalá en: https://nodejs.org${NC}"; exit 1; }
command -v git >/dev/null 2>&1 || { echo -e "${RED}✗ Git no encontrado. Instalá en: https://git-scm.com${NC}"; exit 1; }

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
  echo -e "${RED}✗ Necesitás Node.js 18 o superior (tenés v$(node -v))${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Node $(node -v), npm $(npm -v), git $(git --version | awk '{print $3}')${NC}"

# ── 2. Instalar dependencias del proyecto ───────────────────────────
echo ""
echo -e "${YELLOW}[2/7] Instalando dependencias npm...${NC}"
npm install
echo -e "${GREEN}✓ Dependencias instaladas${NC}"

# ── 3. Configurar .env ──────────────────────────────────────────────
echo ""
echo -e "${YELLOW}[3/7] Configurando variables de entorno...${NC}"

if [ ! -f ".env" ]; then
  cp .env.example .env
  echo -e "${GREEN}✓ .env creado desde .env.example${NC}"
  echo ""
  echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "  IMPORTANTE: Editá el archivo ${CYAN}.env${NC} con tus credenciales:"
  echo -e "  ${CYAN}nano .env${NC}  o  ${CYAN}code .env${NC}"
  echo ""
  echo -e "  Variables necesarias:"
  echo -e "  • ${GREEN}DATABASE_URL${NC}     → Supabase connection string"
  echo -e "  • ${GREEN}NEXTAUTH_SECRET${NC}  → Random: openssl rand -base64 32"
  echo -e "  • ${GREEN}GOOGLE_*${NC}         → Google OAuth (console.cloud.google.com)"
  echo -e "  • ${GREEN}CLOUDINARY_*${NC}     → cloudinary.com (imágenes)"
  echo -e "  • ${GREEN}BANCARD_*${NC}        → bancard.com.py (pagos PY)"
  echo -e "  • ${GREEN}PAYPAL_*${NC}         → developer.paypal.com"
  echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
  read -p "  ¿Ya editaste el .env? (s/n): " EDITED_ENV
  if [[ "$EDITED_ENV" != "s" && "$EDITED_ENV" != "S" ]]; then
    echo -e "${YELLOW}Editá el .env y volvé a correr este script.${NC}"
    exit 0
  fi
else
  echo -e "${GREEN}✓ .env ya existe${NC}"
fi

# ── 4. Base de datos ────────────────────────────────────────────────
echo ""
echo -e "${YELLOW}[4/7] Configurando base de datos...${NC}"

echo "Generando cliente Prisma..."
npx prisma generate

echo "Aplicando schema a la base de datos..."
npx prisma db push

echo "Cargando datos iniciales (seed)..."
npx ts-node prisma/seed.ts 2>/dev/null || npx prisma db seed 2>/dev/null || echo -e "${YELLOW}  (seed omitido — podés correrlo luego con: npx ts-node prisma/seed.ts)${NC}"

echo -e "${GREEN}✓ Base de datos configurada${NC}"

# ── 5. Git init + primer commit ─────────────────────────────────────
echo ""
echo -e "${YELLOW}[5/7] Inicializando repositorio Git...${NC}"

if [ ! -d ".git" ]; then
  git init
  echo -e "${GREEN}✓ Repositorio Git inicializado${NC}"
else
  echo -e "${GREEN}✓ Repositorio Git ya existe${NC}"
fi

git add .
git commit -m "🚀 Initial commit — Tecnovate ecommerce" 2>/dev/null || echo -e "${YELLOW}  (sin cambios para commitear)${NC}"

# ── 6. Subir a GitHub ───────────────────────────────────────────────
echo ""
echo -e "${YELLOW}[6/7] Subiendo a GitHub...${NC}"
echo ""
echo -e "  Para subir a GitHub necesitás:"
echo -e "  1. Crear un repo en ${CYAN}https://github.com/new${NC}"
echo -e "     Nombre sugerido: ${GREEN}tecnovate${NC} (sin initializar con README)"
echo ""
read -p "  Pegá la URL del repo (ej: https://github.com/usuario/tecnovate.git): " REPO_URL

if [ -n "$REPO_URL" ]; then
  git remote remove origin 2>/dev/null || true
  git remote add origin "$REPO_URL"
  git branch -M main
  git push -u origin main
  echo -e "${GREEN}✓ Código subido a GitHub: $REPO_URL${NC}"
else
  echo -e "${YELLOW}  Saltando push a GitHub${NC}"
fi

# ── 7. Deploy en Vercel ─────────────────────────────────────────────
echo ""
echo -e "${YELLOW}[7/7] Deploy en Vercel...${NC}"
echo ""
echo -e "  Opción A — Deploy automático desde GitHub (recomendado):"
echo -e "  1. Ir a ${CYAN}https://vercel.com/new${NC}"
echo -e "  2. Importar tu repo de GitHub: ${GREEN}tecnovate${NC}"
echo -e "  3. Agregar las variables de entorno del .env en Vercel"
echo -e "  4. Click Deploy ✓"
echo ""
echo -e "  Opción B — Deploy por CLI:"

if command -v vercel >/dev/null 2>&1; then
  read -p "  ¿Deployar ahora con Vercel CLI? (s/n): " DO_DEPLOY
  if [[ "$DO_DEPLOY" == "s" || "$DO_DEPLOY" == "S" ]]; then
    vercel --prod
  fi
else
  echo -e "  ${CYAN}npm i -g vercel && vercel --prod${NC}"
fi

# ── Resumen final ───────────────────────────────────────────────────
echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║         ✓ SETUP COMPLETADO                       ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "  ${CYAN}Correr en desarrollo:${NC}    npm run dev"
echo -e "  ${CYAN}Panel admin:${NC}             http://localhost:3000/admin"
echo -e "  ${CYAN}Admin login:${NC}             admin@tecnovate.com.py / admin123"
echo -e "  ${CYAN}Ver BD (Prisma Studio):${NC}  npx prisma studio"
echo ""
echo -e "  ${YELLOW}Próximos pasos:${NC}"
echo -e "  • Cambiá la contraseña del admin en /admin/users"
echo -e "  • Configurá Bancard y PayPal en /admin/payments"
echo -e "  • Subí tus primeros productos en /admin/products/new"
echo -e "  • Configurá tu dominio en vercel.com → Project → Domains"
echo ""
