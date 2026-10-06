function renderAvailable() {
  expireDonations();
  const searchEl = document.getElementById("search"),
    catEl = document.getElementById("filterCategory"),
    sortEl = document.getElementById("sort"),
    list = document.getElementById("foodList");
  const q = searchEl.value.trim().toLowerCase(),
    cat = catEl.value,
    sort = sortEl.value;
  let d = getDonations().filter((x) => x.status === "available");
  d = d.filter((x) =>
    `${x.foodName} ${x.location} ${x.category} ${x.description || ""}`
      .toLowerCase()
      .includes(q),
  );
  if (cat) d = d.filter((x) => x.category === cat);
  if (sort === "priority") d.sort((a, b) => priority(b) - priority(a));
  if (sort === "expiry") d.sort((a, b) => deadlineOf(a) - deadlineOf(b));
  if (sort === "quantity")
    d.sort((a, b) => Number(b.quantity) - Number(a.quantity));
  const u = currentUser();
  list.innerHTML = d.length
    ? d
        .map((x) =>
          foodCard(x, !!u && u.role !== "donor" && u.role !== "admin"),
        )
        .join("")
    : `<div class="empty">🍃 No available food matches your search.</div>`;
}
document.addEventListener("DOMContentLoaded", () => {
  const u = requireLogin();
  if (!u) return;
  ["search", "filterCategory", "sort"].forEach((id) =>
    document.getElementById(id).addEventListener("input", renderAvailable),
  );
  renderAvailable();
  setInterval(renderAvailable, 60000);
});
