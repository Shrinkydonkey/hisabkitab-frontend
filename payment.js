document.addEventListener("DOMContentLoaded", function () {

  /* ===============================
     GET DATA FROM LOCAL STORAGE
  =============================== */
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

  /* ===============================
     QR SCANNER LOGIC
  =============================== */

  const html5QrCode = new Html5Qrcode("reader");

  function onScanSuccess(decodedText) {

    console.log("QR Detected:", decodedText);

    html5QrCode.stop().catch(err => console.log(err));

    if (decodedText.startsWith("upi://")) {

      let finalUpiLink = decodedText;

      if (decodedText.includes("am=")) {
        finalUpiLink = decodedText.replace(/am=\d+(\.\d+)?/, `am=${totalAmount}`);
      } else {
        finalUpiLink += `&am=${totalAmount}`;
      }

      window.location.href = finalUpiLink;

    } else {
      alert("Scanned QR is not a valid UPI QR.");
    }
  }

  function onScanFailure(error) {
    // silent ignore
  }

  /* ===============================
     START BACK CAMERA
  =============================== */

  html5QrCode.start(
    { facingMode: "environment" },   // 🔥 Forces back camera
    {
      fps: 10,
      qrbox: 250
    },
    onScanSuccess,
    onScanFailure
  ).catch(err => {
    console.log("Camera error:", err);
  });

});