import type { ProjectConfig, TemplateVars } from '@custom-types/config';
import fs from 'node:fs';
import path from 'node:path';
import { copyTemplate } from './copy-template';
import { installDependencies } from './utils';
import kleur from 'kleur';

const { cyan, green, magenta } = kleur;

export async function createProject(config: ProjectConfig): Promise<void> {
  const { projectName, architecture, projectType, template } = config;
  const root = path.join(process.cwd(), projectName);

  if (fs.existsSync(root)) {
    throw new Error(`Directory ${root} already exists`);
  }

  console.log(cyan(`\n📦 Creating ${projectName}...`));
  console.log(magenta(`   Architecture: ${architecture}`));
  console.log(magenta(`   Type: ${projectType}`));
  console.log(magenta(`   Template: ${template}\n`));

  // Construire le chemin du template
  const templatePath = path.join(architecture, projectType, template);

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
    PROJECT_DESCRIPTION: config.projectDescription || '',
    AUTHOR_NAME: config.authorName || '',
    ARCHITECTURE: config.architecture,
    PROJECT_TYPE: config.projectType,
    TEMPLATE: config.template,
    SERVICES: config.services || [],
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
    if (config.services) {
      for (const service of config.services) {
        console.log(`   └── 🛠️  ${service}`);
      }
    }
  }

  console.log(green('\n🚀 Next steps:'));
  console.log(cyan(`   cd ${config.projectName}`));

  if (!config.installDeps) {
    console.log(cyan('   npm install'));
  }

  console.log(cyan('   npm run dev'));
}
