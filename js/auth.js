document.addEventListener("DOMContentLoaded", () => {
  const lf = document.getElementById("loginForm"),
    sf = document.getElementById("signupForm");
  if (lf) {
    lf.addEventListener("submit", (e) => {
      e.preventDefault();
      ensureAdmin();
      const emailEl = document.getElementById("email"),
        passEl = document.getElementById("password"),
        err = document.getElementById("error");
      const u = getUsers().find(
        (x) =>
          String(x.email).toLowerCase() ===
            emailEl.value.trim().toLowerCase() && x.password === passEl.value,
      );
      if (!u) {
        err.textContent = "Invalid email or password.";
        return;
      }
      localStorage.setItem(DB.current, u.id);
      window.location.href =
        u.role === "admin" ? "admin.html" : "dashboard.html";
    });
  }
  if (sf) {
    sf.addEventListener("submit", (e) => {
      e.preventDefault();
      const nameEl = document.getElementById("name"),
        emailEl = document.getElementById("email"),
        passEl = document.getElementById("password"),
        roleEl = document.getElementById("role"),
        areaEl = document.getElementById("area"),
        err = document.getElementById("error");
      const users = getUsers();
      if (
        users.some(
          (x) =>
            String(x.email).toLowerCase() ===
            emailEl.value.trim().toLowerCase(),
        )
      ) {
        err.textContent = "Email already registered.";
        return;
      }
      const u = {
        id: "U" + Date.now(),
        name: nameEl.value.trim(),
        email: emailEl.value.trim(),
        password: passEl.value,
        role: roleEl.value,
        area: areaEl.value.trim(),
        createdAt: new Date().toISOString(),
      };
      users.push(u);
      localStorage.setItem(DB.users, JSON.stringify(users));
      localStorage.setItem(DB.current, u.id);
      window.location.href = "dashboard.html";
    });
  }
});
