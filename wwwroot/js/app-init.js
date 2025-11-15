// app-init.js
document.addEventListener("DOMContentLoaded", () => {
    const page = document.body.dataset.page;
  
    if (page === "bucket") {
        import('./bucket.js').then(module => module.initBucket());
    } else if (page === "wishlist") {
        import('./wishlist.js').then(module => module.initWishlist());
    } else if (page === "photos") {
        import('./photos.js').then(module => module.initPhotos());
    }
});
