# Promptopia - Your Ultimate AI Image Prompt Gallery

This is a Next.js application built with Firebase Studio. It allows users to browse a gallery of AI-generated image prompts and provides a simple admin interface to upload new images and prompts.

## Project Setup & Deployment Guide

This guide will walk you through setting up this project locally, getting it on GitHub, and deploying it live using Render.

---

### Step 1: Running the Project Locally

Before deploying, you should run the project on your own computer to make sure everything works.

1.  **Prerequisites**: Make sure you have [Node.js](https://nodejs.org/) (which includes `npm`) installed on your computer.

2.  **Navigate to Directory**: Open a command prompt or terminal and navigate to your project's root folder.
    ```bash
    cd path/to/your/promptopia-project
    ```

3.  **Install Dependencies**: Run this command to install all the required packages for the project.
    ```bash
    npm install
    ```

4.  **Start the Server**: Run the development server.
    ```bash
    npm run dev
    ```

5.  **View the App**: Open your web browser and go to `http://localhost:9002`. You should see your application running!

---

### Step 2: Setting Up Your Project on GitHub

Next, you need to get your code into a GitHub repository. This will serve as the source for your deployment.

1.  **Create a GitHub Repository**:
    *   Go to [GitHub](https://github.com) and log in.
    *   Click the `+` icon in the top-right corner and select **"New repository"**.
    *   Give your repository a name (e.g., `promptopia-gallery`).
    *   Choose whether you want it to be public or private.
    *   **Important**: Do **not** initialize the new repository with a `README`, `.gitignore`, or `license` file, as your project already contains these.
    *   Click **"Create repository"**.

2.  **Initialize Git in Your Local Project**:
    *   Open a terminal or command prompt in your project's root directory.
    *   Initialize a new Git repository:
        ```bash
        git init -b main
        ```

3.  **Add and Commit Your Files**:
    *   Add all the files in your project to the Git staging area:
        ```bash
        git add .
        ```
    *   Commit the files with a message:
        ```bash
        git commit -m "Initial commit of Promptopia project"
        ```

4.  **Connect to Your GitHub Repository**:
    *   On your new GitHub repository's page, copy the URL from the "…or push an existing repository from the command line" section. It will look something like `https://github.com/your-username/your-repo-name.git`.
    *   Add this URL as a "remote" in your local Git repository:
        ```bash
        git remote add origin <YOUR_REPOSITORY_URL>
        ```

5.  **Push Your Code to GitHub**:
    *   Push your committed files to the `main` branch on GitHub:
        ```bash
        git push -u origin main
        ```

Your project code is now successfully stored and version-controlled on GitHub!

---

### Step 3: Deploying Your Project with Render

Render is a cloud platform that makes it easy to deploy web applications directly from GitHub.

1.  **Create a Render Account**:
    *   Go to [Render.com](https://render.com/) and sign up for a new account (they have a free tier perfect for projects like this).
    *   Connect your GitHub account to Render when prompted. This allows Render to see your repositories.

2.  **Create a New Web Service**:
    *   From your Render dashboard, click **"New +"** and select **"Web Service"**.
    *   Select the GitHub repository you just created for your project.
    *   Click **"Connect"**.

3.  **Configure the Deployment**:
    *   **Name**: Give your service a unique name (e.g., `promptopia`). This will be part of your public URL.
    *   **Region**: Choose a region geographically close to you or your users.
    *   **Branch**: Ensure it's set to `main` (or your default branch).
    *   **Root Directory**: Leave this blank, as your project is in the root of the repository.
    *   **Runtime**: Render should auto-detect `Node`.
    *   **Build Command**: Set this to:
        ```bash
        npm install && npm run build
        ```
    *   **Start Command**: Set this to:
        ```bash
        npm start
        ```
    *   **Instance Type**: The `Free` instance type is sufficient for this project.

4.  **Create the Web Service**:
    *   Scroll down and click the **"Create Web Service"** button.

5.  **Wait for Deployment**:
    *   Render will now pull your code from GitHub, install the dependencies (`npm install`), build your Next.js app (`npm run build`), and start it (`npm start`).
    *   You can watch the progress in the deployment logs. The first deployment might take a few minutes.
    *   Once it's finished, you'll see a "Live" status, and your application's public URL will be shown at the top of the page.

Your Promptopia gallery is now live on the web! Any new pushes you make to your `main` branch on GitHub will automatically trigger a new deployment on Render.
