#!/usr/bin/env node

/**
 * Simple test to verify diagnostic tools work
 */

console.log('🔍 Testing Diagnostic Tools\n');

// Check if diagnostic file exists
const fs = require('fs');
const path = require('path');

const diagnosticsFile = path.join(__dirname, 'lib', 'cocktailDiagnostics.ts');
const diagnoseScript = path.join(__dirname, 'scripts', 'diagnose-cocktail-data.ts');
const fixScript = path.join(__dirname, 'scripts', 'fix-missing-ingredients.ts');

console.log('📋 Checking files:\n');

const files = [
  { path: diagnosticsFile, name: 'Diagnostic Library' },
  { path: diagnoseScript, name: 'Diagnostic CLI Tool' },
  { path: fixScript, name: 'Repair CLI Tool' }
];

let allExist = true;
files.forEach(file => {
  const exists = fs.existsSync(file.path);
  const status = exists ? '✅' : '❌';
  const size = exists ? `(${fs.statSync(file.path).size} bytes)` : '';
  console.log(`${status} ${file.name}: ${file.path} ${size}`);
  if (!exists) allExist = false;
});

console.log('\n' + (allExist ? '✅ All diagnostic files present!' : '❌ Some files missing!'));

// Check environment
console.log('\n🔧 Environment Check:\n');

const envVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY'
];

envVars.forEach(env => {
  const value = process.env[env];
  const status = value ? '✅' : '❌';
  const display = value ? `(${value.substring(0, 20)}...)` : '(not set)';
  console.log(`${status} ${env} ${display}`);
});

console.log('\n📚 Documentation Files:\n');

const docs = [
  'START_QA_ISSUE_5.md',
  'QA_ISSUE_5_QUICK_START.md',
  'QA_ISSUE_5_README.md',
  'QA_ISSUE_5_INDEX.md',
  'QA_ISSUE_5_INVESTIGATION.md',
  'QA_ISSUE_5_SOLUTION.md',
  'ISSUE_5_SUMMARY.txt'
];

docs.forEach(doc => {
  const fullPath = path.join(__dirname, doc);
  const exists = fs.existsSync(fullPath);
  const status = exists ? '✅' : '❌';
  console.log(`${status} ${doc}`);
});

console.log('\n💾 Next Steps:\n');
console.log('1. Verify Supabase credentials are set in .env.local');
console.log('2. Run: npx ts-node scripts/diagnose-cocktail-data.ts');
console.log('3. Review the console output and diagnose-report.json');
console.log('4. If needed, run: npx ts-node scripts/fix-missing-ingredients.ts --dry-run');
console.log('5. Then apply: npx ts-node scripts/fix-missing-ingredients.ts --apply');

console.log('\n🎯 Start with reading: START_QA_ISSUE_5.md\n');

