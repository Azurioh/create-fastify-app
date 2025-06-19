#!/usr/bin/env node

import { createProject } from '@libs/create-project';
import { collectUserInput } from '@libs/prompt';
import kleur from 'kleur';

const { cyan, yellow, red } = kleur;

async function main(): Promise<void> {
  console.log(cyan('🚀 Welcome to Fastify App Creator!\n'));

  try {
    const config = await collectUserInput();
    if (!config) {
      console.log(yellow('\n✖ Operation cancelled'));
      return;
    }

    await createProject(config);
  } catch (error) {
    console.error(red('\n❌ An error occurred:'));
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

main();
