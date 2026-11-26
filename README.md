# ⚡ Salesforce Admin AI Copilot

> An AI-powered assistant for Salesforce Admins — get instant, expert answers to Flows, SOQL, Apex, Validation Rules, Permissions, and more.

![Beta](https://img.shields.io/badge/status-beta-orange)
![Node](https://img.shields.io/badge/node-%3E%3D18-green)
![License](https://img.shields.io/badge/license-MIT-blue)

---

## 🚀 What It Does

The Salesforce Admin AI Copilot is a web app that gives Salesforce Admins instant, expert-level answers powered by Claude AI.

Ask anything:
- "Write a Flow to auto-create a Task when Opportunity moves to Negotiation"
- "Write a validation rule to require Phone on Lead"
- "Find all Contacts with no Activities in 90 days (SOQL)"
- "Fix: Too many SOQL queries error in Apex trigger"
- "When should I use Permission Set vs Profile?"

It responds like a **senior Salesforce Admin with 10+ years of experience** — with working code, step-by-step setup instructions, common variations, and gotchas to watch for.

---

## 🖥️ Screenshots

> Clean, minimal UI with Salesforce branding. Example chips for quick testing. Code blocks with dark theme.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML, CSS, Vanilla JS |
| Backend | Node.js + Express |
| AI | Anthropic Claude API (claude-sonnet-4-6) |
| Environment | dotenv |

---

## 📦 Installation

### Prerequisites
- Node.js v18 or higher (`node --version`)
- An Anthropic API key — get one at [console.anthropic.com](https://console.anthropic.com)

### Steps

**1. Clone the repo**
```bash
git clone https://github.com/suryavijayakumar03/salesforce-copilot.git
cd salesforce-copilot
```

**2. Install dependencies**
```bash
npm install
```

**3. Create your .env file**
```bash
cp .env.example .env
```

Edit `.env` and add your API key:
```
ANTHROPIC_API_KEY=sk-ant-...your-key-here...
PORT=3000
```

**4. Start the server**
```bash
node server.js
```

**5. Open in browser**
```
http://localhost:3000
```

---

## 📁 Project Structure

```
salesforce-copilot/
├── server.js          # Express backend + Claude API integration
├── public/
│   └── index.html     # Frontend UI
├── .env               # Your API keys (not committed)
├── .env.example       # Template for .env
├── .gitignore
├── package.json
└── README.md
```

---

## ⚙️ Configuration

| Variable | Description |
|----------|-------------|
| `ANTHROPIC_API_KEY` | Your Claude API key from console.anthropic.com |
| `PORT` | Port to run the server on (default: 3000) |

---

## 🔒 Security Notes

- **Never commit your `.env` file** — it's in `.gitignore`
- API keys are stored server-side only, never exposed to the browser
- The system prompt restricts the AI to Salesforce topics only

---

## 🗺️ Roadmap

- [x] MVP: Ask any Salesforce question, get expert answer
- [ ] User authentication (login/signup)
- [ ] Usage limits per user
- [ ] Payment integration (Razorpay / Stripe)
- [ ] Save conversation history
- [ ] Deploy to cloud (Railway / Render)
- [ ] Salesforce-specific prompt templates library

---

## 💡 Customization

### Change the AI model
In `server.js`, find:
```javascript
model: "claude-sonnet-4-6",
```
You can change this to `claude-haiku-4-5` (faster, cheaper) or `claude-opus-4-5` (more powerful).

### Change max response length
```javascript
max_tokens: 2048,
```
Increase for longer answers, decrease for shorter ones.

### Modify the system prompt
The system prompt in `server.js` defines the AI's persona and what it will/won't answer. Edit it to focus on specific Salesforce topics.

---

## 🤝 Contributing

Pull requests welcome. For major changes, open an issue first.

---

## 📄 License

MIT — free to use, modify, and sell.

---

## 👤 Author

Built by [Surya VJ](https://github.com/suryavijayakumar03) — Salesforce Admin & Business Systems Engineer with 9+ years of experience.

---

*Powered by [Anthropic Claude AI](https://anthropic.com)*
