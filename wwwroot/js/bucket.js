export function initBucket() {
    const addBtn = document.getElementById("bucketAddBtn");
    const emojiInput = document.getElementById("bucketEmoji");
    const input = document.getElementById("bucketInput");
    const dateInput = document.getElementById("bucketDate");

    const containerPast = document.getElementById("bucketPastContainer");
    const containerToday = document.getElementById("bucketTodayContainer");
    const containerFuture = document.getElementById("bucketFutureContainer");

    const toggleBtn = document.getElementById("bucketToggleBtn");
    const sections = document.getElementById("bucketSections");

    // --- SHOW/HIDE ---
    toggleBtn.addEventListener("click", () => {
        if (sections.style.display === "none") {
            sections.style.display = "block";
            toggleBtn.textContent = "Hide List";
        } else {
            sections.style.display = "none";
            toggleBtn.textContent = "Show List";
        }
    });

    // --- LOAD EXISTING ---
    fetch("/api/bucket")
        .then(res => res.json())
        .then(items => items.forEach(item => addToUI(item)));

    // --- ADD NEW BUCKET ITEM ---
    addBtn?.addEventListener("click", async () => {
        const title = input.value.trim();
        const emoji = emojiInput.value.trim() || "✨";
        const targetDate = dateInput.value || null;

        if (!title) return;

        const res = await fetch("/api/bucket", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: emoji + " " + title, targetDate })
        });

        const data = await res.json();
        addToUI(data);

        input.value = "";
        dateInput.value = "";
        emojiInput.value = "";
    });

    function addToUI(item) {
        const div = document.createElement("div");
        div.className = "list-item";

        div.innerHTML = `
            <span>${item.isDone ? "✅" : ""} ${item.title} 
            ${item.targetDate ? `<small>(${item.targetDate})</small>` : ""}</span>

            <div class="btn-group">
                <button class="button btn-pink doneBtn">Done</button>
                <button class="button btn-pink deleteBtn">Delete</button>
            </div>
        `;

        const today = new Date().toISOString().split("T")[0];

        if (item.targetDate < today) containerPast.appendChild(div);
        else if (item.targetDate === today) containerToday.appendChild(div);
        else containerFuture.appendChild(div);

        // DONE BUTTON
        div.querySelector(".doneBtn").addEventListener("click", async () => {
            await fetch(`/api/bucket/${item.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: item.title,
                    targetDate: item.targetDate,
                    isDone: true
                })
            });

            div.querySelector("span").innerHTML = "✅ " + item.title;
        });

        // DELETE BUTTON
        div.querySelector(".deleteBtn").addEventListener("click", async () => {
            await fetch(`/api/bucket/${item.id}`, { method: "DELETE" });
            div.remove();
        });
    }
}
