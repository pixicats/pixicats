import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const repoName = process.env.GITHUB_REPOSITORY?.split("/")[1];
const isGitHubPages = Boolean(process.env.GITHUB_ACTIONS && repoName);

export default defineConfig({
  plugins: [react()],
  base: isGitHubPages ? `/${repoName}/` : "/"
});
