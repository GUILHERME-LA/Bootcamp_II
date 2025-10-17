import fs from 'node:fs';
import path from 'node:path';
import archiver from 'archiver';

const dist = 'dist';
const src = 'src';

// 1. Limpa e recria o diretório dist
fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist);
fs.mkdirSync(path.join(dist, src));
fs.mkdirSync(path.join(dist, src, 'popup'));
fs.mkdirSync(path.join(dist, src, 'background'));
fs.mkdirSync(path.join(dist, 'icons'));


// 2. Copia arquivos essenciais para dist/
try {
  // Arquivos na raiz
  for (const f of ['manifest.json']) {
    fs.copyFileSync(f, path.join(dist, f));
  }
  
  // Arquivos de código/UI
  fs.cpSync(path.join(src, 'popup'), path.join(dist, src, 'popup'), { recursive: true });
  fs.cpSync(path.join(src, 'background'), path.join(dist, src, 'background'), { recursive: true });
  
  // Ícones (assumindo que estão na raiz)
  fs.cpSync('icons', path.join(dist, 'icons'), { recursive: true });
  
} catch (error) {
  console.error('Erro ao copiar arquivos para dist:', error);
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