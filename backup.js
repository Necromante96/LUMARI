// Script de backup local para LUMARI
// Execute com: node backup.js

const fs = require('fs');
const path = require('path');

const BACKUP_DIR = 'C:\\Users\\lukas\\Downloads\\LUMARI';
const PROJECT_DIR = __dirname;

// Arquivos e pastas para backup
const ITEMS_TO_BACKUP = [
  'index.html',
  '404.html',
  'README.md',
  'README_DEPLOY.md',
  'css/',
  'js/',
  'pages/',
  'logo/',
  'sound/',
  'data/'
];

function createBackupDir() {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
    console.log(`✅ Diretório de backup criado: ${BACKUP_DIR}`);
  }
}

function copyFileOrDir(src, dest) {
  const srcPath = path.join(PROJECT_DIR, src);
  const destPath = path.join(BACKUP_DIR, src);
  
  if (!fs.existsSync(srcPath)) {
    console.log(`⚠️  Item não encontrado: ${srcPath}`);
    return;
  }
  
  const stat = fs.statSync(srcPath);
  
  if (stat.isDirectory()) {
    // Copia diretório recursivamente
    copyDir(srcPath, destPath);
  } else {
    // Copia arquivo
    const destDir = path.dirname(destPath);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    fs.copyFileSync(srcPath, destPath);
  }
  
  console.log(`📁 Copiado: ${src}`);
}

function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const items = fs.readdirSync(src);
  
  items.forEach(item => {
    const srcItem = path.join(src, item);
    const destItem = path.join(dest, item);
    const stat = fs.statSync(srcItem);
    
    if (stat.isDirectory()) {
      copyDir(srcItem, destItem);
    } else {
      fs.copyFileSync(srcItem, destItem);
    }
  });
}

function createBackup() {
  console.log('🚀 Iniciando backup do LUMARI...');
  console.log(`📦 Origem: ${PROJECT_DIR}`);
  console.log(`💾 Destino: ${BACKUP_DIR}`);
  console.log('');
  
  createBackupDir();
  
  // Adiciona timestamp ao backup
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupInfo = {
    timestamp: new Date().toISOString(),
    version: 'v0.0.9-alfa',
    items: ITEMS_TO_BACKUP
  };
  
  // Copia todos os itens
  ITEMS_TO_BACKUP.forEach(item => {
    copyFileOrDir(item);
  });
  
  // Salva informações do backup
  const infoPath = path.join(BACKUP_DIR, `backup-info-${timestamp}.json`);
  fs.writeFileSync(infoPath, JSON.stringify(backupInfo, null, 2));
  
  console.log('');
  console.log(`✅ Backup concluído com sucesso!`);
  console.log(`📄 Informações salvas em: backup-info-${timestamp}.json`);
  console.log(`🗂️  Total de ${ITEMS_TO_BACKUP.length} itens copiados`);
}

function restoreBackup() {
  if (!fs.existsSync(BACKUP_DIR)) {
    console.log('❌ Diretório de backup não encontrado!');
    return;
  }
  
  console.log('🔄 Iniciando restauração do backup...');
  
  ITEMS_TO_BACKUP.forEach(item => {
    const backupPath = path.join(BACKUP_DIR, item);
    const projectPath = path.join(PROJECT_DIR, item);
    
    if (fs.existsSync(backupPath)) {
      const stat = fs.statSync(backupPath);
      
      if (stat.isDirectory()) {
        // Remove diretório atual se existir
        if (fs.existsSync(projectPath)) {
          fs.rmSync(projectPath, { recursive: true, force: true });
        }
        copyDir(backupPath, projectPath);
      } else {
        // Copia arquivo
        const destDir = path.dirname(projectPath);
        if (!fs.existsSync(destDir)) {
          fs.mkdirSync(destDir, { recursive: true });
        }
        fs.copyFileSync(backupPath, projectPath);
      }
      
      console.log(`🔄 Restaurado: ${item}`);
    }
  });
  
  console.log('✅ Restauração concluída!');
}

// Verifica argumentos da linha de comando
const command = process.argv[2];

switch (command) {
  case 'backup':
  case 'create':
    createBackup();
    break;
  case 'restore':
    restoreBackup();
    break;
  default:
    console.log('📋 Script de Backup LUMARI');
    console.log('');
    console.log('Comandos disponíveis:');
    console.log('  node backup.js backup   - Criar backup');
    console.log('  node backup.js restore  - Restaurar backup');
    console.log('');
    console.log(`💾 Diretório de backup: ${BACKUP_DIR}`);
    break;
}