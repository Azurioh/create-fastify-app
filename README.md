# Create Fastify App: A Modern Node.js Project Generator

Create Fastify App is a command-line tool that streamlines the creation of Fastify-based applications by providing a flexible and feature-rich project scaffolding system. It supports both monolithic and microservices architectures, offering pre-configured templates with best practices and modern development tooling.

The tool enables developers to quickly bootstrap new Fastify applications with a robust foundation, including features like CORS configuration, rate limiting, Swagger documentation, and error handling. It provides an interactive CLI experience that guides users through project configuration choices and automatically sets up the project structure based on selected options.

## Repository Structure
```
.
├── src/                      # Source code directory
│   ├── index.ts             # CLI entry point
│   ├── lib/                 # Core library functions
│   │   ├── copy-template.ts # Template processing logic
│   │   ├── create-project.ts# Project creation orchestration
│   │   ├── prompt.ts       # User input collection
│   │   └── utils.ts        # Utility functions
│   └── types/              # TypeScript type definitions
├── templates/              # Project templates
│   ├── microservices/     # Microservices architecture templates
│   └── monolith/         # Monolithic architecture templates
├── biome.json            # Biome.js configuration
├── package.json          # Project metadata and dependencies
└── tsconfig.json        # TypeScript configuration
```

## Usage Instructions
### Prerequisites
- Node.js (v14 or higher)
- npm, yarn, or pnpm package manager
- TypeScript knowledge for template customization

### Installation

```bash
# Using npm
npm install -g create-fastify-app

# Using yarn
yarn global add create-fastify-app

# Using pnpm
pnpm add -g create-fastify-app
```

### Quick Start
1. Create a new project:
```bash
create-fastify-app
```

2. Follow the interactive prompts to configure your project:
```bash
? Project name: my-fastify-app
? Choose your architecture:
  🏛️  Monolith
  🔧 Microservices
? Choose your setup:
  🖥️  Backend Only
? Choose your template:
  ⚡ Basic
? Install dependencies? Yes/No
```

### More Detailed Examples

1. Creating a Monolithic Backend:
```bash
create-fastify-app
# Select: Monolith > Backend Only > Basic
```

2. Creating a Microservices Project:
```bash
create-fastify-app
# Select: Microservices > Backend Only > Basic
```
