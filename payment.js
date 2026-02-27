document.addEventListener("DOMContentLoaded", function () {

  const members = JSON.parse(localStorage.getItem("selectedMembers")) || [];
  const totalAmount = localStorage.getItem("totalAmount") || 0;
  const selectedTime = localStorage.getItem("selectedTime") || "Not Selected";
  const user = JSON.parse(localStorage.getItem("user"));

  const summary = document.getElementById("summary");

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
  // IF RETURNED FROM UPI → SHOW CONFIRM BUTTON
  // ===============================
  if (sessionStorage.getItem("upiRedirected")) {

    sessionStorage.removeItem("upiRedirected");

    document.getElementById("reader").style.display = "none";

    summary.innerHTML += `
      <p style="margin-top:15px;">Did you complete the payment?</p>
      <button id="confirmBtn" style="
        padding:10px 20px;
        background:#16a34a;
        color:white;
        border:none;
        border-radius:8px;
        cursor:pointer;
      ">
        Payment Completed
      </button>
    `;

    document.getElementById("confirmBtn")
      .addEventListener("click", savePayment);

    return;
  }

  summary.innerHTML += `<p>Scan Cab Driver QR below:</p>`;

  // ===============================
  // QR SCANNER LOGIC
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

      sessionStorage.setItem("upiRedirected", "true");

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
    {
      fps: 10,
      qrbox: 250
    },
    onScanSuccess,
    onScanFailure
  ).catch(err => console.log("Camera error:", err));

});


// ===============================
// SAVE PAYMENT TO BACKEND
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
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        paidBy: user.id,
        paidFor: selectedMembers,
        amountPerPerson,
        totalAmount,
        time: selectedTime
      })
    });

    alert("Payment logged successfully");

    localStorage.removeItem("selectedMembers");
    localStorage.removeItem("totalAmount");
    localStorage.removeItem("selectedTime");

    window.location.href = "members.html";

  } catch (error) {
    alert("Error saving payment");
  }

}