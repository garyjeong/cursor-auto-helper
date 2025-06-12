#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 색상 출력을 위한 유틸리티
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function exec(command, options = {}) {
  try {
    return execSync(command, { encoding: 'utf8', stdio: 'inherit', ...options });
  } catch (error) {
    log(`Error executing: ${command}`, 'red');
    log(error.message, 'red');
    process.exit(1);
  }
}

function getCurrentVersion() {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  return packageJson.version;
}

function validateWorkingDirectory() {
  try {
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    if (status.trim()) {
      log('Working directory is not clean. Please commit or stash changes.', 'red');
      process.exit(1);
    }
  } catch (error) {
    log('Error checking git status', 'red');
    process.exit(1);
  }
}

function validateBranch() {
  try {
    const branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
    if (branch !== 'main' && branch !== 'develop') {
      log(`Warning: You are on branch '${branch}'. Releases should typically be made from 'main' or 'develop'.`, 'yellow');
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      return new Promise((resolve) => {
        readline.question('Continue anyway? (y/N): ', (answer) => {
          readline.close();
          if (answer.toLowerCase() !== 'y') {
            process.exit(1);
          }
          resolve();
        });
      });
    }
  } catch (error) {
    log('Error checking current branch', 'red');
    process.exit(1);
  }
}

async function selectReleaseType() {
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    log('\nSelect release type:', 'cyan');
    log('1. patch (bug fixes)');
    log('2. minor (new features)');
    log('3. major (breaking changes)');
    log('4. custom version');
    
    readline.question('\nEnter your choice (1-4): ', (answer) => {
      readline.close();
      
      switch (answer) {
        case '1':
          resolve('patch');
          break;
        case '2':
          resolve('minor');
          break;
        case '3':
          resolve('major');
          break;
        case '4':
          resolve('custom');
          break;
        default:
          log('Invalid choice', 'red');
          process.exit(1);
      }
    });
  });
}

async function getCustomVersion() {
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    readline.question('Enter custom version (e.g., 1.2.3): ', (version) => {
      readline.close();
      
      if (!/^\d+\.\d+\.\d+$/.test(version)) {
        log('Invalid version format. Use semantic versioning (x.y.z)', 'red');
        process.exit(1);
      }
      
      resolve(version);
    });
  });
}

async function main() {
  log('🚀 Starting release process...', 'cyan');
  
  // 1. 작업 디렉토리 검증
  log('\n📋 Validating working directory...', 'blue');
  validateWorkingDirectory();
  
  // 2. 브랜치 검증
  log('📋 Validating branch...', 'blue');
  await validateBranch();
  
  // 3. 현재 버전 표시
  const currentVersion = getCurrentVersion();
  log(`\n📦 Current version: ${currentVersion}`, 'blue');
  
  // 4. 릴리스 타입 선택
  const releaseType = await selectReleaseType();
  
  let newVersion;
  if (releaseType === 'custom') {
    newVersion = await getCustomVersion();
  } else {
    // 5. 버전 업데이트
    log(`\n⬆️  Bumping ${releaseType} version...`, 'blue');
    exec(`npm run version:${releaseType}`);
    newVersion = getCurrentVersion();
  }
  
  log(`\n📦 New version: ${newVersion}`, 'green');
  
  // 6. 체인지로그 업데이트
  log('\n📝 Updating changelog...', 'blue');
  exec('npm run changelog');
  
  // 7. 빌드 및 테스트
  log('\n🔨 Running build and tests...', 'blue');
  exec('npm run release:prepare');
  
  // 8. Git 커밋 및 태그
  log('\n📝 Creating git commit and tag...', 'blue');
  exec('git add .');
  exec(`git commit -m "chore: release v${newVersion}"`);
  exec(`git tag v${newVersion}`);
  
  // 9. 푸시 (GitHub Actions 트리거)
  log('\n🚀 Pushing to remote (this will trigger GitHub Actions)...', 'blue');
  exec('git push origin HEAD');
  exec(`git push origin v${newVersion}`);
  
  log('\n✅ Release process completed!', 'green');
  log(`🎉 Version ${newVersion} has been released!`, 'green');
  log('\n📋 Next steps:', 'cyan');
  log('1. Check GitHub Actions for build status');
  log('2. Verify the release on GitHub');
  log('3. Monitor VS Code Marketplace for publication');
}

// 스크립트 실행
if (require.main === module) {
  main().catch((error) => {
    log(`Error: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = { getCurrentVersion, validateWorkingDirectory }; 