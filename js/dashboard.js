document.addEventListener("DOMContentLoaded", () => {
  const u = requireLogin();
  if (!u) return;
  document.getElementById("welcome").textContent = `Hello, ${u.name} 👋`;
  document.getElementById("avatar").textContent = u.name[0].toUpperCase();
  const d = getDonations(),
    c = getClaims(),
    mine = d.filter((x) => x.donorId === u.id),
    claims = c.filter((x) => x.recipientId === u.id);
  const saved = mine
    .filter((x) => ["claimed", "collected", "distributed"].includes(x.status))
    .reduce((s, x) => s + Number(x.quantity || 0), 0);
  const meals = mine
    .filter((x) => x.status !== "expired")
    .reduce((s, x) => s + Number(x.servings || 0), 0);
  document.getElementById("myDonations").textContent = mine.length;
  document.getElementById("myClaims").textContent = claims.length;
  document.getElementById("foodSaved").textContent = saved + " kg";
  document.getElementById("meals").textContent = meals;
  const urgent = d.filter(
    (x) => x.status === "available" && deadlineOf(x) - Date.now() < 10800000,
  );
  document.getElementById("alertBox").innerHTML = urgent.length
    ? `<div class="info-banner">🚨 <b>${urgent.length} urgent donation(s)</b> are expiring soon. <a href="available.html">Rescue them →</a></div>`
    : "";
  document.getElementById("foodList").innerHTML =
    d
      .filter((x) => x.status === "available")
      .sort((a, b) => priority(b) - priority(a))
      .slice(0, 6)
      .map((x) => foodCard(x, u.role !== "donor" && u.role !== "admin"))
      .join("") ||
    `<div class="empty">No food available yet. <a href="donate.html">Post a donation.</a></div>`;
  document.getElementById("activity").innerHTML =
    mine
      .slice(-6)
      .reverse()
      .map(
        (x) =>
          `<div class="timeline-item">🍱 <b>${esc(x.foodName)}</b> — <span class="badge ${x.status}">${x.status}</span> <span class="muted">${new Date(x.postedAt).toLocaleString()}</span></div>`,
      )
      .join("") || '<div class="timeline-item">No donation activity yet.</div>';
});
