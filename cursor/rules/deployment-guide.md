# Deployment Guide for Capybara Swim

This guide provides step-by-step instructions for deploying the Capybara Swim project to GitHub and setting up hosting on Netlify.

## Prerequisites

Before you begin, make sure you have:

- [Git](https://git-scm.com/) installed on your computer
- A [GitHub](https://github.com/) account
- A [Netlify](https://www.netlify.com/) account (free tier is sufficient)
- Node.js and npm installed

## Deploying to GitHub

### 1. Initialize a Git Repository (if not already done)

```bash
# Navigate to your project directory
cd path/to/capybara-swim

# Initialize a new Git repository
git init

# Add all files to the repository
git add .

# Commit the files
git commit -m "Initial commit"
```

### 2. Create a New Repository on GitHub

1. Go to [GitHub](https://github.com/) and sign in to your account
2. Click on the "+" icon in the top-right corner and select "New repository"
3. Enter a name for your repository (e.g., "capybara-swim")
4. Add an optional description
5. Choose whether the repository should be public or private
6. Do NOT initialize the repository with a README, .gitignore, or license
7. Click "Create repository"

### 3. Connect Your Local Repository to GitHub

```bash
# Add the GitHub repository as a remote
git remote add origin https://github.com/yourusername/capybara-swim.git

# Rename the default branch to main (if needed)
git branch -M main

# Push your code to GitHub
git push -u origin main
```

### 4. Verify Your Repository

1. Refresh your GitHub repository page
2. You should see all your project files listed

## Deploying to Netlify

### 1. Build Your Project Locally (Optional)

```bash
# Install dependencies
npm install

# Build the project
npm run build
```

This will create a `dist` directory with the built files.

### 2. Deploy to Netlify

#### Option 1: Deploy via Netlify UI

1. Log in to your [Netlify](https://app.netlify.com/) account
2. Click on "New site from Git"
3. Select "GitHub" as your Git provider
4. Authorize Netlify to access your GitHub account if prompted
5. Select your repository from the list
6. Configure the build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
7. Click "Deploy site"

#### Option 2: Deploy via Netlify CLI

```bash
# Install Netlify CLI globally
npm install -g netlify-cli

# Login to Netlify
netlify login

# Initialize a new Netlify site
netlify init

# Follow the prompts to connect to your GitHub repository
# and configure build settings

# Deploy your site
netlify deploy --prod
```

### 3. Configure Custom Domain (Optional)

1. In the Netlify dashboard, go to your site settings
2. Click on "Domain management" or "Domain settings"
3. Add a custom domain if you have one
4. Follow the instructions to configure DNS settings

## Continuous Deployment

Once set up, Netlify will automatically deploy your site whenever you push changes to your GitHub repository:

```bash
# Make changes to your code
git add .
git commit -m "Update feature X"
git push origin main
```

Netlify will detect the push, build your project, and deploy the updated site.

## Troubleshooting Common Issues

### Build Failures

If your build fails on Netlify, check the build logs for errors. Common issues include:

1. **Missing entry point**: Ensure your `vite.config.js` correctly specifies the entry point:

```javascript
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: '.',
  base: './',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      }
    }
  }
});
```

2. **Module type issues**: Make sure your `package.json` includes `"type": "module"` for ES modules.

3. **Missing dependencies**: Ensure all dependencies are correctly listed in your `package.json`.

### Asset Loading Issues

If assets like 3D models or shaders aren't loading:

1. Check that paths are correct and use relative paths with the correct base URL
2. Ensure the `assetsInclude` option in `vite.config.js` includes your asset file types
3. Verify that assets are being copied to the `dist` directory during build

## Conclusion

Your Capybara Swim project should now be successfully deployed to GitHub and hosted on Netlify. The site will automatically update whenever you push changes to your GitHub repository.

For more information, refer to the [Netlify documentation](https://docs.netlify.com/) or the [GitHub documentation](https://docs.github.com/en/pages). 