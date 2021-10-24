[![Build Status](https://travis-ci.org/laysent/eslint-import-resolver-custom-alias.svg?branch=master)](https://travis-ci.org/laysent/eslint-import-resolver-custom-alias)

This plugin will help you configure [eslint-plugin-import](https://www.npmjs.com/package/eslint-plugin-import)
to allow customized alias and extensions.

## Installation

To install this plugin, run:

```bash
npm install --dev eslint-import-resolver-custom-alias
```

or

```bash
yarn add --dev eslint-import-resolver-custom-alias
```

## Configuration

```json
{
  "settings": {
    "import/resolver": {
      "eslint-import-resolver-custom-alias": {
        "alias": {
          "src": "./src"
        },
        "extensions": [".js", ".jsx"],
        "packages": [
          "packages/*"
        ]
      }
    }
  }
}
```

Here, `alias` is a key-value pair, where `key` represents the alias, and `value` represents
it's actual path. Relative path is allowed for `value`. When used, it's relative to project
root, where command line is running. (i.e. root path will be `process.cwd()`)

`extensions` is an array of possible suffix. If not provided, default value will be `[".js"]`.

`packages` is an optional configuration. When using lerna to manage packages and use eslint at
root folder, `packages` lets the resolver know where each package folder exist. This way, when
resolving alias, relative path will be resolved based on current package, instead of root folder.

Consider the file as an example:

```jsx
import * as utils from '@/utils';
```

Suppose the above file locates at `./packages/subfolder/src/components/button.jsx` and command is
running at root folder (i.e. `./`). If the resolver is configured the following way:

```json
{
  "settings": {
    "import/resolver": {
      "eslint-import-resolver-custom-alias": {
        "alias": {
          "@": "./src"
        },
        "extensions": [".js", ".jsx"],
      }
    }
  }
}
```

Resolver will tries to find file at `./src/utils` folder. However, with `packages` configured:

```json
{
  "settings": {
    "import/resolver": {
      "eslint-import-resolver-custom-alias": {
        "alias": {
          "@": "./src"
        },
        "extensions": [".js", ".jsx"],
        "packages": [
          "packages/*"
        ]
      }
    }
  }
}
```

Resolver will try to find it at `./packages/subfolder/src/utils` folder instead.

One special alias is empty string `""`. If configured, the resolver will try to
add prefix in front of the path before resolving. For example, with following configuration

```json
{
  "settings": {
    "import/resolver": {
      "eslint-import-resolver-custom-alias": {
        "alias": {
          "": "./src"
        },
        "extensions": [".js", ".jsx"],
        "packages": [
          "packages/*"
        ]
      }
    }
  }
}
```

The resolver will try to find the following import at path `./packages/subfolder/src/utils/helper`.

```jsx
import * as helper from 'utils/helper';
```