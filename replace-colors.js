const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  'src/pages/Dashboard.tsx',
  'src/pages/Tables.tsx',
  'src/pages/Orders.tsx',
  'src/pages/Order.tsx',
  'src/pages/Settings.tsx',
  'src/App.tsx'
];

filesToUpdate.forEach(file => {
  const fullPath = path.join(process.cwd(), file);
  if (!fs.existsSync(fullPath)) return;
  
  let content = fs.readFileSync(fullPath, 'utf8');
  
  // Custom logic to avoid messing with tables "seated" status which is green intentionally
  // Or actually, if they pick a custom brand color, maybe ALL their "emerald" should become custom brand color.
  // Actually, seated is emerald-100/800. Let's just blindly replace emerald with primary where it's a tailwind class.
  // BUT the tailwind classes might be emerald-600, etc.
  
  // Better: replace bg-emerald-, text-emerald-, border-emerald-, ring-emerald- with bg-primary- etc.
  content = content.replace(/bg-emerald/g, 'bg-primary');
  content = content.replace(/text-emerald/g, 'text-primary');
  content = content.replace(/border-emerald/g, 'border-primary');
  content = content.replace(/ring-emerald/g, 'ring-primary');
  content = content.replace(/shadow-emerald/g, 'shadow-primary');
  content = content.replace(/decoration-emerald/g, 'decoration-primary');
  
  fs.writeFileSync(fullPath, content);
  console.log(`Updated ${file}`);
});
