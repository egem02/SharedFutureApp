export function initAlbum() {
    const createAlbumBtn = document.getElementById("createAlbumBtn");
    const newAlbumInput = document.getElementById("newAlbumName");
    const albumSelect = document.getElementById("albumSelect");
    const albumFilter = document.getElementById("albumFilter");
    const container = document.getElementById("photoContainer");

    if (!createAlbumBtn || !newAlbumInput || !container) return;

    let allPhotos = [];
    let currentFilter = null;

    // -----------------------------
    // FOTOĞRAFLARI YÜKLEME
    // -----------------------------
    async function loadPhotos() {
        try {
            const res = await fetch("/api/photos"); // backend endpoint
            if (!res.ok) throw new Error("Photos load failed");
            allPhotos = await res.json();
            displayPhotos();
        } catch (err) {
            console.error("Error loading photos:", err);
        }
    }

    loadPhotos(); // sayfa yüklendiğinde çağır

    // -----------------------------
    // FOTOĞRAFLARI GÖSTERME
    // -----------------------------
    function displayPhotos() {
        container.innerHTML = "";
        let photosToShow = allPhotos;

        if (currentFilter) {
            photosToShow = allPhotos.filter(p => p.AlbumId == parseInt(currentFilter));
        }

        if (photosToShow.length === 0) {
            container.innerHTML = '<p style="text-align:center;color:#999;">No photos yet</p>';
            return;
        }

        photosToShow.forEach(addPhotoToUI);
    }

    function addPhotoToUI(photo) {
        const div = document.createElement("div");
        div.className = "photo-item";
        div.innerHTML = `<img src="${photo.url}" alt="Photo">`;
        container.appendChild(div);
    }

    // -----------------------------
    // ALBUM FILTRE EVENT
    // -----------------------------
    albumFilter?.addEventListener("change", (e) => {
        currentFilter = e.target.value;
        displayPhotos();
    });

    // -----------------------------
    // ALBUM OLUŞTURMA
    // -----------------------------
    createAlbumBtn.addEventListener("click", async () => {
        const albumName = newAlbumInput.value.trim();
        if (!albumName) return alert("Please enter an album name");

        try {
            const res = await fetch("/api/album", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ Name: albumName })
            });

            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const newAlbum = await res.json();

            const albumDisplayName = newAlbum.Name ?? newAlbum.name;
            const albumId = newAlbum.Id ?? newAlbum.id;

            if (albumSelect) {
                const opt = document.createElement("option");
                opt.value = albumId;
                opt.textContent = albumDisplayName;
                albumSelect.appendChild(opt);
            }

            newAlbumInput.value = "";
            alert(`Album "${albumDisplayName}" created successfully!`);
        } catch (err) {
            console.error("Error creating album:", err);
            alert("Error creating album");
        }
    });

    // global olarak erişilebilir kıl
    window.displayPhotos = displayPhotos;
}
