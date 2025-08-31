import { defineChain } from "viem";

// XDC Apothem Testnet
export const xdcApothemTestnet = defineChain({
  id: 51,
  name: "XDC Apothem Testnet",
  nativeCurrency: { name: "XDC", symbol: "XDC", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc.ankr.com/xdc_testnet"],
      webSocket: ["wss://rpc.ankr.com/xdc_testnet"],
    },
  },
  blockExplorers: {
    default: {
      name: "Apothem Explorer",
      url: "https://explorer.apothem.network",
      apiUrl: "https://explorer.apothem.network/api",
    },
  },
  testnet: true,
});
