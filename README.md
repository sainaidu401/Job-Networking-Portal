# Web3Job - Decentralized Job Platform

A modern, AI-powered job platform built on blockchain technology that connects Web3 talent with opportunities. Built with Vite + React, Node.js, and MongoDB.

## 🚀 Features

### Core Features
- **🔐 Authentication & Profile Management**
  - JWT-based authentication
  - MetaMask wallet integration
  - AI-powered skill extraction from bio/LinkedIn
  - Profile completion tracking

- **💼 Job Posting & Management**
  - Create, edit, and manage job postings
  - Blockchain payment integration for platform fees
  - Advanced filtering and search capabilities
  - Real-time job status tracking

- **🤖 AI-Powered Features**
  - Intelligent job-candidate matching
  - Automatic skill extraction from text
  - Match score calculation based on skills, experience, and location
  - Smart job recommendations

- **💰 Blockchain Integration**
  - MetaMask wallet connection
  - Platform fee payments in ETH
  - Secure transaction verification
  - Escrow payment system (planned)

- **📊 Analytics & Insights**
  - User activity dashboard
  - Job performance metrics
  - Application tracking
  - AI-powered insights

## 🛠 Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Ethers.js** - Ethereum library for Web3 integration
- **Lucide React** - Beautiful icons
- **React Hot Toast** - Toast notifications
- **Framer Motion** - Animations

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Natural** - NLP library for AI features

### Blockchain
- **Ethereum** - Smart contract platform
- **MetaMask** - Wallet integration
- **Solidity** - Smart contract language (planned)

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB
- MetaMask browser extension

### Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd web3-job-platform
```

2. **Install dependencies**
```bash
npm run install-all
```

3. **Environment Setup**

Create `.env` files in both `server/` and `client/` directories:

**Server (.env)**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/web3job
JWT_SECRET=your-super-secret-jwt-key
CLIENT_URL=http://localhost:3000
NODE_ENV=development
PLATFORM_WALLET_ADDRESS=0x1234567890123456789012345678901234567890
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/YOUR_PROJECT_ID
```

**Client (.env)**
```env
VITE_API_URL=http://localhost:5000/api
```

4. **Start the development servers**
```bash
npm run dev
```

This will start both the frontend (port 3000) and backend (port 5000) servers.

## 🏗 Project Structure

```
web3-job-platform/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── contexts/       # React contexts (Auth, Web3, Job)
│   │   ├── pages/          # Page components
│   │   ├── App.jsx         # Main app component
│   │   └── main.jsx        # Entry point
│   ├── public/             # Static assets
│   └── package.json        # Frontend dependencies
├── server/                 # Backend Node.js application
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── middleware/         # Express middleware
│   ├── index.js            # Server entry point
│   └── package.json        # Backend dependencies
└── package.json            # Root package.json
```

## 🔧 Configuration

### Database Setup
1. Install MongoDB locally or use MongoDB Atlas
2. Update `MONGODB_URI` in server `.env`
3. The application will automatically create collections

### Blockchain Setup
1. Install MetaMask browser extension
2. Add your Ethereum network (mainnet/testnet)
3. Update `PLATFORM_WALLET_ADDRESS` in server `.env`
4. Configure `ETHEREUM_RPC_URL` for your preferred provider

### AI Features
The platform uses the `natural` library for:
- Skill extraction from text
- Job-candidate matching
- Text analysis and processing

## 🚀 Deployment

### Frontend (Vercel/Netlify)
```bash
cd client
npm run build
# Deploy the dist/ folder
```

### Backend (Heroku/Railway)
```bash
cd server
# Set environment variables
# Deploy to your preferred platform
```

### Database
- Use MongoDB Atlas for production
- Set up proper indexes for performance
- Configure backup and monitoring

## 📱 Usage

### For Job Seekers
1. **Register/Login** - Create account or connect wallet
2. **Complete Profile** - Add skills, experience, and preferences
3. **Browse Jobs** - Use filters and AI recommendations
4. **Apply** - Submit applications with match scores
5. **Track** - Monitor application status

### For Employers
1. **Connect Wallet** - Link MetaMask for payments
2. **Post Job** - Create detailed job listings
3. **Pay Fee** - Complete blockchain payment
4. **Review Applications** - View candidates with match scores
5. **Hire** - Select and onboard talent

## 🔒 Security Features

- JWT token authentication
- Password hashing with bcrypt
- Input validation and sanitization
- Rate limiting
- CORS configuration
- Helmet.js security headers
- Blockchain transaction verification

## 🤖 AI Features

### Skill Extraction
- Automatically identifies skills from bio text
- Supports LinkedIn URL parsing
- Maintains skill database for matching

### Job Matching
- Calculates match scores based on:
  - Skill overlap (50% weight)
  - Experience level compatibility (30% weight)
  - Location preferences (20% weight)
- Provides personalized job recommendations

### Smart Suggestions
- Recommends jobs based on user profile
- Suggests skills based on job descriptions
- Provides insights on profile completion

## 💰 Monetization

### Revenue Streams
1. **Platform Fees** - 0.001 ETH per job posting
2. **Premium Subscriptions** - Enhanced features for employers
3. **Featured Listings** - Promoted job positions
4. **Recruitment Services** - Premium matching and screening

### Token Economics (Future)
- Platform token for governance
- Staking mechanisms
- Reward systems for active users

## 🧪 Testing

```bash
# Run backend tests
cd server
npm test

# Run frontend tests
cd client
npm test
```

## 📈 Performance

### Optimization Features
- Lazy loading of components
- Image optimization
- Code splitting
- Database indexing
- Caching strategies
- CDN integration

### Monitoring
- Error tracking
- Performance metrics
- User analytics
- Blockchain transaction monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

- Documentation: [Link to docs]
- Issues: [GitHub Issues]
- Discord: [Community server]
- Email: support@web3job.com

## 🔮 Roadmap

### Phase 1 (Current)
- ✅ Basic job posting and application
- ✅ Wallet integration
- ✅ AI skill extraction
- ✅ User authentication

### Phase 2 (Next)
- 🔄 Smart contract integration
- 🔄 Escrow payment system
- 🔄 Advanced AI matching
- 🔄 Mobile app

### Phase 3 (Future)
- 📋 DAO governance
- 📋 Platform token
- 📋 Cross-chain support
- 📋 Advanced analytics

---

**Built with ❤️ for the Web3 community** 
