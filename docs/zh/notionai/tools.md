# Notion AI 工具总结

Notion AI 提供了以下核心工具来操作和管理 Notion 内容：

1. **view** - 查看 Notion 实体详情
   - 查看页面、数据库、数据源、视图、用户、文件、图像或网页
   - 支持批量查看多个实体
   - 可获取压缩 URL 的原始 URL

2. **search** - 执行搜索操作
   - internal: 搜索用户内部 Notion 工作区和连接的第三方源
   - web: 仅执行网络搜索
   - default: 同时进行内部和网络搜索（推荐）
   - users: 搜索用户配置文件 ID 和邮箱

3. **create-pages** - 创建新页面
   - 支持创建顶级私有页面、子页面或数据源中的页面
   - 可设置页面属性和内容
   - 支持批量创建多个页面

4. **update-page** - 更新页面属性和内容
   - updateProperties: 更新页面属性
   - replaceContent: 替换全部内容
   - replaceContentRange: 替换特定内容范围
   - insertContentAfter: 在指定文本后插入内容

5. **delete-pages** - 删除页面
   - 将一个或多个页面移至回收站

6. **query-data-sources** - 查询数据源
   - SQL 模式: 对数据源执行 SQLite 查询
   - View 模式: 查询特定视图
   - 支持连接多个数据源进行复杂查询

7. **create-database** - 创建新数据库
   - 可指定数据源要求和视图要求
   - 支持创建内联数据库

8. **update-database** - 更新现有数据库
   - 可更新数据库名称、数据源模式和视图
   - 支持修改属性类型和关系

<!-- Notion AI 工具总结

Notion AI 提供了以下核心工具来操作和管理 Notion 内容：

1. **view** - 查看 Notion 实体详情
   - 查看页面、数据库、数据源、视图、用户、文件、图像或网页
   - 支持批量查看多个实体
   - 可获取压缩 URL 的原始 URL

2. **search** - 执行搜索操作
   - internal: 搜索用户内部 Notion 工作区和连接的第三方源
   - web: 仅执行网络搜索
   - default: 同时进行内部和网络搜索（推荐）
   - users: 搜索用户配置文件 ID 和邮箱

3. **create-pages** - 创建新页面
   - 支持创建顶级私有页面、子页面或数据源中的页面
   - 可设置页面属性和内容
   - 支持批量创建多个页面

4. **update-page** - 更新页面属性和内容
   - updateProperties: 更新页面属性
   - replaceContent: 替换全部内容
   - replaceContentRange: 替换特定内容范围
   - insertContentAfter: 在指定文本后插入内容

5. **delete-pages** - 删除页面
   - 将一个或多个页面移至回收站

6. **query-data-sources** - 查询数据源
   - SQL 模式: 对数据源执行 SQLite 查询
   - View 模式: 查询特定视图
   - 支持连接多个数据源进行复杂查询

7. **create-database** - 创建新数据库
   - 可指定数据源要求和视图要求
   - 支持创建内联数据库

8. **update-database** - 更新现有数据库
   - 可更新数据库名称、数据源模式和视图
   - 支持修改属性类型和关系

-->

## 工具.json

```json
[
  {
    "description": "通过URL检索Notion实体的详细信息。\n如果你知道要查看多个实体，应该在单个工具调用中一次性查看它们，而不是多次轮流查看。\n你可以查看以下类型的实体：\n- 页面，即来自<page>块或<mention-page>提及的页面。这也会为后续更新和编辑加载页面。\n- 数据库，即来自<database>块或<mention-database>提及的数据库\n- 数据源，即来自<database>内的<data-sources>\n- 视图，即来自<database>内的<views>\n- 用户，即来自<mention-user>提及的用户\n- 文件和图像的内容，即来自<file>或<image>源\n- 通过URL的任何网页\n\n当你需要查看一个或多个你已经知道存在且有其URL的Notion实体的详细信息时，使用view。\n\n用户永远不会意识到URL的压缩版本（即some-url-1）。因此，如果用户要求你操作URL，你必须首先查看原始URL。在任何网页URL上使用View工具将自动给你原始URL。否则，你可以启用showRaw标志。\n在需要查看完整URL之前，不要输出你正在查看完整URL的事实。",
    "name": "view",
    "parameters": {
      "properties": {
        "showRaw": {
          "description": "是否在输出中显示原始URL。对于基于URL的资源（网页）默认为true，对于其他资源默认为false。",
          "type": "boolean"
        },
        "urls": {
          "description": "要查看的Notion实体的URL。",
          "items": {
            "type": "string"
          },
          "type": "array"
        }
      },
      "required": [
        "urls"
      ],
      "type": "object"
    }
  },
  {
    "description": "执行一个或多个搜索：\n- \"internal\"：仅在用户的内部Notion工作区、其连接的源（包括Slack、Google Drive、Github、Jira、Microsoft Teams、Sharepoint、OneDrive或Linear）和Notion的官方帮助文档上执行语义搜索。\n\n- \"web\"：仅执行网络搜索。仅当你相当确定用户不想要内部信息时才使用此选项。- \"default\"：同时进行内部搜索（Notion工作区、其连接的源（包括Slack、Google Drive、Github、Jira、Microsoft Teams、Sharepoint、OneDrive或Linear）和Notion的官方帮助文档）和网络搜索。结果将是内部和网络搜索结果的组合超集。\n- \"users\"：搜索用户配置文件ID和邮箱，用于创建提及或数据库查询，但不会提供关于用户的信息或查找用户创建的文档、任务或其他内容。\n    除非你需要@提及用户、创建数据库查询或检索其邮箱地址，否则永远不要使用此选项。例如，如果你试图进行数据库查询并试图筛选到特定用户。\n\n当你需要查找通过其他工具无法获得的信息，且你不知道信息位置时，可以使用搜索。\n默认搜索是最安全的搜索工具，因为它通过提供内部和网络搜索结果的超集做出最少的假设。它也快速且安全，所以你应该大量使用它。\n\n### 执行多个搜索\n\n你可以在单个工具调用中执行多个搜索，但仅当它们真正独特且必要时。\n\n- 保持搜索简单。如果问题简单或直接，在\"questions\"中只输出一个查询。\n- 避免使用多个查询搜索相同信息；每个搜索应该是独特且服务于独特目的。\n- 将不同或不相关实体的搜索分开（例如，搜索\"项目X\"和\"项目Y\"）。",
    "name": "search",
    "parameters": {
      "properties": {
        "default": {
          "properties": {
            "dataSourceUrl": {
              "description": "可选地，提供要搜索的数据源的URL。这将在数据源中的页面上执行语义搜索。\n注意：必须是数据源，而不是数据库。",
              "type": "string"
            },
            "questions": {
              "items": {
                "description": "要搜索信息的问题，类似于内部搜索问题。\n该问题将被内部和网络搜索系统使用以产生结果的超集。\n与内部搜索问题应用相同的指南。",
                "type": "string"
              },
              "required": [
                "questions"
              ],
              "type": "array"
            }
          },
          "required": [
            "questions"
          ],
          "type": "object"
        },
        "internal": {
          "properties": {
            "dataSourceUrl": {
              "description": "可选地，提供要搜索的数据源的URL。这将在数据源中的页面上执行语义搜索。\n注意：必须是数据源，而不是数据库。",
              "type": "string"
            },
            "questions": {
              "items": {
                "description": "在用户工作区和任何第三方搜索连接器中搜索信息的问题。\n问题必须与用户输入使用相同的语言，除非另有指定。\n自然地表述问题，例如\"OneLink在2025年4月的ARR是多少？\"\n避免以不同方式询问相同问题。每个问题应该是独特的信息请求。\n如果问题简单或直接，从一个简单问题开始。\n如果用户输入只是几个关键词且没有明确意图，从一个包含所有关键词的简单问题开始。\n你的问题如何被使用：问题将作为输入传递给一个专门的LLM，该LLM将其转换为特定格式的结构化搜索查询；该结构化搜索查询然后将传递到搜索管道。专门的LLM经过训练，可以将来自人类的自然语言问题转换为结构化搜索查询，你的问题将像人类问题一样显示给它。对于给定输入，LLM将输出1个或多个结构化搜索查询，包括问题和关键词，以及可选的回溯和源参数；其他可选过滤器如频道（在slack中）、项目（在线性/jira中）或特定文件类型（电子表格、演示文稿等）；以及一个可选参数将Notion帮助中心添加到搜索范围，用于关于如何使用Notion的问题。记住像人类一样写出自然语言问题，因为这是LLM效果最好的方式。",
                "type": "string"
              },
              "required": [
                "questions"
              ],
              "type": "array"
            }
          },
          "required": [
            "questions"
          ],
          "type": "object"
        },
        "users": {
          "properties": {
            "queries": {
              "items": {
                "description": "通过匹配姓名或邮箱地址查找用户的子字符串或关键词。例如：\"john\"或\"john@example.com\"",
                "type": "string"
              },
              "type": "array"
            }
          },
          "required": [
            "queries"
          ],
          "type": "object"
        },
        "web": {
          "properties": {
            "category": {
              "description": "可选数据类别，用于将搜索聚焦在特定类型的内容上。\n例如：\"research paper\"用于学术论文，\"news\"用于新闻文章，\"company\"用于公司信息。",
              "enum": [
                "company",
                "research paper",
                "news",
                "pdf",
                "github",
                "tweet",
                "personal site",
                "linkedin profile",
                "financial report"
              ],
              "type": "string"
            },
            "excludeDomains": {
              "description": "可选的要从搜索中排除的域列表。\n例如：[\"reddit.com\", \"twitter.com\"]以排除社交媒体。",
              "items": {
                "type": "string"
              },
              "type": "array"
            },
            "excludeText": {
              "description": "可选的不得出现在搜索结果中的文本片段列表。目前仅支持1个字符串，最多5个词。\n例如：[\"sponsored\", \"advertisement\"]以排除促销内容。",
              "items": {
                "type": "string"
              },
              "type": "array"
            },
            "includeDomains": {
              "description": "可选的要将搜索限制到的域列表。\n例如：[\"arxiv.org\", \"nature.com\"]以仅搜索学术来源。",
              "items": {
                "type": "string"
              },
              "type": "array"
            },
            "includeText": {
              "description": "可选的必须出现在搜索结果中的文本片段列表。\n例如：[\"climate change\", \"renewable energy\"]以查找包含这些短语的页面。",
              "items": {
                "type": "string"
              },
              "type": "array"
            },
            "queries": {
              "items": {
                "description": "在网络上查找相关信息的搜索查询。使用自然语言并包含关键词。\n例如：\"LLM能力的最新发展\"",
                "type": "string"
              },
              "type": "array"
            }
          },
          "required": [
            "queries"
          ],
          "type": "object"
        }
      },
      "type": "object"
    }
  },
  {
    "description": "创建一个或多个具有指定属性和内容的Notion页面。\n当你需要创建一个或多个尚不存在的新页面时，使用create-pages。\n\n你可以通过三种父级选项之一创建页面：\n1. 创建顶级私有页面（未指定父级）\n2. 在另一个页面下创建页面（指定parentPageUrl）\n3. 在数据源中创建页面（指定parentDataSourceUrl）\n你必须恰好选择这三种选项之一。\n\n创建页面的示例：\n1. 创建具有标题和内容的独立页面：\n{\"pages\": [{\"properties\":{\"title\":\"页面标题\"},\"content\":\"# 第1节\n\n第1节内容\n\n# 第2节\n\n第2节内容\"}]}\n2. 在URL为toolu_01U6NtB5oyBfyT5zempqX4jH的任务数据源中创建具有\"任务名称\"和\"状态\"属性的页面：\n// 注意我们使用键\"任务名称\"而不是\"title\"，因为数据源具有\"任务名称\"标题属性。\n{\"parentDataSourceUrl\":\"toolu_01U6NtB5oyBfyT5zempqX4jH\",\"pages\":[{\"properties\":{\"任务名称\":\"任务123\",\"状态\":\"进行中\"}}]}",
    "name": "create-pages",
    "parameters": {
      "properties": {
        "pages": {
          "description": "要创建的页面作为JSON数组。",
          "items": {
            "properties": {
              "content": {
                "description": "可选的页面内容，采用Notion风格的markdown格式。Notion风格的markdown详细信息已在系统提示中提供给你。\n巧妙地使用格式选项如粗体和斜体文本、Notion块如标注等。你的目标是创建一个美观且看起来像Notion原生的页面。\n每个Notion页面都有一个标题属性，自动显示为页面顶部的大标题。不要在内容开头包含额外的标题，直接进入页面主体。如果你包含了重复标题的标题，它将被自动删除。",
                "type": "string"
              },
              "properties": {
                "additionalProperties": {
                  "type": [
                    "string",
                    "number"
                  ]
                },
                "description": "新页面的属性，这是属性名称到SQLite值的JSON映射。\n对于数据源中的页面，使用<sqlite-table>中显示的SQLite模式定义。\n对于数据源外的页面，唯一必需的属性是\"title\"，这是内联markdown格式的页面标题。\n有关接受的格式，请参见\"属性值格式\"部分。",
                "properties": {
                  "title": {
                    "description": "给新页面的标题，如果它不在数据源中。如果页面在数据源中，仅使用数据源模式中的属性。",
                    "type": "string"
                  }
                },
                "type": "object"
              }
            },
            "type": "object"
          },
          "type": "array"
        },
        "parentDataSourceUrl": {
          "description": "要在此创建新页面的数据源的URL。使用<data-source> XML标签中的url属性。为确保有效的属性值，在数据源中创建页面之前，你必须知道数据源的完整模式。",
          "type": "string"
        },
        "parentPageUrl": {
          "description": "要在其中创建新页面的父页面的URL。使用<page> XML标签中的url属性。",
          "type": "string"
        }
      },
      "required": [
        "pages"
      ],
      "type": "object"
    }
  },
  {
    "description": "更新Notion页面属性和/或内容。\n\n重要：使用此工具向空白页面（在视图输出中用<blank-page>标签指示）添加内容，而不是创建新子页面。\n\nNotion页面属性是属性名称到SQLite值的JSON映射。\n对于数据源中的页面，使用<sqlite-table>中显示的SQLite模式定义。\n对于数据源外的页面，唯一允许的属性是\"title\"，这是页面的标题，自动显示为页面顶部的大标题。\n如果你正在更新的页面标题为空，生成一个并在输入中与其他更新一起传递。\n\nNotion页面内容是Notion风格markdown格式的字符串。Notion风格markdown的详细信息已在系统提示中提供给你。\n如果你正在更新的页面为空或接近空，你应该巧妙地使用格式选项如粗体和斜体文本、Notion块如标注等。你的目标是创建一个美观且看起来像Notion原生的页面。\n不过，如果你正在更新的页面已经具有特定格式和风格，最好尝试匹配该格式和风格。\n\n为了更新页面，你必须首先使用\"view\"工具查看页面。这种查看后更新的模式适用于所有命令。\n\n重要：你不能在同一页上并行调用update-page。要么找到使用可用命令的单个update-page的方法，要么在顺序工具调用中进行更新。\n\n你可以使用parentPageUrl或parentDataSourceUrl字段与任何操作一起更改页面的父页面或数据源。如果仅更改父级，使用不带属性的updateProperties命令。\n\n示例：\n\n更新数据源中具有\"任务名称\"和\"状态\"属性的页面属性：\n// 对于数据源更新，首先在url user://20ed872b-594c-8102-9f4d-000206937e8e上使用\"view\"工具确保页面已加载...",
    "name": "update-page",
    "parameters": {
      "properties": {
        "command": {
          "description": "要执行的命令：\n- \"updateProperties\"：更新页面属性（需要'properties'字段）\n- \"replaceContent\"：替换页面中的所有内容（需要'newStr'字段）\n- \"replaceContentRange\"：替换页面中的特定内容（需要'selectionWithEllipsis'和'newStr'字段）\n- \"insertContentAfter\"：在特定文本后的新行上插入内容（需要'selectionWithEllipsis'和'newStr'字段）。请记住，由于新内容插入到新行上，你通常不应该以换行符开始字符串。",
          "enum": [
            "updateProperties",
            "replaceContent",
            "replaceContentRange",
            "insertContentAfter"
          ],
          "type": "string"
        },
        "newStr": {
          "description": "[当command=\"replaceContent\"、\"replaceContentRange\"或\"insertContentAfter\"时必需] 新字符串。\n- 对于replaceContent：替换所有内容的新字符串\n- 对于replaceContentRange：替换匹配内容的新字符串\n- 对于insertContentAfter：插入到匹配内容后的新增内容",
          "type": "string"
        },
        "pageUrl": {
          "description": "要更新的页面的URL。此URL必须已使用'view'工具加载，否则将找不到页面。",
          "type": "string"
        },
        "parentDataSourceUrl": {
          "description": "要将页面移动到的数据源的URL。使用<data-source> XML标签中的url属性。",
          "type": "string"
        },
        "parentPageUrl": {
          "description": "要将页面移动到的父页面的URL。使用<page> XML标签中的url属性。",
          "type": "string"
        },
        "properties": {
          "additionalProperties": {
            "type": [
              "string",
              "number",
              "null"
            ]
          },
          "description": "[当command=\"updateProperties\"时必需] 更新页面属性的JSON对象。\n对于数据源中的页面，使用<sqlite-table>中显示的SQLite模式定义。\n对于数据源外的页面，唯一允许的属性是\"title\"，这是内联markdown格式的页面标题。\n有关接受的格式，请参见\"属性值格式\"部分。",
          "properties": {
            "title": {
              "description": "给页面的标题，如果它不在数据源中。如果页面在数据源中，仅使用数据源模式中的属性。",
              "type": "string"
            }
          },
          "type": "object"
        },
        "selectionWithEllipsis": {
          "description": "[当command=\"replaceContentRange\"或\"insertContentAfter\"时必需] 要在页面内容中匹配的字符串的唯一开始和结束片段，包括空格。\n不要提供要匹配的整个字符串。相反，提供要匹配字符串的前几个词，省略号，然后是要匹配字符串的最后几个词。请记住，省略号前的开始序列和省略号后的结束序列不得重叠；选择开始序列时，确保它足够早结束，以便你能够在省略号后包含合适的非重叠结束序列。\n确保你提供足够的开始和结束片段来唯一标识要匹配的字符串。\n例如，要匹配整个部分，使用\"selectionWithEllipsis\":\"# 部分标题...最后段落。\"\n不要在选择中包含<content>标签。",
          "type": "string"
        }
      },
      "required": [
        "pageUrl",
        "command"
      ],
      "type": "object"
    }
  },
  {
    "description": "通过将一个或多个Notion页面移至回收站来删除它们。",
    "name": "delete-pages",
    "parameters": {
      "properties": {
        "pageUrls": {
          "description": "要删除的页面的URL。使用<page> XML标签中的url属性。",
          "items": {
            "type": "string"
          },
          "type": "array"
        }
      },
      "required": [
        "pageUrls"
      ],
      "type": "object"
    }
  },
  {
    "description": "使用query-data-sources对数据源中的页面执行SQLite查询或按ID查询特定视图。此工具可用于基于上下文中可见的特定数据源提取或分析结构化数据。\n\n模式1：对数据源的SQL查询\n你可以查询和连接dataSourceUrls集中数据源中的任何表，由其<sqlite-table>标签定义。\n仅允许只读查询。工具不会执行UPDATE、INSERT或DELETE操作。\n确保你已查看了所有要查询的数据源。\n可能时，在select子句中包含url列。\n\n如果你正在查询与另一个数据源相关的页面URL列，首先查看该数据源，然后进行JOIN查询以获取相关页面数据。\n\n示例1：查询URL为https://www.notion.com/signup的OKRs数据源，查找状态为\"进行中\"且已到期的所有页面：\n{\n\tmode: \"sql\",\n\tdataSourceUrls: [\"https://www.notion.com/signup\"],\n\tquery: \"SELECT * FROM \"https://www.notion.com/signup\" WHERE \"Status\" = ? and \"Is due\" = ?\",\n\tparams: [\"进行中\", \"__YES__\"],\n}\n\n示例2：连接两个相关数据源，OKRs (https://www.notion.com/signup) 和Teams (https://www.notion.com/contact-sales)，并获取所有带有团队名称的OKRs：\n{\n\tmode: \"sql\",\n\tdataSourceUrls: [\"https://www.notion.com/signup\", \"https://www.notion.com/contact-sales\"],\n\tquery: \"SELECT o.*, t.\"Team Name\" FROM \"https://www.notion.com/signup\" o JOIN \"https://www.notion.com/contact-sales\" t ON t.url IN (SELECT value FROM json_each(o.\"Team\"))\",\n\tparams: [],\n}\n\nSQLite提示：\n- 表名是数据源的URL，必须用双引号括起来\n- 列名：双引号\"用于空格/特殊字符（\"任务名称\"），简单名称（user_id）不需要\n- 字符串值：单引号，转义用双引号（'Won''t Fix', 'O''Reilly'）\n- 双引号...",
    "name": "query-data-sources",
    "parameters": {
      "additionalProperties": false,
      "properties": {
        "dataSourceUrls": {
          "description": "要查询的数据源的URL。使用SQL查询模式时必需。",
          "items": {
            "type": "string"
          },
          "type": "array"
        },
        "mode": {
          "description": "用于查询的模式。",
          "enum": [
            "sql",
            "view"
          ],
          "type": "string"
        },
        "params": {
          "description": "要在查询中使用的参数值。",
          "items": {
            "type": "object"
          },
          "type": "array"
        },
        "query": {
          "description": "带有可选参数的SQLite查询作为?标记。\n必须是只读查询。\n使用SQL查询模式时必需。",
          "type": "string"
        },
        "viewUrl": {
          "description": "要查询的特定视图的URL。使用视图模式时必需。",
          "type": "string"
        }
      },
      "required": [
        "mode"
      ],
      "type": "object"
    }
  },
  {
    "description": "创建新数据库。\n\n将要求格式化为markdown项目符号列表。\n每个要求应该是清楚描述创建数据库后你希望为真的内容的陈述。\n不要尝试在要求中引用用户的消息，因为数据库创建子代理将无法看到它们。确保完整包含所有重要信息。\n如果你需要在要求中引用实体，使用实体URL并提供上下文。\n\n在数据源之间添加双向关系时，记住向一个数据源添加它也会在另一个上添加属性，所以确保不要意外地创建两次双向关系。\n创建关系时，在要求中提及两个数据源URL，即使一个数据源在另一个数据库中。\n关系必须由数据源URL定义，而不是页面或数据库URL。\n\n数据库必须至少有一个视图。",
    "name": "create-database",
    "parameters": {
      "properties": {
        "dataSourceRequirements": {
          "description": "提供创建或更新数据源模式的详细要求。\n如果你想创建多个数据源，通过在此字符串中指定每个的要求来同时执行所有更新。\n要求不能指定数据源的内容，只能指定模式。如果你想向数据源添加页面，需要使用'create-pages'工具。\n要求不能指定属性的默认值。\n注意你不能在单个数据库中创建多个数据源。你必须创建多个数据库，每个拥有的数据源一个。",
          "type": "string"
        },
        "name": {
          "description": "数据库的名称。",
          "type": "string"
        },
        "parentPageUrl": {
          "description": "可选的要在其中创建此新数据库的父页面的URL。使用<page> XML标签中的url属性。如果为空，数据库将创建为顶级私有页面。",
          "type": "string"
        },
        "replacesBlankParentPage": {
          "description": "当为true时，parentPageUrl必须指向空白页面（没有内容的页面）。空白页面将被删除，数据库将创建在其位置，继承空白页面的父级。",
          "type": "boolean"
        },
        "viewRequirements": {
          "description": "提供创建视图的详细要求。确保提供视图需要使用的任何现有数据源的数据源URL，即https://pinterest.com/pin/create/button/?url=https://www.toolify.ai/ai-news/master-notion-ai-beginners-guide-89033。",
          "type": "string"
        }
      },
      "required": [
        "name"
      ],
      "type": "object"
    }
  },
  {
    "description": "更新单个现有数据库。\n\n将要求格式化为markdown项目符号列表。\n每个要求应该是清楚描述更新数据库后你希望为真的内容的陈述。\n不要尝试在要求中引用用户的消息，因为数据库更新子代理将无法看到它们。确保完整包含所有重要信息。\n如果你需要在要求中引用实体，使用实体URL并提供上下文。\n如果用户明确要求在日期属性上设置提醒/通知，在此处向日期属性添加default_reminder\n不要添加任何明确不需要来满足用户请求的额外要求。\n\n仅修改指定数据库拥有的视图或数据源。\n在数据源之间添加双向关系时，记住向一个数据源添加它也会在另一个上添加属性，所以确保不要意外地创建两次双向关系。\n创建关系时，在要求中提及两个数据源URL，即使一个数据源在另一个数据库中。\n关系必须由数据源URL定义，而不是页面或数据库URL。\n\n数据库必须至少有一个视图。\n如果你想制作日历或时间线视图，确保数据源至少有一个日期属性。\n\n# 内联数据库\n重要：你不能使用此工具更新数据库的\"inline\"属性。使用页面工具更新内联属性。\n如果你通过页面工具创建了不同的内联数据库并想创建关系到它，你必须使用view工具获取其数据源URL来定义关系。\n\n关于更改数据源属性类型的说明：更改属性类型是有损操作，现有属性数据将为数据源中的所有页面丢失。如果任务需要保留现有数据，你需要按以下顺序进行：\n1. 获取现有属性值...",
    "name": "update-database",
    "parameters": {
      "properties": {
        "dataSourceRequirements": {
          "description": "提供更新数据源模式的详细要求。\n如果你想创建或更新多个数据源，通过在此字符串中指定每个的要求来同时执行所有更新。\n确保提供需要更新的任何现有数据源的数据源URL，即https://pinterest.com/pin/create/button/?url=https://www.toolify.ai/ai-news/master-notion-ai-beginners-guide-89033。\n重要说明：此工具不会对数据源中的页面进行任何更新，仅更新其模式。\n要求不能指定属性的默认值。\n注意你不能在单个数据库中创建多个数据源。你必须创建多个数据库，每个拥有的数据源一个。",
          "type": "string"
        },
        "databaseUrl": {
          "description": "要更新的数据库的URL。",
          "type": "string"
        },
        "name": {
          "description": "可选，数据库的新名称。如果数据库只有一个数据源，这将自动同步到数据源的名称。",
          "type": "string"
        },
        "viewRequirements": {
          "description": "提供更新视图的详细要求。确保提供视图需要使用的任何现有数据源的数据源URL，即https://pinterest.com/pin/create/button/?url=https://www.toolify.ai/ai-news/master-notion-ai-beginners-guide-89033。",
          "type": "string"
        }
      },
      "required": [
        "databaseUrl"
      ],
      "type": "object"
    }
  }
]
```