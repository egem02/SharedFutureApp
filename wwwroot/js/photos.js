
async function addPhotoToSelectedAlbum() {
    const albumSelect = document.getElementById('albumSelect');
    const albumId = albumSelect ? albumSelect.value : null;

    // Fotoğraf ID'sini DOM elementinde sakladık.
    const currentPhotoIdInModal = albumSelect ? parseInt(albumSelect.dataset.photoId, 10) : null;

    if (!albumId) {
        console.warn("Lütfen bir albüm seçin!");
        // Burada kullanıcıya bir toast/custom modal ile uyarı gösterilebilir.
        return;
    }

    if (isNaN(currentPhotoIdInModal) || currentPhotoIdInModal === 0) {
        console.error("Hata: Modalda aktif fotoğraf ID'si bulunamadı.");
        return;
    }

    try {
        const response = await fetch('/api/photos/add-to-album', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                PhotoId: currentPhotoIdInModal,
                AlbumId: parseInt(albumId, 10)
            })
        });

        const result = await response.json();

        if (response.ok) {
            console.log("Albüm İşlemi Başarılı:", result.message);
            // Başarılı geri bildirim gösterimi
        } else {
            console.error("Albüm İşlemi Başarısız:", result.message);
            // Hata geri bildirimi gösterimi
        }

    } catch (error) {
        console.error('Albüme ekleme sırasında beklenmedik hata:', error);
    }
}

/**
 * Tüm albümleri API'den çeker ve dropdown (select) elementini doldurur.
 */
async function loadAlbumsAndPopulateDropdown(albumSelectElement) {
    if (!albumSelectElement) return;

    try {
        // Not: Controller'da /api/albums endpoint'i olduğunu varsayıyoruz.
        const response = await fetch('/api/albums');
        if (!response.ok) throw new Error("Albüm listesi yüklenemedi.");

        // Albüm verilerinin [ {id: 1, name: "Yaz 2024"} ] formatında olduğunu varsayıyoruz.
        const albums = await response.json();

        albumSelectElement.innerHTML = '<option value="" disabled selected>Albüme Ekle...</option>';

        albums.forEach(album => {
            const option = document.createElement('option');
            // Not: C# backend'den gelen JSON'da PascalCase (Id, Name) ise, 
            // burası küçük harf (id, name) olmalıdır (default JSON serializer ayarı).
            option.value = album.id || album.Id;
            option.text = album.name || album.Name;
            albumSelectElement.appendChild(option);
        });

    } catch (error) {
        console.error("Albüm listesi yüklenirken hata oluştu:", error);
    }
}
export function initPhotos() {
    console.log("Photo Module: initPhotos function is running. DOM listeners attaching.");

    let currentPhotos = [];
    let currentIndex = 0;
    // Bu global değişkenler artık sadece modal gezinme için yerel olarak kullanılıyor.
    let currentPhotoId = 0;
    let nextPhotoId = 0;
    let prevPhotoId = 0;

    // --- DOM Elementlerini initPhotos çalışır çalışmaz Yakalama ---

    // Modal ve Diğer Elementler
    const modal = document.getElementById("photoModal");
    const modalImg = document.getElementById("modalImage");
    const photoInfo = document.getElementById("photoInfo");
    const photoDate = document.getElementById("photoDate");
    const closeModal = document.getElementById("closeModal");
    const prevBtn = document.getElementById("prevPhoto");
    const nextBtn = document.getElementById("nextPhoto");
    const saveNoteBtn = document.getElementById("saveNote");
    const noteInput = document.getElementById("modalNote");

    // YENİ ALBÜM ELEMENTLERİ
    const albumSelect = document.getElementById("albumSelect");


    // Temel elementler
    const uploadBtn = document.getElementById("photoUploadBtn");
    const fileInput = document.getElementById("photoFileInput");
    const memorizeText = document.getElementById("memorizeText");
    const unassignedContainer = document.getElementById("unassignedPhotoContainer");
    const music = document.getElementById("bgMusic");

    // --- KRİTİK HATA KONTROLÜ ---
    if (!uploadBtn || !fileInput || !memorizeText || !unassignedContainer || !modal) {
        console.error("KRİTİK HATA: Photos sayfasında tüm temel elementler bulunamadı. JS çalışmayı durdurdu.");
        return;
    }
    if (!albumSelect) {
        console.warn("UYARI: Albüm Seçim Kutusu (albumSelect) bulunamadı. Albüm ekleme özelliği çalışmayacak.");
    }


    // Müzik varsa otomatik oynatmayı dener
    if (music) music.play().catch(() => console.log("Autoplay blocked"));

    // Sayfa yüklendiğinde atanmamış fotoğrafları yükle
    loadUnassignedPhotos(unassignedContainer);

    // --- Olay Dinleyicilerini Atama (Artık Dengesiz Bloklar İçinde DEĞİL) ---

    // 1. Yükleme Butonu
    uploadBtn.addEventListener("click", handlePhotoUpload);
    console.log("DEBUG: photoUploadBtn dinleyicisi başarıyla atandı.");

    // 2. Modal Kapama
    closeModal.addEventListener("click", closeModalFunc);
    window.onclick = (event) => {
        if (event.target == modal) {
            closeModalFunc();
        }
    };

    // 3. Modal Gezinme (Mevcut dizin mantığı korunmuştur)
    prevBtn.addEventListener("click", () => {
        if (currentIndex > 0) {
            currentIndex--;
            showPhoto();
        }
    });
    nextBtn.addEventListener("click", () => {
        if (currentIndex < currentPhotos.length - 1) {
            currentIndex++;
            showPhoto();
        }
    });

    // 4. Not Kaydetme
    saveNoteBtn.addEventListener("click", async () => {
        const photo = currentPhotos[currentIndex];
        const newNote = noteInput.value.trim();

        if (!photo || !photo.Id) {
            console.error("Hata: Kaydedilecek fotoğraf ID'si bulunamadı.");
            return;
        }

        try {
            const res = await fetch(`/api/photo/${photo.Id}/note`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newNote)
            });

            if (res.ok) {
                photo.Note = newNote;
                updateGridCardNote(photo.Id, newNote);
                photoInfo.textContent = newNote;
                noteInput.value = newNote;
                console.log("Note updated successfully!");
            } else {
                console.error(`Failed to save note. Status: ${res.status}`);
            }
        } catch (err) {
            console.error("Error saving note:", err);
        }
    });

    // --- Yükleme İşleyici Fonksiyonu ---
    async function handlePhotoUpload() {
        console.log("Yükleme Butonuna Tıklandı. İşlem Başlatılıyor...");

        if (!fileInput.files.length) {
            console.error("Lütfen yüklemek için bir fotoğraf seçin.");
            return;
        }

        const note = memorizeText.value.trim();
        const formData = new FormData();
        formData.append("photo", fileInput.files[0]);
        if (note) formData.append("note", note);

        try {
            const res = await fetch("/api/photo/upload", {
                method: "POST",
                body: formData
            });

            if (!res.ok) throw new Error(`Upload failed with status: ${res.status}`);

            const data = await res.json();
            console.log("Uploaded photo response:", data);

            if (data.Id) {
                fileInput.value = "";
                memorizeText.value = "";

                // Başarılı yüklemeden sonra container'ı temizleyip yeniden yükle
                await loadUnassignedPhotos(unassignedContainer);
                console.log("Photo uploaded and list refreshed successfully!");
            }
        } catch (err) {
            console.error("Upload Error:", err);
            console.error("Error uploading photo: " + err.message);
        }
    }

    // --- Fonksiyon Tanımlamaları ---

    // UI'da tıklanınca modalı açar
    function showPhotoModal(photo) {
        // Tıklanan fotoğrafı currentPhotos listesinde bul
        const index = currentPhotos.findIndex(p => p.Id === photo.Id);
        if (index !== -1) {
            openModal(currentPhotos, index);
        }
    }


    async function loadUnassignedPhotos(container) {
        try {
            const res = await fetch("/api/photo/unassigned");

            if (!res.ok) {
                throw new Error(`API isteği başarısız oldu: ${res.status}`);
            }

            const photos = await res.json();
            currentPhotos = photos; // Gezinme için tüm fotoğraflar global değişkene atanır

            console.log("API'den gelen toplam atanmamış fotoğraflar:", photos.length);

            container.innerHTML = "";

            if (photos.length === 0) {
                return;
            }

            photos.forEach(photo => addPhotoToUI(photo));

        } catch (err) {
            console.error("Error loading unassigned photos:", err);
        }
    }

    function addPhotoToUI(photo) {
        if (!photo || !photo.FilePath) {
            console.error("Kritik: Fotoğraf objesi veya FilePath eksik.", photo);
            return;
        }

        const container = document.getElementById('unassignedPhotoContainer');
        const cardDiv = document.createElement('div');
        cardDiv.className = 'photo-card shadow-lg p-2 bg-white rounded-lg transition-transform hover:scale-[1.02] cursor-pointer';
        cardDiv.dataset.id = photo.Id; // PascalCase: Id

        // --- FOTOĞRAF GÖRÜNTÜLEME ALANI ---

        const imgContainer = document.createElement('div');
        imgContainer.className = 'w-full h-40 overflow-hidden flex items-center justify-center bg-gray-100 rounded-md';

        const imgElement = document.createElement('img');
        imgElement.className = 'object-cover w-full h-full rounded-md';

        // Dosya yoluna tarayıcı protokolünü otomatik ekle.
        const baseUrl = window.location.origin;
        imgElement.src = `${baseUrl}${photo.FilePath}`; // PascalCase: FilePath

        imgElement.alt = photo.Note || "Atanmamış Fotoğraf"; // PascalCase: Note

        imgContainer.appendChild(imgElement);

        // --- NOT VE DÜZENLEME ALANI ---

        const noteElement = document.createElement('p');
        noteElement.className = 'mt-2 text-sm text-gray-700 truncate';
        noteElement.textContent = photo.Note || 'Not yok'; // PascalCase: Note
        noteElement.title = photo.Note;

        // Etkileşim için cardDiv'i ayarla
        cardDiv.onclick = () => showPhotoModal(photo); // showPhotoModal'a photo objesini gönder

        cardDiv.appendChild(imgContainer);
        cardDiv.appendChild(noteElement);

        container.appendChild(cardDiv);
    }

    function openModal(photos, index) {
        currentPhotos = photos;
        currentIndex = index;

        // YENİ ENTEGRASYON: Modal açıldığında albümleri yükle
        if (albumSelect && typeof loadAlbumsAndPopulateDropdown === 'function') {
            loadAlbumsAndPopulateDropdown(albumSelect);
        } else {
            console.warn("loadAlbumsAndPopulateDropdown fonksiyonu globalde tanımlı değil veya albumSelect bulunamadı.");
        }

        showPhoto();

        // Modal'ı görünür yap
        modal.style.display = "flex";
    }

    function closeModalFunc() {
        modal.style.display = "none";
    }

    function showPhoto() {
        const photo = currentPhotos[currentIndex];

        if (!photo || !photo.FilePath) {
            modalImg.src = "";
            photoInfo.textContent = "Hata: Fotoğraf yüklenemedi.";
            photoDate.textContent = "Hata: Geçersiz Veri";
            return;
        }

        // imgElement.src'e tam yolu atama (Modal için)
        const baseUrl = window.location.origin;
        modalImg.src = `${baseUrl}${photo.FilePath}`; // PascalCase: FilePath

        photoInfo.textContent = photo.Note || "No note yet."; // PascalCase: Note
        noteInput.value = photo.Note || ""; // PascalCase: Note

        // Tarih formatlama
        try {
            const dateObj = new Date(photo.UploadedAt); // PascalCase: UploadedAt
            photoDate.textContent = isNaN(dateObj.getTime())
                ? "Invalid Date Format"
                : dateObj.toLocaleString('tr-TR', {
                    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                });
        } catch (e) {
            photoDate.textContent = "Date Parsing Error";
            console.error("Tarih ayrıştırma hatası:", e);
        }

        // YENİ ENTEGRASYON: Aktif fotoğraf ID'sini Albüm Dropdown elementinde sakla
        if (albumSelect && photo && photo.Id) {
            // Bu ID, addPhotoToSelectedAlbum global fonksiyonunda kullanılacaktır.
            albumSelect.dataset.photoId = photo.Id;
            albumSelect.value = ""; // Seçimi sıfırla
        }


        // Gezinme butonlarını ayarla
        prevBtn.style.display = currentIndex > 0 ? "inline-block" : "none";
        nextBtn.style.display = currentIndex < currentPhotos.length - 1 ? "inline-block" : "none";
    }

    function updateGridCardNote(id, newNote) {
        // ID'si eşleşen kartı bul
        const cardDiv = document.querySelector(`.photo-card[data-id="${id}"]`);
        if (cardDiv) {
            // Not elementini bul
            const noteElement = cardDiv.querySelector('p.mt-2');
            if (noteElement) {
                noteElement.textContent = newNote || 'Not yok';
                noteElement.title = newNote;
            }
        }
    }

    // initPhotos içinde dışarıya açılacak fonksiyonlar
    return {
        loadUnassignedPhotos,
        showPhotoModal
    };
}