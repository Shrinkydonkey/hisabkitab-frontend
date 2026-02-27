// ===============================
// PROTECT PAGES + PAGE LOGIC
// ===============================
document.addEventListener("DOMContentLoaded", function () {

  /* ===============================
     Protect pages (except login/signup)
  =============================== */
  const currentPage = window.location.pathname;
  const publicPages = ["login.html", "signup.html"];
  const isPublic = publicPages.some(page => currentPage.includes(page));
  const token = localStorage.getItem("token");

  if (!isPublic && !token) {
    window.location.href = "login.html";
    return;
  }

  /* ===============================
     Show Welcome Name
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
          headers: {
            "Content-Type": "application/json"
          },
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
          headers: {
            "Content-Type": "application/json"
          },
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
   MEMBERS PAGE - SHOW USER CARD
=============================== */
const membersContainer = document.getElementById("membersContainer");

if (membersContainer) {

  const loggedInUser = JSON.parse(localStorage.getItem("user"));

  fetch("https://hisabkitab-backend-g1q6.onrender.com/api/auth/users")
    .then(res => res.json())
    .then(users => {

      membersContainer.innerHTML = "";

      if (!loggedInUser) return;

      // Create Main Card for Logged-in User
      const mainCard = document.createElement("div");
      mainCard.className = "member";

      mainCard.innerHTML = `
        <button class="member-name">
          <span class="member-initial">${loggedInUser.name.charAt(0).toUpperCase()}</span>
          <span class="member-title">${loggedInUser.name}</span>
        </button>
        <div class="member-details" style="display:none;">
          <div id="otherMembersList"></div>
        </div>
      `;

      membersContainer.appendChild(mainCard);

      const detailsDiv = mainCard.querySelector(".member-details");
      const nameBtn = mainCard.querySelector(".member-name");
      const otherMembersList = mainCard.querySelector("#otherMembersList");

      // Toggle card
      nameBtn.addEventListener("click", () => {
        detailsDiv.style.display =
          detailsDiv.style.display === "block" ? "none" : "block";
      });

      // Add Other Members Below
      users.forEach(user => {

        if (user._id !== loggedInUser.id) {

          const row = document.createElement("div");
          row.className = "member-row";

          row.innerHTML = `
            <span>${user.name}</span>
            <span>₹0</span>
          `;

          otherMembersList.appendChild(row);
        }

      });

    })
    .catch(err => console.log("Error loading members:", err));
  }
});

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