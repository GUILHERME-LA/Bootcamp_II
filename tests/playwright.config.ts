import { defineConfig } from '@playwright/test';
import * as path from 'path';

// O diretório 'dist' é criado pelo comando 'npm run build' e contém o manifest.json, etc.
const pathToExtension = path.join(__dirname, 'dist');

export default defineConfig({
  // Aumenta o timeout global para 60 segundos, o dobro do padrão (30s).
  // Isso resolve o erro 'Test timeout of 30000ms exceeded while setting up "page"' no Docker/CI.
  timeout: 60000, 
  
  // Timeout de 60 segundos para 'expect's (assercões)
  expect: {
    timeout: 60000,
  },

  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  use: {
    // Modo headless desabilitado (headless: false) é fundamental para depuração visual.
    headless: false,
    
    // Configuração base do Playwright
    trace: 'on-first-retry',
    
    // Configurações do Chromium para carregar a extensão
    contextOptions: {
      args: [
        `--disable-extensions-except=${pathToExtension}`,
        `--load-extension=${pathToExtension}`,
      ],
    },
  },

  projects: [
    {
      name: 'chromium-extension',
      use: { 
        ...process.env.CI ? {} : { launchOptions: { devtools: true } },
        browserName: 'chromium' 
      },
    },
  ],
});
