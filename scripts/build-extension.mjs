import { mkdirSync, cpSync, rmSync, existsSync } from 'fs';
import archiver from 'archiver';
import { createWriteStream } from 'fs';
import path from 'path';

const DIST_DIR = path.resolve(process.cwd(), 'dist');
const SRC_DIR = path.resolve(process.cwd(), 'src');

// 1. Limpa o diretório de distribuição anterior
console.log('Limpando diretório anterior...');
rmSync(DIST_DIR, { recursive: true, force: true });

// 2. Cria o diretório de distribuição
mkdirSync(DIST_DIR);
console.log(`Diretório ${DIST_DIR} criado com sucesso.`);

// 3. Copia arquivos estáticos e obrigatórios

// Arquivos na raiz
cpSync('manifest.json', path.join(DIST_DIR, 'manifest.json'));
cpSync('README.md', path.join(DIST_DIR, 'README.md'));

// Pasta src
mkdirSync(path.join(DIST_DIR, 'src'));
cpSync(path.join(SRC_DIR, 'background'), path.join(DIST_DIR, 'src', 'background'), { recursive: true });
cpSync(path.join(SRC_DIR, 'popup'), path.join(DIST_DIR, 'src', 'popup'), { recursive: true });
cpSync(path.join(SRC_DIR, 'content.js'), path.join(DIST_DIR, 'src', 'content.js'));


// Pasta icons (MANDATÓRIA pelo manifest.json)
const iconsPath = path.resolve(process.cwd(), 'icons');
if (existsSync(iconsPath)) {
    console.log('Copiando pasta icons...');
    cpSync('icons', path.join(DIST_DIR, 'icons'), { recursive: true });
} else {
    // Isso é uma correção de build, mas lembre-se: a extensão PRECISA da pasta icons!
    console.warn(`[AVISO] Pasta 'icons' não encontrada em ${iconsPath}. O build continuará, mas a extensão pode falhar ao carregar no Chrome.`);
}


// 4. Cria o arquivo ZIP da extensão
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
