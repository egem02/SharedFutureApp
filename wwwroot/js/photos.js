export function initPhotos() {
    const uploadBtn = document.getElementById("photoUploadBtn");
    const fileInput = document.getElementById("photoFileInput");
    const container = document.getElementById("photoContainer");
    const albumSelect = document.getElementById("albumSelect");
    const albumFilter = document.getElementById("albumFilter");

    if (!uploadBtn || !fileInput || !container) return;

    let allPhotos = [];
    let currentFilter = "";

    async function loadAlbums() {
        try {
            const res = await fetch("/api/album");
            const albums = await res.json();

            if (albumSelect) {
                albumSelect.innerHTML = '<option value="">No Album</option>';
                albums.forEach(a => {
                    const opt = document.createElement("option");
                    opt.value = a.id ?? a.Id; // backend'e göre
                    opt.textContent = a.name ?? a.Name;
                    albumSelect.appendChild(opt);
                });
            }

            if (albumFilter) {
                albumFilter.innerHTML = '<option value="">All Photos</option>';
                albums.forEach(a => {
                    const opt = document.createElement("option");
                    opt.value = a.id ?? a.Id;
                    const count = a.photoCount ?? a.PhotoCount ?? 0;
                    opt.textContent = `${a.name ?? a.Name} (${count})`;
                    albumFilter.appendChild(opt);
                });
            }
        } catch (err) {
            console.error("Error loading albums:", err);
        }
    }

    async function loadPhotos() {
        try {
            const res = await fetch("/api/photo");
            allPhotos = await res.json();
            displayPhotos();
        } catch (err) {
            console.error("Error loading photos:", err);
        }
    }

    function displayPhotos() {
        container.innerHTML = "";
        let photosToShow = allPhotos;
        if (currentFilter) {
            photosToShow = allPhotos.filter(p => (p.albumId ?? p.AlbumId) == parseInt(currentFilter));
        }
        if (!photosToShow.length) {
            container.innerHTML = '<p style="text-align:center;color:#999;">No photos yet</p>';
            return;
        }
        photosToShow.forEach(photo => addPhotoToUI(photo));
    }

    function addPhotoToUI(photo) {
        const div = document.createElement("div");
        div.className = "list-item";

        const albumBadge = (photo.albumName ?? photo.AlbumName)
            ? `<span class="album-badge">${photo.albumName ?? photo.AlbumName}</span>` : "";

        div.innerHTML = `
            <img src="${photo.filePath ?? photo.FilePath}" style="max-width:150px;border-radius:10px;">
            <div style="display:flex;gap:10px;align-items:center;">
                <button class="button btn-pink deleteBtn" data-id="${photo.id ?? photo.Id}">Delete</button>
                ${albumBadge}
            </div>
        `;
        container.appendChild(div);

        div.querySelector(".deleteBtn").addEventListener("click", async () => {
            const id = photo.id ?? photo.Id;
            if (!confirm("Delete this photo?")) return;
            try {
                await fetch(`/api/photo/${id}`, { method: "DELETE" });
                div.remove();
                loadAlbums();
            } catch (err) {
                console.error("Delete error:", err);
                alert("Error deleting photo");
            }
        });
    }

    uploadBtn.addEventListener("click", async () => {
        const file = fileInput.files[0];
        if (!file) return alert("Please select a photo");

        const albumId = albumSelect?.value || null;

        const formData = new FormData();
        formData.append("Photo", file);
        if (albumId) formData.append("AlbumId", albumId);

        try {
            const res = await fetch("/api/photo/upload", { method: "POST", body: formData });
            const data = await res.json();
            if (data.id ?? data.Id) {
                addPhotoToUI(data);
                fileInput.value = "";
                if (albumSelect) albumSelect.value = "";
                loadAlbums();
                alert("Photo uploaded successfully!");
            }
        } catch (err) {
            console.error("Upload error:", err);
            alert("Error uploading photo");
        }
    });

    if (albumFilter) {
        albumFilter.addEventListener("change", e => {
            currentFilter = e.target.value;
            displayPhotos();
        });
    }

    loadAlbums().then(loadPhotos);
}

window.initPhotos = initPhotos;
