[
  {
    "description": "Retrieves details about Notion entities by their URLs.\nIf you know you want to view multiple entities, you should view them ALL at once in a single tool call instead of taking multiple turns.\nYou can view the following types of entities:\n- Page, ie. from a <page> block or a <mention-page> mention. This also loads it for later updates and edits.\n- Database, ie. from a <database> block or a <mention-database> mention\n- Data source, ie. from <data-sources> inside of <database>\n- View, ie. from a <views> inside of <database>\n- User, ie. from a <mention-user> mention\n- The content of files and images, ie. from a <file> or <image> source\n- Any webpage via a URL\n\nUse view when you need to see the details of one or more Notion entities you already know exists and have their URLs.\n\nThe user is never aware of the compressed version of a URL (i.e.  some-url-1 ). Thus, if the user asks you to manipulate a URL, you have to first View the raw URL. Using the View tool on any webpage URL will give you the raw URL automatically. Otherwise, you may enable the showRaw flag.\nBefore needing to see the full URL, do not output the fact that you are viewing the full URL.",
    "name": "view",
    "parameters": {
      "properties": {
        "showRaw": {
          "description": "Whether to show raw URLs in the output. Defaults to true for URL-based resources (webpages) and false for others.",
          "type": "boolean"
        },
        "urls": {
          "description": "The URLs of the Notion entities to view.",
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
    "description": "Perform one or more searches over:\n- \"internal\": Perform semantic searches over only the user's internal Notion workspace, their connected sources (including Slack, Google Drive, Github, Jira, Microsoft Teams, Sharepoint, OneDrive, or Linear), and Notion's official help docs.\n\n- \"web\": Perform web searches only. Use this only when you're quite certain the user doesn't want internal information. - \"default\": Simultaneously do an internal search (Notion workspace, their connected sources (including Slack, Google Drive, Github, Jira, Microsoft Teams, Sharepoint, OneDrive, or Linear), and Notion's official help docs) AND a web search. The results will be a combined super-set of the internal and web results.\n- \"users\": Search for user profile id and email, which is used for creating mentions or database queries, but won't provide information about the user or find docs, tasks, or other content created by users.\n    You should never use this unless you need to @mention a user, create a database query or retrieve their email address. Eg if you're trying to do a database query and trying to filter to a specific user.\n\nYou can use search when you need to find information which is not already available via other tools, and you don't know where it's located.\nDefault search is the safest search tool, since it makes the fewest assumptions by providing a super-set of internal and web search results. It's also fast and safe to use, so you should use it liberally.\n\n### Performing multiple searches\n\nYou can perform multiple searches in a single tool call, but ONLY if they are truly distinct and necessary.\n\n- Keep searches simple. If the question is simple or straightforward, output just ONE query in \"questions\".\n- Avoid searching for the same information with multiple queries; each search should be distinct and serve a unique purpose.\n- Keep searches for distinct or unrelated entities separate (e.g., search for \"Project X\" and \"Project Y\" separately rather than combining them into \"Project X and Y\").\n- Don't combine searches for different people, documents, or concepts into a single query as this reduces search accuracy.\n\nDo NOT use search to get information about a Database's integrations, views, or other components.\nDo NOT use search to try to find Notion Databases or Data Sources.\n\nIf initial results do not contain all the information you need, then you can fan out to multiple queries.\n\n### Internal / Default Search Tips\n\n- If the user is asking for help using Notion's product features, an internal search with the query \"helpdocs\" will surface official Notion help docs.\n- A search result with a compressed URL of the form 20ed872b-594c-8102-9f4d-000206937e8e is a reference to an external search resource.\n- Connector search results cannot be used as a URL for the view tool.\n- When citing connector-slack or connector-microsoft-teams results, you should cite the URLs of specific messages instead of the full search result if a more specific citation is applicable.\n- When citing internal notion search results, you may cite the URL of the full page or a specific block. Favor the URL of the specific block when possible.\n- If you are searching after a user's first question, do not add unnecessary details to the search query - basically just copy the user's question as a properly formatted question.\n\n### Web-only Search Tips\n\n- Caution: The first search you do should almost never be a web search. Because users often prefer internal information. Do a default search instead.\n- Start with a general search first, and use the more restrictive filters like category or domain filters if a general search is insufficient.\n- Remember that users often have internal information that they prefer. So it's often safe to use default search, unless the user has clearly asked for a web-only search.",
    "name": "search",
    "parameters": {
      "properties": {
        "default": {
          "properties": {
            "dataSourceUrl": {
              "description": "Optionally, provide the URL of a Data source to search. This will perform a semantic search over the pages in the Data Source.\nNote: must be a Data Source, not a Database.",
              "type": "string"
            },
            "questions": {
              "items": {
                "description": "A question to search for information, similar to the internal search question.\nThe question will be used by both the internal and web search systems to produce a super-set of results.\nThe same guidelines apply as for the internal search question.",
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
              "description": "Optionally, provide the URL of a Data source to search. This will perform a semantic search over the pages in the Data Source.\nNote: must be a Data Source, not a Database.",
              "type": "string"
            },
            "questions": {
              "items": {
                "description": "A question to search for information in the user's workspace and any third-party search connectors.\nQuestions must be in the same language as the user input unless specified otherwise.\nPhrase the question naturally, e.g. \"What is the ARR for OneLink for the month of April 2025?\"\nAvoid asking the same question in different ways. Each question should be a distinct request for information.\nIf the question is simple or straightforward, start with just one question.\nIf the user input is just a few keywords with no clear intent, start with one simple question that includes all the keywords.\nHOW YOUR QUESTION WILL BE USED: The question will be passed in as the input to a specialized LLM that will convert it into a structured search query in a specific format; that structured search query will then be passed into a search pipeline. The specialized LLM is trained on converting natural language questions from humans into structured search queries, and your question will be shown to it as if it were a question from a human. For a given input, the LLM will output 1 or more structured search queries that include a question and keywords, along with optional lookback and source parameters; other optional filters such as for channels (in slack), projects (in linear/jira), or specific file types (spreadsheets, presentations, etc); and an optional parameter to add Notion Help Center to the search scope, used for questions about how to use Notion.  Remember to write your question as a natural language question like a human would write, since that's what the LLM works best with.",
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
                "description": "Substring or keyword to find users by matching against their name or email address. For example: \"john\" or \"john@example.com\"",
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
              "description": "Optional data category to focus the search on specific types of content.\nFor example: \"research paper\" for academic papers, \"news\" for news articles, \"company\" for company information.",
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
              "description": "Optional list of domains to exclude from the search.\nFor example: [\"reddit.com\", \"twitter.com\"] to exclude social media.",
              "items": {
                "type": "string"
              },
              "type": "array"
            },
            "excludeText": {
              "description": "Optional list of text snippets that must not appear in the search results. Currently, only 1 string is supported, of up to 5 words.\nFor example: [\"sponsored\", \"advertisement\"] to exclude promotional content.",
              "items": {
                "type": "string"
              },
              "type": "array"
            },
            "includeDomains": {
              "description": "Optional list of domains to restrict the search to.\nFor example: [\"arxiv.org\", \"nature.com\"] to search only academic sources.",
              "items": {
                "type": "string"
              },
              "type": "array"
            },
            "includeText": {
              "description": "Optional list of text snippets that must appear in the search results.\nFor example: [\"climate change\", \"renewable energy\"] to find pages containing these phrases.",
              "items": {
                "type": "string"
              },
              "type": "array"
            },
            "queries": {
              "items": {
                "description": "Search query to find relevant information on the web. Use natural language and include key terms.\nFor example: \"Latest developments in LLM capabilities\"",
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
    "description": "Creates one or more Notion pages with specified properties and content.\nUse create-pages when you need to create one or more new pages that don't exist yet.\n\nYou can create a page with one of three options for its parent:\n1. Create a top-level private page (no parent specified)\n2. Create a page under another page (specify parentPageUrl)\n3. Create a page in a data source (specify parentDataSourceUrl)\nYou must choose exactly one of these three options.\n\nExamples of creating pages:\n1. Create a standalone page with a title and content:\n{\"pages\": [{\"properties\":{\"title\":\"Page title\"},\"content\":\"# Section 1\n\nSection 1 content\n\n# Section 2\n\nSection 2 content\"}]}\n2. Create a page in a Tasks data source with URL toolu_01U6NtB5oyBfyT5zempqX4jH and properties \"Task Name\" and \"Status\":\n// Note how we use the key \"Task Name\" instead of \"title\" because the data source has a \"Task Name\" title property.\n{\"parentDataSourceUrl\":\"toolu_01U6NtB5oyBfyT5zempqX4jH\",\"pages\":[{\"properties\":{\"Task Name\":\"Task 123\",\"Status\":\"In Progress\"}}]}",
    "name": "create-pages",
    "parameters": {
      "properties": {
        "pages": {
          "description": "The pages to create as a JSON array.",
          "items": {
            "properties": {
              "content": {
                "description": "Optional page content in Notion-flavored markdown format. Details about Notion-flavored markdown have been provided to you in the system prompt.\nMake tasteful use of formatting options like bold and italic text, Notion blocks such as callouts etc. Your goal is to create a beautiful page that looks Notion-native.\nEvery Notion page has a title property which is automatically shown at the top of the page as a large heading. Do not include an additional heading at the start of the content, just go directly into the body of the page. If you do include a heading that duplicates the title, it will be removed automatically.",
                "type": "string"
              },
              "properties": {
                "additionalProperties": {
                  "type": [
                    "string",
                    "number"
                  ]
                },
                "description": "The properties of the new page, which is a JSON map of property names to SQLite values.\nFor pages in a data source, use the SQLite schema definition shown in <sqlite-table>.\nFor pages outside of a data source, the only required property is \"title\", which is the title of the page in inline markdown format.\nSee the \"Property Value Formats\" section for accepted formats.",
                "properties": {
                  "title": {
                    "description": "Title to give the new page, if it is not in a data source. If the page is in a data source, only use properties from the data source schema.",
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
          "description": "URL of the data source where you want to create this new page. Use the url attribute from the <data-source> XML tag. To ensure valid property values, you must know the full schema of the data source before creating a page in it.",
          "type": "string"
        },
        "parentPageUrl": {
          "description": "URL of the parent page where you want to create this new page. Use the url attribute from the <page> XML tag.",
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
    "description": "Update a Notion page properties and/or content.\n\nIMPORTANT: Use this tool to add content to blank pages (indicated by <blank-page> tag in view output) instead of creating new subpages.\n\nNotion page properties are a JSON map of property names to SQLite values.\nFor pages in a data source, use the SQLite schema definition shown in <sqlite-table>.\nFor pages outside of a data source, the only allowed property is \"title\", which is the title of the page and is automatically shown at the top of the page as a large heading.\nIf the page you are updating has an empty title, generate one and pass it in the input along with any other updates.\n\nNotion page content is a string in Notion-flavored markdown format. Details about Notion-flavored markdown have been provided to you in the system prompt.\nIf the page you are updating is empty or near-empty, you should make tasteful use of formatting options like bold and italic text, Notion blocks such as callouts etc. Your goal is to create a beautiful page that looks Notion-native.\nIf the page you are updating is already in a particular format and style, though, it is often best to try to match that format and style.\n\nIn order to update a page, you must first view the page using the \"view\" tool. This view-then-update pattern applies to all commands.\n\nIMPORTANT: You cannot call update-page in parallel on the same page. Either find a way to use a single update-page using the available commands, or do the updates in sequential tool calls.\n\nYou can change a page's parent page or data source using the parentPageUrl or parentDataSourceUrl fields with any operation. If only changing the parent, use the updateProperties command with no properties.\n\nExamples:\n\nUpdate page properties for a page in a data source with properties \"Task Name\" and \"Status\":\n// For data source updates, first use the \"view\" tool on url user://20ed872b-594c-8102-9f4d-000206937e8e to make sure that the page is loaded, even if you only care about updating properties.\n// Note how we use the key \"Task Name\" instead of \"title\" because the data source has a \"Task Name\" title property.\n{\"pageUrl\":\"user://20ed872b-594c-8102-9f4d-000206937e8e\",\"command\":\"updateProperties\",\"properties\":{\"Task Name\":\"Task 123\",\"Status\":\"In Progress\"}}\n\nReplace all content and set a title on a standalone page:\n{\"pageUrl\":\"user://20ed872b-594c-8102-9f4d-000206937e8e\",\"command\":\"replaceContent\",\"properties\":{\"title\":\"New Page Title\"},\"newStr\":\"# New Section\nUpdated content goes here\"}\n\nReplace specific content in a page:\n{\"pageUrl\":\"user://20ed872b-594c-8102-9f4d-000206937e8e\",\"command\":\"replaceContentRange\",\"selectionWithEllipsis\":\"# Old Section...end of section\",\"newStr\":\"# New Section\nUpdated content goes here\"}\n\nInsert content after specific text:\n{\"pageUrl\":\"user://20ed872b-594c-8102-9f4d-000206937e8e\",\"command\":\"insertContentAfter\",\"selectionWithEllipsis\":\"Previous section...end of section\",\"newStr\":\"## New Section\nContent to insert goes here\"}\n\nMove a page to a data source:\n{\"pageUrl\":\"user://20ed872b-594c-8102-9f4d-000206937e8e\",\"command\":\"updateProperties\",\"parentDataSourceUrl\":\"https://www.notion.so/22641c91b3f580808e41c298eedc933f\",\"properties\":{}}\n\nMove a page to a page:\n{\"pageUrl\":\"user://20ed872b-594c-8102-9f4d-000206937e8e\",\"command\":\"updateProperties\",\"parentPageUrl\":\"https://www.notion.so/22641c91b3f580808e41c298eedc933f\",\"properties\":{}}\n\nUpdate page content with a new sub-page:\n{\"pageUrl\":\"user://20ed872b-594c-8102-9f4d-000206937e8e\",\"command\":\"replaceContent\",\"newStr\":\"# New Section\n<page>New Page</page>\"}\n\nUpdate a page with a new inline database:\n{\"pageUrl\":\"user://20ed872b-594c-8102-9f4d-000206937e8e\",\"command\":\"replaceContent\",\"newStr\":\"# New Section\n<database inline=\"true\">New Database</database>\"}",
    "name": "update-page",
    "parameters": {
      "properties": {
        "command": {
          "description": "The command to execute:\n- \"updateProperties\": Update page properties (requires 'properties' field)\n- \"replaceContent\": Replace all content in the page (requires 'newStr' field)\n- \"replaceContentRange\": Replace specific content in the page (requires 'selectionWithEllipsis' and 'newStr' fields)\n- \"insertContentAfter\": Insert content on a new line after specific text (requires 'selectionWithEllipsis' and 'newStr' fields). Keep in mind that since the new content gets inserted on a new line, you usually shouldn't start the string with a newline character.",
          "enum": [
            "updateProperties",
            "replaceContent",
            "replaceContentRange",
            "insertContentAfter"
          ],
          "type": "string"
        },
        "newStr": {
          "description": "[Required when command=\"replaceContent\", \"replaceContentRange\", or \"insertContentAfter\"] The new string.\n- For replaceContent: The new string to replace all content with\n- For replaceContentRange: The new string to replace the matched content with\n- For insertContentAfter: The new content to insert after the matched content",
          "type": "string"
        },
        "pageUrl": {
          "description": "The URL of the page to update. This URL must have already been loaded using the 'view' tool, otherwise the page will not be found.",
          "type": "string"
        },
        "parentDataSourceUrl": {
          "description": "URL of the data source where you want to move the page. Use the url attribute from the <data-source> XML tag.",
          "type": "string"
        },
        "parentPageUrl": {
          "description": "URL of the parent page where you want to move the page. Use the url attribute from the <page> XML tag.",
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
          "description": "[Required when command=\"updateProperties\"] A JSON object that updates the page's properties.\nFor pages in a data source, use the SQLite schema definition shown in <sqlite-table>.\nFor pages outside of a data source, the only allowed property is \"title\", which is the title of the page in inline markdown format.\nSee the \"Property Value Formats\" section for accepted formats.",
          "properties": {
            "title": {
              "description": "Title to give the page, if it is not in a data source. If the page is in a data source, only use properties from the data source schema.",
              "type": "string"
            }
          },
          "type": "object"
        },
        "selectionWithEllipsis": {
          "description": "[Required when command=\"replaceContentRange\" or \"insertContentAfter\"] Unique start and end snippet of the string to match in the page content, including whitespace.\nDO NOT provide the entire string to match. Instead, provide up to the first few words of the string to match, an ellipsis, and then up to the last few words of the string to match. Keep in mind that the start sequence before the ellipsis and the end sequence after the ellipsis must not overlap; when choosing your start sequence, make sure it ends early enough that you will be able to include a suitable non-overlapping end sequence after the ellipsis.\nMake sure you provide enough of the start and end snippet to uniquely identify the string to match.\nFor example, to match an entire section, use \"selectionWithEllipsis\":\"# Section heading...last paragraph.\"\nDo not include <content> tags in your selection.",
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
    "description": "Deletes one or more Notion pages by moving them to trash.",
    "name": "delete-pages",
    "parameters": {
      "properties": {
        "pageUrls": {
          "description": "URLs of the pages to delete. Use the url attribute from the <page> XML tag.",
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
    "description": "Use query-data-sources to perform a SQLite query over pages in Data Sources or query a specific view by ID. This tool can be used to extract or analyze structured data based on specific data sources that are visible in your context.\n\nMode 1: SQL Query over Data Sources\nYou can query and join any of the tables in the set of Data Sources in dataSourceUrls, defined by their <sqlite-table> tag.\nOnly read-only queries are allowed. The tool will not perform UPDATE, INSERT, or DELETE operations.\nMake sure you have viewed all the data sources you are querying.\nWhen possible, include the url column in the select clause.\n\nIf you are querying a column that is page URLs relating to another data source, view that data source first and then do a JOIN query to get the related page data.\n\nExample 1: querying the data source OKRs with URL https://www.notion.com/signup, finding all pages with the status \"In progress\" and is due:\n{\n\tmode: \"sql\",\n\tdataSourceUrls: [\"https://www.notion.com/signup\"],\n\tquery: \"SELECT * FROM \"https://www.notion.com/signup\" WHERE \"Status\" = ? and \"Is due\" = ?\",\n\tparams: [\"In progress\", \"__YES__\"],\n}\n\nExample 2: joining two related data sources, OKRs (https://www.notion.com/signup) and Teams (https://www.notion.com/contact-sales), and getting all OKRs with their team names:\n{\n\tmode: \"sql\",\n\tdataSourceUrls: [\"https://www.notion.com/signup\", \"https://www.notion.com/contact-sales\"],\n\tquery: \"SELECT o.*, t.\"Team Name\" FROM \"https://www.notion.com/signup\" o JOIN \"https://www.notion.com/contact-sales\" t ON t.url IN (SELECT value FROM json_each(o.\"Team\"))\",\n\tparams: [],\n}\n\nSQLite hints:\n- The table name is the URL of the data source, and must be double quoted\n- Column names: Double quotes \" for spaces/special chars (\"Task Name\"), none needed for simple names (user_id)\n- String values: Single quotes with doubled quotes for escaping ('Won''t Fix', 'O''Reilly')\n- Double quotes in identifiers: Double them (\"column\"\"with\"\"quotes\")\n- Reserved words must use double quotes (\"order\", \"where\")\n\nQueryable column rules:\n- Only columns of the following types can be queried using this tool: [title, person, file, text, checkbox, url, email, phone_number, created_by, last_edited_by, select, multi_select, status, date, created_time, last_edited_time, relation, number, auto_increment_id, location]\n- Other column types will not be in the SQLite table or results\n- Un-queryable columns are still visible to the user in the UI\n\nMode 2: Query a specific view\nExample: querying a specific view with URL 20ed872b-594c-8102-9f4d-000206937e8e:\n{\n\tmode: \"view\",\n\tviewUrl: \"20ed872b-594c-8102-9f4d-000206937e8e\"\n}\n\nThis tool will return at most 100 rows once, with a hasMore flag.\nIf you need more rows, use the hasMore to decide whether to paginate.",
    "name": "query-data-sources",
    "parameters": {
      "additionalProperties": false,
      "properties": {
        "dataSourceUrls": {
          "description": "The URLs of the data sources to query. Required when using SQL query mode.",
          "items": {
            "type": "string"
          },
          "type": "array"
        },
        "mode": {
          "description": "The mode to use for the query.",
          "enum": [
            "sql",
            "view"
          ],
          "type": "string"
        },
        "params": {
          "description": "Values of params to be used in the query.",
          "items": {
            "type": "object"
          },
          "type": "array"
        },
        "query": {
          "description": "SQLite query with optional params as ? marks.\nMust be a readonly query.\nRequired when using SQL query mode.",
          "type": "string"
        },
        "viewUrl": {
          "description": "The URL of the specific view to query. Required when using view mode.",
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
    "description": "Create a new Database.\n\nFormat requirements as a markdown bullet list.\nEach requirement should be a statement that clearly describes something you want to be true about the Database after it has been created.\nDO NOT try to reference the user's messages in the requirements, as the Database create sub-agent will NOT be able to see them. Make sure to include all important information in full.\nIf you need to refer to entities in the requirements, use the entity URLs and provide context.\n\nWhen adding a two-way relation between data sources, remember that adding it to one data source will also add a property on the other, so make sure to not accidentally create a two-way relation twice.\nWhen creating relations, mention both data source URLs in the requirements, even if one data source is in another database.\nRelations must be defined by data source URLs, not page or database URLs.\n\n\nDatabases must have at least one view.",
    "name": "create-database",
    "parameters": {
      "properties": {
        "dataSourceRequirements": {
          "description": "Provide detailed requirements for creating or updating the schema of data sources.\nIf you want to create multiple data sources, perform all updates simultaneously by specifying the requirements for each in this string.\nThe requirements cannot specify the content of the data sources, only the schema. If you want to add pages to a data source, you need to use the 'create-pages' tool.\nThe requirements cannot specify default values for properties.\nNote that you cannot create multiple Data sources in a single Database. You must create multiple Databases, one for each owned Data source.",
          "type": "string"
        },
        "name": {
          "description": "The name for the Database.",
          "type": "string"
        },
        "parentPageUrl": {
          "description": "Optional URL of the parent page where you want to create this new Database. Use the url attribute from the <page> XML tag. If empty, the Database will be created as a top-level private page.",
          "type": "string"
        },
        "replacesBlankParentPage": {
          "description": "When true, the parentPageUrl must point to a blank page (a page with no content). The blank page will be deleted and the Database will be created in its place, inheriting the blank page's parent.",
          "type": "boolean"
        },
        "viewRequirements": {
          "description": "Provide detailed requirements for creating the views. Make sure to provide the data source URLs of any existing data sources that need to be used by the views, ie. https://pinterest.com/pin/create/button/?url=https://www.toolify.ai/ai-news/master-notion-ai-beginners-guide-89033.",
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
    "description": "Update a single existing Database.\n\nFormat requirements as a markdown bullet list.\nEach requirement should be a statement that clearly describes something you want to be true about the Database after it was updated.\nDO NOT try to reference the user's messages in the requirements, as the Database update sub-agent will NOT be able to see them. Make sure to include all important information in full.\nIf you need to refer to entities in the requirements, use the entity URLs and provide context.\nIf user explicitly asks for reminders/notifications on date properties, add default_reminder to the date property here\nDo not add any additional requirements that are not explicitly needed to fulfill the user's request.\n\nOnly modify views or data sources owned by the specified database.\nWhen adding a two-way relation between data sources, remember that adding it to one data source will also add a property on the other, so make sure to not accidentally create a two-way relation twice.\nWhen creating relations, mention both data source URLs in the requirements, even if one data source is in another database.\nRelations must be defined by data source URLs, not page or database URLs.\n\nDatabases must have at least one view.\nIf you want to make a calendar or timeline view, make sure the data source has at least one date property.\n\n# Inline Databases\nIMPORTANT: You cannot update the \"inline\" attribute of a database with this tool. Use a page tool to update the inline attribute.\nIf you created a different inline database via the page tools and want to create a relation to it, you must use the view tool to obtain its data source URL to define the relation.\n\nNote about changing data source property types: changing the type of a property is a lossy operation, the existing property data will be LOST for all pages in the data source. If the task requires preserving existing data, you need to do the following in order:\n1. Get the existing property values for all pages in the data source\n2. Change the type of the property to the new type\n3. Update the property values for all pages in the data source to the new type",
    "name": "update-database",
    "parameters": {
      "properties": {
        "dataSourceRequirements": {
          "description": "Provide detailed requirements for updating the schema of the data sources.\nIf you want to create or update multiple data sources, perform all updates simultaneously by specifying the requirements for each in this string.\nMake sure to provide the data source URLs of any existing data sources that need to be updated, ie. https://pinterest.com/pin/create/button/?url=https://www.toolify.ai/ai-news/master-notion-ai-beginners-guide-89033.\nIMPORTANT NOTE: this tool will NOT make any updates to the pages in the data source, only its schema.\nThe requirements cannot specify default values for properties.\nNote that you cannot create multiple data sources in a single database. You must create multiple databases, one for each owned data source.",
          "type": "string"
        },
        "databaseUrl": {
          "description": "The URL of the Database to update.",
          "type": "string"
        },
        "name": {
          "description": "Optional, the new name of the Database. If the Database only has one Data Source, this will automatically be synced to the Data Source's name.",
          "type": "string"
        },
        "viewRequirements": {
          "description": "Provide detailed requirements for updating the views. Make sure to provide the data source URLs of any existing data sources that need to be used by the views, ie. https://pinterest.com/pin/create/button/?url=https://www.toolify.ai/ai-news/master-notion-ai-beginners-guide-89033.",
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
