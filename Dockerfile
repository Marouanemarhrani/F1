# Stage 1: Build the client app
FROM node:14 as client-build

# Set the working directory for client build
WORKDIR /app

# Copy client app's package.json and package-lock.json (if available) and install dependencies
COPY client/package*.json ./
RUN npm install

# Copy the rest of the client app code and build the React app
COPY client/ ./
RUN npm run build

# Stage 2: Set up the server
FROM node:18

# Set the working directory for the server
WORKDIR /app

# Copy the server package.json and package-lock.json (if available) and install dependencies
COPY server/package*.json ./
RUN npm install

# Copy the server code
COPY server/ ./

# Copy the built React app from the client build stage
COPY --from=client-build /app/build ./client/build

# Expose the port the app runs on
EXPOSE 8080

# Start the application
CMD ["npm", "start"]