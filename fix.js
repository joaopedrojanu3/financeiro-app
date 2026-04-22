const fs = require('fs');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = require('path').join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

walkDir('src', function(filePath) {
  if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;
    let lines = content.split('\n');
    for(let i=0; i<lines.length; i++) {
        if(lines[i].includes('// eslint-disable-line @typescript-eslint/no-explicit-any')) {
            lines[i] = lines[i].replace('// eslint-disable-line', '/* eslint-disable-line').replace('@typescript-eslint/no-explicit-any', '@typescript-eslint/no-explicit-any */');
            changed = true;
        }
    }
    if(changed) { fs.writeFileSync(filePath, lines.join('\n')); console.log('Fixed', filePath); }
  }
});
