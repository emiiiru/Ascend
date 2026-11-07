# Ascend

A simple daily exercise planner. Sign in with Google, pick an exercise
category (Flexibility, Strength, Cardio, Core), choose a **3, 5 or 7 day** weekly
plan and follow each day's routine. The home page is a dashboard with your
active plans, weekly activity, workouts done and day streak.

## Run it

The app is plain HTML, CSS and JavaScript modules, so it only needs a static server:

```bash
cd fitplan
python3 -m http.server 5173      # or: npx serve -l 5173 .
```

Open http://localhost:5173.

Until you add Firebase settings the app runs in **demo mode**: the Google button
signs in a fake user and data is stored in your browser's localStorage.

## Enable real Google login and a database (Firebase)

1. Create a project at https://console.firebase.google.com.
2. **Authentication → Sign-in method →** enable **Google**.
3. **Firestore Database →** create a database.
4. **Project settings → Your apps →** add a **Web app** and copy its config into
   `js/config.js`.
5. **Authentication → Settings → Authorized domains:** make sure `localhost`
   (and your hosting domain when you deploy) is listed.
6. Set these Firestore security rules so each user can only access their own data:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```

## Project structure

```
index.html          page shell
css/styles.css      slate blue theme, hover and button styles
js/config.js        Firebase config (edit this)
js/firebase.js      lazy Firebase loader
js/auth.js          Google sign-in / sign-out (demo fallback)
js/db.js            Firestore or localStorage store (same interface)
js/data.js          exercise catalog and plan builder
js/utils.js         dates, dashboard stats, HTML escaping
js/icons.js         inline SVG icon set
assets/logo.svg     logo and favicon (plus apple-touch-icon.png)
js/app.js           views, routing and actions
```

## Data model

Firestore path: `users/{uid}/plans/{categoryId}`

```js
{
  categoryId: "flexibility",
  daysPerWeek: 5,                       // 3, 5 or 7
  completed: { "1": "2026-10-31" },     // this week's finished days
  log: ["2026-10-31"],                  // every completion date (dashboard stats)
  weeksCompleted: 0,
  startedAt: 1793400000000,
  updatedAt: 1793400000000
}
```

## Add more exercises

Open `js/data.js` and add a category to `CATEGORIES` with seven `routine(...)`
entries. The 3, 5 and 7 day plans are generated from them automatically.
