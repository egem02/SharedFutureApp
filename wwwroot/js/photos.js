export function initPhotos() {
    const uploadBtn = document.getElementById("photoUploadBtn");
    const fileInput = document.getElementById("photoFileInput");
    const container = document.getElementById("photoContainer");

    // Load existing photos
    fetch("/api/photo")
        .then(res => res.json())
        .then(items => {
            items.forEach(photo => addPhotoToUI(photo));
        });

    uploadBtn?.addEventListener("click", async () => {
        const file = fileInput.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("Photo", file);

        const res = await fetch("/api/photo/upload", { method: "POST", body: formData });
        const data = await res.json();
        addPhotoToUI(data);
        fileInput.value = "";
    });

    function addPhotoToUI(photo) {
        const div = document.createElement("div");
        div.className = "list-item";
        div.innerHTML = `<img src="${photo.filePath}" style="max-width:150px; border-radius:10px;">
                             <button class="button btn-pink deleteBtn" data-id="${photo.id}">Delete</button>`;
        container.appendChild(div);

        div.querySelector(".deleteBtn").addEventListener("click", async () => {
            await fetch(`/api/photo/${photo.id}`, { method: "DELETE" });
            div.remove();
        });
    }
}
