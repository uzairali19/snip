# Use official Node.js image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files and install deps
COPY package*.json ./
RUN npm install

# Copy rest of the code
COPY . .

# Build the Next.js app
RUN npm run start

# Expose the port the app runs on
EXPOSE 3000

# Start the production build
CMD ["npm", "start"]
