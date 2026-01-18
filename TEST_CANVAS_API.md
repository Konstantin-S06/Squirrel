# Quick Canvas API Test Guide

## Step 1: Enable CORS Proxy

Go to: https://cors-anywhere.herokuapp.com/corsdemo

Click: **"Request temporary access to the demo server"**

(Access lasts a few hours)

---

## Step 2: Get Your Canvas API Token

1. Go to: https://q.utoronto.ca/profile/settings
2. Scroll down to "Approved Integrations"
3. Click "+ New Access Token"
4. Purpose: "Squirrel Hackathon"
5. Click "Generate Token"
6. **Copy the token** (you won't see it again!)

---

## Step 3: Test in Browser Console

Open your app, open browser console (F12), and paste:

```javascript
// Quick test function
const testCanvasAPI = async (apiKey) => {
  const CORS_PROXY = 'https://cors-anywhere.herokuapp.com/';
  const CANVAS_DOMAIN = 'https://q.utoronto.ca';

  try {
    console.log('🔍 Testing Canvas API...');

    // Test 1: Get user profile
    const profileResponse = await fetch(
      `${CORS_PROXY}${CANVAS_DOMAIN}/api/v1/users/self`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!profileResponse.ok) {
      throw new Error(`Profile fetch failed: ${profileResponse.status}`);
    }

    const profile = await profileResponse.json();
    console.log('✅ Profile:', profile);

    // Test 2: Get courses
    const coursesResponse = await fetch(
      `${CORS_PROXY}${CANVAS_DOMAIN}/api/v1/courses?enrollment_state=active`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!coursesResponse.ok) {
      throw new Error(`Courses fetch failed: ${coursesResponse.status}`);
    }

    const courses = await coursesResponse.json();
    console.log('✅ Courses:', courses);
    console.log(`Found ${courses.length} active courses!`);

    return { success: true, profile, courses };
  } catch (error) {
    console.error('❌ Error:', error);
    return { success: false, error: error.message };
  }
};

// USAGE: Replace with your actual API token
testCanvasAPI('YOUR_API_TOKEN_HERE');
```

---

## Step 4: Test with Your Firestore User

Once you've confirmed the API key works, save it to Firestore:

```javascript
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db } from './firebase/firebase';

const saveApiKey = async () => {
  const user = auth.currentUser;
  if (!user) {
    console.error('Not logged in!');
    return;
  }

  await updateDoc(doc(db, 'users', user.uid), {
    canvasApiKey: 'YOUR_API_TOKEN_HERE'
  });

  console.log('✅ API key saved!');
};

saveApiKey();
```

---

## Step 5: Test Service Functions

```javascript
import { fetchCanvasCourses } from './services/canvasService';

const testService = async () => {
  try {
    const courses = await fetchCanvasCourses();
    console.log('✅ Service working!', courses);
  } catch (error) {
    console.error('❌ Service error:', error.message);
  }
};

testService();
```

---

## Expected Results

### ✅ Success Output:
```
🔍 Testing Canvas API...
✅ Profile: {name: "Your Name", id: 123456, ...}
✅ Courses: [{id: 1, name: "CSC108", ...}, ...]
Found 5 active courses!
```

### ❌ Common Errors:

**"Failed to fetch"**
- Did you request access at cors-anywhere.herokuapp.com/corsdemo?
- Is your internet connected?

**"401 Unauthorized"**
- Invalid API token
- Token expired
- Wrong Canvas domain (check if it's q.utoronto.ca)

**"CORS error"**
- CORS proxy not accessible
- Run your own: `npm install -g cors-anywhere && cors-anywhere`

---

## Quick Debugging Checklist

- [ ] Enabled CORS proxy access
- [ ] Got Canvas API token from Canvas settings
- [ ] Token copied correctly (no extra spaces)
- [ ] Using correct Canvas domain (q.utoronto.ca)
- [ ] Browser console shows no network errors
- [ ] Firestore user document exists
- [ ] User is logged in to Firebase Auth

---

## Production Note

For your demo, this CORS proxy method works fine. After the hackathon, migrate to a proper backend proxy or Firebase Functions.

See [CANVAS_API_README.md](CANVAS_API_README.md) for full documentation.
