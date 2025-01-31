# JWT Authentication API

This project provides a **JWT authentication API** using **RS256 asymmetric encryption**. It allows users to:
- Generate JWT tokens with custom claims.
- Validate tokens using `aws-jwt-verify`.
- Serve JWKS (JSON Web Key Set) for token validation.

## Features
✅ Generate JWT tokens
✅ Validate JWT tokens
✅ Serve JWKS for public key discovery
✅ Secure environment variable configuration

---

## 1️⃣ Prerequisites

Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18+ recommended)
- [ngrok](https://ngrok.com/) (for HTTPS tunneling)

---

## 2️⃣ Setup Instructions

### **Step 1: Clone the Repository**
```bash
git clone https://github.com/your-repo/jwt-auth-api.git
cd jwt-auth-api
```

### **Step 2: Install Dependencies**
```bash
npm install
```

### **Step 3: Generate Private & Public Keys**
Run the following commands to create RSA keys:
```bash
openssl genpkey -algorithm RSA -out private.pem
openssl rsa -in private.pem -pubout -out public.pem
```

This generates:
- `private.pem` (used for signing tokens)
- `public.pem` (used for verification & JWKS serving)

### **Step 4: Create and Configure `.env`**
Create a `.env` file in the project root:
```
PORT=5000
ISSUER=https://your-ngrok-url.ngrok-free.app
AUDIENCE=your-audience
JWKS_URI=https://your-ngrok-url.ngrok-free.app/.well-known/jwks.json
JWT_ALGORITHM=RS256
JWT_KEY_ID=my-key-id
```
Replace `your-ngrok-url` with your actual **ngrok HTTPS URL** (see Step 7).

### **Step 5: Generate JWKS File**
Run:
```bash
node generateJWKS.js
```
This creates a `jwks.json` file, which is used for token validation.

### **Step 6: Start the API Server**
```bash
npm start
```

You should see:
```bash
✅ Server running on port 5000
```

### **Step 7: Expose the API Over HTTPS Using ngrok**
```bash
ngrok http 5000
```
Copy the **ngrok HTTPS URL** and update `.env` accordingly.

---

## 3️⃣ API Endpoints

### ✅ **Generate JWT Token**
```bash
curl -X POST "http://localhost:5000/generate-token" \
     -H "Content-Type: application/json" \
     -d '{
         "email": "user@example.com",
         "orgCode": "ORG123",
         "orgName": "Example Org",
         "roles": [{ "id": "123", "key": "admin", "name": "Administrator" }],
         "permissions": ["read", "write"]
     }'
```
**Response:**
```json
{
  "token": "your_generated_jwt_here"
}
```

### ✅ **Validate JWT Token**
```bash
curl -X POST "http://localhost:5000/validate-token" \
     -H "Content-Type: application/json" \
     -d '{"token": "your_generated_jwt_here"}'
```
**Response (if valid):**
```json
{
  "valid": true,
  "decoded": { "email": "user@example.com", ... }
}
```

**Response (if invalid):**
```json
{
  "valid": false,
  "error": "Invalid signature"
}
```

### ✅ **Serve JWKS (Public Key Discovery)**
```bash
curl -X GET "http://localhost:5000/.well-known/jwks.json"
```
This returns the **public key** for verification.

---

## 4️⃣ Troubleshooting

### ❌ `Protocol "http:" not supported. Expected "https:"`
🔹 **Solution:** Use **ngrok** for HTTPS, and update `.env` with the correct `ISSUER` and `JWKS_URI` values.

### ❌ `Invalid signature`
🔹 **Solution:** Ensure the correct **private/public key pair** is used for signing and verification.

---


