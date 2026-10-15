VAYEN FIREBASE PRODUCTS - staging package

1. BACK UP your existing files. Do NOT deploy yet until config and rules are complete.
2. In vayen-firebase-config.js, paste the Firebase Web API key from your existing working auth config. This is a web config value, NOT a service account secret.
3. Merge FIRESTORE_RULES_ADD.txt into the existing Firestore rules (inside match /databases/{database}/documents). Publish rules.
4. Upload the 5 files: Admin.html, collection.html, product.html, vayen-catalog.js, vayen-firebase-config.js to the same GitHub Pages directory.
5. Sign in as authorized admin; Admin > Products > Import original catalog ONCE. The import stops if any product exists, to avoid overwrite.
6. Test: public collection, detail, admin add/edit/hide, another browser/device, and purchase link.

IMPORTANT LIMITATIONS:
- Only collection.html and product.html are integrated here. Other pages (homepage, search, checkout, saved/library) may still depend on old catalog behavior and need separate validation.
- No real payment or server-side price verification has been added. Never trust client-side product price for real checkout.
- Firestore products collection must be imported before public listings will show.
- Do not store private PDF URLs or credentials in public product documents.
- For published-only queries, Firestore rules permit public listing. Admin can read all.
- This is a staging build, not verified in a deployed browser.
