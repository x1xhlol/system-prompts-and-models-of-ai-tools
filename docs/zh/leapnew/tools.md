# Leap AI 工具总结

Leap AI 提供了以下核心工具来构建全栈应用程序：

1. **create_artifact** - 创建包含所有项目文件的综合工件
   - 用于使用 Encore.ts 后端和 React 前端构建全栈应用程序
   - 支持创建、修改、删除和移动文件操作

2. **define_backend_service** - 定义 Encore.ts 后端服务
   - 定义具有适当结构的后端服务
   - 支持定义 API 端点和数据库配置

3. **create_react_component** - 创建 React 组件
   - 创建带有 TypeScript 和 Tailwind CSS 的 React 组件
   - 支持组件属性定义和后端 API 调用

4. **setup_authentication** - 设置身份验证
   - 使用 Clerk 为后端和前端设置身份验证
   - 支持受保护路由配置

5. **create_database_migration** - 创建数据库迁移
   - 为 Encore.ts 数据库创建新的 SQL 迁移文件
   - 支持多种数据库操作类型

6. **setup_streaming_api** - 设置流式 API
   - 为实时通信设置流式 API
   - 支持三种流式 API 类型

7. **configure_secrets** - 配置密钥管理
   - 为 API 密钥和敏感数据配置密钥管理
   - 支持密钥描述和必需性标记

8. **setup_object_storage** - 设置对象存储
   - 为文件上传设置对象存储桶
   - 支持公共访问和版本控制配置

9. **setup_pubsub** - 设置发布/订阅
   - 为事件驱动架构设置 Pub/Sub 主题和订阅
   - 支持消息传递保证配置

10. **create_test_suite** - 创建测试套件
    - 使用 Vitest 为后端和前端创建测试套件
    - 支持多种测试类型

## tools.json

```json
{
  "tools": [
    {
      "name": "create_artifact",
      "description": "创建包含所有项目文件的综合工件，用于使用 Encore.ts 后端和 React 前端构建全栈应用程序",
      "parameters": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "description": "项目的描述性标识符，使用蛇形命名法（例如，'todo-app', 'blog-platform'）"
          },
          "title": {
            "type": "string",
            "description": "项目的可读标题（例如，'Todo App', 'Blog Platform'）"
          },
          "commit": {
            "type": "string",
            "description": "更改的简短描述，最多 3-10 个单词"
          },
          "files": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "path": {
                  "type": "string",
                  "description": "相对于项目根目录的文件路径"
                },
                "content": {
                  "type": "string",
                  "description": "完整的文件内容 - 永远不要使用占位符或截断"
                },
                "action": {
                  "type": "string",
                  "enum": [
                    "create",
                    "modify",
                    "delete",
                    "move"
                  ],
                  "description": "要对文件执行的操作"
                },
                "from": {
                  "type": "string",
                  "description": "移动操作的源路径"
                },
                "to": {
                  "type": "string",
                  "description": "移动操作的目标路径"
                }
              },
              "required": [
                "path",
                "action"
              ]
            }
          }
        },
        "required": [
          "id",
          "title",
          "commit",
          "files"
        ]
      }
    },
    {
      "name": "define_backend_service",
      "description": "定义具有适当结构的 Encore.ts 后端服务",
      "parameters": {
        "type": "object",
        "properties": {
          "serviceName": {
            "type": "string",
            "description": "后端服务的名称"
          },
          "endpoints": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "name": {
                  "type": "string",
                  "description": "唯一的端点名称"
                },
                "method": {
                  "type": "string",
                  "enum": [
                    "GET",
                    "POST",
                    "PUT",
                    "DELETE",
                    "PATCH"
                  ],
                  "description": "HTTP 方法"
                },
                "path": {
                  "type": "string",
                  "description": "带参数的 API 路径（例如，'/users/:id'）"
                },
                "expose": {
                  "type": "boolean",
                  "description": "端点是否公开可访问"
                },
                "auth": {
                  "type": "boolean",
                  "description": "端点是否需要身份验证"
                }
              },
              "required": [
                "name",
                "method",
                "path"
              ]
            }
          },
          "database": {
            "type": "object",
            "properties": {
              "name": {
                "type": "string",
                "description": "数据库名称"
              },
              "tables": {
                "type": "array",
                "items": {
                  "type": "object",
                  "properties": {
                    "name": {
                      "type": "string",
                      "description": "表名"
                    },
                    "columns": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                          "name": {
                            "type": "string"
                          },
                          "type": {
                            "type": "string"
                          },
                          "constraints": {
                            "type": "string"
                          }
                        },
                        "required": [
                          "name",
                          "type"
                        ]
                      }
                    }
                  },
                  "required": [
                    "name",
                    "columns"
                  ]
                }
              }
            }
          }
        },
        "required": [
          "serviceName"
        ]
      }
    },
    {
      "name": "create_react_component",
      "description": "创建带有 TypeScript 和 Tailwind CSS 的 React 组件",
      "parameters": {
        "type": "object",
        "properties": {
          "componentName": {
            "type": "string",
            "description": "React 组件的名称"
          },
          "path": {
            "type": "string",
            "description": "组件应创建的路径"
          },
          "props": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "name": {
                  "type": "string"
                },
                "type": {
                  "type": "string"
                },
                "optional": {
                  "type": "boolean"
                }
              },
              "required": [
                "name",
                "type"
              ]
            }
          },
          "useBackend": {
            "type": "boolean",
            "description": "组件是否使用后端 API 调用"
          },
          "styling": {
            "type": "object",
            "properties": {
              "theme": {
                "type": "string",
                "enum": [
                  "light",
                  "dark",
                  "system"
                ],
                "description": "组件主题"
              },
              "responsive": {
                "type": "boolean",
                "description": "组件是否响应式"
              },
              "animations": {
                "type": "boolean",
                "description": "是否包含细微动画"
              }
            }
          }
        },
        "required": [
          "componentName",
          "path"
        ]
      }
    },
    {
      "name": "setup_authentication",
      "description": "使用 Clerk 为后端和前端设置身份验证",
      "parameters": {
        "type": "object",
        "properties": {
          "provider": {
            "type": "string",
            "enum": [
              "clerk"
            ],
            "description": "身份验证提供者"
          },
          "features": {
            "type": "array",
            "items": {
              "type": "string",
              "enum": [
                "sign-in",
                "sign-up",
                "user-profile",
                "session-management"
              ]
            }
          },
          "protectedRoutes": {
            "type": "array",
            "items": {
              "type": "string"
            },
            "description": "需要身份验证的 API 端点"
          }
        },
        "required": [
          "provider"
        ]
      }
    },
    {
      "name": "create_database_migration",
      "description": "为 Encore.ts 数据库创建新的 SQL 迁移文件",
      "parameters": {
        "type": "object",
        "properties": {
          "migrationName": {
            "type": "string",
            "description": "迁移的描述性名称"
          },
          "version": {
            "type": "integer",
            "description": "迁移版本号"
          },
          "operations": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "type": {
                  "type": "string",
                  "enum": [
                    "CREATE_TABLE",
                    "ALTER_TABLE",
                    "DROP_TABLE",
                    "CREATE_INDEX",
                    "DROP_INDEX"
                  ]
                },
                "sql": {
                  "type": "string",
                  "description": "操作的原始 SQL"
                }
              },
              "required": [
                "type",
                "sql"
              ]
            }
          }
        },
        "required": [
          "migrationName",
          "version",
          "operations"
        ]
      }
    },
    {
      "name": "setup_streaming_api",
      "description": "为实时通信设置流式 API",
      "parameters": {
        "type": "object",
        "properties": {
          "streamType": {
            "type": "string",
            "enum": [
              "streamIn",
              "streamOut",
              "streamInOut"
            ],
            "description": "流式 API 类型"
          },
          "endpoint": {
            "type": "string",
            "description": "流端点路径"
          },
          "messageTypes": {
            "type": "object",
            "properties": {
              "handshake": {
                "type": "object",
                "description": "握手消息模式"
              },
              "incoming": {
                "type": "object",
                "description": "传入消息模式"
              },
              "outgoing": {
                "type": "object",
                "description": "传出消息模式"
              }
            }
          }
        },
        "required": [
          "streamType",
          "endpoint"
        ]
      }
    },
    {
      "name": "configure_secrets",
      "description": "为 API 密钥和敏感数据配置密钥管理",
      "parameters": {
        "type": "object",
        "properties": {
          "secrets": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "name": {
                  "type": "string",
                  "description": "密钥名称（例如，'OpenAIKey', 'DatabaseURL'）"
                },
                "description": {
                  "type": "string",
                  "description": "密钥用途的描述"
                },
                "required": {
                  "type": "boolean",
                  "description": "此密钥对于应用程序功能是否必需"
                }
              },
              "required": [
                "name",
                "description"
              ]
            }
          }
        },
        "required": [
          "secrets"
        ]
      }
    },
    {
      "name": "setup_object_storage",
      "description": "为文件上传设置对象存储桶",
      "parameters": {
        "type": "object",
        "properties": {
          "buckets": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "name": {
                  "type": "string",
                  "description": "存储桶名称"
                },
                "public": {
                  "type": "boolean",
                  "description": "存储桶内容是否公开可访问"
                },
                "versioned": {
                  "type": "boolean",
                  "description": "是否启用对象版本控制"
                },
                "allowedFileTypes": {
                  "type": "array",
                  "items": {
                    "type": "string"
                  },
                  "description": "允许的文件 MIME 类型"
                }
              },
              "required": [
                "name"
              ]
            }
          }
        },
        "required": [
          "buckets"
        ]
      }
    },
    {
      "name": "setup_pubsub",
      "description": "为事件驱动架构设置 Pub/Sub 主题和订阅",
      "parameters": {
        "type": "object",
        "properties": {
          "topics": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "name": {
                  "type": "string",
                  "description": "主题名称"
                },
                "eventSchema": {
                  "type": "object",
                  "description": "事件数据的 TypeScript 接口"
                },
                "deliveryGuarantee": {
                  "type": "string",
                  "enum": [
                    "at-least-once",
                    "exactly-once"
                  ],
                  "description": "消息传递保证"
                }
              },
              "required": [
                "name",
                "eventSchema"
              ]
            }
          },
          "subscriptions": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "name": {
                  "type": "string",
                  "description": "订阅名称"
                },
                "topicName": {
                  "type": "string",
                  "description": "要订阅的主题名称"
                },
                "handler": {
                  "type": "string",
                  "description": "处理函数描述"
                }
              },
              "required": [
                "name",
                "topicName",
                "handler"
              ]
            }
          }
        },
        "required": [
          "topics"
        ]
      }
    },
    {
      "name": "create_test_suite",
      "description": "使用 Vitest 为后端和前端创建测试套件",
      "parameters": {
        "type": "object",
        "properties": {
          "testType": {
            "type": "string",
            "enum": [
              "backend",
              "frontend",
              "integration"
            ],
            "description": "要创建的测试类型"
          },
          "testFiles": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "path": {
                  "type": "string",
                  "description": "测试文件路径"
                },
                "description": {
                  "type": "string",
                  "description": "测试文件涵盖的内容"
                },
                "testCases": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "name": {
                        "type": "string"
                      },
                      "description": {
                        "type": "string"
                      }
                    },
                    "required": [
                      "name"
                    ]
                  }
                }
              },
              "required": [
                "path",
                "testCases"
              ]
            }
          }
        },
        "required": [
          "testType",
          "testFiles"
        ]
      }
    }
  ],
  "guidelines": {
    "code_quality": [
      "使用 2 个空格进行缩进",
      "将功能拆分为更小的、专注的模块",
      "保持文件尽可能小",
      "在整个项目中使用适当的 TypeScript 类型",
      "遵循一致的命名约定",
      "包含全面的错误处理",
      "为复杂逻辑添加有意义的注释"
    ],
    "backend_requirements": [
      "所有后端代码必须使用 Encore.ts",
      "使用 SQL 数据库或对象存储存储数据",
      "永远不要在内存或本地文件中存储数据",
      "所有服务都放在 backend/ 文件夹下",
      "每个 API 端点放在单独的文件中",
      "跨应用程序的端点名称必须唯一",
      "使用模板字面量进行数据库查询",
      "用注释记录所有 API 端点"
    ],
    "frontend_requirements": [
      "使用 React 与 TypeScript 和 Tailwind CSS",
      "导入后端客户端为：import backend from '~backend/client'",
      "在适当的时候使用 shadcn/ui 组件",
      "为所有屏幕尺寸创建响应式设计",
      "包含细微动画和交互",
      "使用适当的错误处理和 console.error 日志",
      "将组件拆分为更小的、可重用的模块",
      "前端代码放在 frontend/ 文件夹下（无 src/ 子文件夹）"
    ],
    "file_handling": [
      "始终提供完整的文件内容",
      "永远不要使用占位符或截断",
      "仅输出需要更改的文件",
      "使用 leapFile 进行创建/修改",
      "使用 leapDeleteFile 进行删除",
      "使用 leapMoveFile 进行重命名/移动",
      "排除自动生成的文件（package.json 等）"
    ],
    "security": [
      "为所有敏感数据使用密钥",
      "在请求时实现适当的身份验证",
      "验证所有用户输入",
      "使用适当的 CORS 设置",
      "遵循 API 的安全最佳实践"
    ]
  }
}
```