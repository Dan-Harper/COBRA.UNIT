const concurrently = require('concurrently');

const commands = [
  { name: 'frontend', command: 'npm run start', prefixColor: 'cyan' },
  { name: 'backend', command: 'node app/backendmicroservice/backend-microservice.js', prefixColor: 'magenta' },
];

concurrently(commands, {
  restartTries: 3,
  prefix: 'name',
}).catch((err) => {
  console.error(err);
});