# NodeJS Express API

> An example User Management API built with NodeJS & Express

## Getting Started

> Run the following to get setup locally. Note we use nvm to manage local node
> versions. An `.nvmrc` file specifies the required node version

```
1. git clone https://github.com/DuncanFenning1008/express-api.git
2. populate .env file (see example below)
3. npm i
4. npm start
```

#### Example `.env`

> Example .env file with definitions of each variable

```
NODE_ENV= The node env the api runs in locally
AUTH_USER_ID= Auth0 ID used to create auth tokens
AUTH_USER_SECRET= Auth0 Secret used to create auth tokens
PORT= The port the api will run on
CACHE_TTL= The time in seconds to store data in cache
```

## Testing + Linting

> Follow the steps below to run the test suite + linting

- `npm test` - runs linting, test suite and generates coverage report
- `npm run coverage:html` - runs test suite and opens generated coverage report
- `npm run lint` - runs linting, auto fixing issues

## Routes

> Follow the links below for detailed documentation on each route

- [Users Routes](./documentation/users.md)
