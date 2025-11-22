export function initWishlist() {
    const addBtn = document.getElementById("wishlistAddBtn");
    const emojiInput = document.getElementById("wishlistEmoji");
    const input = document.getElementById("wishlistInput");
    const dateInput = document.getElementById("wishlistDate");

    const containerPast = document.getElementById("wishlistPastContainer");
    const containerToday = document.getElementById("wishlistTodayContainer");
    const containerFuture = document.getElementById("wishlistFutureContainer");

    const toggleBtn = document.getElementById("wishlistToggleBtn");
    const sections = document.getElementById("wishlistSections");

    // SHOW/HIDE
    toggleBtn?.addEventListener("click", () => {
        if (sections.style.display === "none") {
            sections.style.display = "block";
            toggleBtn.textContent = "Hide List";
        } else {
            sections.style.display = "none";
            toggleBtn.textContent = "Show List";
        }
    });

    // LOAD EXISTING
    fetch("/api/wishlist")
        .then(res => res.json())
        .then(items => items.forEach(item => addToUI(item)))
        .catch(err => console.error("Wishlist load error:", err));

    // ADD NEW ITEM
    addBtn?.addEventListener("click", async () => {
        const title = input.value.trim();
        const emoji = emojiInput.value.trim() || "💖";
        const date = dateInput.value || null;

        if (!title) return;

        try {
            const res = await fetch("/api/wishlist", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: emoji + " " + title,
                    eventDate: date,
                })
            });

            if (!res.ok) {
                console.error("POST failed:", res.status);
                return;
            }

            const data = await res.json();

            if (!data.id) {
                console.warn("POST sonrası item ID yok", data);
                return;
            }

            addToUI(data);

            input.value = "";
            emojiInput.value = "";
            dateInput.value = "";
        } catch (err) {
            console.error("POST error:", err);
        }
    });

    function addToUI(item) {
        const div = document.createElement("div");
        div.className = "list-item";

        div.innerHTML = `
            <span>${item.isDone ? "✅" : ""} ${item.title}
            ${item.eventDate ? `<small>(${new Date(item.eventDate).toLocaleDateString()})</small>` : ""}</span>

            <div class="btn-group">
                <button class="button btn-pink doneBtn">Done</button>
                <button class="button btn-pink deleteBtn">Delete</button>
            </div>
        `;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const itemDate = item.eventDate ? new Date(item.eventDate) : null;
        if (itemDate) itemDate.setHours(0, 0, 0, 0);

        if (!itemDate || itemDate < today) containerPast.appendChild(div);
        else if (itemDate.getTime() === today.getTime()) containerToday.appendChild(div);
        else containerFuture.appendChild(div);

        // DONE BUTTON
        div.querySelector(".doneBtn").addEventListener("click", async () => {
            if (!item.id) {
                console.warn("Item ID yok, PUT atlanıyor", item);
                return;
            }

            try {
                const res = await fetch(`/api/wishlist/${item.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        title: item.title,
                        eventDate: item.eventDate,
                        isDone: true
                    })
                });

                if (!res.ok) console.error("PUT failed:", res.status);
                else div.querySelector("span").innerHTML = "✅ " + item.title;
            } catch (err) {
                console.error("PUT error:", err);
            }
        });

        const id = item.id || item.Id; // küçük/büyük harf farkı
        div.querySelector(".deleteBtn").addEventListener("click", async () => {
            if (!id) {
                console.warn("Item ID yok, DELETE atlanıyor", item);
                div.remove();
                return;
            }

            try {
                const res = await fetch(`/api/wishlist/${id}`, { method: "DELETE" });
                if (!res.ok) console.error("DELETE failed:", res.status);
                else div.remove();
            } catch (err) {
                console.error("DELETE error:", err);
            }
        });
    }
}
