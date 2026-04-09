/// <reference path="../pb_data/types.d.ts" />

onRecordAfterCreateSuccess((e) => {
  const BREVO_KEY = "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";
  const userEmail = e.record.get("email");

  $http.send({
    url: "https://api.brevo.com/v3/smtp/email",
    method: "POST",
    headers: {
      "accept": "application/json",
      "content-type": "application/json",
      "api-key": BREVO_KEY
    },
    body: JSON.stringify({
      sender: { email: "drsonam@thevedicprotocol.com", name: "TVP Notifications" },
      to: [{ email: "drsonam@thevedicprotocol.com" }],
      subject: "New account: " + userEmail,
      htmlContent: "<p>New account created: <strong>" + userEmail + "</strong></p>",
      textContent: "New account created: " + userEmail
    })
  });

}, "customers");