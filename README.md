# 🎮 Incentifi - Gamified Chore dApp

**A blockchain-powered gamification platform for household chores built for the XDC Vibe Coding Bootcamp 2025**

## 🌟 Overview

Incentifi transforms mundane household chores into an engaging, reward-based experience using blockchain technology. Parents can create chore tasks with token escrow, while children earn NFTs for completion and trade them for real-world rewards.

## 🚀 Key Features

- **📝 Task Management**: Parents create chore tasks with escrow tokens
- **🎯 Task Acceptance**: Kids can browse and accept available tasks
- **✅ Completion System**: Submit proof of completion for review
- **🏆 NFT Rewards**: Earn unique NFTs for completed tasks
- **🎲 Lucky Lottery**: 10% bonus chance for extra rewards
- **🏅 Achievement Badges**: Dual NFT system with special achievement tokens
- **⏰ Timed Escrow**: Automatic token release system
- **💱 Reward Trading**: Exchange NFTs for real-world rewards

## 🛠 Technology Stack

- **Frontend**: NextJS with Tailwind CSS + daisyUI
- **Smart Contracts**: Solidity on XDC Network
- **Development**: Scaffold-ETH 2 framework
- **Wallet**: RainbowKit integration
- **Build Tool**: Hardhat

## 🏗 Project Structure

```
incentifi/
├── packages/
│   ├── hardhat/          # Smart contracts and deployment
│   │   ├── contracts/    # Solidity contracts
│   │   └── deploy/       # Deployment scripts
│   └── nextjs/           # Frontend application
│       ├── app/          # Next.js app router
│       └── components/   # React components
```

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) (>= v20.18.3)
- [Yarn](https://yarnpkg.com/) (v1 or v2+)
- [Git](https://git-scm.com/)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/incentifi.git
cd incentifi
```

2. **Install dependencies**
```bash
yarn install
```

3. **Start local blockchain**
```bash
yarn chain
```

4. **Deploy contracts** (in a new terminal)
```bash
yarn deploy
```

5. **Start the frontend** (in a new terminal)
```bash
yarn start
```

6. **Visit the app**
Open [http://localhost:3000](http://localhost:3000) in your browser

## 🎯 Core Smart Contract Functions

- `createTask()` - Parents create new chore tasks with escrow
- `acceptTask()` - Children accept available tasks
- `submitCompletion()` - Submit proof of task completion
- `approveCompletion()` - Parents approve and release rewards

## 🏆 XDC Vibe Coding Bootcamp 2025

This project was built for the XDC Vibe Coding Bootcamp (August 27-29, 2025) with focus on:
- **Stablecoins & DeFi**: Token escrow and reward systems
- **Real-world Problem**: Gamifying household responsibility
- **XDC Network Integration**: Deployed on XDC mainnet
- **Smart Contract Innovation**: Timed escrow with lottery mechanics

**Submission Deadline**: September 1, 2025

## 🎮 How to Use

### For Parents
1. Connect your wallet
2. Navigate to Parent Dashboard
3. Create new chore tasks with token rewards
4. Review and approve completed tasks
5. Manage family reward system

### For Children
1. Connect your wallet
2. Browse available chore tasks
3. Accept tasks you want to complete
4. Submit completion proof
5. Collect NFT rewards and trade for prizes

## 🧪 Testing

Run the smart contract tests:
```bash
yarn hardhat:test
```

## 📦 Deployment

Deploy to XDC Network:
```bash
yarn deploy --network xdc
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Scaffold-ETH 2](https://scaffoldeth.io/)
- XDC Network for blockchain infrastructure
- XDC Vibe Coding Bootcamp organizers

---

**Made with ❤️ for the XDC Vibe Coding Bootcamp 2025**