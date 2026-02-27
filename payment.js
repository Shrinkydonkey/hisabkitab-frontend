document.addEventListener("DOMContentLoaded", function () {

  const members = JSON.parse(localStorage.getItem("selectedMembers")) || [];
  const totalAmount = localStorage.getItem("totalAmount") || 0;
  const selectedTime = localStorage.getItem("selectedTime") || "Not Selected";
  const user = JSON.parse(localStorage.getItem("user"));

  const summary = document.getElementById("summary");
  const reader = document.getElementById("reader");

  if (!members.length || totalAmount == 0) {
    summary.innerHTML = "<p>No payment data found.</p>";
    return;
  }

  summary.innerHTML = `
    <p><strong>Time:</strong> ${selectedTime}</p>
    <p><strong>Total Members:</strong> ${members.length}</p>
    <p style="font-size:18px; font-weight:bold; color:#16a34a;">
      Total Amount: ₹${totalAmount}
    </p>
  `;

  // ===============================
  // CHECK IF RETURNED FROM UPI
  // ===============================

  if (localStorage.getItem("paymentInProgress") === "true") {

    localStorage.removeItem("paymentInProgress");
    reader.style.display = "none";

    summary.innerHTML += `
      <div style="margin-top:20px;">
        <p><strong>Did you complete the payment?</strong></p>
        <button id="confirmBtn">Yes, Completed</button>
        <button id="cancelBtn">Cancel</button>
      </div>
    `;

    document.getElementById("confirmBtn").addEventListener("click", savePayment);

    document.getElementById("cancelBtn").addEventListener("click", () => {
      window.location.href = "homepage.html";
    });

    return;
  }

  
  // ===============================
  // START QR SCANNER
  // ===============================

  const html5QrCode = new Html5Qrcode("reader");
  let hasRedirected = false;

  function onScanSuccess(decodedText) {

    if (hasRedirected) return;
    hasRedirected = true;

    html5QrCode.stop().catch(err => console.log(err));

    if (decodedText.startsWith("upi://")) {

      const url = new URL(decodedText.replace("upi://pay?", "https://dummy?"));
      const payee = url.searchParams.get("pa");
      const name = url.searchParams.get("pn") || "CabDriver";

      const cleanUpiLink =
        `upi://pay?pa=${payee}&pn=${encodeURIComponent(name)}&am=${totalAmount}&cu=INR`;

      localStorage.setItem("paymentInProgress", "true");

      setTimeout(() => {
        window.location.href = cleanUpiLink;
      }, 300);

    } else {
      alert("Scanned QR is not valid UPI.");
      hasRedirected = false;
    }
  }

  function onScanFailure(error) {}

  html5QrCode.start(
    { facingMode: "environment" },
    { fps: 10, qrbox: 250 },
    onScanSuccess,
    onScanFailure
  ).catch(err => console.log("Camera error:", err));

});


// ===============================
// SAVE PAYMENT
// ===============================

async function savePayment() {

  const user = JSON.parse(localStorage.getItem("user"));
  const selectedMembers = JSON.parse(localStorage.getItem("selectedMembers"));
  const totalAmount = localStorage.getItem("totalAmount");
  const selectedTime = localStorage.getItem("selectedTime");

  let amountPerPerson =
    selectedTime.includes("Morning") ? 60 : 65;

  try {

    await fetch("https://hisabkitab-backend-g1q6.onrender.com/api/payment/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        paidBy: user.id,
        paidFor: selectedMembers,
        amountPerPerson,
        totalAmount,
        time: selectedTime
      })
    });

    // Clear storage
    localStorage.removeItem("selectedMembers");
    localStorage.removeItem("totalAmount");
    localStorage.removeItem("selectedTime");

    // 🔥 Now redirect to homepage
    window.location.href = "homepage.html";

  } catch (error) {
    alert("Error saving payment");
  }
}