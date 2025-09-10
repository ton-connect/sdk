FROM node:22

WORKDIR /app

COPY package.json ./

# TODO: fix build, pnpm, pnpm lock?!
RUN npm install

COPY . .

RUN npm run build

EXPOSE 4444

# Start the server using the production build
CMD ["npm", "run", "start:prod"]