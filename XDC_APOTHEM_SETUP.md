# XDC Apothem Testnet Configuration

This project has been configured to use the **XDC Apothem Testnet** instead of the local Hardhat network.

## What Changed

### 1. Network Configuration
- **Default Network**: Changed from `localhost` to `xdcApothemTestnet`
- **Chain ID**: 51
- **RPC URL**: `https://rpc.ankr.com/xdc_testnet`
- **Block Explorer**: `https://explorer.apothem.network`

### 2. Frontend Configuration
- **Target Networks**: Updated to use XDC Apothem Testnet
- **Burner Wallet**: Disabled for production networks
- **Polling Interval**: Set to 30 seconds for real-time updates

### 3. Hardhat Configuration
- Added XDC Apothem Testnet network configuration
- Updated etherscan verification for the new network
- Set as default deployment network

## Getting Started with XDC Apothem Testnet

### Prerequisites
1. **XDC Testnet Tokens**: You'll need XDC tokens on the Apothem testnet for gas fees
2. **Wallet Setup**: Configure MetaMask or another wallet to connect to XDC Apothem Testnet

### Adding XDC Apothem Testnet to MetaMask

1. Open MetaMask
2. Click on the network dropdown
3. Select "Add Network"
4. Enter the following details:
   - **Network Name**: XDC Apothem Testnet
   - **New RPC URL**: `https://rpc.ankr.com/xdc_testnet`
   - **Chain ID**: `51`
   - **Currency Symbol**: `XDC`
   - **Block Explorer URL**: `https://explorer.apothem.network`

### Getting Testnet XDC Tokens

Visit the XDC Apothem Testnet Faucet to get testnet XDC tokens:
- **Faucet URL**: Check the official XDC documentation for current faucet URLs
- **Alternative**: Use the XDC Discord or Telegram channels to request testnet tokens

### Development Workflow

#### 1. Deploy Contracts
```bash
# Deploy to XDC Apothem Testnet (default)
yarn deploy

# Or explicitly specify the network
yarn deploy --network xdcApothemTestnet
```

#### 2. Start Frontend
```bash
yarn start
```

The frontend will now connect to XDC Apothem Testnet by default.

#### 3. Verify Contracts
```bash
# Verify on XDC Apothem Explorer
yarn verify --network xdcApothemTestnet
```

## Configuration Files Modified

### `packages/nextjs/scaffold.config.ts`
- Updated `targetNetworks` to use XDC Apothem Testnet
- Set `onlyLocalBurnerWallet` to `false`

### `packages/nextjs/utils/customChains.ts`
- Added XDC Apothem Testnet chain definition

### `packages/hardhat/hardhat.config.ts`
- Added XDC Apothem Testnet network configuration
- Updated `defaultNetwork` to `xdcApothemTestnet`
- Added etherscan verification configuration

## Network Details

- **Network Name**: XDC Apothem Testnet
- **Chain ID**: 51
- **RPC Endpoint**: `https://rpc.ankr.com/xdc_testnet`
- **WebSocket**: `wss://rpc.ankr.com/xdc_testnet`
- **Block Explorer**: `https://explorer.apothem.network`
- **Native Token**: XDC (18 decimals)
- **Testnet**: Yes

## Troubleshooting

### Common Issues

1. **"Insufficient funds" error**: Make sure you have XDC testnet tokens in your wallet
2. **"Network not found" error**: Ensure MetaMask is connected to XDC Apothem Testnet
3. **"Contract verification failed"**: Check that the contract address and constructor arguments are correct

### Switching Back to Local Development

If you need to switch back to local development temporarily:

1. Update `packages/hardhat/hardhat.config.ts`:
   ```typescript
   defaultNetwork: "hardhat",
   ```

2. Update `packages/nextjs/scaffold.config.ts`:
   ```typescript
   targetNetworks: [chains.hardhat],
   onlyLocalBurnerWallet: true,
   ```

3. Use local commands:
   ```bash
   yarn chain        # Start local Hardhat node
   yarn deploy       # Deploy to local network
   yarn start        # Start frontend
   ```

## Useful Commands

```bash
# Deploy to XDC Apothem Testnet
yarn deploy

# Verify contracts on XDC Apothem Explorer
yarn verify --network xdcApothemTestnet

# Check account balance
yarn account

# Generate new account
yarn generate

# Import existing account
yarn account:import
```

## Resources

- [XDC Network Documentation](https://docs.xdc.org/)
- [Apothem Testnet Explorer](https://explorer.apothem.network)
- [XDC Community](https://t.me/xdc_community)
- [XDC Discord](https://discord.gg/xdc)
