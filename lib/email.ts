import nodemailer from "nodemailer";

const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;

// Lazy transporter: only created on first actual send attempt, prevents module-level crash
let _transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!_transporter && smtpUser && smtpPass) {
    _transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: smtpUser, pass: smtpPass },
      pool: true,
      maxConnections: 3,
    });
  }
  return _transporter;
}

// Clean layout template wrapper
const getEmailWrapper = (title: string, bodyContent: string) => `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        body { font-family: 'DM Sans', Arial, sans-serif; background-color: #0A0A0F; color: #F8FAFC; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background-color: #0D1B3E; border: 1px solid rgba(0, 212, 255, 0.2); border-radius: 16px; overflow: hidden; }
        .header { background-color: #0A0A0F; padding: 30px; text-align: center; border-bottom: 2px solid #00D4FF; }
        .logo { font-size: 24px; font-weight: bold; color: #00D4FF; letter-spacing: 1px; }
        .body { padding: 40px 30px; line-height: 1.6; font-size: 15px; }
        .footer { background-color: #0A0A0F; padding: 20px; text-align: center; font-size: 12px; color: #64748B; border-top: 1px solid rgba(0, 212, 255, 0.1); }
        .btn { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #00D4FF 0%, #00FFB3 100%); color: #0A0A0F !important; text-decoration: none; font-weight: bold; border-radius: 10px; margin-top: 20px; text-shadow: none; text-align: center; }
        .details-box { background-color: #0A0A0F; border: 1px solid rgba(0, 212, 255, 0.1); padding: 20px; border-radius: 12px; margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px; }
        .detail-label { color: #94A3B8; }
        .detail-value { font-weight: bold; color: #F8FAFC; text-align: right; }
        h1, h2 { color: #00D4FF; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">TechFix <span style="color: #00FFB3;">Unlock Hub</span></div>
        </div>
        <div class="body">
          ${bodyContent}
        </div>
        <div class="footer">
          <p>© 2026 TechFix Unlock Hub. Dormaa, Ghana.</p>
          <p>This is an automated notification. Please do not reply directly to this email.</p>
        </div>
      </div>
    </body>
  </html>
`;

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  if (!smtpUser || !smtpPass) {
    console.log("\x1b[36m%s\x1b[0m", "=== NODEMAILER LOG (GMAIL SMTP NOT YET CONFIGURED) ===");
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log("-----------------------------------------");
    console.log("Email content (HTML text summary):");
    console.log(html.replace(/<[^>]*>/g, " ").trim().substring(0, 300) + "...");
    console.log("\x1b[36m%s\x1b[0m", "====================================================");
    return { success: true, message: "Logged to console since email service variables are not set" };
  }

  try {
    const transporter = getTransporter()!;
    const info = await transporter.sendMail({
      from: `"TechFix Unlock Hub" <${smtpUser}>`,
      to,
      subject,
      html,
    });
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error("Nodemailer error: ", error);
    return { success: false, error: error.message };
  }
}

// 1. Booking Confirmation Email
export async function sendBookingConfirmationEmail(booking: any, serviceName: string) {
  const trackingUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/track/${booking.trackingId}`;
  
  const content = `
    <h1>Booking Confirmed!</h1>
    <p>Hello ${booking.customerName},</p>
    <p>Thank you for choosing TechFix Unlock Hub. We have received your booking and it is currently being processed by our team.</p>
    
    <div class="details-box">
      <h2>Booking Details</h2>
      <div class="detail-row">
        <span class="detail-label">Tracking ID:</span>
        <span class="detail-value" style="color: #00FFB3;">${booking.trackingId}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Service:</span>
        <span class="detail-value">${serviceName}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Device:</span>
        <span class="detail-value">${booking.deviceBrand} ${booking.deviceModel}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Date & Time:</span>
        <span class="detail-value">${new Date(booking.date).toLocaleDateString()} at ${booking.timeSlot}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Total Price:</span>
        <span class="detail-value">GHS ${(booking.finalPrice ?? 0).toFixed(2)}</span>
      </div>
    </div>

    <p>You can track the progress of your repair/unlock in real-time by clicking the button below.</p>
    
    <div style="text-align: center;">
      <a href="${trackingUrl}" class="btn">Track Repair Live</a>
    </div>
  `;

  return sendEmail({
    to: booking.customerEmail,
    subject: `TechFix Booking Confirmed [${booking.trackingId}]`,
    html: getEmailWrapper("Booking Confirmed", content),
  });
}

// 2. Status Update Email
export async function sendStatusUpdateEmail(booking: any, serviceName: string) {
  const trackingUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/track/${booking.trackingId}`;
  
  const content = `
    <h1>Repair Status Updated</h1>
    <p>Hello ${booking.customerName},</p>
    <p>The status of your device repair/unlock <strong>(${booking.deviceBrand} ${booking.deviceModel})</strong> has been updated.</p>
    
    <div class="details-box">
      <div class="detail-row">
        <span class="detail-label">Tracking ID:</span>
        <span class="detail-value">${booking.trackingId}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">New Status:</span>
        <span class="detail-value" style="color: #00FFB3; font-size: 16px;">${booking.status}</span>
      </div>
      ${booking.technicianNotes ? `
        <div class="detail-row" style="margin-top: 15px; border-top: 1px solid rgba(0, 212, 255, 0.1); padding-top: 15px;">
          <span class="detail-label" style="display: block;">Technician Note:</span>
          <span class="detail-value" style="display: block; font-weight: normal; color: #CBD5E1; text-align: left; margin-top: 5px;">${booking.technicianNotes}</span>
        </div>
      ` : ""}
    </div>

    <p>Click below to view the entire status history and track live updates.</p>
    
    <div style="text-align: center;">
      <a href="${trackingUrl}" class="btn">Track Repair Live</a>
    </div>
  `;

  return sendEmail({
    to: booking.customerEmail,
    subject: `TechFix Status Update: ${booking.status} [${booking.trackingId}]`,
    html: getEmailWrapper("Status Update", content),
  });
}

// 3. Payment Receipt Email
export async function sendPaymentReceiptEmail(booking: any, serviceName: string) {
  const content = `
    <h1>Payment Received - Thank You!</h1>
    <p>Hello ${booking.customerName},</p>
    <p>We are pleased to confirm that your payment has been successfully processed.</p>
    
    <div class="details-box">
      <h2>Invoice & Receipt</h2>
      <div class="detail-row">
        <span class="detail-label">Receipt for Booking:</span>
        <span class="detail-value" style="color: #00D4FF;">${booking.trackingId}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Service:</span>
        <span class="detail-value">${serviceName}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Device:</span>
        <span class="detail-value">${booking.deviceBrand} ${booking.deviceModel}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Amount Paid:</span>
        <span class="detail-value" style="color: #00FFB3;">GHS ${(booking.finalPrice ?? 0).toFixed(2)}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Payment Channel:</span>
        <span class="detail-value">${booking.paymentDetails?.channel || "Mobile Money"}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Transaction Ref:</span>
        <span class="detail-value" style="font-size: 11px;">${booking.paymentDetails?.reference}</span>
      </div>
    </div>

    <p>We will keep you informed as we complete your service.</p>
  `;

  return sendEmail({
    to: booking.customerEmail,
    subject: `TechFix Payment Receipt [${booking.trackingId}]`,
    html: getEmailWrapper("Payment Receipt", content),
  });
}

// 4. Password Reset Email
export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  const content = `
    <h1>Password Reset Request</h1>
    <p>Hello,</p>
    <p>We received a request to reset your password for your TechFix Unlock Hub account. Click the button below to choose a new password.</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${resetUrl}" class="btn">Reset Password</a>
    </div>

    <p>This password reset link is valid for 1 hour. If you did not make this request, you can safely ignore this email.</p>
  `;

  return sendEmail({
    to: email,
    subject: "TechFix Password Reset Request",
    html: getEmailWrapper("Password Reset", content),
  });
}

// 5. Welcome Email
export async function sendWelcomeEmail(user: any) {
  const content = `
    <h1>Welcome to TechFix Unlock Hub!</h1>
    <p>Hello ${user.name},</p>
    <p>Thank you for registering on our platform. We are thrilled to have you as part of our tech community in Dormaa, Ghana.</p>
    <p>From your dashboard, you can now: </p>
    <ul>
      <li>Book instant phone repairs, battery replacements, and software unlocks</li>
      <li>Track your orders live and review repair progress details</li>
      <li>Manage payment invoices and review invoice transcripts</li>
    </ul>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.NEXTAUTH_URL || "http://localhost:3000"}/login" class="btn">Login to Your Account</a>
    </div>
  `;

  return sendEmail({
    to: user.email,
    subject: "Welcome to TechFix Unlock Hub",
    html: getEmailWrapper("Welcome!", content),
  });
}
