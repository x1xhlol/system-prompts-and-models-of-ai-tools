## Tools.json

```json
[
  {
    "description": "Shortcut to create a new web project from a framework template. Each is configured with TypeScript, Biome, and Bun. Choose the best framework for the project. Do not use this tool if the desired framework is not listed. Default to nextjs-shadcn.",
    "name": "startup",
    "parameters": {
      "$schema": "http://json-schema.org/draft-07/schema#",
      "additionalProperties": false,
      "properties": {
        "framework": {
          "description": "The framework to use for the project..",
          "enum": [
            "html-ts-css",
            "react-vite",
            "react-vite-tailwind",
            "react-vite-shadcn",
            "nextjs-shadcn",
            "vue-vite",
            "vue-vite-tailwind",
            "shipany"
          ],
          "type": "string"
        },
        "project_name": {
          "description": "The name of the project. Only lowercase letters, numbers, and hyphens allowed.",
          "type": "string"
        },
        "shadcn_theme": {
          "description": "The shadcn theme to use for the project. Choose zinc unless the app's requirements specify otherwise.",
          "enum": [
            "zinc",
            "blue",
            "green",
            "orange",
            "red",
            "rose",
            "violet",
            "yellow"
          ],
          "type": "string"
        }
      },
      "required": [
        "project_name",
        "framework",
        "shadcn_theme"
      ],
      "type": "object"
    }
  },
  {
    "description": "Launches a highly capable task agent in the USER's workspace. Usage notes:\n1. When the agent is done, it will return a report of its actions. This report is also visible to USER, so you don't have to repeat any overlapping information.\n2. Each agent invocation is stateless and doesn't have access to your chat history with USER. You will not be able to send additional messages to the agent, nor will the agent be able to communicate with you outside of its final report. Therefore, your prompt should contain a highly detailed task description for the agent to perform autonomously and you should specify exactly what information the agent should return back to you in its final and only message to you.\n3. The agent's outputs should generally be trusted.",
    "name": "task_agent",
    "parameters": {
      "$schema": "http://json-schema.org/draft-07/schema#",
      "additionalProperties": false,
      "properties": {
        "integrations": {
          "description": "Choose the external services the agent should interact with.",
          "items": {
            "enum": [],
            "type": "string"
          },
          "type": "array"
        },
        "prompt": {
          "description": "The task for the agent to perform.",
          "type": "string"
        },
        "relative_file_paths": {
          "description": "Relative paths to files that are relevant to the task.",
          "items": {
            "type": "string"
          },
          "type": "array"
        }
      },
      "required": [
        "prompt",
        "integrations",
        "relative_file_paths"
      ],
      "type": "object"
    }
  },
  {
    "description": "Run a terminal command. Each command runs in a new shell.\nIMPORTANT: Do not use this tool to edit files. Use the `edit_file` tool instead.",
    "name": "bash",
    "parameters": {
      "$schema": "http://json-schema.org/draft-07/schema#",
      "additionalProperties": false,
      "properties": {
        "command": {
          "description": "The terminal command to execute.",
          "type": "string"
        },
        "require_user_interaction": {
          "description": "If the command requires user to interact with the terminal (for example, to install dependencies), write a notice to the user. A short single sentence starting with \"Interact with the terminal to ...\" Otherwise, write \"\".",
          "type": "string"
        },
        "starting_server": {
          "description": "Whether the command starts a server process.",
          "type": "boolean"
        }
      },
      "required": [
        "command",
        "starting_server",
        "require_user_interaction"
      ],
      "type": "object"
    }
  },
  {
    "description": "List the contents of a directory. The quick tool to use for discovery, before using more targeted tools like semantic search or file reading. Useful to try to understand the file structure before diving deeper into specific files. Can be used to explore the codebase.",
    "name": "ls",
    "parameters": {
      "$schema": "http://json-schema.org/draft-07/schema#",
      "additionalProperties": false,
      "properties": {
        "relative_dir_path": {
          "description": "The relative path to the directory to list contents of.",
          "type": "string"
        }
      },
      "required": [
        "relative_dir_path"
      ],
      "type": "object"
    }
  },
  {
    "description": "Search for files using glob patterns. Supports patterns like *.ts, **/*.tsx, src/**/*.{js,ts}, etc. Use this when you need to find files matching specific patterns rather than fuzzy matching.",
    "name": "glob",
    "parameters": {
      "$schema": "http://json-schema.org/draft-07/schema#",
      "additionalProperties": false,
      "properties": {
        "exclude_pattern": {
          "description": "Optional glob pattern to exclude files (e.g., '**/node_modules/**')",
          "type": "string"
        },
        "pattern": {
          "description": "Glob pattern to match files against (e.g., '*.ts', '**/*.tsx', 'src/**/*.{js,ts}')",
          "type": "string"
        }
      },
      "required": [
        "pattern",
        "exclude_pattern"
      ],
      "type": "object"
    }
  },
  {
    "description": "Fast text-based regex search that finds exact pattern matches within files or directories, utilizing the ripgrep command for efficient searching. Results will be formatted in the style of ripgrep and can be configured to include line numbers and content. To avoid overwhelming output, the results are capped at 50 matches. Use the include or exclude patterns to filter the search scope by file type or specific paths. This is best for finding exact text matches or regex patterns. More precise than semantic search for finding specific strings or patterns. This is preferred over semantic search when we know the exact symbol/function name/etc. to search in some set of directories/file types.",
    "name": "grep",
    "parameters": {
      "$schema": "http://json-schema.org/draft-07/schema#",
      "additionalProperties": false,
      "properties": {
        "case_sensitive": {
          "description": "Whether the search should be case sensitive.",
          "type": "boolean"
        },
        "exclude_pattern": {
          "description": "Glob pattern for files to exclude (e.g. '.test.ts' for test files).",
          "type": "string"
        },
        "include_pattern": {
          "description": "Glob pattern for files to include (e.g. '.ts' for TypeScript files).",
          "type": "string"
        },
        "query": {
          "description": "The regex pattern to search for.",
          "type": "string"
        }
      },
      "required": [
        "query",
        "case_sensitive",
        "include_pattern",
        "exclude_pattern"
      ],
      "type": "object"
    }
  },
  {
    "description": "Read the contents of a file. For text files, the output will be the 1-indexed file contents from start_line_one_indexed to end_line_one_indexed_inclusive, together with a summary of the lines outside those ranges. Notes that it can view at most 750 lines at a time. For binary files (like images), it will show you the image.\n\nWhen using this tool to gather information, it's your responsibility to ensure you have the COMPLETE context. Specifically, each time you call this command you should:\n1) Assess if the contents you viewed are sufficient to proceed with your task.\n2) Take note of where there are lines not shown.\n3) If the file contents you have viewed are insufficient, and you suspect they may be in lines not shown, proactively call the tool again to view those lines.\n4) When in doubt, call this tool again to gather more information. Remember that partial file views may miss critical dependencies, imports, or functionality.\n\nIn some cases, if reading a range of lines is not enough, you may choose to read the entire file. Reading entire files is often wasteful and slow, especially for large files (i.e. more than a few hundred lines). So you should use this option sparingly. Reading the entire file is not allowed in most cases. You are only allowed to read the entire file if it has been edited or manually attached to the conversation by the user.",
    "name": "read_file",
    "parameters": {
      "$schema": "http://json-schema.org/draft-07/schema#",
      "additionalProperties": false,
      "properties": {
        "end_line_one_indexed": {
          "description": "The one-indexed line number to end reading at (inclusive).",
          "type": "number"
        },
        "relative_file_path": {
          "description": "The relative path to the file to read.",
          "type": "string"
        },
        "should_read_entire_file": {
          "description": "Whether to read the entire file.",
          "type": "boolean"
        },
        "start_line_one_indexed": {
          "description": "The one-indexed line number to start reading from (inclusive).",
          "type": "number"
        }
      },
      "required": [
        "relative_file_path",
        "should_read_entire_file",
        "start_line_one_indexed",
        "end_line_one_indexed"
      ],
      "type": "object"
    }
  },
  {
    "description": "Deletes a file at the specified path. The operation will fail gracefully if:\n    - The file doesn't exist\n    - The operation is rejected for security reasons\n    - The file cannot be deleted",
    "name": "delete_file",
    "parameters": {
      "$schema": "http://json-schema.org/draft-07/schema#",
      "additionalProperties": false,
      "properties": {
        "relative_file_path": {
          "description": "The relative path to the file to delete.",
          "type": "string"
        }
      },
      "required": [
        "relative_file_path"
      ],
      "type": "object"
    }
  },
  {
    "description": "Use this tool to make large edits or refactorings to an existing file or create a new file.\nSpecify the `relative_file_path` argument first.\n`code_edit` will be read by a less intelligent model, which will quickly apply the edit.\n\nMake it clear what the edit is while minimizing the unchanged code you write.\nWhen writing the edit, specify each edit in sequence using the special comment `// ... existing code ... <description of existing code>` to represent unchanged code in between edited lines.\n\nFor example:\n```\n// ... existing code ... <original import statements>\n<first edit here>\n// ... existing code ... <`LoginButton` component>\n<second edit here>\n// ... existing code ... <the rest of the file>\n```\nALWAYS include the `// ... existing code ... <description of existing code>` comment for each edit to indicate the code that should not be changed.\n\nDO NOT omit spans of pre-existing code without using the `// ... existing code ... <description of existing code>` comment to indicate its absence.\n\nOnly use emojis if the user explicitly requests it. Avoid adding emojis to files unless asked.",
    "name": "edit_file",
    "parameters": {
      "$schema": "http://json-schema.org/draft-07/schema#",
      "additionalProperties": false,
      "properties": {
        "code_edit": {
          "description": "Specify ONLY the precise lines of code that you wish to edit. **NEVER specify or write out unchanged code**. Instead, represent all unchanged code using the comment of the language you're editing in - example: `// ...[existing code] <description of existing code> ...`.",
          "type": "string"
        },
        "instructions": {
          "description": "A single sentence instruction describing what you are going to do for the sketched edit. Don't repeat what you have said previously in normal messages. And use it to disambiguate uncertainty in the edit.",
          "type": "string"
        },
        "relative_file_path": {
          "description": "The relative path to the file to modify. The tool will create any directories in the path that don't exist.",
          "type": "string"
        },
        "smart_apply": {
          "description": "Use a smarter model to apply the code_edit. This is useful if the edit is long, or if the last edit was incorrect and you are trying again. Make sure to include the proper `// ... existing code ...` comments to indicate the code that should not be changed.",
          "type": "boolean"
        }
      },
      "required": [
        "relative_file_path",
        "instructions",
        "code_edit",
        "smart_apply"
      ],
      "type": "object"
    }
  },
  {
    "description": "Performs exact string replacements in files.\nUse this tool to make small, specific edits to a file. For example, to edit some text, a couple of lines of code, etc. Use edit_file for larger edits.\n\nEnsure you preserve the exact indentation (tabs/spaces) as it appears AFTER the line number prefix added by the read_file tool.\nOnly use this tool if you are sure that the old_string is unique in the file, otherwise use the edit_file tool.\n\nThe edit will FAIL if `old_string` is not unique in the file. Either provide a larger string with more surrounding context to make it unique or use `replace_all` to change every instance of `old_string`.\n\nUse `replace_all` for replacing and renaming strings across the file. This parameter is useful if you want to rename a variable for instance.\n\nOnly use emojis if the user explicitly requests it. Avoid adding emojis to files unless asked.",
    "name": "string_replace",
    "parameters": {
      "$schema": "http://json-schema.org/draft-07/schema#",
      "additionalProperties": false,
      "properties": {
        "new_string": {
          "description": "The new text to replace the old_string.",
          "type": "string"
        },
        "old_string": {
          "description": "The text to replace. It must be unique within the file, and must match the file contents exactly, including all whitespace and indentation.",
          "type": "string"
        },
        "relative_file_path": {
          "description": "The relative path to the file to modify. The tool will create any directories in the path that don't exist.",
          "type": "string"
        },
        "replace_all": {
          "description": "Replace all occurences of old_string.",
          "type": "boolean"
        }
      },
      "required": [
        "relative_file_path",
        "old_string",
        "new_string",
        "replace_all"
      ],
      "type": "object"
    }
  },
  {
    "description": "Before running this tool, make sure a lint script exists in the project's package.json file and all packages have been installed. This tool will return the linter result and, when available, runtime errors and dev server logs from the last time the preview was refreshed.",
    "name": "run_linter",
    "parameters": {
      "$schema": "http://json-schema.org/draft-07/schema#",
      "additionalProperties": false,
      "properties": {
        "package_manager": {
          "description": "The package manager used to install the dependencies.",
          "enum": [
            "bun",
            "pnpm",
            "npm"
          ],
          "type": "string"
        },
        "project_directory": {
          "description": "The directory of the project to run linting on.",
          "type": "string"
        }
      },
      "required": [
        "project_directory",
        "package_manager"
      ],
      "type": "object"
    }
  },
  {
    "description": "Create a new version for a project. Calling this tool will automatically increment the version by 1. If there is a dev server running when the tool is called, the tool will show you a full-page screenshot of the version's live preview and return any unresolved linter and runtime errors. Create versions frequently.",
    "name": "versioning",
    "parameters": {
      "$schema": "http://json-schema.org/draft-07/schema#",
      "additionalProperties": false,
      "properties": {
        "project_directory": {
          "description": "The relative path to the project directory to version. This is the directory that contains the project's package.json file.",
          "type": "string"
        },
        "version_changelog": {
          "description": "The version changelog. Write 1-5 short points.",
          "items": {
            "type": "string"
          },
          "type": "array"
        },
        "version_number": {
          "description": "A whole number. Write an empty string to automatically increment.",
          "type": "string"
        },
        "version_title": {
          "description": "The title of the version. This is used to help the user navigate to the version.",
          "type": "string"
        }
      },
      "required": [
        "project_directory",
        "version_title",
        "version_changelog",
        "version_number"
      ],
      "type": "object"
    }
  },
  {
    "description": "Suggest 1-5 next steps to implement with the USER.",
    "name": "suggestions",
    "parameters": {
      "$schema": "http://json-schema.org/draft-07/schema#",
      "additionalProperties": false,
      "properties": {
        "suggestions": {
          "description": "List of 1-5 suggested next steps. No '-', bullet points, or other formatting.",
          "items": {
            "type": "string"
          },
          "type": "array"
        }
      },
      "required": [
        "suggestions"
      ],
      "type": "object"
    }
  },
  {
    "description": "Deploys the project to Netlify. Version the project before calling this tool. Check the full-page screenshot of the live preview carefully. If the project is even borderline illegal or morally unsafe, you should not deploy it.\n\nStatic vs Dynamic deployments:\nNetlify accepts either static or dynamic site deployments. Deploying static sites is much faster.\nHowever, if the project has a backend, API routes, or a database, deploy it as a dynamic site.\n\nFor static site deployments:\nUse 'zip -r9' for your `build_and_zip_command` to create a zip of the build output. For example: `cd {project_directory} && {build_command} && mkdir -p output && zip -r9 output/output.zip {build_output_directory}`.\nEnsure the `relative_zip_path` correctly points to the zip file created by the `build_and_zip_command`.\nYou don't need to run the `build_and_zip_command` manually. The tool will run it for you.\nIf deploying a static site fails, try redeploying the project as a dynamic site.\nIf you have to deploy a nextjs static site, read the `next.config.js` file and make sure it includes `output: 'export'` and `distDir: 'out'`.\n\nFor dynamic site deployments:\nEdit the `netlify.toml` file to set the correct build command and output directory.\nDefault to deploying nextjs projects as dynamic sites.",
    "name": "deploy",
    "parameters": {
      "$schema": "http://json-schema.org/draft-07/schema#",
      "additionalProperties": false,
      "properties": {
        "deploy_as_dynamic_site": {
          "description": "Set to true to deploy as a dynamic site.",
          "type": "boolean"
        },
        "deploy_as_static_site": {
          "additionalProperties": false,
          "description": "To deploy a static site. Write the build_and_zip_command and relative_zip_path. Otherwise, write them as empty strings.",
          "properties": {
            "build_and_zip_command": {
              "description": "A command to build the project and create a zip of the build output.",
              "type": "string"
            },
            "relative_zip_path": {
              "description": "Relative path to the zip file to deploy.",
              "type": "string"
            }
          },
          "required": [
            "build_and_zip_command",
            "relative_zip_path"
          ],
          "type": "object"
        }
      },
      "required": [
        "deploy_as_static_site",
        "deploy_as_dynamic_site"
      ],
      "type": "object"
    }
  },
  {
    "description": "Search the web for real-time text and image responses. For example, you can get up-to-date information that might not be available in your training data, verify current facts, or find images that you can use in your project. You will see the text and images in the response. You can use the images by using the links in the <img> tag. Use this tool to find images you can use in your project. For example, if you need a logo, use this tool to find a logo.",
    "name": "web_search",
    "parameters": {
      "$schema": "http://json-schema.org/draft-07/schema#",
      "additionalProperties": false,
      "properties": {
        "search_term": {
          "description": "The search term to look up on the web. Be specific and include relevant keywords for better results. For technical queries, include version numbers or dates if relevant.",
          "type": "string"
        },
        "type": {
          "description": "The type of search to perform (text or images).",
          "enum": [
            "text",
            "images"
          ],
          "type": "string"
        }
      },
      "required": [
        "search_term",
        "type"
      ],
      "type": "object"
    }
  },
  {
    "description": "Scrape a website to see its design and content. Use this tool to get a website's title, description, content, and screenshot (if requested). Use this tool whenever USER gives you a documentation URL to read or asks you to clone a website. When using this tool, say \"I'll visit {url}...\" or \"I'll read {url}...\" and never say \"I'll scrape\".",
    "name": "web_scrape",
    "parameters": {
      "$schema": "http://json-schema.org/draft-07/schema#",
      "additionalProperties": false,
      "properties": {
        "include_screenshot": {
          "description": "Whether to see a screenshot of the website. Set to false when reading documentation.",
          "type": "boolean"
        },
        "theme": {
          "description": "To scrape the website in light or dark mode.",
          "enum": [
            "light",
            "dark"
          ],
          "type": "string"
        },
        "url": {
          "description": "The URL of the website to scrape. Must be a valid URL starting with http:// or https://",
          "type": "string"
        },
        "viewport": {
          "description": "The viewport to scrape the website in.",
          "enum": [
            "mobile",
            "tablet",
            "desktop"
          ],
          "type": "string"
        }
      },
      "required": [
        "url",
        "theme",
        "viewport",
        "include_screenshot"
      ],
      "type": "object"
    }
  }
]
```