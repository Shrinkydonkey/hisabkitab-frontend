// ===============================
// MAIN APP SCRIPT
// ===============================

document.addEventListener("DOMContentLoaded", function () {

  /* ===============================
     PROTECT PAGES
  =============================== */

  const currentPage = window.location.pathname;
  const publicPages = ["login.html", "signup.html"];
  const specialPages = ["payment.html"];

  const isPublic = publicPages.some(page => currentPage.includes(page));
  const isSpecial = specialPages.some(page => currentPage.includes(page));

  const token = localStorage.getItem("token");

  if (!isPublic && !isSpecial && !token) {
    window.location.href = "login.html";
    return;
  }

  /* ===============================
     SHOW WELCOME NAME
  =============================== */

  const user = JSON.parse(localStorage.getItem("user"));

  if (user) {
    const welcomeText = document.getElementById("welcomeText");
    const authLinks = document.getElementById("authLinks");

    if (welcomeText) {
      welcomeText.textContent = "Welcome, " + user.name;
    }

    if (authLinks) {
      authLinks.style.display = "none";
    }
  }

  /* ===============================
     LOGIN FORM
  =============================== */

  const loginForm = document.getElementById("loginForm");

  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      try {
        const res = await fetch("https://hisabkitab-backend-g1q6.onrender.com/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (res.ok) {
          localStorage.setItem("token", data.token);
          localStorage.setItem("user", JSON.stringify(data.user));

          alert("Login successful");
          window.location.href = "homepage.html";
        } else {
          alert(data.message);
        }

      } catch (err) {
        alert("Server error");
      }
    });
  }

  /* ===============================
     SIGNUP FORM
  =============================== */

  const signupForm = document.getElementById("signupForm");

  if (signupForm) {
    signupForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const name = document.getElementById("name").value;
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      try {
        const res = await fetch("https://hisabkitab-backend-g1q6.onrender.com/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password })
        });

        const data = await res.json();

        if (res.ok) {
          alert("Signup successful! Please login.");
          window.location.href = "login.html";
        } else {
          alert(data.message);
        }

      } catch (err) {
        alert("Server error");
      }
    });
  }

  /* ===============================
     MEMBERS PAGE - CALCULATE DEBT
  =============================== */

  const membersContainer = document.getElementById("membersContainer");

  if (membersContainer && user) {

    fetch("https://hisabkitab-backend-g1q6.onrender.com/api/payment/all")
      .then(res => res.json())
      .then(payments => {

        const debtMap = {};

        payments.forEach(payment => {

          const paidById = payment.paidBy._id;
          const amount = payment.amountPerPerson;

          payment.paidFor.forEach(person => {

            if (paidById === user.id) {

              // Others owe me
              if (!debtMap[person._id]) {
                debtMap[person._id] = { name: person.name, amount: 0 };
              }

              debtMap[person._id].amount += amount;

            } else if (person._id === user.id) {

              // I owe someone
              if (!debtMap[paidById]) {
                debtMap[paidById] = { name: payment.paidBy.name, amount: 0 };
              }

              debtMap[paidById].amount -= amount;
            }

          });

        });

        renderDebtCards(debtMap);

      })
      .catch(err => console.log("Error loading payments:", err));
  }

});


// ===============================
// RENDER DEBT CARDS
// ===============================

function renderDebtCards(debtMap) {

  const container = document.getElementById("membersContainer");
  container.innerHTML = "";

  if (Object.keys(debtMap).length === 0) {
    container.innerHTML = "<p>No transactions yet.</p>";
    return;
  }

  Object.values(debtMap).forEach(entry => {

    const row = document.createElement("div");
    row.className = "member-row";

    const amountColor =
      entry.amount > 0 ? "#16a34a" :
      entry.amount < 0 ? "#dc2626" :
      "#6b7280";

    const status =
      entry.amount > 0 ? "owes you" :
      entry.amount < 0 ? "you owe" :
      "settled";

    row.innerHTML = `
      <span>${entry.name}</span>
      <span style="color:${amountColor}; font-weight:bold;">
        ₹${Math.abs(entry.amount)} (${status})
      </span>
    `;

    container.appendChild(row);
  });
}


// ===============================
// OTHER FUNCTIONS
// ===============================

function toggleSidebar() {
  document.getElementById("sidebar")?.classList.toggle("active");
}

function selectTime(timeLabel) {
  const section = document.getElementById("membersSection");
  if (section) section.style.display = "block";

  const text = document.getElementById("selectedTimeText");
  if (text) text.textContent = "Selected time: " + timeLabel;
}

function submitSelection() {
  const selected = [];
  const checkboxes = document.querySelectorAll("input[type='checkbox']:checked");

  checkboxes.forEach(box => selected.push(box.value));

  if (selected.length === 0) {
    alert("Please select at least one member");
    return;
  }

  window.location.href = "payment.html";
}