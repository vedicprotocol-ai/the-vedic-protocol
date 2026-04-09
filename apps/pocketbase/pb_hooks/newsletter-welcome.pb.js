/// <reference path="../pb_data/types.d.ts" />

onRecordAfterCreateSuccess((e) => {
  const subscriberEmail = e.record.get("email");
  const BREVO_KEY = "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";

  $http.send({
    url: "https://api.brevo.com/v3/smtp/email",
    method: "POST",
    headers: {
      "accept": "application/json",
      "content-type": "application/json",
      "api-key": BREVO_KEY
    },
    body: JSON.stringify({
      sender: { email: "drsonam@thevedicprotocol.com", name: "Dr. Sonam | The Vedic Protocol" },
      to: [{ email: subscriberEmail }],
      subject: "Welcome to The Vedic Protocol",
      htmlContent: "<html><body style='font-family:Arial,sans-serif;background:#fafaf8;padding:40px;'><div style='max-width:600px;margin:0 auto;background:#fff;border:1px solid #e8e6e1;padding:48px;'><p style='font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#C9A96E;'>The Vedic Protocol</p><h1 style='font-size:28px;font-weight:300;color:#1a1814;font-family:Georgia,serif;'>Ancient wisdom.<br><em style='color:#C9A96E;'>Clinically precise.</em></h1><p style='font-size:15px;color:#3d3a34;line-height:1.85;'>You are now part of something we have been building with a great deal of care.</p><p style='font-size:15px;color:#3d3a34;line-height:1.85;'>The Vedic Protocol is a PhD-formulated Ayurvedic haircare and skincare range built on The Charaka Samhita, validated by modern science, and made without a single synthetic ingredient.</p><p style='font-size:15px;color:#3d3a34;line-height:1.85;'>As a subscriber, you will be the first to know when our formulations launch.</p><p style='font-size:15px;color:#3d3a34;line-height:1.85;font-style:italic;'>With gratitude,<br><strong style='font-style:normal;'>Dr. Sonam</strong><br><span style='font-size:12px;color:#6b6660;'>Founder, The Vedic Protocol</span></p><p style='font-size:11px;color:#6b6660;border-top:1px solid #e8e6e1;padding-top:24px;'>thevedicprotocol.com</p></div></body></html>",
      textContent: "Welcome to The Vedic Protocol\n\nYou are now part of something we have been building with great care.\n\nThe Vedic Protocol is a PhD-formulated Ayurvedic haircare and skincare range built on The Charaka Samhita, validated by modern science, and made without a single synthetic ingredient.\n\nWith gratitude,\nDr. Sonam\nFounder, The Vedic Protocol\nthevedicprotocol.com"
    })
  });

}, "newsletter_subscribers");