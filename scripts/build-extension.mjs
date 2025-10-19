import { mkdirSync, cpSync, rmSync, existsSync } from 'fs';
import archiver from 'archiver';
import { createWriteStream } from 'fs';
import path from 'path';

// Define caminhos base
const CWD = process.cwd();
const DIST_DIR = path.resolve(CWD, 'dist');
const SRC_DIR = path.resolve(CWD, 'src');

// 1. Limpa o diretório de distribuição anterior
console.log('Limpando diretório anterior...');
rmSync(DIST_DIR, { recursive: true, force: true });

// 2. Cria o diretório de distribuição
mkdirSync(DIST_DIR);
console.log(`Diretório ${DIST_DIR} criado com sucesso.`);

// =======================================================
// 3. Copia arquivos estáticos e obrigatórios (Com verificação de existência)
// =======================================================

// A. Arquivos na raiz
const manifestPath = path.resolve(CWD, 'manifest.json');
const readmePath = path.resolve(CWD, 'README.md');

// manifest.json é obrigatório
cpSync(manifestPath, path.join(DIST_DIR, 'manifest.json'));

// README.md é opcional, mas pode causar falha se o caminho for absoluto e não existir
if (existsSync(readmePath)) {
    console.log('Copiando README.md...');
    cpSync(readmePath, path.join(DIST_DIR, 'README.md'));
} else {
    console.warn("[AVISO] README.md não encontrado. Pulando cópia.");
}


// B. Pastas e Arquivos em 'src'
if (existsSync(SRC_DIR)) {
    // 1. Cria o diretório src em dist
    const distSrcDir = path.join(DIST_DIR, 'src');
    mkdirSync(distSrcDir);

    // 2. background
    const backgroundPath = path.join(SRC_DIR, 'background');
    if (existsSync(backgroundPath)) {
        console.log('Copiando pasta src/background...');
        cpSync(backgroundPath, path.join(distSrcDir, 'background'), { recursive: true });
    } else {
        console.warn("[AVISO] Pasta src/background não encontrada. O Service Worker não será incluído.");
    }

    // 3. popup
    const popupPath = path.join(SRC_DIR, 'popup');
    if (existsSync(popupPath)) {
        console.log('Copiando pasta src/popup...');
        cpSync(popupPath, path.join(distSrcDir, 'popup'), { recursive: true });
    } else {
        console.warn("[AVISO] Pasta src/popup não encontrada. O popup não será incluído.");
    }
    
    // 4. content.js (Arquivo de Content Script)
    const contentJsPath = path.join(SRC_DIR, 'content.js');
    if (existsSync(contentJsPath)) {
        console.log('Copiando src/content.js...');
        cpSync(contentJsPath, path.join(distSrcDir, 'content.js'));
    } else {
        console.warn("[AVISO] Arquivo src/content.js não encontrado. Pulando cópia.");
    }

} else {
    console.warn("[AVISO] Pasta 'src' não encontrada. Pulando cópia de todos os scripts.");
}


// C. Pasta icons
const iconsPath = path.resolve(CWD, 'icons');
// CORREÇÃO: Verifica se a pasta existe antes de tentar copiá-la.
if (existsSync(iconsPath)) {
    console.log('Copiando pasta icons...');
    // Usar o caminho absoluto 'iconsPath' elimina erros de resolução de caminho.
    cpSync(iconsPath, path.join(DIST_DIR, 'icons'), { recursive: true });
} else {
    // Isso é uma correção de build, mas lembre-se: a extensão PRECISA da pasta icons!
    console.warn(`[AVISO] Pasta 'icons' não encontrada em ${iconsPath}. O build continuará, mas a extensão pode falhar ao carregar no Chrome.`);
}


// =======================================================
// 4. Cria o arquivo ZIP da extensão
// =======================================================
const output = createWriteStream(path.join(DIST_DIR, 'extension.zip'));
const archive = archiver('zip', {
    zlib: { level: 9 } // Melhor compressão
});

output.on('close', function() {
    console.log(`\nExtensão ZIP criada com sucesso.`);
    console.log(`Tamanho total: ${(archive.pointer() / 1024 / 1024).toFixed(2)} MB`);
});

archive.on('error', function(err) {
    throw err;
});

archive.pipe(output);

// Adiciona todos os arquivos do diretório 'dist' ao ZIP
archive.directory(DIST_DIR, false);

archive.finalize();
