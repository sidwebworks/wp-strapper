#!/usr/bin/env node

import {  zors } from 'zors';
import { renderSplashScreen } from './lib/utils.js';
import chalk from 'chalk';
import { initCommand } from './commands/init.js';

renderSplashScreen();

const program = zors('wp-strapper', `0.0.1`, {
  // printHelpOnNotFound: false,
  formatters: {
    help(sections) {
      sections.map((sec) => {
        sec.title = sec.title ? chalk.green(sec.title) : sec.title;
        return sec;
      });
      return sections;
    },
  },
});

program
  .help() // Show help
  .version('0.0.1')
  .register(initCommand);

const onExit = (code: number = 0) => {
  process.exit(code);
};

program.run(process.argv.slice(2));

process.on('SIGINT', () => onExit(0));

process.on('SIGTERM', () => onExit(0));
