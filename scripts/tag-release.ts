import { version } from '../packages/villus/package.json';
import { execSync } from 'node:child_process';
import { consola } from 'consola';

try {
  execSync(`git tag v${version}`);
  consola.success(`🔖 Tagged release v${version}`);
} catch (error) {
  consola.error(`❌ Failed to tag release v${version}`);
  consola.error(error);
  process.exit(1);
}
