FROM node:20.10.0

WORKDIR /frontend

EXPOSE 3001

CMD [ "node", "main" ] 

COPY ./frontend/package.json .
RUN npm install

COPY ./frontend/. .

RUN npm run build



WORKDIR /backend

COPY ./backend/package.json .
RUN npm install

COPY ./backend/. .

RUN npm run build

WORKDIR /backend/dist
