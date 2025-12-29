#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🔒 Step 1: Creating backup...');
const timestamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0].replace('T', '-');
const backupBranch = `backup-before-clean-${timestamp}`;
const backupTag = `backup-${timestamp}`;

try {
  execSync(`git branch ${backupBranch}`, { cwd: '/Users/karim-f/Code/devbridge', stdio: 'inherit' });
  console.log(`✅ Backup branch created: ${backupBranch}`);
} catch (e) {
  console.log('Note: Backup branch may already exist');
}

try {
  execSync(`git tag ${backupTag}`, { cwd: '/Users/karim-f/Code/devbridge', stdio: 'inherit' });
  console.log(`✅ Backup tag created: ${backupTag}`);
} catch (e) {
  console.log('Note: Backup tag may already exist');
}

console.log('\n🧹 Step 2: Creating clean branch...');
try {
  execSync('git checkout main', { cwd: '/Users/karim-f/Code/devbridge', stdio: 'inherit' });
} catch (e) {
  console.log('Note: Already on main or main doesn\'t exist');
}

try {
  execSync('git checkout --orphan clean-main', { cwd: '/Users/karim-f/Code/devbridge', stdio: 'inherit' });
  console.log('✅ Orphan branch created');
} catch (e) {
  console.log('Note: clean-main may already exist, checking out...');
  execSync('git checkout clean-main', { cwd: '/Users/karim-f/Code/devbridge', stdio: 'inherit' });
}

console.log('\n📝 Step 3: Clearing and staging files...');
try {
  execSync('git rm -rf .', { cwd: '/Users/karim-f/Code/devbridge', stdio: 'inherit' });
} catch (e) {
  // Ignore errors
}

execSync('git add -A', { cwd: '/Users/karim-f/Code/devbridge', stdio: 'inherit' });
console.log('✅ Files staged');

console.log('\n📝 Step 4: Creating commit...');
const commitMessage = `Initial commit - NivoStack monorepo

- Dashboard with Next.js (NivoStack Studio)
- Flutter SDK (nivostack_sdk)
- Android SDK (com.plixera.nivostack)
- Documentation
- Deployment configurations for 4 Vercel projects`;

try {
  execSync(`git commit -m "${commitMessage}" --author="iplixera <iplixera@iplixera.com>"`, {
    cwd: '/Users/karim-f/Code/devbridge',
    stdio: 'inherit',
    env: { ...process.env, GIT_AUTHOR_NAME: 'iplixera', GIT_AUTHOR_EMAIL: 'iplixera@iplixera.com' }
  });
  console.log('✅ Commit created');
} catch (e) {
  console.log('Note: Commit may already exist or error occurred');
}

console.log('\n📤 Step 5: Pushing to repository...');
try {
  execSync('git push iplixera clean-main:main --force', {
    cwd: '/Users/karim-f/Code/devbridge',
    stdio: 'inherit'
  });
  console.log('✅ Push complete!');
} catch (e) {
  console.log('❌ Push failed. Error:', e.message);
  process.exit(1);
}

console.log('\n✅ Success!');
console.log(`📋 Repository: https://github.com/iplixera/nivostack-monorepo`);
console.log(`📋 Backup: ${backupBranch}`);

