{
  "author": "Isaac Z. Schlueter <i@izs.me> (http://blog.izs.me)",
  "name": "minimatch",
  "description": "a glob matcher in javascript",
  "version": "9.0.5",
  "repository": {
    "type": "git",
    "url": "git://github.com/isaacs/minimatch.git"
  },
  "main": "./dist/commonjs/index.js",
  "types": "./dist/commonjs/index.d.ts",
  "exports": {
    "./package.json": "./package.json",
    ".": {
      "import": {
        "types": "./dist/esm/index.d.ts",
        "default": "./dist/esm/index.js"
      },
      "require": {
        "types": "./dist/commonjs/index.d.ts",
        "default": "./dist/commonjs/index.js"
      }
    }
  },
  "files": [
    "dist"
  ],
  "scripts": {
    "preversion": "npm test",
    "postversion": "npm publish",
    "prepublishOnly": "git push origin --follow-tags",
    "prepare": "tshy",
    "pretest": "npm run prepare",
    "presnap": "npm run prepare",
    "test": "tap",
    "snap": "tap",
    "format": "prettier --write . --loglevel warn",
    "benchmark": "node benchmark/index.js",
    "typedoc": "typedoc --tsconfig tsconfig-esm.json ./src/*.ts"
  },
  "prettier": {
    "semi": false,
    "printWidth": 80,
    "tabWidth": 2,
    "useTabs": false,
    "singleQuote": true,
    "jsxSingleQuote": false,
    "bracketSameLine": true,
    "arrowParens": "avoid",
    "endOfLine": "lf"
  },
  "engines": {
    "node": ">=16 || 14 >=14.17"
  },
  "dependencies": {
    "brace-expansion": "^2.0.1"
  },
  "devDependencies": {
    "@types/brace-expansion": "^1.1.0",
    "@types/node": "^18.15.11",
    "@types/tap": "^15.0.8",
    "eslint-config-prettier": "^8.6.0",
    "mkdirp": "1",
    "prettier": "^2.8.2",
    "tap": "^18.7.2",
    "ts-node": "^10.9.1",
    "tshy": "^1.12.0",
    "typedoc": "^0.23.21",
    "typescript": "^4.9.3"
  },
  "funding": {
    "url": "https://github.com/sponsors/isaacs"
  },
  "license": "ISC",
  "tshy": {
    "exports": {
      "./package.json": "./package.json",
      ".": "./src/index.ts"
    }
  },
  "type": "module"
}
