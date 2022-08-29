import Enquirer from 'enquirer';
import { getAuthor } from './utils.js';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';

const __dirname = fileURLToPath(dirname(import.meta.url));

class QuestionsService {
  async targetDir(name?: string) {
    const answer = await Enquirer.prompt<{ targetDir: string }>({
      name: 'targetDir',
      initial: path.relative('./', name || ''),
      validate(value) {
        return value.trim() !== '';
      },
      required: true,
      message: `Where do you want to create this theme?`,
      type: 'text',
    });

    return answer['targetDir'];
  }

  async themeName() {
    const answer = await Enquirer.prompt<{ themeName: string }>({
      name: 'themeName',
      validate(value) {
        return value.trim() !== '';
      },
      required: true,
      message: `What's the name of the theme`,
      type: 'text',
    });

    return answer['themeName'];
  }

  async author() {
    const found = await getAuthor();

    const answer = await Enquirer.prompt<{ author: string }>({
      name: 'author',
      initial: found,
      validate(value) {
        return value.trim() !== '';
      },
      required: true,
      skip: !!found,
      message: `Who's the author of the theme?`,
      type: 'text',
    });

    return answer['author'];
  }

  async template() {
    let templates: any[] = await fs.readdir(
      path.resolve(__dirname, '../../', 'template-files')
    );

    templates = templates.slice(1).map((t) => ({ name: t.split('with-')[1], value: t }));

    const answer = await Enquirer.prompt<{ template: string }>({
      name: 'template',
      required: true,
      choices: templates,
      message: `Select a theme template`,
      type: 'select',
    });

    return answer['template'];
  }

  async rmTargetDirectory() {
    const answer = await Enquirer.prompt<{ rmDir: string }>({
      name: 'rmDir',
      required: true,
      message: `Destination directory already exists, overwrite it?`,
      type: 'confirm',
    });

    return answer['rmDir'];
  }
}

const questions = new QuestionsService();

export default questions;
