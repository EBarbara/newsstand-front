# Newsstand Frontend

Front-end web da aplicação Newsstand, um leitor e gerenciador de revistas com interface de edição de capas e metadados. Desenvolvido no ecossistema moderno do **Next.js**.

## 🛠️ Tecnologias Principais
* Next.js (App Router)
* React 19
* Tailwind CSS
* Node.js 20+

## 💻 Desenvolvimento Local

1. Verifique se o backend está rodando localmente (porta 8000).
2. Configure o ambiente criando um arquivo `.env` na raiz:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000/api
   ```
3. Instale as dependências com npm (ou yarn/pnpm/bun):
   ```bash
   npm install
   ```
4. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
O site estará acessível em `http://localhost:3000`.

## 🚀 Deploy (Docker & GitHub Actions)

Este projeto está empacotado através de um `Dockerfile` **Multi-stage**, garantindo uma imagem final de produção extremamente leve, contendo apenas o `node_modules` e os assets estáticos gerados na compilação.

Ao fazer `push` para a branch `main`, o GitHub Actions (ver `.github/workflows/docker-publish.yml`) realiza o build e publica a imagem no **GitHub Container Registry (GHCR)**.

### Para rodar a versão de produção (via docker-compose):
Você pode inicializar essa imagem utilizando `docker-compose`:
```yaml
services:
  frontend:
    image: ghcr.io/SEU_USUARIO/newsstand_front:latest
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://IP_DO_SERVIDOR:8000/api
      - NEXT_PUBLIC_IMAGE_HOSTNAME=IP_DO_SERVIDOR
    extra_hosts:
      - "localhost:host-gateway"
```

## 📜 Licença
Distribuído sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.
