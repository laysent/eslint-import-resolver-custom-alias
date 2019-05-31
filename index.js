const path = require('path');
const resolve = require('resolve'); // eslint-disable-line

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

exports.interfaceVersion = 2;
exports.resolve = (source, file, config) => {
  if (resolve.isCore(source)) return { found: true, path: null };
  try {
    const modifiedSource = Object.keys(config.alias || {}).reduce((currentSource, prefix) => {
      let ret = currentSource;
      if (currentSource.indexOf(prefix) === 0 && currentSource[prefix.length] === '/') {
        const prefixPath = path.resolve(process.cwd(), config.alias[prefix]);
        ret = `${prefixPath}/${currentSource.substr(prefix.length)}`;
      } else if (currentSource === prefix) {
        ret = path.resolve(process.cwd(), config.alias[prefix]);
      }
      return ret;
    }, source);
    const resolvedPath = resolve.sync(modifiedSource, getOptions(file, config));
    return { found: true, path: resolvedPath };
  } catch (e) {
    return { found: false };
  }
};
