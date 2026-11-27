const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const Anthropic = require("@anthropic-ai/sdk");
require("dotenv").config();

const app = express();
app.use(cors());

app.use("/api/razorpay-webhook", express.raw({ type: "application/json" }));
app.use(express.json());
app.use(express.static("public"));

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

const SYSTEM_PROMPT = `You are an expert Salesforce Admin AI Copilot with 10+ years of experience.

You help Salesforce Admins with:
- Salesforce Flows (Screen Flows, Record-Triggered Flows, Scheduled Flows)
- Validation Rules (formula syntax, error messages)
- Apex code (triggers, classes, test classes)
- SOQL queries
- Reports and Dashboards
- Permissions and Security (Profiles, Permission Sets, OWD, Sharing Rules)
- Process Builder (and migrating to Flow)
- Custom Objects and Fields
- Integration tips (REST API, webhooks, Connected Apps)
- Error debugging and troubleshooting

Your responses should:
- Be clear, specific, and immediately usable
- Include complete code/formula when asked
- Explain WHY something works, not just HOW
- Mention any gotchas or common mistakes
- Be formatted with headers and code blocks for readability

Always give production-ready answers that a Salesforce Admin can implement right away.`;

app.post("/api/ask", async (req, res) => {
  const { question } = req.body;
  if (!question || question.trim().length === 0) {
    return res.status(400).json({ error: "Question is required" });
  }
  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: question }],
    });
    res.json({ answer: message.content[0].text });
  } catch (error) {
    console.error("Claude API error:", error);
    res.status(500).json({ error: "Failed to get answer. Please try again." });
  }
});

app.post("/api/razorpay-webhook", async (req, res) => {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers["x-razorpay-signature"];
  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(req.body)
    .digest("hex");

  if (signature !== expectedSignature) {
    console.error("Invalid Razorpay webhook signature");
    return res.status(400).json({ error: "Invalid signature" });
  }

  let event;
  try {
    event = JSON.parse(req.body);
  } catch (e) {
    return res.status(400).json({ error: "Invalid JSON" });
  }

  console.log("Razorpay webhook event:", event.event);

  if (event.event === "subscription.charged" || event.event === "payment.captured") {
    try {
      const payload = event.payload;
      let customerEmail = null;
      let planId = null;
      let customerName = "Salesforce Admin";

      if (event.event === "subscription.charged") {
        const subscription = payload.subscription?.entity;
        const payment = payload.payment?.entity;
        customerEmail = payment?.email;
        customerName = payment?.contact || customerName;
        planId = subscription?.plan_id;
      } else {
        const payment = payload.payment?.entity;
        customerEmail = payment?.email;
        customerName = payment?.contact || customerName;
      }

      if (!customerEmail) {
        return res.json({ status: "ok", note: "no email found" });
      }

      const proPlanId = process.env.RAZORPAY_PRO_PLAN_ID;
      const accessCode = process.env.PAID_ACCESS_CODE;
      const planName = planId === proPlanId ? "Pro" : "Starter";
      const planPrice = planId === proPlanId ? "999/month" : "499/month";
      const appUrl = process.env.APP_URL || "https://your-app.up.railway.app";

      await transporter.sendMail({
        from: `"Salesforce Admin AI Copilot" <${process.env.GMAIL_USER}>`,
        to: customerEmail,
        subject: "Your SF Copilot Access is Ready!",
        html: `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f0f4f8;margin:0;padding:20px}.container{max-width:560px;margin:0 auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1)}.header{background:linear-gradient(135deg,#00a1e0,#0070d2);color:white;padding:32px;text-align:center}.header h1{margin:0;font-size:24px}.body{padding:32px}.code-box{background:#f0f4f8;border:2px solid #0070d2;border-radius:12px;padding:20px;text-align:center;margin:24px 0}.code-box .label{font-size:13px;color:#666;margin-bottom:8px}.code-box .code{font-size:28px;font-weight:700;color:#0070d2;letter-spacing:2px;font-family:monospace}.cta-btn{display:block;background:linear-gradient(135deg,#00a1e0,#0070d2);color:white;text-decoration:none;padding:16px 32px;border-radius:10px;text-align:center;font-size:16px;font-weight:700;margin:24px 0}.steps{background:#f8fafc;border-radius:10px;padding:20px;margin:20px 0}.footer{text-align:center;color:#999;font-size:12px;padding:20px 32px;border-top:1px solid #eee}</style></head><body><div class="container"><div class="header"><h1>Welcome to SF Copilot!</h1><p>${planName} Plan (Rs.${planPrice}) is active</p></div><div class="body"><p>Hi ${customerName},</p><p>Thank you for subscribing! Use the code below to access your Salesforce Admin AI Copilot.</p><div class="code-box"><div class="label">Your Access Code</div><div class="code">${accessCode}</div></div><a href="${appUrl}" class="cta-btn">Open SF Copilot</a><div class="steps"><strong>How to get started:</strong><ol><li>Click Open SF Copilot above</li><li>Click "I have a password"</li><li>Enter your access code</li><li>Start asking Salesforce questions!</li></ol></div><p style="font-size:14px;color:#666">Questions? Reply to this email and I will help you.</p></div><div class="footer">Salesforce Admin AI Copilot - ${planName} Plan</div></div></body></html>`,
      });

      console.log("Access email sent to", customerEmail);
      res.json({ status: "ok", email_sent: customerEmail });
    } catch (err) {
      console.error("Failed to send access email:", err);
      res.status(500).json({ error: "Failed to send email" });
    }
  } else {
    res.json({ status: "ok", event: event.event });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🚀 Salesforce Copilot running at http://localhost:${PORT}\n`);
});
