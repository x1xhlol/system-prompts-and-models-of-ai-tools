const fs = require('fs');
const path = require('path');

// 检查文件是否存在未闭合的标签
function checkUnclosedTags(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // 检查未闭合的HTML标签
  const htmlTagPattern = /<([a-zA-Z][a-zA-Z0-9]*)[^>]*>(?!.*<\/\1>)/gs;
  const htmlMatches = content.match(htmlTagPattern);
  
  // 检查未闭合的代码块
  const codeBlockPattern = /```[a-z]*\s*$/;
  const codeBlockMatches = content.match(codeBlockPattern);
  
  // 检查重复的标签
  const duplicatePattern = /(<system-reminder[^>]*>.*?<\/system-reminder>\s*){2,}/gs;
  const duplicateMatches = content.match(duplicatePattern);
  
  console.log(`检查文件: ${filePath}`);
  if (htmlMatches) {
    console.log('发现未闭合的HTML标签:', htmlMatches);
  }
  if (codeBlockMatches) {
    console.log('发现未闭合的代码块:', codeBlockMatches);
  }
  if (duplicateMatches) {
    console.log('发现重复的标签:', duplicateMatches);
  }
  if (!htmlMatches && !codeBlockMatches && !duplicateMatches) {
    console.log('未发现问题');
  }
  console.log('---');
}

// 检查所有修改过的文件
const files = [
  'docs/en/codebuddy-prompts/Craft Prompt.md',
  'docs/en/kiro/Spec_Prompt.md',
  'docs/en/open-source-prompts/RooCode/Prompt.md',
  'docs/en/v0-prompts-and-tools/Prompt.md'
];

files.forEach(file => {
  const fullPath = path.join(__dirname, '..', file);
  if (fs.existsSync(fullPath)) {
    checkUnclosedTags(fullPath);
  } else {
    console.log(`文件不存在: ${fullPath}`);
  }
});