#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

// 색상 출력
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function exec(command) {
  try {
    return execSync(command, { encoding: 'utf8', stdio: 'inherit' });
  } catch (error) {
    log(`❌ Command failed: ${command}`, 'red');
    process.exit(1);
  }
}

function getCurrentVersion() {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  return packageJson.version;
}

function main() {
  const releaseType = process.argv[2] || 'patch';
  
  if (!['patch', 'minor', 'major'].includes(releaseType)) {
    log('Usage: npm run quick-release [patch|minor|major]', 'yellow');
    log('Default: patch', 'yellow');
    process.exit(1);
  }

  log(`${colors.bold}${colors.cyan}🚀 QUICK RELEASE (${releaseType.toUpperCase()}) 🚀${colors.reset}\n`);

  const currentVersion = getCurrentVersion();
  log(`Current version: ${currentVersion}`, 'blue');

  // 1. 빌드 및 테스트
  log('\n📋 Running tests...', 'blue');
  exec('npm run compile');
  exec('npm run lint');
  exec('npm test');
  log('✅ All checks passed', 'green');

  // 2. 버전 업데이트
  log('\n📦 Updating version...', 'blue');
  exec(`npm version ${releaseType} --no-git-tag-version`);
  const newVersion = getCurrentVersion();
  log(`✅ Version updated: ${currentVersion} → ${newVersion}`, 'green');

  // 3. 체인지로그 업데이트
  log('\n📝 Updating changelog...', 'blue');
  try {
    exec('npm run changelog');
    log('✅ Changelog updated', 'green');
  } catch (error) {
    log('⚠️  Changelog update failed, continuing...', 'yellow');
  }

  // 4. 패키지 생성
  log('\n📦 Creating package...', 'blue');
  exec('npm run package');
  log('✅ VSIX package created', 'green');

  // 5. Git 커밋 및 태그
  log('\n📝 Creating git commit and tag...', 'blue');
  exec('git add .');
  exec(`git commit -m "chore: release v${newVersion}"`);
  exec(`git tag v${newVersion}`);
  log('✅ Git commit and tag created', 'green');

  // 6. 푸시
  log('\n🚀 Pushing to remote...', 'blue');
  exec('git push origin HEAD');
  exec(`git push origin v${newVersion}`);
  log('✅ Pushed to remote repository', 'green');

  // 완료 메시지
  log(`\n${colors.bold}${colors.green}🎉 QUICK RELEASE COMPLETED! 🎉${colors.reset}`);
  log(`Version: ${colors.cyan}v${newVersion}${colors.reset}`);
  log(`Package: ${colors.blue}cursor-auto-resumer-${newVersion}.vsix${colors.reset}`);
  log('\n📋 Next steps:');
  log('• Monitor GitHub Actions for automated deployment');
  log('• Check GitHub Releases page');
  log('• Verify VS Code Marketplace publication');
}

if (require.main === module) {
  main();
} 