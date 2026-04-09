/// <reference path="../pb_data/types.d.ts" />
onRecordAfterCreateSuccess((e) => {
  const name = e.record.get("name");
  const email = e.record.get("email");
  const inquiryType = e.record.get("inquiry_type");
  const message = e.record.get("message");

  // Send notification to support team
  const ownerMessage = new MailerMessage({
    from: {
      address: "noreply@thevedicprotocol.com",
      name: "The Vedic Protocol"
    },
    to: [
      { address: "support@thevedicprotocol.com" },
      { address: "drsonam@thevedicprotocol.com" }
    ],
    subject: "New Contact Form Submission: " + inquiryType,
    html: "<h2>New Contact Form Submission</h2><p><strong>Name:</strong> " + name + "</p><p><strong>Email:</strong> " + email + "</p><p><strong>Inquiry Type:</strong> " + inquiryType + "</p><p><strong>Message:</strong><br>" + message + "</p>"
  });
  $app.newMailClient().send(ownerMessage);

  // Send confirmation to the person who contacted you
  const confirmationMessage = new MailerMessage({
    from: {
      address: "noreply@thevedicprotocol.com",
      name: "The Vedic Protocol"
    },
    to: [{ address: email }],
    subject: "We received your message — The Vedic Protocol",
    html: "<h2>Thank you for reaching out, " + name + "!</h2><p>We have received your message and will get back to you as soon as possible.</p><p><strong>Your enquiry type:</strong> " + inquiryType + "</p><p><strong>Your message:</strong><br>" + message + "</p><p>If you have any urgent questions, contact us directly at support@thevedicprotocol.com</p><p>Best regards,<br>The Vedic Protocol Team</p>"
  });
  $app.newMailClient().send(confirmationMessage);

  e.next();
}, "contact_submissions");