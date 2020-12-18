const initEnv = require('./src/initEnvironment.js');
const api = require('./src/api.js');

async function main () {
  await initEnv();

  api();
  process.signerBot.process();
}

main();
