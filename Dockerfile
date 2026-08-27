# Stage 1: Build Frontend and Backend
FROM node:20-alpine AS builder

WORKDIR /app

# Install root dependencies
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

RUN npm install --prefix backend
RUN npm install --prefix frontend

# Copy all source code
COPY . .

# Build both backend (TypeScript) and frontend (Vite React)
RUN npm run build --prefix backend
RUN npm run build --prefix frontend

# Stage 2: Runtime Production Image
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=4000

# Copy root package.json
COPY package*.json ./

# Copy backend package and install production dependencies
COPY backend/package*.json ./backend/
RUN cd backend && npm install --omit=dev

# Copy compiled backend output and built frontend dist
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/frontend/dist ./frontend/dist

# Expose standard port
EXPOSE 4000

# Start Sentinel AI Production Control Plane
CMD ["node", "backend/dist/index.js"]
