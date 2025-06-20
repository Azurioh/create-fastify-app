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
