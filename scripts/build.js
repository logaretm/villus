const mkdirp = require('mkdirp');
const chalk = require('chalk');
const { configs, utils, paths } = require('./config');

async function build() {
  await mkdirp(paths.dist);
  // eslint-disable-next-line
  console.log(chalk.cyan('Generating ESM build...'));
  await utils.writeBundle(configs.esm, 'villus.esm.js');
  // eslint-disable-next-line
  console.log(chalk.cyan('Done!'));

  // eslint-disable-next-line
  console.log(chalk.cyan('Generating UMD build...'));
  await utils.writeBundle(configs.umd, 'villus.js', true);
  // eslint-disable-next-line
  console.log(chalk.cyan('Done!'));
}

build();
