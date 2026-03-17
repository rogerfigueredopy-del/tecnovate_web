const fs = require('fs');

// Fix 1: Agregar force-dynamic a páginas admin (server components)
const adminPages = [
  'app/admin/page.tsx',
  'app/admin/orders/page.tsx', 
  'app/admin/products/page.tsx',
  'app/admin/users/page.tsx',
];

adminPages.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');
  if (!content.includes('force-dynamic')) {
    content = "export const dynamic = 'force-dynamic'\n" + content;
    fs.writeFileSync(file, content);
    console.log('Fixed admin: ' + file);
  }
});

// Fix 2: Envolver useSearchParams en Suspense para login y products
const loginFile = 'app/login/page.tsx';
let login = fs.readFileSync(loginFile, 'utf8');
if (!login.includes('Suspense')) {
  login = login.replace("'use client'", "'use client'\nimport { Suspense } from 'react'");
  login = login.replace(
    'export default function LoginPage()',
    'function LoginPageInner()'
  );
  login = login + `
export default function LoginPage() {
  return (
    <Suspense>
      <LoginPageInner />
    </Suspense>
  )
}`;
  fs.writeFileSync(loginFile, login);
  console.log('Fixed login');
}

const productsFile = 'app/products/page.tsx';
let products = fs.readFileSync(productsFile, 'utf8');
if (!products.includes('Suspense')) {
  products = products.replace("'use client'", "'use client'\nimport { Suspense } from 'react'");
  products = products.replace(
    'export default function ProductsPage()',
    'function ProductsPageInner()'
  );
  products = products + `
export default function ProductsPage() {
  return (
    <Suspense>
      <ProductsPageInner />
    </Suspense>
  )
}`;
  fs.writeFileSync(productsFile, products);
  console.log('Fixed products');
}

console.log('Listo!');