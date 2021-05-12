const path = require('path');
const typescript = require('rollup-plugin-typescript2');
const replace = require('rollup-plugin-replace');
const commonjs = require('rollup-plugin-commonjs');
const resolve = require('rollup-plugin-node-resolve');

const formatNameMap = {
  villus: 'Villus',
  batch: 'VillusBatch',
  multipart: 'VillusMultipart',
};

const pkgNameMap = {
  villus: 'villus',
  batch: 'batch',
  multipart: 'multipart',
};

const pkgBannerMap = {
  villus: 'villus',
  batch: '@villus/batch',
  multipart: '@villus/multipart',
};

const pkgExternals = {
  villus: ['vue', 'graphql'],
  multipart: ['extract-files', 'villus'],
  batch: ['villus', 'graphql'],
};

const pkgGlobals = {
  villus: {
    vue: 'Vue',
    graphql: 'graphql',
  },
  multipart: {
    'extract-files': 'ExtractFiles',
    villus: 'Villus',
  },
  batch: {
    villus: 'Villus',
    graphql: 'graphql',
  },
};

const formatMap = {
  es: 'esm',
  umd: '',
};

function createConfig(pkg, format) {
  const tsPlugin = typescript({
    tsconfig: path.resolve(__dirname, '../tsconfig.json'),
    cacheRoot: path.resolve(__dirname, '../node_modules/.rts2_cache'),
    useTsconfigDeclarationDir: true,
    tsconfigOverride: {
      exclude: ['**/tests'],
    },
  });

  const version = require(path.resolve(__dirname, `../packages/${pkg}/package.json`)).version;

  const config = {
    input: {
      input: path.resolve(__dirname, `../packages/${pkg}/src/index.ts`),
      external: pkgExternals[pkg],
      plugins: [
        tsPlugin,
        resolve({
          dedupe: ['fast-json-stable-stringify'],
        }),
        commonjs(),
        replace({ __VERSION__: version }),
      ],
    },
    output: {
      banner: `/**
  * ${pkgBannerMap[pkg]} v${version}
  * (c) ${new Date().getFullYear()} Abdelrahman Awad
  * @license MIT
  */`,
      format,
      name: format === 'umd' ? formatNameMap[pkg] : undefined,
      globals: pkgGlobals[pkg],
    },
  };

  config.bundleName = `${pkgNameMap[pkg]}${formatMap[format] ? '.' + formatMap[format] : ''}.js`;

  // if (options.env) {
  //   config.input.plugins.unshift(
  //     replace({
  //       'process.env.NODE_ENV': JSON.stringify(options.env)
  //     })
  //   );
  // }

  return config;
}

module.exports = {
  formatNameMap,
  pkgNameMap,
  formatMap,
  createConfig,
};
