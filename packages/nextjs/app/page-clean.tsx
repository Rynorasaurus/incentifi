"use client";

import { useState } from "react";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { Address, Balance } from "~~/components/scaffold-eth";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const [selectedChore, setSelectedChore] = useState<number>(0);

  // Hardcoded chore data
  const chores = [
    { name: "Take Out Garbage", reward: "0.1", timeLimit: "2", description: "Take the garbage bins to the curb for pickup" },
    { name: "Wash Dishes", reward: "0.05", timeLimit: "1", description: "Wash and dry all dishes in the sink" },
    { name: "Walk Dog", reward: "0.08", timeLimit: "3", description: "Take the dog for a 20-minute walk" },
    { name: "Do Homework", reward: "0.15", timeLimit: "24", description: "Complete all assigned homework" },
    { name: "Mow Lawn", reward: "0.2", timeLimit: "6", description: "Mow the entire lawn and clean up clippings" }
  ];

  // Contract write hooks
  const { writeContractAsync: selectChore, isPending: isSelectingChore } = useScaffoldWriteContract("YourContract");
  const { writeContractAsync: completeChore, isPending: isCompletingChore } = useScaffoldWriteContract("YourContract");
  const { writeContractAsync: burnForReward, isPending: isBurningForReward } = useScaffoldWriteContract("YourContract");

  const handleSelectChore = async () => {
    try {
      await selectChore({
        functionName: "selectChore",
        args: [selectedChore],
      });
    } catch (e) {
      console.error("Error selecting chore:", e);
    }
  };

  const handleCompleteChore = async (choreType: number) => {
    try {
      await completeChore({
        functionName: "completeChore",
        args: [choreType],
      });
    } catch (e) {
      console.error("Error completing chore:", e);
    }
  };

  const handleBurnForReward = async (choreType: number) => {
    try {
      await burnForReward({
        functionName: "burnForReward",
        args: [choreType],
      });
    } catch (e) {
      console.error("Error burning for reward:", e);
    }
  };

  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="px-5">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
              🎮 Incentifi
            </h1>
            <p className="text-xl text-base-content/70">
              Gamified Chore dApp - Complete tasks, earn NFTs, claim rewards on XDC Apothem!
            </p>
          </div>

          {!connectedAddress ? (
            <div className="text-center">
              <div className="bg-base-200 p-8 rounded-2xl shadow-lg border border-base-300 max-w-md mx-auto">
                <h2 className="text-xl font-semibold mb-4">🔗 Connect Your Wallet</h2>
                <p className="text-base-content/70 mb-4">
                  Connect your wallet to XDC Apothem testnet to start earning rewards!
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* User Info */}
              <div className="bg-base-100 p-6 rounded-2xl shadow-lg border border-base-300">
                <h2 className="text-xl font-semibold mb-4">👤 Your Account</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-base-content/70 mb-1">Address:</p>
                    <Address address={connectedAddress} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-base-content/70 mb-1">Balance:</p>
                    <Balance address={connectedAddress} />
                  </div>
                </div>
              </div>

              {/* Chore Selection */}
              <div className="bg-base-100 p-6 rounded-2xl shadow-lg border border-base-300">
                <h2 className="text-xl font-semibold mb-4">🎯 Select a Chore</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="label">
                      <span className="label-text font-medium">Choose Chore:</span>
                    </label>
                    <select 
                      className="select select-bordered w-full"
                      value={selectedChore}
                      onChange={(e) => setSelectedChore(Number(e.target.value))}
                    >
                      {chores.map((chore, index) => (
                        <option key={index} value={index}>
                          {chore.name} - {chore.reward} XDC - {chore.timeLimit}h
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button
                      className="btn btn-primary w-full"
                      onClick={handleSelectChore}
                      disabled={isSelectingChore}
                    >
                      {isSelectingChore ? "Starting..." : "🚀 Start Chore"}
                    </button>
                  </div>
                </div>
                
                {/* Selected Chore Info */}
                <div className="bg-base-200 p-4 rounded-xl">
                  <h3 className="font-semibold text-lg mb-2">{chores[selectedChore].name}</h3>
                  <p className="text-base-content/70 mb-2">{chores[selectedChore].description}</p>
                  <div className="flex gap-4 text-sm">
                    <span className="badge badge-success">💰 {chores[selectedChore].reward} XDC</span>
                    <span className="badge badge-info">⏰ {chores[selectedChore].timeLimit} hours</span>
                  </div>
                </div>
              </div>

              {/* Active Chores */}
              <div className="bg-base-100 p-6 rounded-2xl shadow-lg border border-base-300">
                <h2 className="text-xl font-semibold mb-4">📋 Your Chores</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {chores.map((chore, index) => (
                    <div key={index} className="bg-base-200 p-4 rounded-xl">
                      <h3 className="font-semibold mb-2">{chore.name}</h3>
                      <p className="text-sm text-base-content/70 mb-3">{chore.description}</p>
                      <div className="flex gap-2 mb-3">
                        <span className="badge badge-success text-xs">💰 {chore.reward} XDC</span>
                        <span className="badge badge-info text-xs">⏰ {chore.timeLimit}h</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          className="btn btn-sm btn-success flex-1"
                          onClick={() => handleCompleteChore(index)}
                          disabled={isCompletingChore}
                        >
                          ✅ Complete
                        </button>
                        <button
                          className="btn btn-sm btn-warning flex-1"
                          onClick={() => handleBurnForReward(index)}
                          disabled={isBurningForReward}
                        >
                          🔥 Claim Reward
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Achievement Gallery */}
              <div className="bg-base-100 p-6 rounded-2xl shadow-lg border border-base-300">
                <h2 className="text-xl font-semibold mb-4">🏆 Achievement Badges</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {chores.map((chore, index) => (
                    <div key={index} className="bg-base-200 p-4 rounded-xl text-center">
                      <div className="text-3xl mb-2">🏅</div>
                      <p className="text-xs font-medium">{chore.name}</p>
                      <p className="text-xs text-base-content/50">Badge</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* How It Works */}
              <div className="bg-base-100 p-6 rounded-2xl shadow-lg border border-base-300">
                <h2 className="text-xl font-semibold mb-4">❓ How Incentifi Works</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-4xl mb-2">🎯</div>
                    <h3 className="font-semibold mb-2">1. Select Chore</h3>
                    <p className="text-sm text-base-content/70">Choose a chore and mint your task NFT</p>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl mb-2">✅</div>
                    <h3 className="font-semibold mb-2">2. Complete Task</h3>
                    <p className="text-sm text-base-content/70">Finish your chore within the time limit</p>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl mb-2">🎁</div>
                    <h3 className="font-semibold mb-2">3. Claim Rewards</h3>
                    <p className="text-sm text-base-content/70">Burn your NFT for XDC rewards + achievement badge</p>
                  </div>
                </div>
              </div>

              {/* XDC Network Info */}
              <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-6 rounded-2xl border border-blue-300/20">
                <h2 className="text-xl font-semibold mb-4">🌐 Running on XDC Apothem Testnet</h2>
                <p className="text-base-content/70 mb-4">
                  Your Incentifi dApp is now deployed on XDC Apothem testnet! This is perfect for the XDC Vibe Coding Bootcamp.
                </p>
                <div className="flex gap-4 text-sm">
                  <span className="badge badge-primary">Network: XDC Apothem</span>
                  <span className="badge badge-secondary">Chain ID: 51</span>
                  <span className="badge badge-accent">Testnet Ready</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Home;
