# 文档目录

- [Prompt](./Prompt.md)
- [Tools](./Tools.md)

## 产品工具文档的综述

此目录定义了名为 "Replit Assistant" 的AI编程助手的核心规范，该助手在 Replit 在线IDE环境中运行，旨在协助用户完成各类编码任务。

- **`Prompt.md`**: 这是核心的系统提示，详细说明了助手的身份、能力和行为准则。它定义了助手如何通过建议文件更改（`<proposed_file_...>`）、执行shell命令（`<proposed_shell_command>`）和安装软件包（`<proposed_package_install>`）等特定XML标签格式来与IDE交互。该提示强调了精确性和遵循现有代码模式的重要性，并指导助手如何处理工作流配置和部署。

- **`Tools.md`**: 以JSON格式详细定义了助手可用的工具集。这些工具功能强大，涵盖了从代码库搜索（`search_filesystem`）、文件编辑（`str_replace_editor`）、包管理（`packager_tool`）到数据库操作（`create_postgresql_database_tool`, `execute_sql_tool`）和应用反馈（`web_application_feedback_tool`）的全方位开发需求。这些工具使助手能够深入集成到Replit环境中，执行复杂的操作。

总而言之，这两个文件共同描绘了一个深度集成于Replit IDE、通过特定协议和强大工具集来执行开发任务的AI编程助手。