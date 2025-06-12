#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// 색상 출력을 위한 유틸리티
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
  log(`\n${colors.bold}${colors.cyan}[${step}]${colors.reset} ${colors.blue}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`${colors.green}✅ ${message}${colors.reset}`);
}

function logError(message) {
  log(`${colors.red}❌ ${message}${colors.reset}`);
}

function logWarning(message) {
  log(`${colors.yellow}⚠️  ${message}${colors.reset}`);
}

function exec(command, options = {}) {
  try {
    const result = execSync(command, { 
      encoding: 'utf8', 
      stdio: options.silent ? 'pipe' : 'inherit', 
      ...options 
    });
    return result;
  } catch (error) {
    logError(`Command failed: ${command}`);
    if (options.silent) {
      logError(error.message);
    }
    throw error;
  }
}

function getCurrentVersion() {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  return packageJson.version;
}

function updatePackageVersion(newVersion) {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  packageJson.version = newVersion;
  fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2) + '\n');
}

function validateEnvironment() {
  logStep('1', 'Environment Validation');
  
  // Git 저장소 확인
  try {
    exec('git status', { silent: true });
    logSuccess('Git repository detected');
  } catch (error) {
    logError('Not a git repository');
    throw new Error('This script must be run in a git repository');
  }

  // Node.js 및 npm 확인
  try {
    const nodeVersion = exec('node --version', { silent: true }).trim();
    const npmVersion = exec('npm --version', { silent: true }).trim();
    logSuccess(`Node.js ${nodeVersion}, npm ${npmVersion}`);
  } catch (error) {
    logError('Node.js or npm not found');
    throw error;
  }

  // VSCE 확인
  try {
    const vsceVersion = exec('vsce --version', { silent: true }).trim();
    logSuccess(`VSCE ${vsceVersion} installed`);
  } catch (error) {
    logWarning('VSCE not found, installing...');
    exec('npm install -g @vscode/vsce');
    logSuccess('VSCE installed successfully');
  }

  // package.json 확인
  if (!fs.existsSync('package.json')) {
    logError('package.json not found');
    throw new Error('package.json is required');
  }

  // 필수 필드 확인
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const requiredFields = ['name', 'version', 'description', 'publisher'];
  const missingFields = requiredFields.filter(field => !packageJson[field]);
  
  if (missingFields.length > 0) {
    logError(`Missing required fields in package.json: ${missingFields.join(', ')}`);
    throw new Error('Please complete package.json metadata');
  }

  logSuccess('Environment validation completed');
}

function validateWorkingDirectory() {
  logStep('2', 'Working Directory Validation');
  
  try {
    const status = exec('git status --porcelain', { silent: true });
    if (status.trim()) {
      logError('Working directory is not clean');
      log('Uncommitted changes:', 'yellow');
      console.log(status);
      throw new Error('Please commit or stash changes before release');
    }
    logSuccess('Working directory is clean');
  } catch (error) {
    if (error.message.includes('commit or stash')) {
      throw error;
    }
    logError('Error checking git status');
    throw error;
  }
}

function validateBranch() {
  logStep('3', 'Branch Validation');
  
  try {
    const branch = exec('git rev-parse --abbrev-ref HEAD', { silent: true }).trim();
    log(`Current branch: ${branch}`, 'blue');
    
    if (branch !== 'main' && branch !== 'master' && branch !== 'develop') {
      logWarning(`You are on branch '${branch}'. Releases are typically made from 'main', 'master', or 'develop'.`);
      return false;
    }
    
    logSuccess('Branch validation passed');
    return true;
  } catch (error) {
    logError('Error checking current branch');
    throw error;
  }
}

async function confirmBranch() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question('Continue with release from this branch? (y/N): ', (answer) => {
      rl.close();
      if (answer.toLowerCase() !== 'y') {
        log('Release cancelled by user', 'yellow');
        process.exit(0);
      }
      resolve();
    });
  });
}

async function selectReleaseType() {
  logStep('4', 'Release Type Selection');
  
  const currentVersion = getCurrentVersion();
  log(`Current version: ${currentVersion}`, 'blue');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    log('\nSelect release type:', 'cyan');
    log('1. patch (bug fixes) - e.g., 1.0.0 → 1.0.1');
    log('2. minor (new features) - e.g., 1.0.0 → 1.1.0');
    log('3. major (breaking changes) - e.g., 1.0.0 → 2.0.0');
    log('4. custom version');
    log('5. auto (based on commit messages)');
    
    rl.question('\nEnter your choice (1-5): ', (answer) => {
      rl.close();
      
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
        case '5':
          resolve('auto');
          break;
        default:
          logError('Invalid choice');
          process.exit(1);
      }
    });
  });
}

async function getCustomVersion() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question('Enter custom version (e.g., 1.2.3): ', (version) => {
      rl.close();
      
      if (!/^\d+\.\d+\.\d+(-[\w\.-]+)?$/.test(version)) {
        logError('Invalid version format. Use semantic versioning (x.y.z or x.y.z-prerelease)');
        process.exit(1);
      }
      
      resolve(version);
    });
  });
}

function determineAutoReleaseType() {
  logStep('4.1', 'Analyzing commit messages for auto release type');
  
  try {
    const lastTag = exec('git describe --tags --abbrev=0', { silent: true }).trim();
    const commits = exec(`git log ${lastTag}..HEAD --oneline --no-merges`, { silent: true });
    
    if (!commits.trim()) {
      logWarning('No new commits since last tag');
      return 'patch';
    }

    const commitMessages = commits.toLowerCase();
    
    if (commitMessages.includes('breaking') || commitMessages.includes('!:')) {
      log('Breaking changes detected → major release', 'yellow');
      return 'major';
    } else if (commitMessages.includes('feat') || commitMessages.includes('feature')) {
      log('New features detected → minor release', 'blue');
      return 'minor';
    } else {
      log('Bug fixes/improvements detected → patch release', 'green');
      return 'patch';
    }
  } catch (error) {
    logWarning('No previous tags found, defaulting to patch release');
    return 'patch';
  }
}

function runTests() {
  logStep('5', 'Running Tests and Quality Checks');
  
  try {
    log('Running TypeScript compilation...', 'blue');
    exec('npm run compile');
    logSuccess('TypeScript compilation passed');

    log('Running ESLint...', 'blue');
    exec('npm run lint');
    logSuccess('ESLint checks passed');

    log('Running unit tests...', 'blue');
    exec('npm test');
    logSuccess('All tests passed');

  } catch (error) {
    logError('Quality checks failed');
    throw new Error('Please fix all issues before release');
  }
}

function updateVersion(releaseType, customVersion = null) {
  logStep('6', 'Version Update');
  
  const currentVersion = getCurrentVersion();
  let newVersion;

  if (customVersion) {
    newVersion = customVersion;
    updatePackageVersion(newVersion);
  } else {
    exec(`npm version ${releaseType} --no-git-tag-version`);
    newVersion = getCurrentVersion();
  }

  log(`Version updated: ${currentVersion} → ${newVersion}`, 'green');
  return newVersion;
}

function generateChangelog() {
  logStep('7', 'Generating Changelog');
  
  try {
    exec('npm run changelog');
    logSuccess('Changelog updated');
  } catch (error) {
    logWarning('Changelog generation failed, continuing...');
  }
}

function createVSIXPackage() {
  logStep('8', 'Creating VSIX Package');
  
  try {
    exec('npm run package');
    logSuccess('VSIX package created successfully');
    
    // 패키지 정보 표시
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const vsixFile = `${packageJson.name}-${packageJson.version}.vsix`;
    
    if (fs.existsSync(vsixFile)) {
      const stats = fs.statSync(vsixFile);
      const sizeKB = (stats.size / 1024).toFixed(2);
      log(`Package: ${vsixFile} (${sizeKB} KB)`, 'blue');
    }
    
    return vsixFile;
  } catch (error) {
    logError('VSIX package creation failed');
    throw error;
  }
}

function commitAndTag(version) {
  logStep('9', 'Git Commit and Tag');
  
  try {
    exec('git add .');
    exec(`git commit -m "chore: release v${version}

- Update version to ${version}
- Update changelog
- Create release package"`);
    
    exec(`git tag v${version}`);
    logSuccess(`Created git tag v${version}`);
  } catch (error) {
    logError('Git commit and tag creation failed');
    throw error;
  }
}

async function confirmPush() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question('\nPush to remote repository and trigger GitHub Actions? (Y/n): ', (answer) => {
      rl.close();
      resolve(answer.toLowerCase() !== 'n');
    });
  });
}

function pushToRemote(version) {
  logStep('10', 'Pushing to Remote Repository');
  
  try {
    exec('git push origin HEAD');
    exec(`git push origin v${version}`);
    logSuccess('Pushed to remote repository');
    logSuccess('GitHub Actions will be triggered automatically');
  } catch (error) {
    logError('Failed to push to remote repository');
    throw error;
  }
}

async function confirmMarketplacePublish() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question('\nPublish directly to VS Code Marketplace? (y/N): ', (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'y');
    });
  });
}

function publishToMarketplace() {
  logStep('11', 'Publishing to VS Code Marketplace');
  
  try {
    // VSCE 로그인 상태 확인
    try {
      exec('vsce ls', { silent: true });
    } catch (error) {
      logWarning('Not logged in to VSCE. Please run "vsce login <publisher>" first');
      return false;
    }

    exec('vsce publish --no-git-tag-version');
    logSuccess('Published to VS Code Marketplace');
    return true;
  } catch (error) {
    logError('Marketplace publication failed');
    logWarning('You can publish manually later using: vsce publish');
    return false;
  }
}

function generateReleaseReport(version, vsixFile, marketplacePublished) {
  logStep('12', 'Release Report');
  
  const report = `
${colors.bold}${colors.green}🎉 RELEASE COMPLETED SUCCESSFULLY! 🎉${colors.reset}

${colors.bold}Release Details:${colors.reset}
• Version: ${colors.cyan}v${version}${colors.reset}
• Package: ${colors.blue}${vsixFile}${colors.reset}
• Git Tag: ${colors.yellow}v${version}${colors.reset}
• Marketplace: ${marketplacePublished ? colors.green + '✅ Published' : colors.yellow + '⏳ Pending'} ${colors.reset}

${colors.bold}Next Steps:${colors.reset}
• Monitor GitHub Actions: ${colors.blue}https://github.com/your-username/cursor-auto-resumer/actions${colors.reset}
• Check GitHub Release: ${colors.blue}https://github.com/your-username/cursor-auto-resumer/releases/tag/v${version}${colors.reset}
• VS Code Marketplace: ${colors.blue}https://marketplace.visualstudio.com/items?itemName=your-publisher.cursor-auto-resumer${colors.reset}

${colors.bold}Manual Commands (if needed):${colors.reset}
• Install locally: ${colors.cyan}code --install-extension ${vsixFile}${colors.reset}
• Publish manually: ${colors.cyan}vsce publish${colors.reset}
• Rollback: ${colors.cyan}git reset --hard HEAD~1 && git tag -d v${version}${colors.reset}
`;

  console.log(report);
}

async function main() {
  try {
    log(`${colors.bold}${colors.cyan}🚀 CURSOR AUTO RESUMER - AUTOMATED RELEASE SCRIPT 🚀${colors.reset}\n`);
    
    // 1. 환경 검증
    validateEnvironment();
    
    // 2. 작업 디렉토리 검증
    validateWorkingDirectory();
    
    // 3. 브랜치 검증
    const branchValid = validateBranch();
    if (!branchValid) {
      await confirmBranch();
    }
    
    // 4. 릴리스 타입 선택
    const releaseType = await selectReleaseType();
    
    let newVersion;
    if (releaseType === 'custom') {
      newVersion = await getCustomVersion();
    } else if (releaseType === 'auto') {
      const autoType = determineAutoReleaseType();
      newVersion = null; // npm version will handle it
      updateVersion(autoType);
      newVersion = getCurrentVersion();
    } else {
      newVersion = null; // npm version will handle it
      updateVersion(releaseType);
      newVersion = getCurrentVersion();
    }
    
    if (releaseType === 'custom') {
      updateVersion(null, newVersion);
    }
    
    // 5. 테스트 및 품질 검사
    runTests();
    
    // 6. 체인지로그 생성
    generateChangelog();
    
    // 7. VSIX 패키지 생성
    const vsixFile = createVSIXPackage();
    
    // 8. Git 커밋 및 태그
    commitAndTag(newVersion);
    
    // 9. 원격 저장소 푸시 확인
    const shouldPush = await confirmPush();
    if (shouldPush) {
      pushToRemote(newVersion);
    }
    
    // 10. Marketplace 배포 확인
    let marketplacePublished = false;
    const shouldPublish = await confirmMarketplacePublish();
    if (shouldPublish) {
      marketplacePublished = publishToMarketplace();
    }
    
    // 11. 릴리스 리포트 생성
    generateReleaseReport(newVersion, vsixFile, marketplacePublished);
    
  } catch (error) {
    logError(`Release failed: ${error.message}`);
    log('\n🔧 Troubleshooting tips:', 'yellow');
    log('• Check git status and commit any pending changes');
    log('• Ensure all tests pass: npm test');
    log('• Verify VSCE login: vsce login <publisher>');
    log('• Check GitHub repository access');
    process.exit(1);
  }
}

// 스크립트 실행
if (require.main === module) {
  main().catch((error) => {
    logError(`Unexpected error: ${error.message}`);
    process.exit(1);
  });
}

module.exports = {
  validateEnvironment,
  validateWorkingDirectory,
  getCurrentVersion,
  updateVersion,
  createVSIXPackage
}; 