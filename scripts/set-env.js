const { spawnSync } = require('child_process');

const vars = {
  RESEND_API_KEY: 're_LQerRDCK_7yPq8mfXDtjQ7tdJF4fB1uNF',
  FROM_EMAIL: 'onboarding@resend.dev',
};

for (const [key, value] of Object.entries(vars)) {
  console.log(`Setting ${key}...`);
  const r = spawnSync('npx', ['-y', 'vercel', 'env', 'add', key, 'production'], {
    input: value,
    encoding: 'utf-8',
    stdio: ['pipe', 'pipe', 'pipe'],
    shell: true,
  });
  console.log(r.stdout || '');
  console.log(`✅ ${key} set`);
}
