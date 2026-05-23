# 1. Use an official lightweight Node.js runtime as the base image
FROM node:20-alpine

# 2. Set the working directory inside the virtual container
WORKDIR /app

# 3. Copy package.json and package-lock.json first to cache dependencies efficiently
COPY package*.json ./

# 4. Install only production dependencies to keep the image compact
RUN npm install --only=production

# 5. Copy the rest of your application source code into the container
COPY . .

# 6. Expose the port your server listens on
EXPOSE 3000

# 7. Define the command to execute your application
CMD ["node", "server.js"]