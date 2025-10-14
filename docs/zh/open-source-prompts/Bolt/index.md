# 文档目录

- [Prompt](./Prompt.md)

## 产品工具文档的综述

此目录下的 `Prompt.md` 文件为名为 "Bolt" 的AI助手定义了核心系统提示。Bolt被定位为一名杰出的高级软件开发工程师，在一个名为 "WebContainer" 的、基于浏览器的Node.js运行时环境中工作。该提示详细说明了Bolt所处环境的特定约束，例如有限的Python库支持、无Git访问权限，以及对Node.js脚本和Vite的偏好。它还规定了Bolt如何通过`<boltArtifact>`和`<boltAction>`等特定XML标签来创建包含文件操作和shell命令的综合性“工件”，以完成用户的开发任务。此外，文档还包含了详细的数据库操作指南（默认为Supabase），强调了数据安全和迁移文件的规范化流程。