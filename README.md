# 💧 Lembrete de Água para Estudos (MV3)

Extensão Chrome Manifest V3 que lembra o usuário de beber água em intervalos configuráveis. Esta entrega foca na automação de testes End-to-End (E2E) em ambiente conteinerizado.

---

## 🛠️ Requisitos Técnicos (Para Execução Local)

Para rodar o ambiente de testes E2E localmente (via Docker Compose), você precisará instalar apenas estas duas ferramentas:

1.  **Docker Desktop** (Inclui o Docker Engine e o Docker Compose)
    * **Link de Instalação:** [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/)

2.  **Node.js (LTS)** (Recomendado para usar a ferramenta de relatório do Playwright `show-report` fora do container).
    * **Link de Instalação:** [https://nodejs.org/en/download/](https://nodejs.org/en/download/)
    
    > **Observação:** O Playwright e o Chromium são instalados *dentro* do container Docker, garantindo que sua máquina local não precise de muitas dependências de testes.

---

## 🚀 Como Rodar Localmente (Teste E2E)

Utilizamos Docker Compose para garantir um ambiente de testes E2E isolado e reprodutível, carregando o Chromium com a extensão empacotada.

1.  **Abra o terminal** na pasta raiz do projeto.

2.  **Build do Projeto e Imagem Docker:**
    Este comando constrói a imagem, instala dependências e executa o script de build (`scripts/build-extension.mjs`) que cria a pasta `dist/` e o `extension.zip`.
    ```bash
    docker compose build
    ```

3.  **Execução dos Testes E2E:**
    Este comando executa a suíte de testes Playwright E2E dentro do container.
    ```bash
    docker compose run --rm e2e
    ```

4.  **Visualizar Relatório:**
    Após a execução, o relatório HTML é gerado na pasta `playwright-report/` e pode ser aberto no navegador (requer Node.js local):
    ```bash
    npx playwright show-report
    ```

---

## ⚙️ Integração Contínua (CI)

O *workflow* do GitHub Actions automatiza o *build* e os testes em cada `push` para `main` ou `pull_request` usando um ambiente virtualizado (o `Dockerfile` não é usado no CI, mas a lógica de instalação e testes é replicada).

O CI garante que os **Artefatos** sejam publicados: o `playwright-report` e o `extension.zip`.

**Link do Workflow (Exemplo):**
*(https://github.com/GUILHERME-LA/Bootcamp_II/actions/runs/18631385194/job/53116550265)*

---
