# Elysia Js with Bun runtime

### CRUD and AUTH with Elysia Js Bun API

#### Install Bun
- https://bun.sh/docs/installation

#### Setup database and env
- create database elysia_app with mysql
- setup .env
- `DATABASE_URL= "postgresql://postgres:postgres@localhost:5432/todolist?schema=public"`
- `JWT_SECRETS= "secret"`
- `JWT_EXPIRED= "2h"`

#### List dependency
checkout detail in package.json

#### Install dependency
```bash
bun i  
```
#### Init prisma
```bash
bunx prisma migrate dev --name init  
```

#### Development
To start the development server run:
```bash
bun run dev
```

Open http://localhost:3000/ with your browser to see the result.


#### Swagger
`http://localhost:3000/swagger`
  
