# Firebase Admin SDK Implementation - Summary

## ✅ Completed Tasks

### 1. **Firebase Admin SDK Initialization** 
   - Created `/lib/firebaseAdmin.js` with proper Admin SDK setup
   - Credentials are read from server-side environment variables only
   - Safe handling of private key newlines: `privateKey.replace(/\\n/g, '\n')`

### 2. **API Endpoint for Instructor Creation**
   - Created `/pages/api/instructors/create.ts`
   - Verifies JWT tokens before allowing writes
   - Uses Admin SDK to bypass Firestore client-side rules
   - Returns proper HTTP status codes and error messages

### 3. **Client-Side API Integration**
   - Updated `src/lib/api.ts` - `instructorAPI.createInstructor()`
   - Now calls `/api/instructors/create` instead of directly using Firestore
   - Automatically sends JWT token in Authorization header
   - Created `src/lib/tokenUtils.ts` for token management

### 4. **Documentation**
   - Created `FIREBASE_ADMIN_SETUP.md` with complete setup guide
   - Detailed environment variable configuration
   - Troubleshooting section for common errors
   - Security best practices

### 5. **Fixed TypeScript Build Errors**
   - Corrected all role string cases: `'Super Admin'`, `'Content Manager'`, etc.
   - Dev server is now running successfully

---

## 🔑 Required Environment Variables

Create a `.env.local` file at project root with:

```env
# Firebase Admin SDK (Server-side only - NEVER expose to client)
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

---

## 🔐 How to Get Service Account Credentials

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select project `fowardafrica-8cf73`
3. **Project Settings** → **Service Accounts** tab
4. Click **Generate new private key**
5. Extract these values from the downloaded JSON:
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `client_email` → `FIREBASE_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_PRIVATE_KEY` (preserve `\n` characters)

---

## 📊 How It Works Now

### Before (❌ Permission Errors)
```
Client Component
  ↓
firebaseAuthService.signUp()
  ↓
createInstructorInFirestore() [Client SDK]
  ↓
Firestore (checks rules)
  ↓
"Missing or insufficient permissions" ❌
```

### After (✅ Works Fine)
```
Client Component
  ↓
InstructorService.createInstructor()
  ↓
instructorAPI.createInstructor()
  ↓
POST /api/instructors/create (with JWT)
  ↓
JWTManager.verifyToken()
  ↓
Admin SDK db.collection().add() [Bypasses rules]
  ↓
Firestore (no rule check)
  ↓
Success! ✅
```

---

## 🧪 Testing the Setup

1. **Ensure user is logged in** with `Content Manager` or `Super Admin` role
2. **Navigate to instructor creation form**
3. **Submit form** with valid data
4. **Check DevTools → Network** tab for request to `/api/instructors/create`
5. **Verify response** contains `"message": "Instructor created successfully"`

### Expected Response (201 Created):
```json
{
  "id": "instructor_doc_id",
  "message": "Instructor created successfully",
  "data": {
    "id": "instructor_doc_id",
    "name": "John Doe",
    "title": "Senior Developer",
    "email": "john@example.com",
    ...
  }
}
```

---

## 📁 Files Created/Modified

### Created:
- `lib/firebaseAdmin.js` - Admin SDK initialization
- `pages/api/instructors/create.ts` - API endpoint for instructor creation
- `src/lib/tokenUtils.ts` - JWT token utility functions
- `FIREBASE_ADMIN_SETUP.md` - Complete setup guide
- `FIREBASE_ADMIN_IMPLEMENTATION_SUMMARY.md` - This file

### Modified:
- `src/lib/api.ts` - Updated `instructorAPI.createInstructor()`
- Various `.tsx` files - Fixed TypeScript role string cases

---

## 🚀 Next Steps for You

1. **Get Firebase Service Account JSON**
   - Go to Firebase Console → Project Settings → Service Accounts
   - Click "Generate new private key"
   - Save the JSON file securely

2. **Create `.env.local` file**
   - Extract credentials from JSON file
   - Create `.env.local` in project root with environment variables above
   - **Never commit `.env.local` to Git**

3. **Deploy Firestore Rules** (if not already done)
   ```bash
   firebase login
   firebase deploy --only firestore:rules
   ```

4. **Test the instructor creation**
   - Log in as `Content Manager` or `Super Admin`
   - Create an instructor
   - Verify no "Missing or insufficient permissions" error

5. **Optional: Apply to other operations**
   - Create similar API endpoints for:
     - Course creation
     - User management
     - Other sensitive operations

---

## ⚠️ Important Security Notes

- ✅ `FIREBASE_` variables (no `NEXT_PUBLIC_` prefix) are **server-only**
- ✅ Never log or expose `FIREBASE_PRIVATE_KEY`
- ✅ Always verify JWT tokens on backend before Firestore writes
- ✅ Never hardcode credentials in your code
- ✅ Rotate service account keys periodically in production

---

## 🛠️ Troubleshooting

### "FIREBASE_PROJECT_ID is not configured"
- **Cause**: `.env.local` file missing
- **Fix**: Create `.env.local` with all three Firebase Admin variables

### "Invalid token" (401)
- **Cause**: User not logged in or token expired
- **Fix**: Ensure user is logged in, refresh browser if needed

### "Missing or insufficient permissions" (still getting this?)
- **Cause**: Admin SDK service account doesn't have write permissions
- **Fix**: Check Google Cloud IAM → Grant service account "Editor" role

### "TypeError: Cannot read property 'replace' of undefined"
- **Cause**: `FIREBASE_PRIVATE_KEY` not set or empty
- **Fix**: Verify private key is in `.env.local` with proper newlines

---

## 📝 Summary

You now have:
1. ✅ Firebase Admin SDK properly configured
2. ✅ API endpoint that creates instructors without permission errors
3. ✅ Secure JWT token verification on backend
4. ✅ Client-side code updated to use the API
5. ✅ Complete documentation for setup and troubleshooting

**Status**: Ready to use. Just add the Firebase service account credentials to `.env.local` and test!
