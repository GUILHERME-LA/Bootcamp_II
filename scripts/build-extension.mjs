import fs from 'node:fs';
import path from 'node:path';
import archiver from 'archiver';

const dist = 'dist';

// 1. Limpa e recria o diretório dist
// Apenas cria a pasta dist e a pasta icons, nada de pastas aninhadas 'src'
fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist);
fs.mkdirSync(path.join(dist, 'icons'));


// 2. Copia arquivos essenciais para dist/
try {
  // Arquivos da Raiz
  fs.copyFileSync('manifest.json', path.join(dist, 'manifest.json'));
  
  // Ícones
  // Assumindo que a pasta 'icons' está na raiz do projeto.
  fs.cpSync('icons', path.join(dist, 'icons'), { recursive: true });
  
  // Arquivos do Popup (copiados DIRETAMENTE para a raiz de 'dist')
  fs.copyFileSync('src/popup/popup.html', path.join(dist, 'popup.html'));
  fs.copyFileSync('src/popup/popup.css', path.join(dist, 'popup.css'));
  fs.copyFileSync('src/popup/popup.js', path.join(dist, 'popup.js'));
  
  // Arquivo do Service Worker (copiado DIRETAMENTE para a raiz de 'dist')
  fs.copyFileSync('src/background/background.js', path.join(dist, 'background.js'));
  
} catch (error) {
  console.error('Erro ao copiar arquivos para dist. Verifique se os arquivos de origem (manifest.json, icons/, src/popup/, src/background/) existem:', error);
  process.exit(1);
}

// 3. Gera ZIP
const output = fs.createWriteStream(path.join(dist, 'extension.zip'));
const archive = archiver('zip', { zlib: { level: 9 } });

archive.on('warning', function(err) {
  if (err.code === 'ENOENT') {
    console.warn(err);
  } else {
    throw err;
  }
});

archive.on('error', function(err) {
  throw err;
});

archive.pipe(output);

// Adiciona o conteúdo do dist para o ZIP (sem a pasta dist em si)
archive.directory(dist, false);

await archive.finalize();
console.log(`Build gerado em ${dist}/ e ${dist}/extension.zip`);
