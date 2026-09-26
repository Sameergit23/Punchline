# Build the site
FROM node:24-slim AS site
WORKDIR /site
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Run the API, which also serves the built site
FROM python:3.12-slim
ENV PYTHONUNBUFFERED=1 PYTHONDONTWRITEBYTECODE=1
WORKDIR /app
COPY backend/requirements.txt backend/
RUN pip install --no-cache-dir -r backend/requirements.txt
COPY backend/ backend/
COPY --from=site /site/dist frontend/dist
WORKDIR /app/backend
EXPOSE 8000
CMD waitress-serve --host=0.0.0.0 --port=${PORT:-8000} --threads=8 app:app
