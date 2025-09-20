# 🚀 BLOCKCHAIN SETUP GUIDE FOR STUDENTS
## Complete Setup Instructions for Ethereum Sepolia Testnet

---

## 📱 **STEP 1: Install MetaMask Wallet**

1. **Install MetaMask Browser Extension:**
   - Go to: https://metamask.io/
   - Click "Download" and add to your browser
   - Create a new wallet (SAVE YOUR SEED PHRASE SAFELY!)
   - Write down your 12-word recovery phrase

2. **Add Sepolia Testnet to MetaMask:**
   - Open MetaMask
   - Click network dropdown (usually shows "Ethereum Mainnet")
   - Click "Add Network"
   - Enter these details:
     ```
     Network Name: Sepolia test network
     New RPC URL: https://sepolia.infura.io/v3/
     Chain ID: 11155111
     Currency Symbol: ETH
     Block Explorer URL: https://sepolia.etherscan.io
     ```

---

## 🚰 **STEP 2: Get Free Test ETH**

1. **Copy Your Wallet Address:**
   - Open MetaMask
   - Click on account name to copy address
   - Should look like: 0x1234...abcd

2. **Get Free Test ETH from Faucets:**
   - **Faucet 1:** https://sepoliafaucet.com/
   - **Faucet 2:** https://www.infura.io/faucet/sepolia
   - **Faucet 3:** https://sepolia-faucet.pk910.de/
   
   **Instructions:**
   - Paste your wallet address
   - Complete any captcha/verification
   - Wait for ETH to arrive (usually 1-2 minutes)
   - You need at least 0.1 ETH for contract deployment

---

## 🔗 **STEP 3: Get Free Infura Account**

1. **Register at Infura:**
   - Go to: https://infura.io/
   - Click "Get started for free"
   - Create account with your email

2. **Create New Project:**
   - Click "Create New Key"
   - Select "Web3 API"
   - Name: "Jharkhand Tourism Blockchain"
   - Select "Sepolia" network

3. **Copy Project ID:**
   - From project dashboard, copy the Project ID
   - Should look like: 3a4b5c6d7e8f9g0h1i2j3k4l5m6n7o8p

---

## ⚙️ **STEP 4: Update Environment Variables**

**Update your `/app/backend/.env` file with:**

```bash
# Replace these values with your actual data:
INFURA_PROJECT_ID=your_actual_infura_project_id_here
BLOCKCHAIN_PRIVATE_KEY=your_actual_wallet_private_key_here
```

**To get your private key from MetaMask:**
1. Open MetaMask
2. Click three dots menu
3. Account details → Export Private Key
4. Enter MetaMask password
5. Copy the private key (KEEP THIS SECRET!)

---

## ✅ **VERIFICATION CHECKLIST**

Before proceeding to Phase 2, verify you have:

- [ ] MetaMask installed and wallet created
- [ ] Sepolia testnet added to MetaMask
- [ ] At least 0.1 test ETH in your wallet
- [ ] Infura account created and project ID copied
- [ ] Environment variables updated in .env file
- [ ] Wallet private key added to .env file

---

## 🎯 **COSTS SUMMARY**

- **MetaMask Wallet:** FREE ✅
- **Sepolia Testnet:** FREE ✅
- **Test ETH from Faucets:** FREE ✅
- **Infura Account:** FREE (100k requests/day) ✅
- **Smart Contract Deployment:** FREE (using test ETH) ✅

**Total Cost: ₹0 (Completely Free!)** 🎓

---

## 🚨 **SECURITY TIPS**

1. **NEVER share your private key with anyone**
2. **NEVER use mainnet ETH for testing**
3. **ALWAYS double-check you're on Sepolia testnet**
4. **Save your seed phrase in a secure location**
5. **This is for educational purposes only**

---

Once you complete these steps, let me know and I'll proceed with **Phase 2: Smart Contract Development**! 🚀

---

## 💻 **PHASE 2.1: REMIX IDE SETUP**

### **🎯 RECOMMENDED APPROACH: Simple Workspace**

**For your Jharkhand Tourism contracts, use Option 1 (Simple Workspace):**

1. **Open Remix IDE:**
   - Go to: https://remix.ethereum.org
   - Wait for it to fully load

2. **Create New Workspace:**
   - Click "Create New Workspace" button
   - Select "Blank" template (NOT Git template)
   - Workspace Name: `Jharkhand_Tourism_Contracts`
   - Click "OK"

3. **Why Simple Workspace (Not Git Plugin):**
   - ✅ **Faster setup** - No Git configuration needed
   - ✅ **Direct deployment** - Straight to contract compilation
   - ✅ **No version control complexity** - Focus on deployment
   - ✅ **Beginner friendly** - Less confusing interface
   - ✅ **Quick testing** - Immediate contract interaction

### **🚫 Avoid Git Plugin For Now Because:**
- ❌ Requires Git repository setup
- ❌ Need GitHub authentication
- ❌ More complex workflow
- ❌ Can cause sync issues
- ❌ Unnecessary for one-time deployment

---

## 📂 **STEP 2.2: IMPORT SMART CONTRACTS**

### **Method 1: Copy-Paste (Recommended)**

1. **Create Contract Files:**
   ```
   contracts/
   ├── TourismCertificates.sol
   ├── LoyaltyRewards.sol
   ├── BookingVerification.sol
   └── AuthenticReviews.sol
   ```

2. **In Remix File Explorer:**
   - Right-click on `contracts` folder
   - Select "New File"
   - Name: `TourismCertificates.sol`
   - Copy-paste contract code from `/app/contracts/TourismCertificates.sol`
   - Repeat for all 4 contracts

### **Method 2: Upload Files (Alternative)**
   - Right-click `contracts` folder → "Upload Files"
   - Select all `.sol` files from `/app/contracts/`
   - Upload them directly

---

## ⚙️ **STEP 2.3: REMIX CONFIGURATION**

### **Compiler Settings:**
```
📁 Solidity Compiler Tab:
├── Compiler Version: 0.8.19
├── Language: Solidity
├── EVM Version: default
├── Auto compile: ✅ ENABLED
├── Enable optimization: ✅ ENABLED
└── Runs: 200
```

### **Deploy & Run Settings:**
```
🚀 Deploy & Run Tab:
├── Environment: Injected Provider - MetaMask
├── Account: 0x891BB11ffb52F7136C3C50Aa740D5DAd73933Af9
├── Gas Limit: 3000000
├── Value: 0 ETH
└── Contract: Select contract to deploy
```

---

## 🦊 **STEP 2.4: METAMASK CONNECTION**

### **Verify Your Setup:**
```
✅ Network: Sepolia test network
✅ Account: 0x891BB11ffb52F7136C3C50Aa740D5DAd73933Af9  
✅ Balance: > 0.1 ETH (from faucets)
✅ Connected to Remix: Green dot in MetaMask
```

### **If Connection Issues:**
1. Refresh Remix page
2. Open MetaMask
3. Click "Connect" when prompted
4. Select your account
5. Approve connection

---

## 🚀 **DEPLOYMENT SEQUENCE**

### **Deploy in This Order:**
```
1️⃣ TourismCertificates.sol
   ├── No constructor parameters
   ├── Estimated Gas: ~0.015 ETH
   └── Copy deployed address

2️⃣ LoyaltyRewards.sol  
   ├── No constructor parameters
   ├── Estimated Gas: ~0.020 ETH
   └── Copy deployed address

3️⃣ BookingVerification.sol
   ├── No constructor parameters
   ├── Estimated Gas: ~0.018 ETH
   └── Copy deployed address

4️⃣ AuthenticReviews.sol
   ├── Constructor param: BookingVerification address
   ├── Estimated Gas: ~0.025 ETH
   └── Copy deployed address
```

### **⚠️ IMPORTANT: Contract Dependencies**
- Deploy `BookingVerification.sol` BEFORE `AuthenticReviews.sol`
- `AuthenticReviews` constructor needs `BookingVerification` address
- All other contracts have no dependencies

---

## 📋 **POST-DEPLOYMENT CHECKLIST**

### **After Each Contract Deployment:**
- [ ] Transaction confirmed in MetaMask
- [ ] Contract address copied and saved
- [ ] Green checkmark in Remix deploy section
- [ ] Verify on Sepolia Etherscan (optional)

### **Update .env File:**
```bash
# Replace with your actual deployed addresses:
CONTRACT_ADDRESS_CERTIFICATES="0x..."
CONTRACT_ADDRESS_LOYALTY="0x..."
CONTRACT_ADDRESS_BOOKING="0x..."
CONTRACT_ADDRESS_REVIEWS="0x..."
```

---

## 🎯 **NEXT STEPS AFTER DEPLOYMENT**

Once all 4 contracts are deployed:
1. ✅ Copy all contract addresses
2. ✅ Update backend .env file
3. ✅ Test basic contract functions in Remix
4. ✅ Ready for Phase 3: Database Integration

**Ready to deploy? Let me know when you complete the Remix setup!** 🚀