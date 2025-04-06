# Makefile for Next.js Code Editor

APP_NAME=snip
PORT=3000

# Start app in Docker (development mode)
docker-dev:
	docker compose up --build

# Stop Docker containers
docker-stop:
	docker compose down

# Rebuild Docker image
docker-rebuild:
	docker compose build --no-cache

# Run app locally
dev:
	npm run dev

# Run app locally with Turbopack (explicit)
turbopack:
	npx next dev --turbo

# Build app for production
build:
	npm run build

# Start app in production mode (locally)
start:
	npm start

# Format with Prettier (if using)
format:
	npx prettier --write .

# Install deps
install:
	npm install

# Run linter
lint:
	npm run lint
