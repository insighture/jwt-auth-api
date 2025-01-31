import fs from 'fs';
import { createPublicKey } from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

// Read the public key
const publicKey = fs.readFileSync('public.pem', 'utf8');

// Convert the public key to a format that can be used for JWKS
const keyObj = createPublicKey(publicKey);
const keyBuffer = keyObj.export({ format: 'der', type: 'spki' });

// Generate the JWKS structure
const jwk = {
    kty: 'RSA',
    n: Buffer.from(keyBuffer).toString('base64url'), // Convert modulus to base64url
    e: 'AQAB', // Standard exponent
    alg: process.env.JWT_ALGORITHM,
    use: 'sig',
    kid: process.env.JWT_KEY_ID,
};

// Write JWKS to a JSON file
fs.writeFileSync('jwks.json', JSON.stringify({ keys: [jwk] }, null, 2));

console.log('✅ JWKS generated successfully:', JSON.stringify({ keys: [jwk] }, null, 2));