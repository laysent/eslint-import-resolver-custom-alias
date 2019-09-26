const path = require('path');
const fs = require('fs');
const resolve = require('resolve'); // eslint-disable-line
const globParent = require('glob-parent');

function getOptions(file, config) {
  return {
      extensions: config.extensions || ['.js'],
      basedir: path.dirname(path.resolve(file)),
      packageFilter(pkg) {
        pkg.main = pkg['jsnext:main'] || pkg.main; // eslint-disable-line
        return pkg;
      },
    };
}

function getPath(configPath, filepath, packages) {
  const workspaces =
    packages.filter(pkg => filepath.indexOf(pkg) === 0 && filepath[pkg.length] === '/');
  const relativeRoot = workspaces[0] || process.cwd();
  return path.resolve(relativeRoot, configPath);
}

exports.interfaceVersion = 2;
exports.resolve = (source, file, config) => {
  if (resolve.isCore(source)) return { found: true, path: null };
  const packages = (config.packages || [])
    .map(pkg => {
      const parent = path.resolve(process.cwd(), globParent(pkg));
      const dir = fs.readdirSync(parent)
        .map(name => path.resolve(parent, name))
        .filter(name => !fs.statSync(name).isFile());
      return dir;
    })
    .reduce((prev, curr) => prev.concat(curr), []);
  try {
    const modifiedSource = Object.keys(config.alias || {}).reduce((currentSource, prefix) => {
      let ret = currentSource;
      if (currentSource.indexOf(prefix) === 0 && currentSource[prefix.length] === '/') {
        const prefixPath = getPath(config.alias[prefix], file, packages);
        ret = `${prefixPath}${currentSource.substr(prefix.length)}`;
      } else if (currentSource === prefix) {
        ret = getPath(config.alias[prefix], file, packages);
      }
      return ret;
    }, source);
    const resolvedPath = resolve.sync(modifiedSource, getOptions(file, config));
    return { found: true, path: resolvedPath };
  } catch (e) {
    return { found: false };
  }
};
