FROM node:lts-alpine
WORKDIR /_build

ARG SERVICE_NAME
ENV SERVICE_NAME=${SERVICE_NAME}

COPY package*.json /_build
COPY app/package*.json app/tsconfig.json /_build/app/
COPY app/micro-services/${SERVICE_NAME} /_build/app/micro-services/${SERVICE_NAME}
COPY packages /_build/packages

RUN npm ci

WORKDIR /_build/app/micro-services/${SERVICE_NAME}

CMD ["npm", "start"]