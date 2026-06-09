/**
 * deploy-ftp.cjs — CampoFinanzas v2
 * Sube dist/ a campofinanzapro.com via FTP
 */
const FtpDeploy = require('ftp-deploy');
const path = require('path');

const config = {
  user: 'u108221933',
  password: 'Producers0587@',
  host: '82.25.87.157',
  port: 21,
  localRoot: path.join(__dirname, 'dist'),
  remoteRoot: '/public_html/',
  include: ['*', '**/*'],
  exclude: [],
  deleteRemote: false,
  forcePasv: true,
  sftp: false,
};

const ftpDeploy = new FtpDeploy();

ftpDeploy.on('uploading', function(data) {
  process.stdout.write('\r  Subiendo: ' + data.transferredFileCount + '/' + data.totalFilesCount + ' — ' + data.filename.substring(0, 50));
});

ftpDeploy.on('uploaded', function(data) {
  process.stdout.write('\r  OK: ' + data.transferredFileCount + '/' + data.totalFilesCount + ' ' + ' '.repeat(40) + '\n');
});

ftpDeploy.on('log', function(data) {
  // suppress verbose logs
});

async function main() {
  console.log('=== Deploy CampoFinanzas v2 → campofinanzapro.com ===\n');
  console.log('Host: ' + config.host);
  console.log('Remote: ' + config.remoteRoot);
  console.log('Local: ' + config.localRoot + '\n');

  try {
    const result = await ftpDeploy.deploy(config);
    console.log('\n✅ Deploy completado!');
    console.log('   Archivos subidos: ' + result.length);
    console.log('   URL: https://campofinanzapro.com\n');
  } catch (err) {
    console.error('\n❌ Error en deploy:', err.message || err);
    process.exit(1);
  }
}

main();
