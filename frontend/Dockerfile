FROM node:20

# Set working dir
WORKDIR /app

# Copy only package files first for layer caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all files (exclude via .dockerignore)
COPY . .

# Expose dev port
EXPOSE 3000

CMD ["npm", "run", "dev"]
