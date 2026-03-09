# Uniformes App - Monorepo

Monorepo con frontend React + Vite y backend Node.js + Express + PostgreSQL.

## Estructura

```
/
├── frontend/   # React + Vite + TailwindCSS + Axios + React Router
├── backend/    # Node.js + Express + Sequelize + PostgreSQL
└── package.json
```

## Requisitos

- Node.js >= 18
- PostgreSQL >= 14
- npm >= 9

## Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/Rouzajor/UniformesClaudeCode.git
cd UniformesClaudeCode
```

### 2. Instalar todas las dependencias

```bash
npm run install:all
```

### 3. Configurar variables de entorno del backend

```bash
cp backend/.env.example backend/.env
```

Edita `backend/.env` con tus credenciales de PostgreSQL:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=uniformes_db
DB_USER=postgres
DB_PASSWORD=your_password
PORT=5000
```

### 4. Crear la base de datos

```sql
CREATE DATABASE uniformes_db;
```

## Ejecución

### Ambos servicios en paralelo

```bash
npm run dev
```

### Solo frontend

```bash
npm run dev:frontend
```

### Solo backend

```bash
npm run dev:backend
```

## URLs

| Servicio   | URL                              |
|------------|----------------------------------|
| Frontend   | http://localhost:3000            |
| Backend    | http://localhost:5000            |
| API Health | http://localhost:5000/api/health |
