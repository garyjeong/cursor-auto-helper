#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function getCurrentVersion() {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  return packageJson.version;
}

function getLastTag() {
  try {
    return execSync('git describe --tags --abbrev=0', { encoding: 'utf8' }).trim();
  } catch (error) {
    return null;
  }
}

function getCommitsSinceTag(tag) {
  const command = tag 
    ? `git log ${tag}..HEAD --oneline --no-merges`
    : 'git log --oneline --no-merges';
  
  try {
    const output = execSync(command, { encoding: 'utf8' });
    return output.trim().split('\n').filter(line => line.trim());
  } catch (error) {
    return [];
  }
}

function categorizeCommits(commits) {
  const categories = {
    breaking: [],
    features: [],
    fixes: [],
    docs: [],
    style: [],
    refactor: [],
    perf: [],
    test: [],
    chore: [],
    other: []
  };

  commits.forEach(commit => {
    const message = commit.toLowerCase();
    
    if (message.includes('breaking') || message.includes('!:')) {
      categories.breaking.push(commit);
    } else if (message.startsWith('feat') || message.includes('feature')) {
      categories.features.push(commit);
    } else if (message.startsWith('fix') || message.includes('bug')) {
      categories.fixes.push(commit);
    } else if (message.startsWith('docs')) {
      categories.docs.push(commit);
    } else if (message.startsWith('style')) {
      categories.style.push(commit);
    } else if (message.startsWith('refactor')) {
      categories.refactor.push(commit);
    } else if (message.startsWith('perf')) {
      categories.perf.push(commit);
    } else if (message.startsWith('test')) {
      categories.test.push(commit);
    } else if (message.startsWith('chore')) {
      categories.chore.push(commit);
    } else {
      categories.other.push(commit);
    }
  });

  return categories;
}

function formatCommit(commit) {
  // 커밋 해시 제거하고 메시지만 추출
  const parts = commit.split(' ');
  const hash = parts[0];
  const message = parts.slice(1).join(' ');
  
  // 첫 글자 대문자로 변경
  const formattedMessage = message.charAt(0).toUpperCase() + message.slice(1);
  
  return `- ${formattedMessage} (${hash})`;
}

function generateChangelogSection(version, categories) {
  const date = new Date().toISOString().split('T')[0];
  let section = `## [${version}] - ${date}\n\n`;

  if (categories.breaking.length > 0) {
    section += '### 💥 BREAKING CHANGES\n\n';
    categories.breaking.forEach(commit => {
      section += formatCommit(commit) + '\n';
    });
    section += '\n';
  }

  if (categories.features.length > 0) {
    section += '### ✨ Features\n\n';
    categories.features.forEach(commit => {
      section += formatCommit(commit) + '\n';
    });
    section += '\n';
  }

  if (categories.fixes.length > 0) {
    section += '### 🐛 Bug Fixes\n\n';
    categories.fixes.forEach(commit => {
      section += formatCommit(commit) + '\n';
    });
    section += '\n';
  }

  if (categories.docs.length > 0) {
    section += '### 📚 Documentation\n\n';
    categories.docs.forEach(commit => {
      section += formatCommit(commit) + '\n';
    });
    section += '\n';
  }

  if (categories.refactor.length > 0) {
    section += '### ♻️ Code Refactoring\n\n';
    categories.refactor.forEach(commit => {
      section += formatCommit(commit) + '\n';
    });
    section += '\n';
  }

  if (categories.perf.length > 0) {
    section += '### ⚡ Performance Improvements\n\n';
    categories.perf.forEach(commit => {
      section += formatCommit(commit) + '\n';
    });
    section += '\n';
  }

  if (categories.test.length > 0) {
    section += '### 🧪 Tests\n\n';
    categories.test.forEach(commit => {
      section += formatCommit(commit) + '\n';
    });
    section += '\n';
  }

  if (categories.chore.length > 0) {
    section += '### 🔧 Chores\n\n';
    categories.chore.forEach(commit => {
      section += formatCommit(commit) + '\n';
    });
    section += '\n';
  }

  if (categories.other.length > 0) {
    section += '### 📦 Other Changes\n\n';
    categories.other.forEach(commit => {
      section += formatCommit(commit) + '\n';
    });
    section += '\n';
  }

  return section;
}

function updateChangelog(newSection) {
  const changelogPath = 'CHANGELOG.md';
  let existingContent = '';

  if (fs.existsSync(changelogPath)) {
    existingContent = fs.readFileSync(changelogPath, 'utf8');
  } else {
    existingContent = '# Changelog\n\nAll notable changes to this project will be documented in this file.\n\nThe format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),\nand this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).\n\n';
  }

  // 새 섹션을 기존 내용 앞에 삽입
  const lines = existingContent.split('\n');
  const insertIndex = lines.findIndex(line => line.startsWith('## [')) || lines.length;
  
  lines.splice(insertIndex, 0, newSection);
  
  const updatedContent = lines.join('\n');
  fs.writeFileSync(changelogPath, updatedContent);
}

function main() {
  console.log('📝 Generating changelog...');
  
  const currentVersion = getCurrentVersion();
  const lastTag = getLastTag();
  
  console.log(`Current version: ${currentVersion}`);
  console.log(`Last tag: ${lastTag || 'none'}`);
  
  const commits = getCommitsSinceTag(lastTag);
  
  if (commits.length === 0) {
    console.log('No new commits found since last tag.');
    return;
  }
  
  console.log(`Found ${commits.length} commits since last tag.`);
  
  const categories = categorizeCommits(commits);
  const changelogSection = generateChangelogSection(currentVersion, categories);
  
  updateChangelog(changelogSection);
  
  console.log('✅ Changelog updated successfully!');
}

if (require.main === module) {
  main();
}

module.exports = { 
  getCurrentVersion, 
  getCommitsSinceTag, 
  categorizeCommits, 
  generateChangelogSection 
}; 