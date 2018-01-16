[![Build Status](https://travis-ci.org/laysent/eslint-import-resolver-custom-alias.svg?branch=master)](https://travis-ci.org/laysent/eslint-import-resolver-custom-alias)

This plugin will help you configure [eslint-plugin-import](https://www.npmjs.com/package/eslint-plugin-import)
to allow customized alias and extensions.

## Configuration

```json
{
  "settings": {
    "import/resolver": {
      "eslint-import-resolver-general-alias": {
        "alias": {
          "src": "./src"
        },
        "extensions": [".js", ".jsx"]
      }
    }
  }
}
```

Here, `alias` is a key-value pair, where `key` represents the alias, and `value` represents
it's actual path. Relative path is allowed for `value`. When used, it's relative to project
root, where command line is running. (i.e. root path will be `process.cwd()`)

`extensions` is an array of possible suffix. If not provided, default value will be `[".js"]`.
