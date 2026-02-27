document.addEventListener("DOMContentLoaded", function () {

  const members = JSON.parse(localStorage.getItem("selectedMembers")) || [];
  const totalAmount = localStorage.getItem("totalAmount") || 0;
  const selectedTime = localStorage.getItem("selectedTime") || "Not Selected";

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
    <p>Scan Cab Driver QR below:</p>
  `;

  // 🚨 Prevent redirect loop
  if (sessionStorage.getItem("upiRedirected")) {
    sessionStorage.removeItem("upiRedirected");
    return; // Do not start scanner again
  }

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

      // Mark redirect
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