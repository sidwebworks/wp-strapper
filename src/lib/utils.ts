import figlet from 'figlet';
import animation from 'chalk-animation';
import { promisify } from 'util';
import { exec } from 'child_process';
import { createSpinner } from 'nanospinner';
import chalk from 'chalk';
import { existsSync } from 'fs';
import fs from 'fs/promises';

export const execa = promisify(exec);

export function renderSplashScreen() {
  const anim = animation.rainbow(figlet.textSync(`WP-STRAPPER`));
  console.log(chalk.dim(chalk.gray(`-`.repeat(73))));
  anim.start();
  console.log(chalk.dim(chalk.gray(`-`.repeat(73))));

  process.on('beforeExit', () => {
    anim.stop();
  });

  return anim;
}

export async function getAuthor() {
  const spinner = createSpinner('auto-detecting theme author');
  try {
    spinner.start();
    const result = await execa('npm whoami');
    const name = result.stdout.trim();
    spinner.success({ text: `auto-detected theme author: ${name}` });
    return name;
  } catch (error) {
    spinner.error({ text: 'failed to auto-detect theme author' });
  }
}

export async function copy(source: string, dest: string, type: 'file' | 'dir') {
  if (!existsSync(dest)) {
    type === 'dir' && (await fs.mkdir(dest));
  }

  if (type === 'dir') {
    return fs.cp(source, dest, { force: true, recursive: true });
  }

  return fs.copyFile(source, dest);
}
