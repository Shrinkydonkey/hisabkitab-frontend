function selectTime(timeLabel) {

  const section = document.getElementById("membersSection");
  const text = document.getElementById("selectedTimeText");
  const memberList = document.getElementById("memberList");

  if (section) section.style.display = "block";
  if (text) text.textContent = "Selected time: " + timeLabel;

  const loggedInUser = JSON.parse(localStorage.getItem("user"));
  if (!loggedInUser) return;

  fetch("https://hisabkitab-backend-g1q6.onrender.com/api/auth/users")
    .then(res => res.json())
    .then(users => {

      memberList.innerHTML = "";

      users.forEach(user => {

        // Exclude current logged-in user
        if (user._id !== loggedInUser.id) {

          const label = document.createElement("label");
          label.className = "member-item";

          label.innerHTML = `
            <input type="checkbox" value="${user._id}" />
            <span>${user.name}</span>
          `;

          memberList.appendChild(label);
        }

      });

    })
    .catch(err => console.log("Error loading members:", err));
}

function submitSelection() {

  const selected = [];
  const checkboxes = document.querySelectorAll("input[type='checkbox']:checked");
  const selectedTime = document.getElementById("selectedTimeText").textContent;

  checkboxes.forEach(box => {
    selected.push(box.value);
  });

  if (selected.length === 0) {
    alert("Please select at least one member");
    return;
  }

  let amountPerPerson = 0;

  if (selectedTime.includes("Morning")) {
    amountPerPerson = 60;
  } else if (selectedTime.includes("Evening")) {
    amountPerPerson = 65;
  }

  const totalAmount = selected.length * amountPerPerson;

  // Store in localStorage
  localStorage.setItem("selectedMembers", JSON.stringify(selected));
  localStorage.setItem("selectedTime", selectedTime);
  localStorage.setItem("totalAmount", totalAmount);

  window.location.href = "payment.html";
}