import express from 'express';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { JwtVerifier } from 'aws-jwt-verify';
import crypto from 'crypto';

dotenv.config();
const app = express();
app.use(express.json());

const PRIVATE_KEY = fs.readFileSync('private.pem', 'utf8');
const PUBLIC_KEY = fs.readFileSync('public.pem', 'utf8');

// AWS JWT Verifier Setup
const verifier = JwtVerifier.create({
    issuer: process.env.ISSUER,
    audience: process.env.AUDIENCE,
    jwksUri: process.env.JWKS_URI,
});

// ✅ Generate JWT API
app.post('/generate-token', (req, res) => {
    const { email, orgCode, orgName, roles, permissions } = req.body;

    if (!email || !orgCode || !orgName || !roles || !permissions) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const payload = {
        aud: [process.env.AUDIENCE],
        azp: "dd680f042f8547a9968920deb325f990",
        email,
        exp: Math.floor(Date.now() / 1000) + 60 * 60, // Expires in 1 hour
        iat: Math.floor(Date.now() / 1000),
        iss: process.env.ISSUER,
        jti: crypto.randomUUID(),
        org_code: orgCode,
        org_name: orgName,
        permissions,
        roles: roles.map(role => ({
            id: role.id || "01946d2f-b775-ee08-8d43-0e8055114171",
            key: role.key,
            name: role.name || "Plus"
        })),
        scp: ["openid", "email", "offline"],
        sub: `kp_${crypto.randomUUID().replace(/-/g, '')}`
    };

    const token = jwt.sign(payload, PRIVATE_KEY, {
        algorithm: process.env.JWT_ALGORITHM,
        keyid: process.env.JWT_KEY_ID,
    });

    res.json({ token });
});

// ✅ Validate JWT API
app.post('/validate-token', async (req, res) => {
    const { token } = req.body;
    if (!token) {
        return res.status(400).json({ error: 'Token is required' });
    }

    try {
        const payload = await verifier.verify(token);
        res.json({ valid: true, decoded: payload });
    } catch (error) {
        console.error(error);
        res.status(401).json({ valid: false, error: error.message });
    }
});

// ✅ Serve JWKS
app.get('/.well-known/jwks.json', (req, res) => {
    const jwks = JSON.parse(fs.readFileSync('jwks.json', 'utf8'));
    res.json(jwks);
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));