# Stage 1: Build the application
FROM node:18 AS build

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the entire app to the working directory
COPY . .

# Copy the .env file into the image
COPY .env .env

# Compile TypeScript
RUN npm run build

# Stage 2: Production environment
FROM node:18

# Install ClamAV for virus scanning
RUN apt-get update && \
    apt-get install -y clamav clamav-daemon && \
    freshclam

# Set working directory
WORKDIR /usr/src/app

# Copy the build from the previous stage
COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/package*.json ./

# Copy the .env file into the production image
COPY .env .env

# Install only production dependencies
RUN npm install --only=production

# Expose port 3000 (or the port your app runs on)
EXPOSE 3000

# Start the ClamAV daemon in the background and then the app
CMD ["bash", "-c", "service clamav-daemon start && npm run start"]
