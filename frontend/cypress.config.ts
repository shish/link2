import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    specPattern: "**/*.cye.{js,jsx,ts,tsx}",
    baseUrl: "http://localhost:5173",
  },

  component: {
    specPattern: "**/*.cy.{js,jsx,ts,tsx}",
    devServer: {
      bundler: 'vite',
      framework:'react',
    }
  },
});
