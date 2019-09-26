const path = require('path');

describe('resolver plugin', () => {
  const defaultSource = '@/path/to/file';
  const defaultFile = 'current/file/path/index.js';
  const defaultBasedir = path.dirname(path.resolve(defaultFile));
  const defaultConfig = {
    alias: {
      '@': './src',
    },
    extensions: ['.js', '.jsx'],
  };
  let resolve;
  let fs;
  beforeAll(() => {
    resolve = require('resolve');
    fs = require('fs');
    spyOn(resolve, 'sync');
    spyOn(resolve, 'isCore');
    spyOn(fs, 'statSync');
    spyOn(fs, 'readdirSync');
  });
  const plugin = require('../index');
  it('should define interfaceVersion as 2', () => {
    /**
     * See document for details:
     * https://github.com/benmosher/eslint-plugin-import/blob/master/resolvers/README.md
     */
    expect(plugin.interfaceVersion).toBe(2);
  });
  it('should use config to resolve file', () => {
    plugin.resolve(defaultSource, defaultFile, defaultConfig);
    const modifiedSource = `${path.resolve(process.cwd(), './src')}${defaultSource.substr(1)}`;

    const mostRecent = resolve.sync.calls.mostRecent();

    expect(mostRecent.args[0]).toBe(modifiedSource);
    expect(mostRecent.args[1].extensions).toEqual(['.js', '.jsx']);
    expect(mostRecent.args[1].basedir).toBe(defaultBasedir);
  });
  it('should replace alias', () => {
    plugin.resolve(defaultSource, defaultFile, defaultConfig);
    const modifiedSource = `${path.resolve(process.cwd(), './src')}${defaultSource.substr(1)}`;

    const mostRecent = resolve.sync.calls.mostRecent();
    expect(mostRecent.args[0]).toBe(modifiedSource);
  });
  it('should not replace alias when not starts with it', () => {
    const source = '@@/path/@/file/@';
    plugin.resolve(source, defaultFile, defaultConfig);

    const mostRecent = resolve.sync.calls.mostRecent();
    expect(mostRecent.args[0]).toBe(source);
  });
  it('should use alias when equals to it', () => {
    const source = '@';
    plugin.resolve(source, defaultFile, defaultConfig);
    const modifiedSource = path.resolve(process.cwd(), './src');

    const mostRecent = resolve.sync.calls.mostRecent();
    expect(mostRecent.args[0]).toBe(modifiedSource);
  });
  it('should be fine when alias is not configured', () => {
    plugin.resolve(defaultSource, defaultFile, { });

    const mostRecent = resolve.sync.calls.mostRecent();
    expect(mostRecent.args[0]).toBe(defaultSource);
  });
  it('should use extensions in config when available', () => {
    plugin.resolve(defaultSource, defaultFile, defaultConfig);

    const mostRecent = resolve.sync.calls.mostRecent();
    expect(mostRecent.args[1].extensions).toEqual(['.js', '.jsx']);
  });
  it('should use default extensions when not provided in config', () => {
    const config = { alias: defaultConfig.alias };
    plugin.resolve(defaultSource, defaultFile, config);

    const mostRecent = resolve.sync.calls.mostRecent();
    expect(mostRecent.args[1].extensions).toEqual(['.js']);
  });
  it('should use file to provide basedir', () => {
    plugin.resolve(defaultSource, defaultFile, defaultConfig);

    const mostRecent = resolve.sync.calls.mostRecent();
    expect(mostRecent.args[1].basedir).toBe(defaultBasedir);
  });
  it('should provide packageFilter to use jsnext:main when possible', () => {
    plugin.resolve(defaultSource, defaultFile, defaultConfig);

    const mostRecent = resolve.sync.calls.mostRecent();
    const packageFilter = mostRecent.args[1].packageFilter;
    const packageWithNext = { main: 'main', 'jsnext:main': 'next' };
    const packageWithoutNext = { main: 'main', something: 'else' };

    expect(packageFilter(packageWithNext).main).toBe('next');
    expect(packageFilter(packageWithoutNext).main).toBe('main');
  });
  it('should return found when requires node.js module', () => {
    resolve.isCore.and.returnValue(true);

    const result = plugin.resolve(defaultSource, defaultFile, defaultConfig);

    expect(result).toEqual({ found: true, path: null });
  });
  it('should return found when file is resolved', () => {
    resolve.isCore.and.returnValue(false);
    resolve.sync.and.returnValue('returned/path');

    const result = plugin.resolve(defaultSource, defaultFile, defaultConfig);

    expect(result).toEqual({ found: true, path: 'returned/path' });
  });
  it('should return not found when file is not resolved', () => {
    resolve.isCore.and.returnValue(false);
    resolve.sync.and.throwError('not found');

    const result = plugin.resolve(defaultSource, defaultFile, defaultConfig);

    expect(result).toEqual({ found: false });
  });
  it('should resolve relative path based on package root', () => {
    fs.statSync.and.returnValue({
      isFile() { return false; }
    });
    fs.readdirSync.and.returnValue(['subfolder']);
    const config = Object.assign({}, defaultConfig, {
      packages: [
        'packages/*'
      ],
    });
    const fileInPackage = path.resolve(process.cwd(), 'packages', 'subfolder', defaultFile);
    plugin.resolve(defaultSource, fileInPackage, config);
    const modifiedSource = path.resolve(process.cwd(), 'packages', 'subfolder', './src', 'path/to/file');

    const mostRecent = resolve.sync.calls.mostRecent();
    expect(mostRecent.args[0]).toBe(modifiedSource);
  });
});
