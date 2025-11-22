
document.addEventListener("DOMContentLoaded", () => {
    const page = document.body.dataset.page;

    // Sayfaya özel modüller
    if (page === "bucket") {
        import('./bucket.js').then(module => module.initBucket());
    } else if (page === "wishlist") {
        import('./wishlist.js').then(module => module.initWishlist());
    } else if (page === "photos") {
        import('./photos.js').then(module => module.initPhotos());
        import('./album.js').then(module => module.initAlbum());
    }

    // Arka plan müziği
    const audio = document.getElementById("bg-audio");
    if (!audio) return;

    let song = "";
    switch (page) {
        case "":
        case "/":
            song = "/audio/veben.mp3"; // Ana sayfa
            break;
        case "bucket":
            song = "/audio/dem.mp3";
            break;
        case "wishlist":
            song = "/audio/sadece.mp3";
            break;
        case "photos":
            song = "/audio/tekrardan.mp3";
            break;
    }


    audio.src = song;

    // İlk kullanıcı etkileşimi ile çal
    function startMusic() {
        audio.play().catch(err => console.log("Audio play blocked:", err));
        document.removeEventListener("click", startMusic);
    }

    // Sayfa yüklendiğinde veya kullanıcı tıkladığında çal
    document.addEventListener("click", startMusic);

   
});
