import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

// Exact allowlist of permitted files where <button> may appear for:
// - sidebar, bottom-tab, breadcrumbs navigation
// - segmented selectors
// - expand/collapse of card details
// - closing overlays with Esc or click-outside
const ALLOWLISTED_FILES = new Set([
  'Sidebar.jsx',
  'BottomTabBar.jsx',
  'Navbar.jsx',
  'JudgeDemosModal.jsx',
  'TinkerModal.jsx',
  'VerdictPage.jsx',
  'AssessPage.jsx',
  'HomePage.jsx',
  'HistoryPage.jsx',
  'ActionPage.jsx',
  'CatalogPage.jsx',
  'Button.jsx', // Base UI primitive
  'Chip.jsx',   // Base UI primitive
  'Stepper.jsx', // Base UI primitive
  'OptionCard.jsx', // Base UI primitive
]);

// Prohibited primary action keywords in button text or labels
const PROHIBITED_ACTION_PATTERNS = [
  /submit/i,
  /save/i,
  /delete/i,
  /assess an item/i,
  /evaluate this fault/i,
  /view side-by-side/i,
  /print action checklist/i,
  /next step/i,
  /back to step/i,
  /finish & calculate/i,
  /book/i,
];

function getFilesRecursively(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFilesRecursively(fullPath));
    } else if (file.endsWith('.jsx')) {
      results.push(fullPath);
    }
  }
  return results;
}

describe('Phase 6 — Action Button Prohibition & Allowlist Test', () => {
  const rootSrc = path.resolve(__dirname, '../../');
  const pagesFiles = getFilesRecursively(path.join(rootSrc, 'pages'));
  const componentsFiles = getFilesRecursively(path.join(rootSrc, 'components'));
  const allUiFiles = [...pagesFiles, ...componentsFiles];

  it('fails if <button> appears in an unapproved file outside the allowlist', () => {
    const violations = [];

    for (const filePath of allUiFiles) {
      const fileName = path.basename(filePath);
      const content = fs.readFileSync(filePath, 'utf8');

      if (/<button[\s>]/i.test(content)) {
        if (!ALLOWLISTED_FILES.has(fileName)) {
          violations.push(`${fileName} contains <button> but is not in the allowlist.`);
        }
      }
    }

    expect(violations).toEqual([]);
  });

  it('verifies no buttons execute prohibited primary actions (Submit, Book, Save, Delete, Assess, Next, Back, Print, Compare)', () => {
    const prohibitedFound = [];

    for (const filePath of allUiFiles) {
      const fileName = path.basename(filePath);
      const content = fs.readFileSync(filePath, 'utf8');

      // Match all button tags and their inner content
      const buttonMatches = content.match(/<button[^>]*>([\s\S]*?)<\/button>/gi) || [];

      for (const btn of buttonMatches) {
        for (const pattern of PROHIBITED_ACTION_PATTERNS) {
          if (pattern.test(btn)) {
            prohibitedFound.push({
              file: fileName,
              buttonSnippet: btn.slice(0, 100).replace(/\s+/g, ' '),
              pattern: pattern.toString(),
            });
          }
        }
      }
    }

    expect(prohibitedFound).toEqual([]);
  });
});
