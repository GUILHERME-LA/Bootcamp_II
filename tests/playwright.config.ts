import { defineConfig, devices } from '@playwright/test';
import path from 'node:path';

// O caminho para a pasta 'dist' que contém a extensão
const distPath = path.join(process.cwd(), 'dist');

export default defineConfig({
  testDir: __dirname,
  // Usa o reporter list e html para o relatório
  reporter: [['list'], ['html', { outputFolder: 'playwright-report' }]],
  use: {
    // Deve ser falso para interagir com o popup em algumas abordagens,
    // mas o Playwright pode lidar com o contexto de extensão em headless.
    // Usaremos a abordagem de contexto persistente para E2E.
    headless: true, 
    // Garante que o teste não falhe apenas por um timeout alto
    actionTimeout: 15000, 
    navigationTimeout: 30000,
  },
  projects: [
    {
      name: 'chromium-with-extension',
      use: {
        ...devices['Desktop Chrome'],
        // Argumentos essenciais para carregar a extensão
        launchOptions: {
          args: [
            `--disable-extensions-except=${distPath}`,
            `--load-extension=${distPath}`
          ]
        },
        // O baseURL é necessário apenas se os testes acessarem URLs fixas
        // baseURL: 'http://localhost:3000', 
      }
    }
  ]
});