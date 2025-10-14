const fs = require('fs');
const path = require('path');

// 检查文件末尾是否有多余的内容
function checkFileEnd(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // 检查文件末尾
  const lines = content.split('\n');
  const lastLines = lines.slice(-10);
  
  console.log(`检查文件: ${filePath}`);
  console.log('文件末尾10行:');
  lastLines.forEach((line, index) => {
    console.log(`${lines.length - 10 + index + 1}: ${JSON.stringify(line)}`);
  });
  console.log('---');
}

// 检查所有修改过的文件
const files = [
  'docs/en/kiro/Spec_Prompt.md',
  'docs/en/v0-prompts-and-tools/Prompt.md',
  'docs/en/open-source-prompts/RooCode/Prompt.md',
  'docs/en/codebuddy-prompts/Craft Prompt.md'
];

files.forEach(file => {
  const fullPath = path.join(__dirname, '..', file);
  if (fs.existsSync(fullPath)) {
    checkFileEnd(fullPath);
  } else {
    console.log(`文件不存在: ${fullPath}`);
  }
});