import fs from 'node:fs';
import path from 'node:path';
import type { TemplateVars } from '../types/config';

export async function copyTemplate(templatePath: string, targetDir: string, templateVars: TemplateVars): Promise<void> {
  const templateDir = path.join(__dirname, '..', '..', 'templates', templatePath);

  if (!fs.existsSync(templateDir)) {
    throw new Error(`Template not found: ${templatePath}`);
  }

  fs.cpSync(templateDir, targetDir, { recursive: true });

  await replaceInFiles(targetDir, templateVars);

  await renameSpecialFiles(targetDir);

  await postProcessTemplate(targetDir, templateVars);
}

async function replaceInFiles(dir: string, templateVars: TemplateVars): Promise<void> {
  const files = await getFilesRecursively(dir);

  for (const file of files) {
    if (shouldSkipFileForReplacement(file)) continue;

    try {
      let content = fs.readFileSync(file, 'utf8');

      content = replaceSimplePlaceholders(content, templateVars);

      content = replaceConditionals(content, templateVars);
      content = replaceLoops(content, templateVars);

      fs.writeFileSync(file, content, 'utf8');
    } catch (error) {
      console.warn(`Warning: Could not process file ${file}`);
    }
  }
}

function replaceSimplePlaceholders(content: string, vars: TemplateVars): string {
  return content.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    if (key in vars) {
      const value = vars[key];
      return Array.isArray(value) ? value.join(', ') : String(value);
    }
    return match;
  });
}

function replaceConditionals(content: string, vars: TemplateVars): string {
  let result = content.replace(/\{\{#(\w+)\}\}([\s\S]*?)\{\{\/\1\}\}/g, (match, key, innerContent) => {
    const value = vars[key];
    if (value && (typeof value !== 'object' || (Array.isArray(value) && value.length > 0))) {
      return innerContent;
    }
    return '';
  });

  result = result.replace(/\{\{\^(\w+)\}\}([\s\S]*?)\{\{\/\1\}\}/g, (match, key, innerContent) => {
    const value = vars[key];
    if (!value || (Array.isArray(value) && value.length === 0)) {
      return innerContent;
    }
    return '';
  });

  return result;
}

function replaceLoops(content: string, vars: TemplateVars): string {
  return content.replace(/\{\{#each\s+(\w+)\}\}([\s\S]*?)\{\{\/each\}\}/g, (match, key, template) => {
    const array = vars[key];
    if (!Array.isArray(array)) return '';

    return array
      .map((item) => {
        let itemContent = template;

        itemContent = itemContent.replace(/\{\{\.\}\}/g, String(item));

        if (typeof item === 'object' && item !== null) {
          itemContent = itemContent.replace(/\{\{(\w+)\}\}/g, (propMatch: string, propKey: string) => {
            return propKey in item ? String(item[propKey]) : propMatch;
          });
        }

        return itemContent;
      })
      .join('');
  });
}

async function renameSpecialFiles(targetDir: string): Promise<void> {
  const specialFiles = [
    { from: '_gitignore', to: '.gitignore' },
    { from: '_npmrc', to: '.npmrc' },
    { from: '_env.example', to: '.env.example' },
    { from: '_dockerignore', to: '.dockerignore' },
  ];

  for (const { from, to } of specialFiles) {
    const fromPath = path.join(targetDir, from);
    const toPath = path.join(targetDir, to);

    if (fs.existsSync(fromPath)) {
      fs.renameSync(fromPath, toPath);
    }
  }
}

async function postProcessTemplate(targetDir: string, templateVars: TemplateVars): Promise<void> {
  switch (templateVars.TEMPLATE) {
    case 'with-docker':
      await generateDockerCompose(targetDir, templateVars);
      break;
    case 'react-monorepo':
    case 'vue-monorepo':
      await setupMonorepo(targetDir, templateVars);
      break;
    default:
      break;
  }
}

async function generateDockerCompose(targetDir: string, templateVars: TemplateVars): Promise<void> {
  if (templateVars.ARCHITECTURE !== 'microservices') return;

  const services = templateVars.SERVICES;
  const dockerCompose = {
    version: '3.8',
    // biome-ignore lint/suspicious/noExplicitAny:
    services: {} as Record<string, any>,
    networks: {
      app_network: {
        driver: 'bridge',
      },
    },
  };

  dockerCompose.services['api-gateway'] = {
    build: './api-gateway',
    ports: ['3000:3000'],
    environment: {
      NODE_ENV: 'development',
    },
    networks: ['app_network'],
    depends_on: services,
  };

  services.forEach((service, index) => {
    const port = 3001 + index;
    dockerCompose.services[service] = {
      build: `./services/${service}`,
      ports: [`${port}:${port}`],
      environment: {
        NODE_ENV: 'development',
        PORT: port,
      },
      networks: ['app_network'],
    };
  });

  const dockerComposeContent = `# Generated Docker Compose file
version: '3.8'

services:
${Object.entries(dockerCompose.services)
  .map(
    ([name, config]) => `  ${name}:
${Object.entries(config)
  .map(([key, value]) => {
    if (Array.isArray(value)) {
      return `    ${key}:\n${value.map((v) => `      - "${v}"`).join('\n')}`;
    }
    if (typeof value === 'object' && value !== null) {
      return `    ${key}:\n${Object.entries(value)
        .map(([k, v]) => `      ${k}: ${v}`)
        .join('\n')}`;
    }
    return `    ${key}: ${typeof value === 'string' ? `"${value}"` : value}`;
  })
  .join('\n')}`,
  )
  .join('\n\n')}

networks:
  app_network:
    driver: bridge
`;

  fs.writeFileSync(path.join(targetDir, 'docker-compose.yml'), dockerComposeContent);
}

async function setupMonorepo(targetDir: string, templateVars: TemplateVars): Promise<void> {
  const workspaces = ['apps/*', 'packages/*', 'services/*'];

  const rootPackageJson = {
    name: templateVars.PROJECT_NAME,
    version: '1.0.0',
    description: templateVars.PROJECT_DESCRIPTION,
    private: true,
    workspaces,
    scripts: {
      'dev:all': 'concurrently "npm run dev:backend" "npm run dev:frontend"',
      'dev:backend': 'npm run dev --workspace=api-gateway',
      'dev:frontend': `npm run dev --workspace=${templateVars.PROJECT_NAME}-frontend`,
      'build:all': 'npm run build --workspaces',
      'test:all': 'npm run test --workspaces',
    },
    devDependencies: {
      concurrently: '^8.2.2',
    },
  };

  fs.writeFileSync(path.join(targetDir, 'package.json'), JSON.stringify(rootPackageJson, null, 2));
}

function getFilesRecursively(dir: string): string[] {
  const files: string[] = [];
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      if (!['node_modules', '.git', 'dist', 'build'].includes(item)) {
        files.push(...getFilesRecursively(fullPath));
      }
    } else {
      files.push(fullPath);
    }
  }

  return files;
}

function shouldSkipFile(filePath: string): boolean {
  const skipPatterns = [/node_modules/, /\.git/, /dist/, /build/, /\.DS_Store/, /Thumbs\.db/];

  return skipPatterns.some((pattern) => pattern.test(filePath));
}

function shouldSkipFileForReplacement(filePath: string): boolean {
  const skipPatterns = [
    /\.(jpg|jpeg|png|gif|ico|svg|webp)$/i,
    /\.(zip|tar|gz|rar|7z)$/i,
    /\.(pdf|doc|docx|xls|xlsx)$/i,
    /\.(mp3|mp4|avi|mov|wav)$/i,
    /node_modules/,
    /package-lock\.json$/,
    /yarn\.lock$/,
    /pnpm-lock\.yaml$/,
    /\.git/,
    /\.DS_Store/,
    /Thumbs\.db/,
  ];

  return skipPatterns.some((pattern) => pattern.test(filePath));
}
