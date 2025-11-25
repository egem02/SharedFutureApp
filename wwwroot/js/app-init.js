document.addEventListener("DOMContentLoaded", async () => {
    const page = document.body.dataset.page;

    // -----------------------------
    // Sayfa bazlı modüller
    // -----------------------------
    if (page === "photos") {
        const photosModule = await import('./photos.js');
        const memorizeModule = await import('./memorize.js');

        // DOM %100 hazır
        photosModule.initPhotos();
        if (memorizeModule.initMemorize) memorizeModule.initMemorize();

    } else if (page === "albums") {
        (async () => {
            const albumViewModule = await import('./album-view.js');
            albumViewModule.initAlbums();
        })();
    } else if (page === "bucket") {
        (async () => {
            const bucketModule = await import('./bucket.js');
            bucketModule.initBucket(); // Bucket sayfasını başlat
        })();
    } else if (page === "wishlist") {
        (async () => {
            const wishlistModule = await import('./wishlist.js');
            wishlistModule.initWishlist();
        })();
    }

    // -----------------------------
    // Arka plan müziği
    // -----------------------------
    const audio = document.getElementById("bg-audio");
    if (!audio) return;

    const musicMap = {
        "": "/audio/veben.mp3",
        "bucket": "/audio/dem.mp3",
        "wishlist": "/audio/sadece.mp3",
        "photos": "/audio/tekrardan.mp3",
        "albums": "/audio/tekrardan.mp3"
    };

    audio.src = musicMap[page] || "";

    function startMusic() {
        audio.play().catch(err => console.log("Audio play blocked:", err));
        document.removeEventListener("click", startMusic);
    }

    document.addEventListener("click", startMusic);
});