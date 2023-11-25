const concurrently = require('concurrently');

const commands = [
  // Start the Next.js (frontend) application
  { name: 'frontend', command: 'npm run start', prefixColor: 'cyan' },
  // Start the backend microservice
  { name: 'backend', command: 'node app/backendmicroservice/backend-microservice.tsx', prefixColor: 'magenta' },
];

concurrently(commands, {
  restartTries: 3,
  prefix: 'name',
}).catch((err) => {
  console.error(err);
});