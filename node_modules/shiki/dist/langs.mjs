const bundledLanguagesInfo = [
  {
    "id": "abap",
    "name": "ABAP",
    "import": () => import('@shikijs/langs/abap')
  },
  {
    "id": "actionscript-3",
    "name": "ActionScript",
    "import": () => import('@shikijs/langs/actionscript-3')
  },
  {
    "id": "ada",
    "name": "Ada",
    "import": () => import('@shikijs/langs/ada')
  },
  {
    "id": "angular-html",
    "name": "Angular HTML",
    "import": () => import('@shikijs/langs/angular-html')
  },
  {
    "id": "angular-ts",
    "name": "Angular TypeScript",
    "import": () => import('@shikijs/langs/angular-ts')
  },
  {
    "id": "apache",
    "name": "Apache Conf",
    "import": () => import('@shikijs/langs/apache')
  },
  {
    "id": "apex",
    "name": "Apex",
    "import": () => import('@shikijs/langs/apex')
  },
  {
    "id": "apl",
    "name": "APL",
    "import": () => import('@shikijs/langs/apl')
  },
  {
    "id": "applescript",
    "name": "AppleScript",
    "import": () => import('@shikijs/langs/applescript')
  },
  {
    "id": "ara",
    "name": "Ara",
    "import": () => import('@shikijs/langs/ara')
  },
  {
    "id": "asciidoc",
    "name": "AsciiDoc",
    "aliases": [
      "adoc"
    ],
    "import": () => import('@shikijs/langs/asciidoc')
  },
  {
    "id": "asm",
    "name": "Assembly",
    "import": () => import('@shikijs/langs/asm')
  },
  {
    "id": "astro",
    "name": "Astro",
    "import": () => import('@shikijs/langs/astro')
  },
  {
    "id": "awk",
    "name": "AWK",
    "import": () => import('@shikijs/langs/awk')
  },
  {
    "id": "ballerina",
    "name": "Ballerina",
    "import": () => import('@shikijs/langs/ballerina')
  },
  {
    "id": "bat",
    "name": "Batch File",
    "aliases": [
      "batch"
    ],
    "import": () => import('@shikijs/langs/bat')
  },
  {
    "id": "beancount",
    "name": "Beancount",
    "import": () => import('@shikijs/langs/beancount')
  },
  {
    "id": "berry",
    "name": "Berry",
    "aliases": [
      "be"
    ],
    "import": () => import('@shikijs/langs/berry')
  },
  {
    "id": "bibtex",
    "name": "BibTeX",
    "import": () => import('@shikijs/langs/bibtex')
  },
  {
    "id": "bicep",
    "name": "Bicep",
    "import": () => import('@shikijs/langs/bicep')
  },
  {
    "id": "blade",
    "name": "Blade",
    "import": () => import('@shikijs/langs/blade')
  },
  {
    "id": "bsl",
    "name": "1C (Enterprise)",
    "aliases": [
      "1c"
    ],
    "import": () => import('@shikijs/langs/bsl')
  },
  {
    "id": "c",
    "name": "C",
    "import": () => import('@shikijs/langs/c')
  },
  {
    "id": "cadence",
    "name": "Cadence",
    "aliases": [
      "cdc"
    ],
    "import": () => import('@shikijs/langs/cadence')
  },
  {
    "id": "cairo",
    "name": "Cairo",
    "import": () => import('@shikijs/langs/cairo')
  },
  {
    "id": "clarity",
    "name": "Clarity",
    "import": () => import('@shikijs/langs/clarity')
  },
  {
    "id": "clojure",
    "name": "Clojure",
    "aliases": [
      "clj"
    ],
    "import": () => import('@shikijs/langs/clojure')
  },
  {
    "id": "cmake",
    "name": "CMake",
    "import": () => import('@shikijs/langs/cmake')
  },
  {
    "id": "cobol",
    "name": "COBOL",
    "import": () => import('@shikijs/langs/cobol')
  },
  {
    "id": "codeowners",
    "name": "CODEOWNERS",
    "import": () => import('@shikijs/langs/codeowners')
  },
  {
    "id": "codeql",
    "name": "CodeQL",
    "aliases": [
      "ql"
    ],
    "import": () => import('@shikijs/langs/codeql')
  },
  {
    "id": "coffee",
    "name": "CoffeeScript",
    "aliases": [
      "coffeescript"
    ],
    "import": () => import('@shikijs/langs/coffee')
  },
  {
    "id": "common-lisp",
    "name": "Common Lisp",
    "aliases": [
      "lisp"
    ],
    "import": () => import('@shikijs/langs/common-lisp')
  },
  {
    "id": "coq",
    "name": "Coq",
    "import": () => import('@shikijs/langs/coq')
  },
  {
    "id": "cpp",
    "name": "C++",
    "aliases": [
      "c++"
    ],
    "import": () => import('@shikijs/langs/cpp')
  },
  {
    "id": "crystal",
    "name": "Crystal",
    "import": () => import('@shikijs/langs/crystal')
  },
  {
    "id": "csharp",
    "name": "C#",
    "aliases": [
      "c#",
      "cs"
    ],
    "import": () => import('@shikijs/langs/csharp')
  },
  {
    "id": "css",
    "name": "CSS",
    "import": () => import('@shikijs/langs/css')
  },
  {
    "id": "csv",
    "name": "CSV",
    "import": () => import('@shikijs/langs/csv')
  },
  {
    "id": "cue",
    "name": "CUE",
    "import": () => import('@shikijs/langs/cue')
  },
  {
    "id": "cypher",
    "name": "Cypher",
    "aliases": [
      "cql"
    ],
    "import": () => import('@shikijs/langs/cypher')
  },
  {
    "id": "d",
    "name": "D",
    "import": () => import('@shikijs/langs/d')
  },
  {
    "id": "dart",
    "name": "Dart",
    "import": () => import('@shikijs/langs/dart')
  },
  {
    "id": "dax",
    "name": "DAX",
    "import": () => import('@shikijs/langs/dax')
  },
  {
    "id": "desktop",
    "name": "Desktop",
    "import": () => import('@shikijs/langs/desktop')
  },
  {
    "id": "diff",
    "name": "Diff",
    "import": () => import('@shikijs/langs/diff')
  },
  {
    "id": "docker",
    "name": "Dockerfile",
    "aliases": [
      "dockerfile"
    ],
    "import": () => import('@shikijs/langs/docker')
  },
  {
    "id": "dotenv",
    "name": "dotEnv",
    "import": () => import('@shikijs/langs/dotenv')
  },
  {
    "id": "dream-maker",
    "name": "Dream Maker",
    "import": () => import('@shikijs/langs/dream-maker')
  },
  {
    "id": "edge",
    "name": "Edge",
    "import": () => import('@shikijs/langs/edge')
  },
  {
    "id": "elixir",
    "name": "Elixir",
    "import": () => import('@shikijs/langs/elixir')
  },
  {
    "id": "elm",
    "name": "Elm",
    "import": () => import('@shikijs/langs/elm')
  },
  {
    "id": "emacs-lisp",
    "name": "Emacs Lisp",
    "aliases": [
      "elisp"
    ],
    "import": () => import('@shikijs/langs/emacs-lisp')
  },
  {
    "id": "erb",
    "name": "ERB",
    "import": () => import('@shikijs/langs/erb')
  },
  {
    "id": "erlang",
    "name": "Erlang",
    "aliases": [
      "erl"
    ],
    "import": () => import('@shikijs/langs/erlang')
  },
  {
    "id": "fennel",
    "name": "Fennel",
    "import": () => import('@shikijs/langs/fennel')
  },
  {
    "id": "fish",
    "name": "Fish",
    "import": () => import('@shikijs/langs/fish')
  },
  {
    "id": "fluent",
    "name": "Fluent",
    "aliases": [
      "ftl"
    ],
    "import": () => import('@shikijs/langs/fluent')
  },
  {
    "id": "fortran-fixed-form",
    "name": "Fortran (Fixed Form)",
    "aliases": [
      "f",
      "for",
      "f77"
    ],
    "import": () => import('@shikijs/langs/fortran-fixed-form')
  },
  {
    "id": "fortran-free-form",
    "name": "Fortran (Free Form)",
    "aliases": [
      "f90",
      "f95",
      "f03",
      "f08",
      "f18"
    ],
    "import": () => import('@shikijs/langs/fortran-free-form')
  },
  {
    "id": "fsharp",
    "name": "F#",
    "aliases": [
      "f#",
      "fs"
    ],
    "import": () => import('@shikijs/langs/fsharp')
  },
  {
    "id": "gdresource",
    "name": "GDResource",
    "import": () => import('@shikijs/langs/gdresource')
  },
  {
    "id": "gdscript",
    "name": "GDScript",
    "import": () => import('@shikijs/langs/gdscript')
  },
  {
    "id": "gdshader",
    "name": "GDShader",
    "import": () => import('@shikijs/langs/gdshader')
  },
  {
    "id": "genie",
    "name": "Genie",
    "import": () => import('@shikijs/langs/genie')
  },
  {
    "id": "gherkin",
    "name": "Gherkin",
    "import": () => import('@shikijs/langs/gherkin')
  },
  {
    "id": "git-commit",
    "name": "Git Commit Message",
    "import": () => import('@shikijs/langs/git-commit')
  },
  {
    "id": "git-rebase",
    "name": "Git Rebase Message",
    "import": () => import('@shikijs/langs/git-rebase')
  },
  {
    "id": "gleam",
    "name": "Gleam",
    "import": () => import('@shikijs/langs/gleam')
  },
  {
    "id": "glimmer-js",
    "name": "Glimmer JS",
    "aliases": [
      "gjs"
    ],
    "import": () => import('@shikijs/langs/glimmer-js')
  },
  {
    "id": "glimmer-ts",
    "name": "Glimmer TS",
    "aliases": [
      "gts"
    ],
    "import": () => import('@shikijs/langs/glimmer-ts')
  },
  {
    "id": "glsl",
    "name": "GLSL",
    "import": () => import('@shikijs/langs/glsl')
  },
  {
    "id": "gnuplot",
    "name": "Gnuplot",
    "import": () => import('@shikijs/langs/gnuplot')
  },
  {
    "id": "go",
    "name": "Go",
    "import": () => import('@shikijs/langs/go')
  },
  {
    "id": "graphql",
    "name": "GraphQL",
    "aliases": [
      "gql"
    ],
    "import": () => import('@shikijs/langs/graphql')
  },
  {
    "id": "groovy",
    "name": "Groovy",
    "import": () => import('@shikijs/langs/groovy')
  },
  {
    "id": "hack",
    "name": "Hack",
    "import": () => import('@shikijs/langs/hack')
  },
  {
    "id": "haml",
    "name": "Ruby Haml",
    "import": () => import('@shikijs/langs/haml')
  },
  {
    "id": "handlebars",
    "name": "Handlebars",
    "aliases": [
      "hbs"
    ],
    "import": () => import('@shikijs/langs/handlebars')
  },
  {
    "id": "haskell",
    "name": "Haskell",
    "aliases": [
      "hs"
    ],
    "import": () => import('@shikijs/langs/haskell')
  },
  {
    "id": "haxe",
    "name": "Haxe",
    "import": () => import('@shikijs/langs/haxe')
  },
  {
    "id": "hcl",
    "name": "HashiCorp HCL",
    "import": () => import('@shikijs/langs/hcl')
  },
  {
    "id": "hjson",
    "name": "Hjson",
    "import": () => import('@shikijs/langs/hjson')
  },
  {
    "id": "hlsl",
    "name": "HLSL",
    "import": () => import('@shikijs/langs/hlsl')
  },
  {
    "id": "html",
    "name": "HTML",
    "import": () => import('@shikijs/langs/html')
  },
  {
    "id": "html-derivative",
    "name": "HTML (Derivative)",
    "import": () => import('@shikijs/langs/html-derivative')
  },
  {
    "id": "http",
    "name": "HTTP",
    "import": () => import('@shikijs/langs/http')
  },
  {
    "id": "hxml",
    "name": "HXML",
    "import": () => import('@shikijs/langs/hxml')
  },
  {
    "id": "hy",
    "name": "Hy",
    "import": () => import('@shikijs/langs/hy')
  },
  {
    "id": "imba",
    "name": "Imba",
    "import": () => import('@shikijs/langs/imba')
  },
  {
    "id": "ini",
    "name": "INI",
    "aliases": [
      "properties"
    ],
    "import": () => import('@shikijs/langs/ini')
  },
  {
    "id": "java",
    "name": "Java",
    "import": () => import('@shikijs/langs/java')
  },
  {
    "id": "javascript",
    "name": "JavaScript",
    "aliases": [
      "js"
    ],
    "import": () => import('@shikijs/langs/javascript')
  },
  {
    "id": "jinja",
    "name": "Jinja",
    "import": () => import('@shikijs/langs/jinja')
  },
  {
    "id": "jison",
    "name": "Jison",
    "import": () => import('@shikijs/langs/jison')
  },
  {
    "id": "json",
    "name": "JSON",
    "import": () => import('@shikijs/langs/json')
  },
  {
    "id": "json5",
    "name": "JSON5",
    "import": () => import('@shikijs/langs/json5')
  },
  {
    "id": "jsonc",
    "name": "JSON with Comments",
    "import": () => import('@shikijs/langs/jsonc')
  },
  {
    "id": "jsonl",
    "name": "JSON Lines",
    "import": () => import('@shikijs/langs/jsonl')
  },
  {
    "id": "jsonnet",
    "name": "Jsonnet",
    "import": () => import('@shikijs/langs/jsonnet')
  },
  {
    "id": "jssm",
    "name": "JSSM",
    "aliases": [
      "fsl"
    ],
    "import": () => import('@shikijs/langs/jssm')
  },
  {
    "id": "jsx",
    "name": "JSX",
    "import": () => import('@shikijs/langs/jsx')
  },
  {
    "id": "julia",
    "name": "Julia",
    "aliases": [
      "jl"
    ],
    "import": () => import('@shikijs/langs/julia')
  },
  {
    "id": "kotlin",
    "name": "Kotlin",
    "aliases": [
      "kt",
      "kts"
    ],
    "import": () => import('@shikijs/langs/kotlin')
  },
  {
    "id": "kusto",
    "name": "Kusto",
    "aliases": [
      "kql"
    ],
    "import": () => import('@shikijs/langs/kusto')
  },
  {
    "id": "latex",
    "name": "LaTeX",
    "import": () => import('@shikijs/langs/latex')
  },
  {
    "id": "lean",
    "name": "Lean 4",
    "aliases": [
      "lean4"
    ],
    "import": () => import('@shikijs/langs/lean')
  },
  {
    "id": "less",
    "name": "Less",
    "import": () => import('@shikijs/langs/less')
  },
  {
    "id": "liquid",
    "name": "Liquid",
    "import": () => import('@shikijs/langs/liquid')
  },
  {
    "id": "log",
    "name": "Log file",
    "import": () => import('@shikijs/langs/log')
  },
  {
    "id": "logo",
    "name": "Logo",
    "import": () => import('@shikijs/langs/logo')
  },
  {
    "id": "lua",
    "name": "Lua",
    "import": () => import('@shikijs/langs/lua')
  },
  {
    "id": "luau",
    "name": "Luau",
    "import": () => import('@shikijs/langs/luau')
  },
  {
    "id": "make",
    "name": "Makefile",
    "aliases": [
      "makefile"
    ],
    "import": () => import('@shikijs/langs/make')
  },
  {
    "id": "markdown",
    "name": "Markdown",
    "aliases": [
      "md"
    ],
    "import": () => import('@shikijs/langs/markdown')
  },
  {
    "id": "marko",
    "name": "Marko",
    "import": () => import('@shikijs/langs/marko')
  },
  {
    "id": "matlab",
    "name": "MATLAB",
    "import": () => import('@shikijs/langs/matlab')
  },
  {
    "id": "mdc",
    "name": "MDC",
    "import": () => import('@shikijs/langs/mdc')
  },
  {
    "id": "mdx",
    "name": "MDX",
    "import": () => import('@shikijs/langs/mdx')
  },
  {
    "id": "mermaid",
    "name": "Mermaid",
    "aliases": [
      "mmd"
    ],
    "import": () => import('@shikijs/langs/mermaid')
  },
  {
    "id": "mipsasm",
    "name": "MIPS Assembly",
    "aliases": [
      "mips"
    ],
    "import": () => import('@shikijs/langs/mipsasm')
  },
  {
    "id": "mojo",
    "name": "Mojo",
    "import": () => import('@shikijs/langs/mojo')
  },
  {
    "id": "move",
    "name": "Move",
    "import": () => import('@shikijs/langs/move')
  },
  {
    "id": "narrat",
    "name": "Narrat Language",
    "aliases": [
      "nar"
    ],
    "import": () => import('@shikijs/langs/narrat')
  },
  {
    "id": "nextflow",
    "name": "Nextflow",
    "aliases": [
      "nf"
    ],
    "import": () => import('@shikijs/langs/nextflow')
  },
  {
    "id": "nginx",
    "name": "Nginx",
    "import": () => import('@shikijs/langs/nginx')
  },
  {
    "id": "nim",
    "name": "Nim",
    "import": () => import('@shikijs/langs/nim')
  },
  {
    "id": "nix",
    "name": "Nix",
    "import": () => import('@shikijs/langs/nix')
  },
  {
    "id": "nushell",
    "name": "nushell",
    "aliases": [
      "nu"
    ],
    "import": () => import('@shikijs/langs/nushell')
  },
  {
    "id": "objective-c",
    "name": "Objective-C",
    "aliases": [
      "objc"
    ],
    "import": () => import('@shikijs/langs/objective-c')
  },
  {
    "id": "objective-cpp",
    "name": "Objective-C++",
    "import": () => import('@shikijs/langs/objective-cpp')
  },
  {
    "id": "ocaml",
    "name": "OCaml",
    "import": () => import('@shikijs/langs/ocaml')
  },
  {
    "id": "pascal",
    "name": "Pascal",
    "import": () => import('@shikijs/langs/pascal')
  },
  {
    "id": "perl",
    "name": "Perl",
    "import": () => import('@shikijs/langs/perl')
  },
  {
    "id": "php",
    "name": "PHP",
    "import": () => import('@shikijs/langs/php')
  },
  {
    "id": "plsql",
    "name": "PL/SQL",
    "import": () => import('@shikijs/langs/plsql')
  },
  {
    "id": "po",
    "name": "Gettext PO",
    "aliases": [
      "pot",
      "potx"
    ],
    "import": () => import('@shikijs/langs/po')
  },
  {
    "id": "polar",
    "name": "Polar",
    "import": () => import('@shikijs/langs/polar')
  },
  {
    "id": "postcss",
    "name": "PostCSS",
    "import": () => import('@shikijs/langs/postcss')
  },
  {
    "id": "powerquery",
    "name": "PowerQuery",
    "import": () => import('@shikijs/langs/powerquery')
  },
  {
    "id": "powershell",
    "name": "PowerShell",
    "aliases": [
      "ps",
      "ps1"
    ],
    "import": () => import('@shikijs/langs/powershell')
  },
  {
    "id": "prisma",
    "name": "Prisma",
    "import": () => import('@shikijs/langs/prisma')
  },
  {
    "id": "prolog",
    "name": "Prolog",
    "import": () => import('@shikijs/langs/prolog')
  },
  {
    "id": "proto",
    "name": "Protocol Buffer 3",
    "aliases": [
      "protobuf"
    ],
    "import": () => import('@shikijs/langs/proto')
  },
  {
    "id": "pug",
    "name": "Pug",
    "aliases": [
      "jade"
    ],
    "import": () => import('@shikijs/langs/pug')
  },
  {
    "id": "puppet",
    "name": "Puppet",
    "import": () => import('@shikijs/langs/puppet')
  },
  {
    "id": "purescript",
    "name": "PureScript",
    "import": () => import('@shikijs/langs/purescript')
  },
  {
    "id": "python",
    "name": "Python",
    "aliases": [
      "py"
    ],
    "import": () => import('@shikijs/langs/python')
  },
  {
    "id": "qml",
    "name": "QML",
    "import": () => import('@shikijs/langs/qml')
  },
  {
    "id": "qmldir",
    "name": "QML Directory",
    "import": () => import('@shikijs/langs/qmldir')
  },
  {
    "id": "qss",
    "name": "Qt Style Sheets",
    "import": () => import('@shikijs/langs/qss')
  },
  {
    "id": "r",
    "name": "R",
    "import": () => import('@shikijs/langs/r')
  },
  {
    "id": "racket",
    "name": "Racket",
    "import": () => import('@shikijs/langs/racket')
  },
  {
    "id": "raku",
    "name": "Raku",
    "aliases": [
      "perl6"
    ],
    "import": () => import('@shikijs/langs/raku')
  },
  {
    "id": "razor",
    "name": "ASP.NET Razor",
    "import": () => import('@shikijs/langs/razor')
  },
  {
    "id": "reg",
    "name": "Windows Registry Script",
    "import": () => import('@shikijs/langs/reg')
  },
  {
    "id": "regexp",
    "name": "RegExp",
    "aliases": [
      "regex"
    ],
    "import": () => import('@shikijs/langs/regexp')
  },
  {
    "id": "rel",
    "name": "Rel",
    "import": () => import('@shikijs/langs/rel')
  },
  {
    "id": "riscv",
    "name": "RISC-V",
    "import": () => import('@shikijs/langs/riscv')
  },
  {
    "id": "rst",
    "name": "reStructuredText",
    "import": () => import('@shikijs/langs/rst')
  },
  {
    "id": "ruby",
    "name": "Ruby",
    "aliases": [
      "rb"
    ],
    "import": () => import('@shikijs/langs/ruby')
  },
  {
    "id": "rust",
    "name": "Rust",
    "aliases": [
      "rs"
    ],
    "import": () => import('@shikijs/langs/rust')
  },
  {
    "id": "sas",
    "name": "SAS",
    "import": () => import('@shikijs/langs/sas')
  },
  {
    "id": "sass",
    "name": "Sass",
    "import": () => import('@shikijs/langs/sass')
  },
  {
    "id": "scala",
    "name": "Scala",
    "import": () => import('@shikijs/langs/scala')
  },
  {
    "id": "scheme",
    "name": "Scheme",
    "import": () => import('@shikijs/langs/scheme')
  },
  {
    "id": "scss",
    "name": "SCSS",
    "import": () => import('@shikijs/langs/scss')
  },
  {
    "id": "sdbl",
    "name": "1C (Query)",
    "aliases": [
      "1c-query"
    ],
    "import": () => import('@shikijs/langs/sdbl')
  },
  {
    "id": "shaderlab",
    "name": "ShaderLab",
    "aliases": [
      "shader"
    ],
    "import": () => import('@shikijs/langs/shaderlab')
  },
  {
    "id": "shellscript",
    "name": "Shell",
    "aliases": [
      "bash",
      "sh",
      "shell",
      "zsh"
    ],
    "import": () => import('@shikijs/langs/shellscript')
  },
  {
    "id": "shellsession",
    "name": "Shell Session",
    "aliases": [
      "console"
    ],
    "import": () => import('@shikijs/langs/shellsession')
  },
  {
    "id": "smalltalk",
    "name": "Smalltalk",
    "import": () => import('@shikijs/langs/smalltalk')
  },
  {
    "id": "solidity",
    "name": "Solidity",
    "import": () => import('@shikijs/langs/solidity')
  },
  {
    "id": "soy",
    "name": "Closure Templates",
    "aliases": [
      "closure-templates"
    ],
    "import": () => import('@shikijs/langs/soy')
  },
  {
    "id": "sparql",
    "name": "SPARQL",
    "import": () => import('@shikijs/langs/sparql')
  },
  {
    "id": "splunk",
    "name": "Splunk Query Language",
    "aliases": [
      "spl"
    ],
    "import": () => import('@shikijs/langs/splunk')
  },
  {
    "id": "sql",
    "name": "SQL",
    "import": () => import('@shikijs/langs/sql')
  },
  {
    "id": "ssh-config",
    "name": "SSH Config",
    "import": () => import('@shikijs/langs/ssh-config')
  },
  {
    "id": "stata",
    "name": "Stata",
    "import": () => import('@shikijs/langs/stata')
  },
  {
    "id": "stylus",
    "name": "Stylus",
    "aliases": [
      "styl"
    ],
    "import": () => import('@shikijs/langs/stylus')
  },
  {
    "id": "svelte",
    "name": "Svelte",
    "import": () => import('@shikijs/langs/svelte')
  },
  {
    "id": "swift",
    "name": "Swift",
    "import": () => import('@shikijs/langs/swift')
  },
  {
    "id": "system-verilog",
    "name": "SystemVerilog",
    "import": () => import('@shikijs/langs/system-verilog')
  },
  {
    "id": "systemd",
    "name": "Systemd Units",
    "import": () => import('@shikijs/langs/systemd')
  },
  {
    "id": "talonscript",
    "name": "TalonScript",
    "aliases": [
      "talon"
    ],
    "import": () => import('@shikijs/langs/talonscript')
  },
  {
    "id": "tasl",
    "name": "Tasl",
    "import": () => import('@shikijs/langs/tasl')
  },
  {
    "id": "tcl",
    "name": "Tcl",
    "import": () => import('@shikijs/langs/tcl')
  },
  {
    "id": "templ",
    "name": "Templ",
    "import": () => import('@shikijs/langs/templ')
  },
  {
    "id": "terraform",
    "name": "Terraform",
    "aliases": [
      "tf",
      "tfvars"
    ],
    "import": () => import('@shikijs/langs/terraform')
  },
  {
    "id": "tex",
    "name": "TeX",
    "import": () => import('@shikijs/langs/tex')
  },
  {
    "id": "toml",
    "name": "TOML",
    "import": () => import('@shikijs/langs/toml')
  },
  {
    "id": "ts-tags",
    "name": "TypeScript with Tags",
    "aliases": [
      "lit"
    ],
    "import": () => import('@shikijs/langs/ts-tags')
  },
  {
    "id": "tsv",
    "name": "TSV",
    "import": () => import('@shikijs/langs/tsv')
  },
  {
    "id": "tsx",
    "name": "TSX",
    "import": () => import('@shikijs/langs/tsx')
  },
  {
    "id": "turtle",
    "name": "Turtle",
    "import": () => import('@shikijs/langs/turtle')
  },
  {
    "id": "twig",
    "name": "Twig",
    "import": () => import('@shikijs/langs/twig')
  },
  {
    "id": "typescript",
    "name": "TypeScript",
    "aliases": [
      "ts"
    ],
    "import": () => import('@shikijs/langs/typescript')
  },
  {
    "id": "typespec",
    "name": "TypeSpec",
    "aliases": [
      "tsp"
    ],
    "import": () => import('@shikijs/langs/typespec')
  },
  {
    "id": "typst",
    "name": "Typst",
    "aliases": [
      "typ"
    ],
    "import": () => import('@shikijs/langs/typst')
  },
  {
    "id": "v",
    "name": "V",
    "import": () => import('@shikijs/langs/v')
  },
  {
    "id": "vala",
    "name": "Vala",
    "import": () => import('@shikijs/langs/vala')
  },
  {
    "id": "vb",
    "name": "Visual Basic",
    "aliases": [
      "cmd"
    ],
    "import": () => import('@shikijs/langs/vb')
  },
  {
    "id": "verilog",
    "name": "Verilog",
    "import": () => import('@shikijs/langs/verilog')
  },
  {
    "id": "vhdl",
    "name": "VHDL",
    "import": () => import('@shikijs/langs/vhdl')
  },
  {
    "id": "viml",
    "name": "Vim Script",
    "aliases": [
      "vim",
      "vimscript"
    ],
    "import": () => import('@shikijs/langs/viml')
  },
  {
    "id": "vue",
    "name": "Vue",
    "import": () => import('@shikijs/langs/vue')
  },
  {
    "id": "vue-html",
    "name": "Vue HTML",
    "import": () => import('@shikijs/langs/vue-html')
  },
  {
    "id": "vyper",
    "name": "Vyper",
    "aliases": [
      "vy"
    ],
    "import": () => import('@shikijs/langs/vyper')
  },
  {
    "id": "wasm",
    "name": "WebAssembly",
    "import": () => import('@shikijs/langs/wasm')
  },
  {
    "id": "wenyan",
    "name": "Wenyan",
    "aliases": [
      "\u6587\u8A00"
    ],
    "import": () => import('@shikijs/langs/wenyan')
  },
  {
    "id": "wgsl",
    "name": "WGSL",
    "import": () => import('@shikijs/langs/wgsl')
  },
  {
    "id": "wikitext",
    "name": "Wikitext",
    "aliases": [
      "mediawiki",
      "wiki"
    ],
    "import": () => import('@shikijs/langs/wikitext')
  },
  {
    "id": "wolfram",
    "name": "Wolfram",
    "aliases": [
      "wl"
    ],
    "import": () => import('@shikijs/langs/wolfram')
  },
  {
    "id": "xml",
    "name": "XML",
    "import": () => import('@shikijs/langs/xml')
  },
  {
    "id": "xsl",
    "name": "XSL",
    "import": () => import('@shikijs/langs/xsl')
  },
  {
    "id": "yaml",
    "name": "YAML",
    "aliases": [
      "yml"
    ],
    "import": () => import('@shikijs/langs/yaml')
  },
  {
    "id": "zenscript",
    "name": "ZenScript",
    "import": () => import('@shikijs/langs/zenscript')
  },
  {
    "id": "zig",
    "name": "Zig",
    "import": () => import('@shikijs/langs/zig')
  }
];
const bundledLanguagesBase = Object.fromEntries(bundledLanguagesInfo.map((i) => [i.id, i.import]));
const bundledLanguagesAlias = Object.fromEntries(bundledLanguagesInfo.flatMap((i) => i.aliases?.map((a) => [a, i.import]) || []));
const bundledLanguages = {
  ...bundledLanguagesBase,
  ...bundledLanguagesAlias
};

export { bundledLanguages, bundledLanguagesAlias, bundledLanguagesBase, bundledLanguagesInfo };
