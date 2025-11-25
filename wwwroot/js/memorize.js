// memorize.js
export function initMemorize() {
    const modal = document.getElementById("photoModal");
    const noteBox = document.getElementById("photoNoteBox");
    const saveBtn = document.getElementById("saveNoteBtn");

    if (!modal || !noteBox || !saveBtn) return;

    let currentPhotoId = null;

    // Foto modalı değiştiğinde tetiklenecek event
    window.updatePhotoNote = async function (photoId) {
        currentPhotoId = photoId;

        try {
            const res = await fetch(`/api/photo/${photoId}`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const photo = await res.json();

            noteBox.value = photo.Note ?? "";
        } catch (err) {
            console.error("Note load failed:", err);
            noteBox.value = "";
        }
    };

    saveBtn.addEventListener("click", async () => {
        if (!currentPhotoId) return;

        try {
            const res = await fetch(`/api/photo/${currentPhotoId}/note`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ Note: noteBox.value })
            });

            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            alert("Note saved!");
        } catch (err) {
            console.error("Save failed:", err);
            alert("Could not save note.");
        }
    });
}

