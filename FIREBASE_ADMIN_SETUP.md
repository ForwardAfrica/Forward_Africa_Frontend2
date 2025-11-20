# Firebase Admin SDK Setup Guide

## Overview

This project now uses the **Firebase Admin SDK** for server-side Firestore operations. This allows writes to Firestore from API endpoints without hitting client-side security rules, eliminating "Missing or insufficient permissions" errors.

## Architecture

- **Client-Side**: Uses Firebase SDK (browser) for authentication
- **Server-Side**: Uses Firebase Admin SDK (Node.js) for Firestore writes via API endpoints
- **Authentication Flow**: Client sends JWT token to API → API verifies token → Admin SDK performs Firestore write

## Setup Steps

### Step 1: Create a Firebase Service Account

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project (`fowardafrica-8cf73`)
3. Go to **Project Settings** → **Service Accounts** tab
4. Click **Generate new private key**
5. A JSON file will download with credentials like:

```json
{
  "type": "service_account",
  "project_id": "fowardafrica-8cf73",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-abc123@fowardafrica-8cf73.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://accounts.google.com/o/oauth2/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "..."
}
```

### Step 2: Extract and Configure Environment Variables

Create a `.env.local` file at the project root with:

```env
# Firebase Admin SDK Credentials (Server-side only - NEVER expose to client)
FIREBASE_PROJECT_ID=fowardafrica-8cf73
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-abc123@fowardafrica-8cf73.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n

# Firebase Client SDK (Public - safe for browser)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCh9D1Buu-Ks_Iyba7LWkiAIuod9io8zLk
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=fowardafrica-8cf73.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=fowardafrica-8cf73
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://fowardafrica-8cf73-default-rtdb.firebaseio.com
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=fowardafrica-8cf73.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=475328888787
NEXT_PUBLIC_FIREBASE_APP_ID=1:475328888787:web:3b2dfe1e8ebd691775b926
```

**Important**: 
- `FIREBASE_` variables (without `NEXT_PUBLIC_` prefix) are **server-side only** and will never be exposed to the browser
- Store the `.env.local` file securely and never commit it to Git
- The private key must preserve newline characters: `\n` (backslash-n, not actual newlines)

### Step 3: Verify Configuration

Run the development server and check for errors:

```bash
npm run dev
```

Look for error messages in the terminal. If you see:
```
FIREBASE_ADMIN_SDK: Missing environment variables
```

Check that `.env.local` is in the project root and contains all three variables.

### Step 4: Deploy Firestore Security Rules

After setting up the Admin SDK, deploy your Firestore rules:

```bash
firebase login
firebase deploy --only firestore:rules
```

Your rules can remain permissive because:
- Client reads still check rules (for data isolation)
- Admin SDK writes bypass rules (for backend operations)

## API Endpoints Using Admin SDK

### Create Instructor

**Endpoint**: `POST /api/instructors/create`

**Headers**:
```
Content-Type: application/json
Authorization: Bearer {JWT_TOKEN}
```

**Body**:
```json
{
  "name": "John Doe",
  "title": "Senior Developer",
  "email": "john@example.com",
  "bio": "Experienced instructor",
  "experience": 10,
  "expertise": ["React", "Node.js"],
  "socialLinks": {
    "linkedin": "https://linkedin.com/in/johndoe",
    "twitter": "https://twitter.com/johndoe",
    "website": "https://johndoe.com"
  }
}
```

**Response** (201 Created):
```json
{
  "id": "instructor_doc_id",
  "message": "Instructor created successfully",
  "data": {
    "id": "instructor_doc_id",
    "name": "John Doe",
    ...
  }
}
```

**Error Responses**:
- `401 Unauthorized`: Invalid or missing JWT token
- `403 Forbidden`: User lacks permission to create instructors
- `400 Bad Request`: Missing required fields
- `500 Internal Server Error`: Server error

## How It Works

1. **Client Action**: User submits instructor form
2. **Frontend**: `src/lib/api.ts` → `instructorAPI.createInstructor()`
3. **API Call**: POST to `/api/instructors/create` with JWT token
4. **Backend**: `pages/api/instructors/create.ts`
   - Verifies JWT token
   - Checks user permissions
   - Uses Admin SDK `db.collection('instructors').add()`
5. **Firestore**: Document created bypassing client-side rules
6. **Response**: Returns new instructor ID to frontend

## Troubleshooting

### "Missing or insufficient permissions" Error

**Cause**: Firestore rules not deployed or too restrictive

**Solution**:
```bash
firebase deploy --only firestore:rules
```

Ensure your rules allow reads/writes:
```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

### "FIREBASE_PROJECT_ID is not configured"

**Cause**: `.env.local` file missing or incomplete

**Solution**:
1. Create `.env.local` in project root
2. Add all three Firebase Admin credentials
3. Restart dev server: `npm run dev`

### Service Account Missing Permissions

**Cause**: Service account doesn't have Firestore write permissions

**Solution**:
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your Firebase project
3. Go to **IAM & Admin** → **Service Accounts**
4. Find the Firebase Admin SDK service account
5. Grant it the `Editor` or `Cloud Datastore User` role

### Private Key Format Issues

**Wrong** (JSON file):
```
"private_key": "-----BEGIN PRIVATE KEY-----\nABC...\nDEF...\n-----END PRIVATE KEY-----\n"
```

**Correct** (Environment variable - escape backslashes):
```
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nABC...\nDEF...\n-----END PRIVATE KEY-----\n
```

The code automatically converts `\\n` (escaped backslash) to actual newlines:
```javascript
privateKey: privateKey.replace(/\\n/g, '\n')
```

## Security Best Practices

1. ✅ **Never** commit `.env.local` to Git
2. ✅ **Never** log sensitive credentials
3. ✅ **Always** verify JWT tokens on the backend
4. ✅ **Use** HTTPS in production
5. ✅ **Rotate** service account keys periodically

## Files Modified/Created

- `lib/firebaseAdmin.js` - Firebase Admin SDK initialization
- `pages/api/instructors/create.ts` - API endpoint for instructor creation
- `src/lib/api.ts` - Updated `instructorAPI.createInstructor()` to use API endpoint
- `src/lib/tokenUtils.ts` - JWT token utility functions
- `.env.local` - Environment variables (not committed to Git)

## Testing

After setup, test the flow:

1. Log in as a user with `Content Manager` or `Super Admin` role
2. Navigate to the instructor creation form
3. Submit the form
4. Check browser DevTools → Network tab → POST `/api/instructors/create`
5. Verify response contains `{ "message": "Instructor created successfully" }`

If you get a 401 error, ensure you're logged in and the JWT token is stored in localStorage.
