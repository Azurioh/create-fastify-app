import type { PromptType } from 'prompts';

export interface ProjectConfig {
  projectName: string;
  architecture: Architecture;
  projectType: ProjectType;
  template: string;
  services?: string[];
  frontendPort?: string;
  backendPort?: string;
  database?: Database;
  installDeps: boolean;
  authorName?: string;
  projectDescription?: string;
}

export type Architecture = 'monolith' | 'microservices';
export type ProjectType = 'backend-only' | 'fullstack';
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
  TEMPLATE: string;
  SERVICES: string[];
  FRONTEND_PORT: string;
  BACKEND_PORT: string;
  DATABASE: Database;
  AUTHOR_NAME?: string;
  PROJECT_DESCRIPTION?: string;
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
