import prompts from 'prompts';
import type { Architecture, ProjectConfig, ProjectType, PromptQuestion, TemplateChoice } from '@custom-types/config';

export const ARCHITECTURE_CHOICES: TemplateChoice[] = [
  {
    title: '🏛️  Monolith',
    value: 'monolith',
    description: 'Single application architecture',
  },
  {
    title: '🔧 Microservices',
    value: 'microservices',
    description: 'Distributed services architecture',
  },
];

export const PROJECT_TYPE_CHOICES: Record<Architecture, TemplateChoice[]> = {
  monolith: [
    {
      title: '🖥️  Backend Only',
      value: 'backend-only',
      description: 'API server only',
    },
    // {
    //   title: '🌐 Full-stack',
    //   value: 'fullstack',
    //   description: 'Backend + Frontend in mono-repo',
    // },
  ],
  microservices: [
    {
      title: '🖥️  Backend Only',
      value: 'backend-only',
      description: 'Multiple API services',
    },
    // {
    //   title: '🌐 Full-stack',
    //   value: 'fullstack',
    //   description: 'Services + Frontend in mono-repo',
    // },
  ],
};

export const TEMPLATE_CHOICES: Record<Architecture, Record<ProjectType, TemplateChoice[]>> = {
  monolith: {
    'backend-only': [
      {
        title: '⚡ Basic',
        value: 'basic',
        description: 'Simple Fastify server',
      },
      // {
      //   title: '🔐 With Authentication',
      //   value: 'with-auth',
      //   description: 'JWT auth included',
      // },
      // {
      //   title: '💾 With Database',
      //   value: 'with-database',
      //   description: 'Prisma + PostgreSQL',
      // },
    ],
    fullstack: [
      // {
      //   title: '⚛️  Vite + React',
      //   value: 'vite-react',
      //   description: 'React + Vite frontend',
      // },
    ],
  },
  microservices: {
    'backend-only': [
      {
        title: '⚡ Basic',
        value: 'basic',
        description: 'Simple Fastify server',
      },
      // {
      //   title: '🔐 With Authentication',
      //   value: 'with-auth',
      //   description: 'JWT auth included',
      // },
      // {
      //   title: '💾 With Database',
      //   value: 'with-database',
      //   description: 'Prisma + PostgreSQL',
      // },
    ],
    fullstack: [
      // {
      //   title: '⚛️  Vite + React',
      //   value: 'vite-react',
      //   description: 'React + Vite frontend',
      // },
    ],
  },
};

export async function collectUserInput(): Promise<ProjectConfig | null> {
  const basicConfig = await prompts([
    {
      type: 'text',
      name: 'projectName',
      message: 'Project name:',
      initial: 'my-fastify-app',
      validate: (value: string) => (value.length > 0 ? true : 'Project name is required'),
    },
  ]);

  if (!basicConfig.projectName) return null;

  const architectureResult = await prompts({
    type: 'select',
    name: 'architecture',
    message: 'Choose your architecture:',
    choices: ARCHITECTURE_CHOICES,
    hint: '- Use arrow-keys. Return to submit.',
  });

  if (!architectureResult.architecture) return null;

  const projectTypeResult = await prompts({
    type: 'select',
    name: 'projectType',
    message: `Choose your ${architectureResult.architecture} setup:`,
    choices: PROJECT_TYPE_CHOICES[architectureResult.architecture as Architecture],
  });

  if (!projectTypeResult.projectType) return null;

  const templateResult = await prompts({
    type: 'select',
    name: 'template',
    message: 'Choose your template:',
    choices:
      TEMPLATE_CHOICES[architectureResult.architecture as Architecture][projectTypeResult.projectType as ProjectType],
  });

  if (!templateResult.template) return null;

  const conditionalQuestions = getConditionalQuestions({
    ...basicConfig,
    ...architectureResult,
    ...projectTypeResult,
    ...templateResult,
  });

  let conditionalResult = {};
  if (conditionalQuestions.length > 0) {
    conditionalResult = await prompts(conditionalQuestions);
  }

  const installResult = await prompts({
    type: 'confirm',
    name: 'installDeps',
    message: 'Install dependencies?',
    initial: true,
  });

  return {
    ...basicConfig,
    ...architectureResult,
    ...projectTypeResult,
    ...templateResult,
    ...conditionalResult,
    ...installResult,
  } as ProjectConfig;
}

function getConditionalQuestions(partialConfig: Partial<ProjectConfig>): PromptQuestion[] {
  const questions: PromptQuestion[] = [];

  if (partialConfig.architecture === 'monolith') {
    questions.push({
      type: 'text',
      name: 'backendPort',
      message: 'Backend port:',
      initial: '3000',
    });
  }

  if (partialConfig.projectType === 'fullstack') {
    questions.push({
      type: 'text',
      name: 'frontendPort',
      message: 'Frontend port:',
      initial: '5173',
    });
  }

  if (partialConfig.template === 'with-database') {
    questions.push({
      type: 'select',
      name: 'database',
      message: 'Choose your database:',
      choices: [
        { title: 'PostgreSQL', value: 'postgresql' },
        { title: 'MySQL', value: 'mysql' },
        { title: 'SQLite', value: 'sqlite' },
      ],
    });
  }

  return questions;
}
