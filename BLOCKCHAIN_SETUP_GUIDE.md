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