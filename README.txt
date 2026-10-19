VAYEN combined mobile + Collection fix

Replace these THREE files in the root of your GitHub Pages veyan repository:
- product.html
- vayen-product-approved.css
- vayen-product-approved.js

Do not replace style.css. Desktop approved layout stays the same.

Included:
1. On phones <=768px, the large inline Get Now action is hidden, leaving the fixed bottom purchase bar, themed to the product. Desktop retains the large Get Now action.
2. Product detail header Collection and breadcrumb Collection now go to collection.html, matching the existing collection destination linked from the supplied index.html, rather than new.html.
3. Existing product/back navigation, catalog and payment logic otherwise unchanged.

After uploading all three, hard-refresh / test product.html?id=youtube-creator-system on desktop and phone.
