FROM node:20 AS build
WORKDIR /build
COPY . .
RUN yarn install
RUN yarn build

FROM node:20
WORKDIR /app
COPY --from=build /build/dist ./dist
RUN yarn global add serve

EXPOSE 80

CMD ["serve", "-s", "dist", "-l", "80"]