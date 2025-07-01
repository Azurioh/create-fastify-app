FROM node:lts-alpine
WORKDIR /app

COPY package.json ./
COPY packages ./packages

COPY apps/backend/package.json ./apps/backend/
RUN npm install

COPY apps/backend ./apps/backend

WORKDIR /app/apps/backend

EXPOSE ${PORT}

CMD ["npm", "run", "dev"]