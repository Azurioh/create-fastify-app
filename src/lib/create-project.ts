import type { ProjectConfig, TemplateVars } from '../types/config';
import fs from 'node:fs';
import path from 'node:path';
import { copyTemplate } from './copy-template';
import { installDependencies } from './utils';
import kleur from 'kleur';
import prompts from 'prompts';

const { cyan, green, magenta } = kleur;

export async function createProject(config: ProjectConfig): Promise<void> {
  const { projectName, architecture, projectType, backendType, template } = config;
  const root = path.join(process.cwd(), projectName);

  if (fs.existsSync(root)) {
    const erase = await prompts({
      type: 'confirm',
      name: 'erase',
      message: `Directory ${root} already exists. Do you want to erase it?`,
      initial: false,
    });

    if (erase.erase) {
      fs.rmSync(root, { recursive: true });
    } else {
      throw new Error(`Directory ${root} already exists`);
    }
  }

  console.log(cyan(`\n📦 Creating ${projectName}...`));
  console.log(magenta(`   Architecture: ${architecture}`));
  console.log(magenta(`   Type: ${projectType}`));
  console.log(magenta(`   Backend: ${backendType}`));
  console.log(magenta(`   Template: ${template}\n`));

  // Construire le chemin du template
  let templatePath = path.join(architecture, projectType);

  if (config.template) {
    templatePath = path.join(templatePath, config.template);
  }

  templatePath = path.join(templatePath, backendType);

  if (config.database) {
    templatePath = path.join(templatePath, config.database);
  }

  // Variables pour le template
  const templateVars = buildTemplateVars(config);

  await copyTemplate(templatePath, root, templateVars);

  if (config.installDeps) {
    console.log(cyan('📥 Installing dependencies...'));
    await installDependencies(root, config);
  }

  printSuccessMessage(config);
}

function buildTemplateVars(config: ProjectConfig): TemplateVars {
  return {
    PROJECT_NAME: config.projectName,
    ARCHITECTURE: config.architecture,
    PROJECT_TYPE: config.projectType,
    BACKEND_TYPE: config.backendType,
    TEMPLATE: config.template,
    FRONTEND_PORT: config.frontendPort || '5173',
    BACKEND_PORT: config.backendPort || '3000',
    DATABASE: config.database || 'postgresql',
  };
}

function printSuccessMessage(config: ProjectConfig): void {
  console.log(green('\n✅ Project created successfully!\n'));

  console.log(cyan('📁 Project structure:'));
  if (config.architecture === 'monolith') {
    console.log('   📦 Single application');
  } else {
    console.log('   🔧 Microservices architecture');
  }

  console.log(green('\n🚀 Next steps:'));
  console.log(cyan(`   cd ${config.projectName}`));

  if (!config.installDeps) {
    console.log(cyan('   npm install'));
  }

  console.log(cyan('   npm run dev'));
}
