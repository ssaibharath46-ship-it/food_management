function renderAdmin() {
  const u = requireAdmin();
  if (!u) return;
  expireDonations();
  const users = getUsers(),
    d = getDonations(),
    c = getClaims();
  document.getElementById("usersCount").textContent = users.length;
  document.getElementById("donationsCount").textContent = d.length;
  document.getElementById("claimsCount").textContent = c.length;
  document.getElementById("savedCount").textContent =
    d
      .filter((x) => ["claimed", "collected", "distributed"].includes(x.status))
      .reduce((s, x) => s + Number(x.quantity || 0), 0) + " kg";
  const dt = document.getElementById("donationTable");
  dt.innerHTML =
    d
      .slice()
      .reverse()
      .map((x) => {
        const donor = users.find((v) => v.id === x.donorId);
        return `<tr><td><b>${esc(x.foodName)}</b><br><small>${esc(x.category)}</small></td><td>${esc(donor?.name || "Unknown")}</td><td>${x.quantity} kg / ${x.servings} meals</td><td>${esc(x.location)}</td><td><span class="badge ${x.status}">${x.status}</span></td><td>${x.status === "available" ? `<button class="btn small" onclick="adminExpire('${x.id}')">Expire</button>` : "—"}</td></tr>`;
      })
      .join("") || `<tr><td colspan="6">No donations yet.</td></tr>`;
  document.getElementById("userTable").innerHTML = users
    .map(
      (x) =>
        `<tr><td>${esc(x.name)}</td><td>${esc(x.email)}</td><td>${x.role}</td><td>${esc(x.area)}</td></tr>`,
    )
    .join("");
}
function adminExpire(id) {
  const d = getDonations(),
    x = d.find((a) => a.id === id);
  if (x) {
    x.status = "expired";
    x.expiredAt = new Date().toISOString();
    saveDonations(d);
    renderAdmin();
    toast("Donation marked expired.");
  }
}
function seedDemo() {
  ensureAdmin();
  let users = getUsers();
  if (!users.some((x) => x.email === "demo@secondserving.com"))
    users.push({
      id: "UDEMO",
      name: "Demo Donor",
      email: "demo@secondserving.com",
      password: "demo123",
      role: "donor",
      area: "Vijayawada",
    });
  localStorage.setItem(DB.users, JSON.stringify(users));
  let d = getDonations();
  d.push({
    id: "FDDEMO" + Date.now(),
    foodName: "Fresh Vegetable Biryani",
    category: "Rice / Biryani",
    quantity: 12,
    servings: 48,
    location: "Vijayawada",
    description: "Freshly packed surplus meals for immediate rescue.",
    postedAt: new Date().toISOString(),
    expiry: new Date(Date.now() + 6 * 3600000).toISOString(),
    status: "available",
    donorId: "UDEMO",
  });
  saveDonations(d);
  renderAdmin();
  toast("Demo donation added.");
}
document.addEventListener("DOMContentLoaded", renderAdmin);
