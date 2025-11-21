# Backend Migration Guide: Firebase Admin SDK

## Overview

This project has been migrated from client-side Firestore operations to secure server-side operations using the Firebase Admin SDK. All database operations now run on the backend (Node.js), and the frontend only communicates via HTTP API endpoints.

## Key Changes

✅ **Backend Operations**: All Firestore reads, writes, updates, and deletes now execute on the server  
✅ **Secure Credentials**: Firebase Admin SDK credentials stored server-side only (never exposed to browser)  
✅ **API-First Frontend**: Frontend calls backend HTTP endpoints instead of using Firebase client SDK  
✅ **Full Privileges**: Admin SDK has complete database access, bypassing all Firestore security rules  

## Environment Setup

### 1. Get Your Service Account JSON

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Project Settings** → **Service Accounts**
4. Click **Generate New Private Key** (or use existing)
5. A JSON file will download containing your service account credentials

### 2. Configure `.env.local`

Create or update `.env.local` in the project root with the following:

```bash
# Firebase Admin SDK - Raw contents of serviceAccount.json
SERVICE_ACCOUNT={"type":"service_account","project_id":"your-project-id","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"firebase-adminsdk-...@your-project-id.iam.gserviceaccount.com","client_id":"...","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-...%40your-project-id.iam.gserviceaccount.com"}
```

### Important Notes

⚠️ **DO NOT commit `.env.local`** to version control  
⚠️ **Keep your service account JSON secret** - it has full database access  
⚠️ **Use `.env.example`** to document which variables are needed (without values)  

### Using Builder.io DevServerControl

If you prefer to set the environment variable through Builder.io without modifying files:

```
DevServerControl Tool → set_env_variable → ["SERVICE_ACCOUNT", "...raw json contents..."]
```

This approach keeps secrets out of the codebase.

## How to Format the Service Account

The `SERVICE_ACCOUNT` environment variable must be the **complete JSON contents as a single-line string**:

### ✅ Correct Format
```
SERVICE_ACCOUNT={"type":"service_account","project_id":"fowardafrica-8cf73","private_key":"-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQE...","client_email":"firebase-adminsdk-abc123@fowardafrica-8cf73.iam.gserviceaccount.com"}
```

### ❌ Incorrect Format (do not use)
```
SERVICE_ACCOUNT={
  "type": "service_account",
  ...
}
```

### Tool to Format

If your service account JSON is multi-line, you can format it:

```bash
# Using Node.js
node -e "console.log(JSON.stringify(require('./serviceAccount.json')))"

# Using Python
python -c "import json; print(json.dumps(json.load(open('serviceAccount.json'))))"

# Using jq (if installed)
jq -c . serviceAccount.json
```

## Backend API Endpoints

All frontend operations now use these backend endpoints:

### Courses
- `GET /api/courses` - List courses
- `GET /api/courses/[courseId]` - Get course details
- `GET /api/courses/featured` - Get featured courses
- `GET /api/courses/category/[category]` - Get courses by category
- `POST /api/courses` - Create course (requires auth)
- `PUT /api/courses/[courseId]` - Update course (requires auth)
- `DELETE /api/courses/[courseId]` - Delete course (requires auth)

### User Progress
- `GET /api/progress/[userId]/[courseId]` - Get user progress
- `POST /api/progress/[userId]/[courseId]` - Update progress
- `POST /api/progress/[userId]/[courseId]/[lessonId]/complete` - Mark lesson complete

### Instructors
- `GET /api/instructors` - List instructors
- `GET /api/instructors/[instructorId]` - Get instructor details
- `GET /api/instructors/by-email/[email]` - Get instructor by email
- `POST /api/instructors` - Create instructor
- `PUT /api/instructors/[instructorId]` - Update instructor
- `DELETE /api/instructors/[instructorId]` - Delete instructor

### Certificates
- `GET /api/certificates/[userId]` - Get user certificates
- `POST /api/certificates/[userId]` - Create certificate

### Achievements
- `GET /api/achievements/[userId]` - Get user achievements

### Notifications
- `GET /api/notifications/[userId]` - Get user notifications
- `POST /api/notifications/[userId]` - Mark notification as read

### Audit Logs
- `GET /api/audit-logs` - Get audit logs
- `POST /api/audit-logs` - Create audit log

### User Data
- `GET /api/users/data/[userId]` - Get user data
- `POST /api/users/data/[userId]` - Create user data
- `PUT /api/users/data/[userId]` - Update user data

## Frontend Code Changes

### Before (Direct Firestore Calls)
```typescript
// ❌ Old: Client-side Firestore
import { getDoc, doc } from 'firebase/firestore';
import { db } from './firebase';

const courseDoc = await getDoc(doc(db, 'courses', courseId));
```

### After (Backend API Calls)
```typescript
// ✅ New: Backend API call
const response = await fetch(`/api/courses/${courseId}`, {
  method: 'GET',
  credentials: 'include'
});
const course = (await response.json()).data;
```

All frontend services have been updated:
- ✅ `src/lib/firestoreService.ts` - Now uses backend endpoints
- ✅ `src/lib/firebaseAuth.ts` - Minimal, uses backend for user data
- ✅ `src/lib/firestoreInstructors.ts` - Now uses backend endpoints

## Backend Service Files

### Firebase Admin Initialization
- **File**: `backend/lib/firebaseAdmin.js`
- **Purpose**: Initializes Firebase Admin SDK using SERVICE_ACCOUNT env variable
- **Key Function**: Automatically initializes on first use, caches instance

```javascript
const { getFirestore, getAuth } = require('./firebaseAdmin');
const db = getFirestore();  // Gets Admin SDK Firestore instance
```

### Firestore Service Layer
- **File**: `backend/lib/firestoreService.js`
- **Purpose**: All database operations (read, write, update, delete)
- **Features**:
  - Course CRUD operations
  - User progress tracking
  - Instructor management
  - Certificate issuance
  - Achievement tracking
  - Notification management
  - Audit logging

## Security Considerations

### ✅ What's Secure Now
- Service account credentials never exposed to browser
- All database operations validated on server
- Firestore security rules no longer needed (Admin SDK bypass)
- API endpoints can implement custom authentication/authorization

### ⚠️ Still Required
- API rate limiting (to prevent abuse)
- Input validation on all endpoints
- Authentication checks where sensitive
- Audit logging for admin operations

## Troubleshooting

### Error: "SERVICE_ACCOUNT environment variable is not configured"
**Solution**: Add `SERVICE_ACCOUNT` to `.env.local` with your complete serviceAccount.json contents

### Error: "SERVICE_ACCOUNT must be a valid JSON string"
**Solution**: Ensure the variable is a single-line JSON string (no newlines except inside `private_key`)

### Error: "Firebase Admin SDK not initialized"
**Solution**: Make sure `SERVICE_ACCOUNT` is set before starting the dev server

### 404 on API endpoints
**Solution**: Ensure endpoint paths match the routes in `pages/api/`

## Deployment

When deploying to production:

1. **Set SERVICE_ACCOUNT environment variable** in your hosting platform (e.g., Fly.io, Vercel)
2. **Never commit `.env.local`** to git
3. **Use secure secret management** provided by your platform
4. **Verify credentials** are set before deploy

### Example: Fly.io
```bash
flyctl secrets set SERVICE_ACCOUNT='{"type":"service_account",...}'
```

### Example: Vercel
Set in Project Settings → Environment Variables

## Testing

To verify the migration is working:

1. Start dev server: `npm run dev`
2. Check that `.env.local` has SERVICE_ACCOUNT set
3. Test an API endpoint:
   ```bash
   curl http://localhost:3000/api/courses
   ```
4. Should return JSON with course data from Firestore

## Migration Complete ✅

The migration from client-side Firestore to backend Admin SDK is complete. All:
- ✅ Database operations are server-side
- ✅ Frontend only calls HTTP endpoints
- ✅ Credentials are secure (server-only)
- ✅ Services are backward compatible with existing code

## Support

For issues or questions about the migration:
1. Check this guide for common solutions
2. Verify SERVICE_ACCOUNT is correctly set
3. Check backend logs for detailed error messages
4. Ensure API routes exist in `pages/api/`
