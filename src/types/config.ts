import type { PromptType } from 'prompts';

export interface ProjectConfig {
  projectName: string;
  architecture: Architecture;
  projectType: ProjectType;
  backendType: BackendType;
  template: string;
  frontendPort?: string;
  backendPort?: string;
  database?: Database;
  installDeps: boolean;
}

export type Architecture = 'monolith' | 'microservices';
export type ProjectType = 'backend-only' | 'fullstack';
export type BackendType = 'basic' | 'with-auth' | 'with-database';
export type Database = 'postgresql' | 'mysql' | 'sqlite';

export interface TemplateChoice {
  title: string;
  value: string;
  description?: string;
  selected?: boolean;
}

export interface TemplateVars {
  PROJECT_NAME: string;
  ARCHITECTURE: Architecture;
  PROJECT_TYPE: ProjectType;
  BACKEND_TYPE: BackendType;
  TEMPLATE: string;
  FRONTEND_PORT: string;
  BACKEND_PORT: string;
  DATABASE: Database;
  [key: string]: unknown;
}

export interface PromptQuestion {
  type: PromptType;
  name: string;
  message: string;
  choices?: TemplateChoice[];
  // biome-ignore lint/suspicious/noExplicitAny:
  initial?: any;
  validate?: (value: unknown) => boolean | string;
  hint?: string;
  min?: number;
}
