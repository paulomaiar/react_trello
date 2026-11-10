# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is enabled on this template. See [this documentation](https://react.dev/learn/react-compiler) for more information.

Note: This will impact Vite dev & build performances.

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
# Deploy na Vercel

Implante `taskflow_api` e `react_trello` como projetos separados. No projeto da
API, configure `DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET` e `CORS_ORIGIN` para
os ambientes desejados. No projeto do frontend, configure
`VITE_BASE_URL_API` com a URL pública da API (sem barra final) e inclua a URL
exata do frontend em `CORS_ORIGIN` no projeto da API. Nas URLs do Neon, use
`sslmode=require&connect_timeout=15`.

Os arquivos `.env.example` mostram os nomes esperados para desenvolvimento
local; nunca envie arquivos `.env` com credenciais para o repositório. A Vercel
precisa executar `prisma generate` durante a instalação do backend. A
configuração da função da API inclui a distribuição estática do Swagger UI para
que seus assets locais também estejam disponíveis no deploy.

O `vercel.json` do frontend reescreve as rotas do cliente para `index.html`;
o da API direciona as requisições para `api/index.js`. Depois de configurar a
conexão do banco, aplique as migrações uma vez com `npm run db:migrate` no
projeto da API.

Para criar dados iniciais de teste, execute `npm run db:seed` no projeto da
API após definir `TASKFLOW_SEED_ENABLED=true` e `SEED_USER_PASSWORD`. O e-mail
padrão é `teste.dupla@email.com`; `SEED_USER_EMAIL` e `SEED_USER_NAME` podem
substituí-lo. O seed cria o usuário somente se o e-mail ainda não existir,
adiciona o projeto `Projeto TaskFlow` e garante as prioridades ativas. Se o
e-mail já existir com outra senha, o seed falha sem redefini-la. Não há seed
automático durante a inicialização da API.

As senhas são armazenadas com bcrypt e nunca são incluídas nas respostas. Os
hashes `scrypt` existentes continuam válidos e migram para bcrypt após login
bem-sucedido. O schema atual não tem um campo de ativação de usuários; contas
cadastradas são consideradas ativas.
