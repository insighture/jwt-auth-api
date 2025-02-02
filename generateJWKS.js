import fs from 'fs';
import jose from 'node-jose';
import dotenv from 'dotenv';

dotenv.config();

// Path to your public key
const PUBLIC_KEY_PATH = 'public.pem';

// Read the public key
const publicKey = fs.readFileSync(PUBLIC_KEY_PATH, 'utf8');

// Function to generate JWKS
async function generateJWKS() {
    try {
        // Import the public key
        const key = await jose.JWK.asKey(publicKey, 'pem', {
            kid: process.env.JWT_KEY_ID, // Set the Key ID here
            alg: process.env.JWT_ALGORITHM, // Specify the signing algorithm (if applicable)
            use: 'sig' // Define the key use (signature)
        });

        // Create a JWKS with the public key
        const keystore = jose.JWK.createKeyStore();
        await keystore.add(key);


        // Export the JWKS
        const jwks = keystore.toJSON();

        // Save the JWKS to a file
        fs.writeFileSync('jwks.json', JSON.stringify(jwks, null, 2));
        console.log('✅ JWKS generated and saved to jwks.json');
        console.log(jwks);
    } catch (error) {
        console.error('Error generating JWKS:', error);
    }
}

// Run the function
generateJWKS();