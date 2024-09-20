FROM node:18

RUN apt-get update && \
    apt-get install -y clamav clamav-daemon build-essential && \
    freshclam

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --production

RUN npm rebuild

RUN npm install -g typescript

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["sh", "-c", "clamd & node dist/index.js"]
