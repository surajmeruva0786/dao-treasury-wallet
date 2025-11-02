# DAO Treasury Wallet

A decentralized platform for managing organizational funds through on-chain governance and community voting on the Stellar network.

## Features

- **Treasury Management**: Track and manage treasury funds on Stellar
- **Proposal System**: Create, vote on, and execute payment proposals
- **Governance**: Community-driven voting mechanism
- **Freighter Integration**: Connect your Stellar wallet via Freighter extension
- **Real-time Sync**: Firebase-powered real-time data synchronization
- **Admin Dashboard**: Manage proposals and treasury settings

## Prerequisites

- Node.js (v14 or higher)
- Freighter browser extension installed
- Browser with modern JavaScript support (Chrome, Firefox, Edge)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd dao-treasury-wallet
```

2. Make sure you have Node.js installed:
```bash
node --version
```

## Running the Project

### Option 1: Using Node.js Server (Recommended)

1. Start the server:
```bash
npm start
```
or
```bash
node server.js
```

2. Open your browser and navigate to:
```
http://localhost:5000
```

### Option 2: Using Python Simple HTTP Server

```bash
python -m http.server 8000
```

Then open `http://localhost:8000` in your browser.

### Option 3: Using Live Server (VS Code)

Install the "Live Server" extension in VS Code, right-click on `index.html`, and select "Open with Live Server".

## Configuration

### Network Settings

The project is configured to use Stellar **Testnet** by default. You can change this in `script.js`:

```javascript
const USE_TESTNET = true; // Set to false for mainnet
```

### Firebase Configuration

Firebase is already configured in `index.html` and `script.js`. The current configuration uses:

- Project ID: `dao-treasury-wallet-3b7a1`
- Project uses Firestore for real-time data

## Usage

1. **Connect Wallet**: Click "Connect Wallet" in the navigation bar
2. **View Treasury**: Navigate to the Treasury section to see current balance
3. **Create Proposal**: Click "Create Proposal" to submit a new payment proposal
4. **Vote on Proposals**: Vote for or against active proposals
5. **Execute Approved Proposals**: Execute proposals that have passed voting
6. **Admin Access**: Navigate to Admin section for administrative functions

## Project Structure

```
dao-treasury-wallet/
├── index.html          # Main HTML file
├── script.js           # Application logic and Firebase integration
├── style.css           # Styling and animations
├── server.js           # Node.js HTTP server
├── package.json        # Node.js dependencies and scripts
└── README.md           # This file
```

## Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Blockchain**: Stellar SDK, Freighter API
- **Backend**: Firebase Firestore
- **Server**: Node.js HTTP Server

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Edge
- Safari

## Security Notes

- **Admin Credentials**: Default admin credentials should be changed in production
- **Private Keys**: Never share your wallet private keys or seed phrases
- **Network**: Always verify you're on the correct network (Testnet vs Mainnet)

## Troubleshooting

### "Freighter Wallet Not Detected"
- Make sure Freighter extension is installed and enabled
- Refresh the page after installing Freighter

### "Firebase Connection Failed"
- Check your internet connection
- Verify Firebase configuration is correct

### Server won't start
- Ensure Node.js is installed: `node --version`
- Check if port 5000 is already in use

## License

MIT License

## Support

For issues and questions, please open an issue on GitHub.

