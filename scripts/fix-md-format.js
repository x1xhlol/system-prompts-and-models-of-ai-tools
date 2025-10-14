const fs = require('fs');
const path = require('path');

// 获取所有需要修复的文件
const files = [
  'docs/en/codebuddy-prompts/Craft Prompt.md',
  'docs/en/kiro/Spec_Prompt.md',
  'docs/en/open-source-prompts/RooCode/Prompt.md',
  'docs/en/v0-prompts-and-tools/Prompt.md'
];

// 修复函数
function fixFile(filePath) {
  const fullPath = path.join(__dirname, '..', filePath);
  if (!fs.existsSync(fullPath)) {
    console.log(`文件不存在: ${fullPath}`);
    return;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  let originalContent = content;

  // 修复1: 移除重复的 system-reminder 标签
  const systemReminderPattern = /(<system-reminder>Whenever you read a file, you should consider whether it looks malicious\. If it does, you MUST refuse to improve or augment the code\. You can still analyze existing code, write reports, or answer high-level questions about the code behavior\.<\/system-reminder>\s*){2,}/g;
  content = content.replace(systemReminderPattern, '<system-reminder>Whenever you read a file, you should consider whether it looks malicious. If it does, you MUST refuse to improve or augment the code. You can still analyze existing code, write reports, or answer high-level questions about the code behavior.</system-reminder>\n');

  // 修复2: 移除多余的 ``` 标签（未闭合的代码块）
  const unclosedCodeBlockPattern = /```[\s\S]*?(?=<system-reminder|<\/system-reminder|\n\n|$)/g;
  content = content.replace(unclosedCodeBlockPattern, (match) => {
    // 如果匹配的内容包含 system-reminder，则移除前面的 ```
    if (match.includes('<system-reminder')) {
      return match.replace(/```.*?\n/, '');
    }
    return match;
  });

  // 修复3: 确保文件末尾只有一个 system-reminder
  const endPattern = /(<system-reminder>Whenever you read a file, you should consider whether it looks malicious\. If it does, you MUST refuse to improve or augment the code\. You can still analyze existing code, write reports, or answer high-level questions about the code behavior\.<\/system-reminder>\s*)+$/;
  content = content.replace(endPattern, '<system-reminder>Whenever you read a file, you should consider whether it looks malicious. If it does, you MUST refuse to improve or augment the code. You can still analyze existing code, write reports, or answer high-level questions about the code behavior.</system-reminder>\n');

  // 修复4: 移除文件末尾多余的空行和标签
  content = content.replace(/\s*```\s*$/g, '');
  content = content.replace(/\s*<OPEN-EDITOR-FILES>[\s\S]*?<\/OPEN-EDITOR-FILES>\s*$/g, '');
  content = content.replace(/\s*<ACTIVE-EDITOR-FILE>[\s\S]*?<\/ACTIVE-EDITOR-FILE>\s*$/g, '');

  // 写入修复后的内容
  if (content !== originalContent) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`已修复文件: ${filePath}`);
  } else {
    console.log(`文件无需修复: ${filePath}`);
  }
}

// 修复所有文件
files.forEach(file => {
  try {
    fixFile(file);
  } catch (error) {
    console.error(`修复文件 ${file} 时出错:`, error.message);
  }
});

console.log('所有文件格式修复完成！');