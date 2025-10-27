import crypto from 'crypto';

// Edita estos dos valores antes de ejecutar
const username = 'inkamaia';   // CAMBIA
const code = '151617';         // CAMBIA (6 dígitos)

// Generar salt de 16 bytes en hex
const salt = crypto.randomBytes(16).toString('hex');

// SHA-256(`${salt}:${code}`) y Base64URL
const digest = crypto
  .createHash('sha256')
  .update(`${salt}:${code}`, 'utf8')
  .digest();

const b64url = digest
  .toString('base64')
  .replace(/=/g, '')
  .replace(/\+/g, '-')
  .replace(/\//g, '_');

const sql = `
INSERT INTO auth_users (username, pass_salt, pass_hash, failed_attempts, locked_until)
VALUES ('${username}', '${salt}', '${b64url}', 0, NULL)
ON CONFLICT (username)
DO UPDATE SET pass_salt = EXCLUDED.pass_salt,
              pass_hash = EXCLUDED.pass_hash,
              failed_attempts = 0,
              locked_until = NULL;
`.trim();

console.log('Salt:', salt);
console.log('Hash:', b64url);
console.log('\nSQL:\n' + sql);

