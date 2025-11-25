export function initPhotos() {
    let currentPhotos = [];
    let currentIndex = 0;

    // ------------------------------
    // Modal elementleri fonksiyon içinde
    // ------------------------------
    const modal = document.getElementById("photoModal");
    const modalImg = document.getElementById("modalImage");
    const photoInfo = document.getElementById("photoInfo");
    const photoDate = document.getElementById("photoDate");
    const closeModal = document.getElementById("closeModal");
    const prevBtn = document.getElementById("prevPhoto");
    const nextBtn = document.getElementById("nextPhoto");
    const saveNoteBtn = document.getElementById("saveNote");
    const noteInput = document.getElementById("modalNote");

    const uploadBtn = document.getElementById("photoUploadBtn");
    const fileInput = document.getElementById("photoFileInput");
    const memorizeText = document.getElementById("memorizeText");
    const unassignedContainer = document.getElementById("unassignedPhotoContainer");
    const music = document.getElementById("bgMusic");

    if (!uploadBtn) return console.warn("Upload button not found!");

    if (music) music.play().catch(() => console.log("Autoplay blocked"));

    loadUnassignedPhotos();

    uploadBtn.addEventListener("click", async () => {
        if (!fileInput.files.length) return alert("Please select a photo");

        const note = memorizeText.value.trim();
        const formData = new FormData();
        formData.append("Photo", fileInput.files[0]);
        if (note) formData.append("Note", note);

        console.log("Uploading..."); // isteğin tetiklendiğini görmek için

        try {
            const res = await fetch("/api/photo/upload", { method: "POST", body: formData });
            const data = await res.json();
            console.log(data); // sunucudan gelen cevabı görmek için
            if (data.id) {
                alert("Photo and note uploaded successfully!");
                fileInput.value = "";
                memorizeText.value = "";
                addPhotoToUI(unassignedContainer, data);
            }
        } catch (err) {
            console.error(err);
            alert("Error uploading photo and note");
        }
    });

    async function loadUnassignedPhotos() {
        try {
            const res = await fetch("/api/photo/unassigned");
            const photos = await res.json();
            unassignedContainer.innerHTML = "";
            photos.forEach(photo => addPhotoToUI(unassignedContainer, photo));
        } catch (err) {
            console.error(err);
        }
    }

    function addPhotoToUI(container, photo) {
        const img = document.createElement("img");
        img.src = photo.filePath;
        img.alt = photo.note || "";
        img.className = "grid-photo";
        img.setAttribute("draggable", true);
        img.dataset.id = photo.id;

        img.addEventListener("click", () => openModal([photo], 0));

        img.addEventListener("dragstart", e => {
            e.dataTransfer.setData("photoId", photo.id);
        });

        container.appendChild(img);
    }


    // -----------------------------
    // Modal işlemleri
    // -----------------------------
    function openModal(photos, index) {
        currentPhotos = photos;
        currentIndex = index;
        showPhoto();

        modal.style.display = "block";
        prevBtn.style.display = "inline-block";
        nextBtn.style.display = "inline-block";
    }

    function closeModalFunc() {
        modal.style.display = "none";
        prevBtn.style.display = "none";
        nextBtn.style.display = "none";
    }

    function showPhoto() {
        const photo = currentPhotos[currentIndex];
        modalImg.src = photo.filePath;
        photoInfo.textContent = photo.note || "";
        photoDate.textContent = new Date(photo.uploadedAt).toLocaleString();
        noteInput.value = photo.note || "";
    }

    prevBtn.addEventListener("click", () => {
        if (currentIndex > 0) currentIndex--;
        showPhoto();
    });

    nextBtn.addEventListener("click", () => {
        if (currentIndex < currentPhotos.length - 1) currentIndex++;
        showPhoto();
    });

    closeModal.addEventListener("click", closeModalFunc);

    saveNoteBtn.addEventListener("click", async () => {
        const photo = currentPhotos[currentIndex];
        const newNote = noteInput.value.trim();

        try {
            const res = await fetch(`/api/photo/${photo.id}/note`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ note: newNote })
            });

            if (res.ok) {
                photo.note = newNote;
                photoInfo.textContent = newNote;
                alert("Note updated!");
            } else {
                alert("Failed to save note");
            }
        } catch (err) {
            console.error(err);
            alert("Error saving note");
        }
    });
}