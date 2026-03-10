# AgriTrust: Blockchain & AI Seed Verification System

AgriTrust is a decentralized solution designed to combat the global crisis of counterfeit seeds. By leveraging blockchain for immutability and AI for expert agricultural support, AgriTrust empowers farmers to verify the authenticity of their seeds and maximize their crop yield.

## 🚀 Key Features

- **Blockchain Ledger**: Every seed packet has a unique digital twin recorded on a simulated immutable ledger.
- **Supply Chain Tracking**: Real-time tracking from the manufacturing plant through distributors to the farmer.
- **QR Verification**: Instant authenticity check using a browser-based QR scanner (no app installation required).
- **Fraud Detection**: Automatic "double-scan" detection. Once a packet is verified, it is marked as `CONSUMED`.
- **AI Agri-Bot**: Integrated Gemini AI provides personalized planting and care advice for verified seeds.
- **Admin Analytics**: Fraud heatmaps and distribution metrics for government and manufacturer oversight.

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS 4, Motion (Animations), Lucide Icons.
- **Backend**: Node.js, Express.
- **Database**: Better-SQLite3 (Simulating Blockchain Ledger).
- **AI**: Google Gemini API (Gemini 3 Flash).
- **Scanner**: HTML5-QRCode.

## 📦 Project Structure

```text
├── server.ts              # Express backend & SQLite blockchain logic
├── src/
│   ├── App.tsx            # Main React application (All views)
│   ├── constants.ts       # Translations & Global Config
│   ├── index.css          # Tailwind 4 Styles & Custom Animations
│   └── services/
│       └── geminiService.ts # Gemini AI Integration
├── metadata.json          # App metadata & permissions
└── package.json           # Dependencies & Scripts
```

## 🚦 Getting Started

### Prerequisites
- Node.js installed.
- A Gemini API Key (configured in AI Studio Secrets).

### Local Setup
1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open `http://localhost:3000` in your browser.

## 🗺️ Future Roadmap

1. **L1 Blockchain Integration**: Migrate from SQLite to Polygon or Ethereum Mainnet.
2. **IoT Sensors**: Real-time temperature and humidity tracking during transit.
3. **Government Audit Node**: Read-only access for agricultural departments to monitor seed quality nationwide.
4. **Farmer Reward Tokens**: ERC-20 tokens rewarded to farmers for reporting fraudulent packets.

## 📄 License
SPDX-License-Identifier: Apache-2.0
