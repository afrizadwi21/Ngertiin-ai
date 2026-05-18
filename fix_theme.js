const fs = require('fs');
const file = 'app/dashboard/roadmap/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const replacements = [
  { search: /bg-zinc-950(?!\/)/g, replace: 'bg-zinc-50 dark:bg-zinc-950' },
  { search: /text-zinc-100/g, replace: 'text-zinc-900 dark:text-zinc-100' },
  { search: /bg-zinc-900\/60/g, replace: 'bg-white dark:bg-zinc-900/60' },
  { search: /border-white\/8/g, replace: 'border-zinc-200 dark:border-white/8' },
  { search: /text-white/g, replace: 'text-zinc-900 dark:text-white' },
  { search: /bg-zinc-900\/40/g, replace: 'bg-white dark:bg-zinc-900/40' },
  { search: /border-white\/5/g, replace: 'border-zinc-200 dark:border-white/5' },
  { search: /border-zinc-900(?!\/)/g, replace: 'border-zinc-200 dark:border-zinc-900' },
  { search: /text-zinc-400/g, replace: 'text-zinc-500 dark:text-zinc-400' },
  { search: /text-zinc-300/g, replace: 'text-zinc-700 dark:text-zinc-300' },
  { search: /text-zinc-200/g, replace: 'text-zinc-800 dark:text-zinc-200' },
  { search: /bg-zinc-950\/80/g, replace: 'bg-zinc-100 dark:bg-zinc-950/80' },
  { search: /border-zinc-800(?!\/)/g, replace: 'border-zinc-300 dark:border-zinc-800' },
  { search: /bg-zinc-950\/40/g, replace: 'bg-zinc-100 dark:bg-zinc-950/40' },
  { search: /border-zinc-800\/80/g, replace: 'border-zinc-200 dark:border-zinc-800/80' },
  { search: /bg-zinc-950\/50/g, replace: 'bg-zinc-50 dark:bg-zinc-950/50' },
  { search: /bg-zinc-900(?!\/)/g, replace: 'bg-white dark:bg-zinc-900' },
  { search: /bg-zinc-900\/20/g, replace: 'bg-zinc-50 dark:bg-zinc-900/20' },
  { search: /bg-zinc-900\/50/g, replace: 'bg-white dark:bg-zinc-900/50' },
  { search: /bg-zinc-950\/20/g, replace: 'bg-zinc-50 dark:bg-zinc-950/20' },
  { search: /bg-zinc-950\/60/g, replace: 'bg-zinc-100 dark:bg-zinc-950/60' },
  { search: /border-dashed border-zinc-800(?!\/)/g, replace: 'border-dashed border-zinc-300 dark:border-zinc-800' },
  { search: /bg-black\/60/g, replace: 'bg-black/40 dark:bg-black/60' },
  { search: /from-cyan-950\/20/g, replace: 'from-cyan-50 dark:from-cyan-950/20' },
  { search: /via-zinc-200/g, replace: 'via-zinc-800 dark:via-zinc-200' },
  { search: /to-zinc-500/g, replace: 'to-zinc-600 dark:to-zinc-500' }
];

replacements.forEach(r => {
  content = content.replace(r.search, r.replace);
});

// Since the regexes might have caught some things twice or wrong, let's fix some common mistakes
content = content.replace(/bg-white dark:bg-white dark:bg-zinc-900/g, 'bg-white dark:bg-zinc-900');
content = content.replace(/bg-zinc-50 dark:bg-zinc-50 dark:bg-zinc-950/g, 'bg-zinc-50 dark:bg-zinc-950');

// Fix text-white inside button which should stay text-white if it's on a colored background
// e.g. <button className="... bg-cyan-500 text-zinc-900 dark:text-white"
content = content.replace(/bg-cyan-500 text-zinc-900 dark:text-white/g, 'bg-cyan-500 text-white');
content = content.replace(/bg-rose-500 hover:bg-rose-600 text-zinc-900 dark:text-white/g, 'bg-rose-500 hover:bg-rose-600 text-white');

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed themes');
