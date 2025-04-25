# Deployment to GitHub Pages

This project can be deployed to GitHub Pages using the provided deployment script. Follow the steps below to deploy the latest version of your app.

## Prerequisites
- Ensure you have push access to the repository.
- All changes should be committed before deploying (the script will abort if there are uncommitted changes).
- Node.js and npm should be installed on your system.

## Deployment Steps

1. **Install dependencies (if not already done):**
   ```sh
   npm install
   ```

2. **Run the deployment script:**
   ```sh
   npm run deploy
   ```
   This will:
   - Prompt you to select a version bump (patch, minor, major).
   - Update the version in `package.json` and `src/main.ts`.
   - Commit and push the changes to the repository with a `[deploy]` tag in the commit message.

3. **GitHub Pages Setup:**
   - Ensure your repository is configured to serve from the correct branch (usually `gh-pages` or `main`/`master` with `/docs` or `/dist` as the source).
   - If you need to reset the GitHub Pages branch, use:
     ```sh
     npm run reset-gh-pages
     ```

## Notes
- The deployment script is located at [`scripts/deploy.sh`](../scripts/deploy.sh).
- The build output is configured for static hosting as required by GitHub Pages.
- If you encounter issues, ensure your repository's GitHub Pages settings match your deployment branch and folder.
- For custom domains or advanced settings, refer to the [GitHub Pages documentation](https://docs.github.com/en/pages).

## Troubleshooting
- **Uncommitted changes:** Commit or stash your changes before running the deploy script.
- **Build errors:** Ensure all dependencies are installed and the project builds successfully with `npm run build`.
- **Pages not updating:** Check the Actions tab on GitHub for deployment logs, and verify your branch/folder settings in the repository's Pages configuration. 