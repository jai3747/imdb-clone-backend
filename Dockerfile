# # FROM node:18-alpine

# # WORKDIR /app

# # COPY package*.json ./
# # RUN npm ci --only=production
# # RUN npm install

# # RUN npm install express dotenv

# # COPY . .
# # ENV NODE_ENV=production

# # EXPOSE 5000

# # CMD ["node", "index.js"]
# FROM node:18-alpine

# WORKDIR /app

# # Copy package files first for better caching
# COPY package*.json ./

# # Install production dependencies
# RUN npm ci --only=production

# # Copy the rest of the application
# COPY . .

# # Set environment
# ENV NODE_ENV=production

# # Expose port
# EXPOSE 5000

# # Start the application
# CMD ["node", "index.js"]
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# First remove any existing modules and lock file
RUN rm -rf node_modules
RUN rm -f package-lock.json

# Install dependencies
RUN npm install
RUN npm install --save-dev babel-jest
# Copy the rest of the application
COPY . .

# Set environment
ENV NODE_ENV=production

# Expose port
EXPOSE 5000

# Start the application
CMD ["node", "index.js"]
