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

    // SHOW/HIDE LIST
    toggleBtn.addEventListener("click", () => {
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
        .then(items => items.forEach(item => addToUI(item)));

    // ADD NEW WISHLIST ITEM
    addBtn?.addEventListener("click", async () => {
        const title = input.value.trim();
        const emoji = emojiInput.value.trim() || "💖";
        const date = dateInput.value || null;

        if (!title) return;

        const res = await fetch("/api/wishlist", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                title: emoji + " " + title,
                eventDate: date,
                photoId: null
            })
        });

        const data = await res.json();
        addToUI(data);

        input.value = "";
        emojiInput.value = "";
        dateInput.value = "";
    });

    function addToUI(item) {
        const div = document.createElement("div");
        div.className = "list-item";

        div.innerHTML = `
            <span>${item.isDone ? "✅" : ""} ${item.title}
            ${item.eventDate ? `<small>(${item.eventDate})</small>` : ""}</span>

            <div class="btn-group">
                <button class="button btn-pink doneBtn">Done</button>
                <button class="button btn-pink deleteBtn">Delete</button>
            </div>
        `;

        const today = new Date().toISOString().split("T")[0];

        if (item.eventDate < today) containerPast.appendChild(div);
        else if (item.eventDate === today) containerToday.appendChild(div);
        else containerFuture.appendChild(div);

        // DONE BUTTON
        div.querySelector(".doneBtn").addEventListener("click", async () => {
            await fetch(`/api/wishlist/${item.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: item.title,
                    eventDate: item.eventDate,
                    isDone: true,
                    photoId: item.photoId
                })
            });

            div.querySelector("span").innerHTML = "✅ " + item.title;
        });

        // DELETE BUTTON
        div.querySelector(".deleteBtn").addEventListener("click", async () => {
            await fetch(`/api/wishlist/${item.id}`, { method: "DELETE" });
            div.remove();
        });
    }
}
