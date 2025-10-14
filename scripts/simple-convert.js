import fs from 'fs';
import path from 'path';

// --- 配置 ---
const srcDir = '.'; // 项目根目录
const docsEnDir = './docs/en'; // 目标目录
const textExtensions = ['.txt', '.prompt', '.log']; // 需要转换的扩展名
// 要排除的源目录
const excludedDirs = ['docs', 'scripts', '.git', '.github', 'node_modules', 'assets', 'public'];

// --- 主函数 ---
function main() {
  console.log('开始简化版转换流程...');

  // 1. 确保目标目录存在
  fs.mkdirSync(docsEnDir, { recursive: true });

  // 2. 获取所有源文件夹
  const productDirs = fs.readdirSync(srcDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory() && !excludedDirs.includes(dirent.name))
    .map(dirent => dirent.name);

  console.log(`找到 ${productDirs.length} 个产品目录进行处理...`);

  // 3. 遍历每个产品目录
  productDirs.forEach(product => {
    const productSrcPath = path.join(srcDir, product);
    const productSlug = product.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const productDestPath = path.join(docsEnDir, productSlug);

    // 为产品创建目标子目录
    fs.mkdirSync(productDestPath, { recursive: true });

    // 4. 遍历目录中的文件
    const files = fs.readdirSync(productSrcPath);
    files.forEach(file => {
      const ext = path.extname(file).toLowerCase();

      // 5. 只处理指定扩展名的文件
      if (textExtensions.includes(ext)) {
        const srcFilePath = path.join(productSrcPath, file);
        const destFilePath = path.join(productDestPath, file.replace(ext, '.md'));

        try {
          // 读取源文件内容
          const originalContent = fs.readFileSync(srcFilePath, 'utf8');

          // 6. 创建新的 Markdown 内容，使用四个反引号
          const newContent = `## ${file}\n\n\`\`\`\`text\n${originalContent}\n\`\`\`\``;

          // 7. 写入新的 .md 文件
          fs.writeFileSync(destFilePath, newContent);
          console.log(`转换并替换: ${destFilePath}`);

        } catch (e) {
          console.warn(`处理文件失败 ${srcFilePath}: ${e.message}`);
        }
      }
    });
  });

  console.log('\n简化版转换完成！');
}

// --- 运行 ---
main();
