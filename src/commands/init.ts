import { renderAsync } from 'eta';
import { existsSync } from 'fs';
import fs from 'fs/promises';
import { createSpinner } from 'nanospinner';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import { defineCommand } from 'zors';
import questions from '../lib/questions.js';
import { copy } from '../lib/utils.js';

const __dirname = fileURLToPath(dirname(import.meta.url));

const spinner = createSpinner();

export const initCommand = defineCommand<[string]>('init [theme-name]', {
  description: 'Initialize a new wordpress theme',
  examples: ['init awesome-theme'],
  async action([name]) {
    const info: any = { name };

    if (!info.name) {
      info.name = await questions.themeName();
    }

    info.target = await questions.targetDir(info.name)

    const target = path.join(process.cwd(), info.target);

    info.author = await questions.author();

    info.template = await questions.template();


    try {
      if (existsSync(target)) {
        const remove = await questions.rmTargetDirectory();

        if (remove) {
          await fs.rm(target, { recursive: true });
        } else {
          throw new Error(`Destination directory already exists. Aborting`);
        }
      }

      spinner.start({ text: `Bootstrapping theme` });

      await fs.mkdir(target);

      await createBaseTemplate(target, info);

      await copyTemplateFiles(`with-${info.template}`, target);
      spinner.success({ text: `Finished bootstrapping theme` });
    } catch (error: any) {
      spinner.error({ text: error.message });
    }
  },
});

async function copyTemplateFiles(template: string, target: string) {
  const templateDir = path.resolve(__dirname, '../../template-files', template);

  return copy(templateDir, path.join(target, 'resources'), 'dir');
}

async function createBaseTemplate(target: string, variables: any) {
  const editable = ['styles.css', 'LICENSE'];
  const templateDir = path.resolve(__dirname, '../../template-files', 'base');
  const dir = await fs.readdir(templateDir);

  const handleInput = async (fileOrDir: string) => {
    const fullPath = path.join(templateDir, fileOrDir);
    const stats = await fs.lstat(fullPath);
    const fullTarget = path.join(target, fileOrDir);

    if (stats.isDirectory()) {
      return copy(fullPath, fullTarget, 'dir');
    }

    if (stats.isFile() && editable.includes(fileOrDir)) {
      const raw = await fs.readFile(fullPath, 'utf-8');

      const contents = await renderAsync(raw, variables, {
        cache: true,
        varName: 'theme',
        autoTrim: false,
      });

      if (contents) {
        return fs.writeFile(fullTarget, contents);
      }
    }

    return copy(fullPath, fullTarget, 'file');
  };

  return Promise.all(dir.map((item) => handleInput(item)));
}
