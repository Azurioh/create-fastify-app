import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import type { ProjectConfig } from '../types/config';
import kleur from 'kleur';

const { cyan, green, red, yellow } = kleur;

export async function installDependencies(targetDir: string, config: ProjectConfig): Promise<void> {
  const packageManager = await detectPackageManager(targetDir);

  if (config.architecture === 'microservices') {
    await installMicroservicesDependencies(targetDir, config, packageManager);
  } else {
    await installSingleProjectDependencies(targetDir, packageManager);
  }
}

async function installSingleProjectDependencies(targetDir: string, packageManager: string): Promise<void> {
  console.log(cyan(`📦 Installing dependencies with ${packageManager}...`));

  await runCommand(packageManager, ['install'], {
    cwd: targetDir,
    stdio: 'inherit',
  });

  console.log(green('✅ Dependencies installed successfully!'));
}

async function installMicroservicesDependencies(
  targetDir: string,
  config: ProjectConfig,
  packageManager: string,
): Promise<void> {
  const rootPackageJson = path.join(targetDir, 'package.json');
  if (fs.existsSync(rootPackageJson)) {
    console.log(cyan('📦 Installing root dependencies...'));
    await runCommand(packageManager, ['install'], {
      cwd: targetDir,
      stdio: 'inherit',
    });
  }

  if (config.projectType === 'fullstack') {
    const frontendPath = path.join(targetDir, 'apps', 'frontend');
    const frontendPackageJson = path.join(frontendPath, 'package.json');

    if (fs.existsSync(frontendPackageJson)) {
      console.log(cyan('📦 Installing frontend dependencies...'));
      await runCommand(packageManager, ['install'], {
        cwd: frontendPath,
        stdio: 'inherit',
      });
    }
  }

  console.log(green('✅ All dependencies installed successfully!'));
}

async function detectPackageManager(targetDir: string): Promise<string> {
  if (fs.existsSync(path.join(targetDir, 'yarn.lock'))) {
    return 'yarn';
  }

  if (fs.existsSync(path.join(targetDir, 'pnpm-lock.yaml'))) {
    return 'pnpm';
  }

  try {
    await runCommand('pnpm', ['--version'], { stdio: 'pipe' });
    return 'pnpm';
  } catch {}

  try {
    await runCommand('yarn', ['--version'], { stdio: 'pipe' });
    return 'yarn';
  } catch {}

  return 'npm';
}

// biome-ignore lint/suspicious/noExplicitAny:
export function runCommand(command: string, args: string[], options: any = {}): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: process.platform === 'win32',
      ...options,
    });

    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Command failed: ${command} ${args.join(' ')}`));
      } else {
        resolve();
      }
    });

    child.on('error', (error) => {
      reject(error);
    });
  });
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
}

export function validateProjectName(name: string): boolean | string {
  if (name.length === 0) {
    return 'Project name cannot be empty';
  }

  if (name.length > 214) {
    return 'Project name cannot be longer than 214 characters';
  }

  if (name.toLowerCase() !== name) {
    return 'Project name must be lowercase';
  }

  if (/[~'!()*]/.test(name)) {
    return 'Project name cannot contain special characters';
  }

  if (name.startsWith('.') || name.startsWith('_')) {
    return 'Project name cannot start with . or _';
  }

  if (/\s/.test(name)) {
    return 'Project name cannot contain spaces';
  }

  const reservedNames = [
    'node_modules',
    'favicon.ico',
    'index',
    'main',
    'test',
    'src',
    'build',
    'dist',
    'lib',
    'bin',
    'package',
    'npm',
    'yarn',
    'pnpm',
  ];

  if (reservedNames.includes(name.toLowerCase())) {
    return `Project name "${name}" is reserved`;
  }

  return true;
}

export function validatePort(port: string | number): boolean | string | number {
  const portNum = typeof port === 'string' ? Number.parseInt(port, 10) : port;

  if (Number.isNaN(portNum)) {
    return 'Port must be a number';
  }

  if (portNum < 1 || portNum > 65535) {
    return 'Port must be between 1 and 65535';
  }

  if (portNum < 1024) {
    return 'Port should be greater than 1024 to avoid conflicts with system ports';
  }

  return true;
}

export function checkDirectoryExists(dirPath: string): boolean {
  try {
    const stat = fs.statSync(dirPath);
    return stat.isDirectory();
  } catch {
    return false;
  }
}

export function ensureDirectoryExists(dirPath: string): void {
  fs.mkdirSync(dirPath, { recursive: true });
}

export function sanitizePackageName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9-_.]/g, '-')
    .replace(/^[-_.]+|[-_.]+$/g, '')
    .replace(/[-_.]{2,}/g, '-');
}

export function getTemplatePathFromConfig(config: ProjectConfig): string {
  return path.join(config.architecture, config.projectType, config.template);
}

// biome-ignore lint/suspicious/noExplicitAny:
export function readJsonFile<T = any>(filePath: string): T {
  const content = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(content);
}

// biome-ignore lint/suspicious/noExplicitAny:
export function writeJsonFile(filePath: string, data: any): void {
  const content = JSON.stringify(data, null, 2);
  fs.writeFileSync(filePath, content);
}

export function logInfo(message: string): void {
  console.log(cyan(`ℹ ${message}`));
}

export function logSuccess(message: string): void {
  console.log(green(`✅ ${message}`));
}

export function logWarning(message: string): void {
  console.log(yellow(`⚠ ${message}`));
}

export function logError(message: string): void {
  console.log(red(`❌ ${message}`));
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// biome-ignore lint/suspicious/noExplicitAny:
export function debounce<T extends (...args: any[]) => any>(func: T, delay: number): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}
