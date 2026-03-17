const fs = require('fs');
const path = require('path');

function walk(dir) {
  fs.readdirSync(dir).forEach(f => {
    const full = path.join(dir, f);
    try {
      if (fs.statSync(full).isDirectory() && f !== 'node_modules' && f !== '.next') {
        walk(full);
      } else if (f.endsWith('.ts') || f.endsWith('.tsx')) {
        const content = fs.readFileSync(full, 'utf8');
        const updated = content.replace(
          /from '@\/app\/api\/auth\/\[\.\.\.nextauth\]\/route'/g,
          "from '@/lib/auth'"
        );
        if (content !== updated) {
          fs.writeFileSync(full, updated);
          console.log('Actualizado: ' + full);
        }
      }
    } catch(e) {}
  });
}

walk('.');
console.log('Listo!');