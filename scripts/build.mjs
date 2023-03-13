import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs-extra';
import { rollup } from 'rollup';
import chalk from 'chalk';
import * as Terser from 'terser';
import { createConfig } from './config.mjs';
import { reportSize } from './info.mjs';
import { generateDts } from './generate-dts.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function minify({ code, pkg, bundleName }) {
  const pkgout = path.join(__dirname, `../packages/${pkg}/dist`);
  const output = await Terser.minify(code, {
    compress: true,
    mangle: true,
  });

  const fileName = bundleName.replace(/\.js$/, '.min.js');
  const filePath = `${pkgout}/${fileName}`;
  fs.outputFileSync(filePath, output.code);
  const stats = reportSize({ code: output.code, path: filePath });
  console.log(`${chalk.green('Output File:')} ${fileName} ${stats}`);
}

async function build(pkg) {
  console.log(chalk.magenta(`Generating bundle for ${pkg}`));
  const pkgout = path.join(__dirname, `../packages/${pkg}/dist`);
  for (const format of ['es', 'umd']) {
    const { input, output, bundleName } = await createConfig(pkg, format);
    const bundle = await rollup(input);
    const {
      output: [{ code }],
    } = await bundle.generate(output);

    const outputPath = path.join(pkgout, bundleName);
    fs.outputFileSync(outputPath, code);
    const stats = reportSize({ code, path: outputPath });
    // eslint-disable-next-line
    console.log(`${chalk.green('Output File:')} ${bundleName} ${stats}`);

    if (format === 'umd') {
      await minify({ bundleName, pkg, code });
    }
  }

  await generateDts(pkg);

  console.log(`${chalk.magenta('✅ Bundled ' + pkg)}`);

  return true;
}

(async function Bundle() {
  for (const pkg of ['villus', 'batch', 'multipart']) {
    await build(pkg);
  }
})();
