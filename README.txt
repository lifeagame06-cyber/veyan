VAYEN — Final customer profile sync package

FILES
1. Admin.html — professional admin with one Firebase customer table, real dashboard count, email and login method.
2. vayen-auth-sync.js — syncs signed-in user's email and provider to Firestore without changing names or createdAt.
3. firestore-users-rule.txt — replacement /users/{userId} rules block; retain your existing /admins block.

INSTALL IN ORDER
1. Back up your current Firestore rules and both existing files.
2. In Firebase Console > Firestore > Rules, replace ONLY the /users/{userId} match block with firestore-users-rule.txt. Keep the surrounding rules_version, service cloud.firestore, match /databases/{database}/documents and your other match blocks intact. Publish.
3. Add your own Firebase Web API key to BOTH Admin.html and vayen-auth-sync.js (apiKey: "").
4. Replace Admin.html and vayen-auth-sync.js in GitHub repository root. Commit and wait for Pages deployment.
5. Sign into the website with a customer account and open a page that loads vayen-auth-sync.js. Then refresh Admin > Customers.

IMPORTANT
- Existing users show 'Not synced yet' until they visit the updated website while signed in.
- The dashboard counts Firestore profile documents, not every Firebase Authentication account.
- Login method is the last Firebase sign-in provider reflected in the ID token, not necessarily all providers linked to an account.
- Email is personally identifiable information: only authenticated owner and authorized admin may read these documents. Do not publish users collection with public read rules.
- This package does NOT implement real payments, orders, notification delivery, or support backend.
- Firebase web API key is public client configuration, not a service account secret. Do NOT put service account credentials in these files.
- Firestore rules should be tested using Rules Playground for owner/admin/other-user cases before production launch.
