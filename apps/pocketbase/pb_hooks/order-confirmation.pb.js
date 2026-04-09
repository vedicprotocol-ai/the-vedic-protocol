/// <reference path="../pb_data/types.d.ts" />

onRecordAfterCreateSuccess((e) => {
  const sub = e.record.get("email");
  const KEY = "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";

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#fafaf8;font-family:Arial,sans-serif;">
<div style="display:none;max-height:0;overflow:hidden;">Your Ayurvedic ritual starts here.</div>
<table width="100%" cellpadding="0" cellspacing="0" style="background:#fafaf8;padding:40px 20px;">
<tr><td align="center"><table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border:1px solid #e8e6e1;max-width:600px;">
<tr><td style="padding:48px;text-align:center;border-bottom:1px solid #e8e6e1;">
<p style="margin:0 0 12px;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#C9A96E;">The Vedic Protocol</p>
<h1 style="margin:0;font-size:30px;font-weight:300;color:#1a1814;font-family:Georgia,serif;">Ancient wisdom.<br><em style="color:#C9A96E;">Clinically precise.</em></h1>
</td></tr>
<tr><td style="padding:40px 48px;">
<p style="margin:0 0 18px;font-size:15px;color:#3d3a34;line-height:1.85;">You are now part of something we have been building with a great deal of care.</p>
<p style="margin:0 0 18px;font-size:15px;color:#3d3a34;line-height:1.85;">The Vedic Protocol is a PhD-formulated Ayurvedic haircare and skincare range built on The Charaka Samhita, validated by modern science, and made without a single synthetic ingredient.</p>
<p style="margin:0 0 18px;font-size:15px;color:#3d3a34;line-height:1.85;">As a subscriber, you will be the first to know when our formulations launch.</p>
<p style="margin:0;font-size:15px;color:#3d3a34;line-height:1.85;font-style:italic;">With gratitude,<br><strong style="font-style:normal;">Dr. Sonam</strong><br><span style="font-size:12px;color:#6b6660;">Founder, The Vedic Protocol</span></p>
</td></tr>
<tr><td style="padding:24px 48px;border-top:1px solid #e8e6e1;text-align:center;">
<p style="margin:0;font-size:11px;color:#6b6660;">thevedicprotocol.com</p>
</td></tr>
</table></td></tr></table>
</body></html>`;

  const txt = "Welcome to The Vedic Protocol\n\nYou are now part of something we have been building with great care.\n\nThe Vedic Protocol is a PhD-formulated Ayurvedic haircare and skincare range built on The Charaka Samhita, validated by modern science, and made without a single synthetic ingredient.\n\nAs a subscriber, you will be the first to know when our formulations launch.\n\nWith gratitude,\nDr. Sonam\nFounder, The Vedic Protocol\nthevedicprotocol.com";

  $http.send({
    url: "https://api.brevo.com/v3/smtp/email",
    method: "POST",
    headers: { "accept": "application/json", "content-type": "application/json", "api-key": KEY },
    body: JSON.stringify({
      sender: { email: "drsonam@thevedicprotocol.com", name: "Dr. Sonam | The Vedic Protocol" },
      to: [{ email: sub }],
      subject: "Welcome to The Vedic Protocol",
      htmlContent: html,
      textContent: txt
    })
  });

}, "newsletter_subscribers");