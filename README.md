# Explore Jharkhand

Full-stack tourism platform for Jharkhand built with a React frontend and a FastAPI backend. The project combines destination discovery, provider bookings, AI trip planning, manual UPI payment verification, and optional blockchain-backed certificates and loyalty features.

## Overview

This repository contains:

- a tourism web application in `frontend/`
- a FastAPI backend in `backend/`
- MySQL schema and setup scripts
- Solidity smart contracts for blockchain features
- extension files for an artisan marketplace module

The current main app supports:

- tourist, provider, and admin flows
- destination and provider discovery
- bookings and reviews
- wishlist management
- AI itinerary planning and chatbot support
- UPI payment request and admin approval workflow
- wallet connection, loyalty points, certificates, and booking verification

## Project structure

```text
.
|-- backend/
|   |-- server.py
|   |-- main.py
|   |-- requirements.txt
|   |-- database/
|   |-- services/
|   `-- models/
|-- frontend/
|   |-- package.json
|   `-- src/
|-- Contracts/
|-- sql_files_3/
|-- Complete_Database_Structure.sql
|-- BLOCKCHAIN_SETUP_GUIDE.md
`-- README.md
```

## Tech stack

### Frontend

- React 19
- React Router
- CRACO
- Tailwind CSS
- Radix UI
- Axios
- Cesium, Three.js, React Three Fiber
- MetaMask SDK and `ethers`

### Backend

- FastAPI
- Uvicorn
- aiomysql
- JWT authentication
- Gemini integration through `emergentintegrations`
- Web3 for blockchain interactions

### Database and contracts

- MySQL 8+
- Solidity contracts in `Contracts/`

## Core features

### Tourism platform

- browse destinations by category and region
- view destination details
- discover service providers
- create and manage bookings
- leave authenticated reviews
- maintain a personal wishlist

### AI features

- AI itinerary generation via `/api/planner`
- tourism chatbot via `/api/chatbot`

### Payment workflow

- create payment requests
- generate UPI QR codes
- submit transaction IDs for verification
- approve or reject payments from the admin panel

### Blockchain features

- wallet registration
- blockchain network status
- tourism certificate minting
- loyalty balance and redemption
- blockchain booking verification
- blockchain review verification

## Current integration status

The main backend route set lives in `backend/server.py` and is the active application entry point.

The repository also contains an artisan marketplace extension, but it is not fully merged into the main backend yet. These files are present for that extension:

- `backend/ARTISAN_INTEGRATION_GUIDE.md`
- `backend/server_marketplace_extension.py`
- `backend/marketplace_endpoints_update.py`
- `backend/models/marketplace_models_updated.py`
- `backend/database/artisan_marketplace_schema.sql`

Important caveat:

- the main backend currently restricts registration to `tourist` and `provider`
- artisan marketplace routes exist as extension files and integration docs, not as the primary live route set in `backend/server.py`

## Environment variables

Create `backend/.env` for backend configuration.

### Backend

```env
DB_HOST=localhost
DB_PORT=3001
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=jharkhand_tourism

JWT_SECRET=replace_this_with_a_real_secret
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=1440

GEMINI_API_KEY=your_gemini_api_key

ETHEREUM_NETWORK=sepolia
INFURA_PROJECT_ID=your_infura_project_id
BLOCKCHAIN_PRIVATE_KEY=your_private_key
WALLET_ADDRESS=your_wallet_address
CONTRACT_ADDRESS_CERTIFICATES=your_contract_address
CONTRACT_ADDRESS_LOYALTY=your_contract_address
CONTRACT_ADDRESS_BOOKING=your_contract_address
CONTRACT_ADDRESS_REVIEWS=your_contract_address
```

Create `frontend/.env` for frontend configuration.

### Frontend

```env
REACT_APP_BACKEND_URL=http://localhost:8000/api
REACT_APP_HIDE_BLOCKCHAIN=false
REACT_APP_CESIUM_TOKEN=your_cesium_token
```

Notes:

- frontend runs on port `3005`
- backend runs on port `8000` from `backend/main.py`
- some blockchain-related components fall back to `8001` if `REACT_APP_BACKEND_URL` is not set, so setting it explicitly is recommended

## Prerequisites

- Node.js 18+
- Yarn 1.x
- Python 3.11+
- MySQL 8+
- MetaMask with Sepolia access if blockchain features are needed

## Installation

### Root dependencies

```bash
yarn install
```

### Frontend dependencies

```bash
cd frontend
yarn install
```

### Backend dependencies

```bash
cd backend
pip install -r requirements.txt
```

## Database setup

The repository contains multiple SQL sources, including historical files. Prefer the backend-specific schema files and the current backend code when setting up a local environment.

Recommended schema sources:

- `Complete_Database_Structure.sql`
- `backend/database/payment_schema.sql`
- `backend/database/blockchain_schema.sql`
- `backend/database/artisan_marketplace_schema.sql`
- normalized table files under `sql_files_3/`

Useful setup scripts:

- `backend/setup_payment_schema.py`
- `apply_blockchain_schema.py`
- `insert_sample_data.py`
- `update_schema.py`

Important notes:

- backend expects the database name `jharkhand_tourism`
- backend startup also attempts to create some missing tables automatically
- some SQL files and docs use older naming, so do not mix everything blindly

## Running the application

### Run frontend and backend together

From the repo root:

```bash
yarn start
```

This starts:

- backend at `http://localhost:8000`
- frontend at `http://localhost:3005`

### Run backend only

```bash
cd backend
python main.py
```

or

```bash
cd backend
uvicorn server:app --host 0.0.0.0 --port 8000 --reload
```

### Run frontend only

```bash
cd frontend
yarn start
```

## Main frontend routes

- `/`
- `/login`
- `/destinations`
- `/providers`
- `/ai-planner`
- `/booking`
- `/bookings`
- `/wishlist`
- `/payment/:bookingId`
- `/provider-dashboard`
- `/provider-bookings`
- `/tourist-dashboard`
- `/admin-dashboard`
- `/admin/services`
- `/admin/destinations`
- `/admin/payments`
- `/map`
- `/sustainable-trip`
- `/practical-tips`
- `/about-us`

## Main API areas

The current backend exposes routes for:

- auth: `/api/auth/*`
- regions and destinations: `/api/regions`, `/api/destinations`
- providers: `/api/providers`, `/api/user/providers`, `/api/provider/bookings`
- reviews: `/api/reviews`
- AI: `/api/planner`, `/api/chatbot`
- bookings: `/api/bookings`
- wishlist: `/api/wishlist`
- admin: `/api/admin/*`
- payments: `/api/payments/*`, `/api/admin/payments/*`
- blockchain: `/api/blockchain/*`, `/api/loyalty/*`

## Important files

### Backend

- `backend/server.py`: main FastAPI application and route definitions
- `backend/main.py`: backend startup entry point
- `backend/services/gemini_service.py`: AI itinerary and chatbot integration
- `backend/services/payment_service.py`: UPI QR and payment utilities
- `backend/services/blockchain_service.py`: blockchain interactions

### Frontend

- `frontend/src/App.js`: route registration
- `frontend/src/services/api.js`: API client and auth handling
- `frontend/src/services/payments.js`: payment API helper
- `frontend/src/contexts/AuthContext.js`: auth state management

### Blockchain and docs

- `Contracts/TourismCertificates.sol`
- `Contracts/LoyaltyRewards.sol`
- `Contracts/BookingVerification.sol`
- `Contracts/AuthenticReviews.sol`
- `BLOCKCHAIN_SETUP_GUIDE.md`
- `contracts.md`

## Testing and utility files

- `backend/test_artisan_backend.py`
- `payment_verification_test.py`
- `blockchain_validation.py`
- `test_result.md`

There is no single clean end-to-end automated test workflow covering the entire stack at the moment.

## Known implementation notes

- most backend logic is concentrated in `backend/server.py`
- some docs describe in-progress or partially integrated features
- multiple schema variants exist in the repo
- some fallback credentials and defaults appear in code and should be replaced before deployment
- AI and blockchain features require external credentials and services

## Recommended cleanup next

1. split `backend/server.py` into routers and service modules
2. standardize on a single database bootstrap process
3. fully integrate or remove the artisan marketplace extension
4. move all secrets and environment-specific values out of code
5. add reproducible seed and test workflows

## License

The root `package.json` declares the project as `MIT`.
