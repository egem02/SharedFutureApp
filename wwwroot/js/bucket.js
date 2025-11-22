export function initBucket() {
    const addBtn = document.getElementById("bucketAddBtn");
    const input = document.getElementById("bucketInput");
    const dateInput = document.getElementById("bucketDate");

    const containerPast = document.getElementById("bucketPastContainer");
    const containerToday = document.getElementById("bucketTodayContainer");
    const containerFuture = document.getElementById("bucketFutureContainer");

    const toggleBtn = document.getElementById("bucketToggleBtn");
    const sections = document.getElementById("bucketSections");

    toggleBtn?.addEventListener("click", () => {
        const style = window.getComputedStyle(sections);
        if (style.display === "none") {
            sections.style.display = "block";
            toggleBtn.textContent = "Hide List";
        } else {
            sections.style.display = "none";
            toggleBtn.textContent = "Show List";
        }
    });


    // Mevcut öğeleri yükle
    fetch("/api/bucket")
        .then(res => res.json())
        .then(items => items.forEach(item => addToUI(item)))
        .catch(err => console.error("Bucket load error:", err));

    // Yeni öğe ekleme
    addBtn?.addEventListener("click", async () => {
        const title = input.value.trim();
        const date = dateInput.value || null;
        if (!title) return;

        try {
            const res = await fetch("/api/bucket", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, targetDate: date })
            });

            if (!res.ok) return console.error("POST failed", res.status);
            const data = await res.json();

            if (!data.id) {
                console.warn("POST sonrası id yok:", data);
                return;
            }

            addToUI(data);
            input.value = "";
            dateInput.value = "";
        } catch (err) {
            console.error(err);
        }
    });

    function addToUI(item) {
        if (!item.id) return; // id yoksa ekleme yapma

        const div = document.createElement("div");
        div.className = "list-item";

        const span = document.createElement("span");
        span.textContent = (item.isDone ? "✅ " : "") + item.title;
        if (item.targetDate) {
            const small = document.createElement("small");
            small.textContent = ` (${new Date(item.targetDate).toLocaleDateString()})`;
            span.appendChild(small);
        }

        const btnGroup = document.createElement("div");
        btnGroup.className = "btn-group";

        const doneBtn = document.createElement("button");
        doneBtn.className = "button btn-pink doneBtn";
        doneBtn.textContent = "Done";

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "button btn-pink deleteBtn";
        deleteBtn.textContent = "Delete";

        btnGroup.appendChild(doneBtn);
        btnGroup.appendChild(deleteBtn);

        div.appendChild(span);
        div.appendChild(btnGroup);

        const today = new Date(); today.setHours(0, 0, 0, 0);
        const itemDate = item.targetDate ? new Date(item.targetDate) : null;
        if (itemDate) itemDate.setHours(0, 0, 0, 0);

        if (!itemDate || itemDate < today) containerPast.appendChild(div);
        else if (itemDate.getTime() === today.getTime()) containerToday.appendChild(div);
        else containerFuture.appendChild(div);

        // DONE BUTTON
        doneBtn.addEventListener("click", async () => {
            try {
                const res = await fetch(`/api/bucket/${item.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ isDone: true, title: item.title, targetDate: item.targetDate })
                });
                if (res.ok) span.textContent = "✅ " + item.title;
            } catch (err) { console.error(err); }
        });

        // DELETE BUTTON
        deleteBtn.addEventListener("click", async () => {
            try {
                const res = await fetch(`/api/bucket/${item.id}`, { method: "DELETE" });
                if (res.ok) div.remove();
            } catch (err) { console.error(err); }
        });
    }
}


