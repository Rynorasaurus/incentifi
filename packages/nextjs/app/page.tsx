"use client";

import { useState, useEffect } from "react";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { Address, Balance } from "~~/components/scaffold-eth";
import { useScaffoldWriteContract, useScaffoldReadContract } from "~~/hooks/scaffold-eth";

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

  // Contract hooks
  const { writeContractAsync: selectChore, isPending: isSelectingChore } = useScaffoldWriteContract("YourContract");
  const { writeContractAsync: completeChore, isPending: isCompletingChore } = useScaffoldWriteContract("YourContract");
  const { writeContractAsync: burnForReward, isPending: isBurningForReward } = useScaffoldWriteContract("YourContract");
  
  // Read current chore status for selected chore
  const { data: currentChoreStatus } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "userChores",
    args: [connectedAddress, selectedChore],
  });

  // Read Walk Dog chore status specifically
  const { data: walkDogStatus } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "userChores",
    args: [connectedAddress, 2], // Walk Dog is index 2
  });
  
  // Track completion counts locally (will persist in localStorage)
  const [choreCompletionCounts, setChoreCompletionCounts] = useState<number[]>([0, 0, 0, 0, 0]);
  
  // Modal states for popups
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [completedChoreType, setCompletedChoreType] = useState<number>(0);
  const [rewardAmount, setRewardAmount] = useState<string>("");
  const [isLotteryWin, setIsLotteryWin] = useState(false);
  
  // Track active chores
  const [activeChores, setActiveChores] = useState<{[key: number]: {selected: boolean, completed: boolean, deadline: number}}>({});

  // Load completion counts from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && connectedAddress) {
      const saved = localStorage.getItem(`choreCompletions_${connectedAddress}`);
      if (saved) {
        setChoreCompletionCounts(JSON.parse(saved));
      }
    }
  }, [connectedAddress]);

  // Save completion counts to localStorage
  const saveCompletionCounts = (newCounts: number[]) => {
    if (typeof window !== 'undefined' && connectedAddress) {
      localStorage.setItem(`choreCompletions_${connectedAddress}`, JSON.stringify(newCounts));
      setChoreCompletionCounts(newCounts);
    }
  };

  const handleSelectChore = async () => {
    try {
      await selectChore({
        functionName: "selectChore",
        args: [selectedChore],
      });
      
      // Track active chore
      const deadline = Date.now() + (parseInt(chores[selectedChore].timeLimit) * 60 * 60 * 1000);
      setActiveChores(prev => ({
        ...prev,
        [selectedChore]: { selected: true, completed: false, deadline }
      }));
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
      
      // Update active chore status
      setActiveChores(prev => ({
        ...prev,
        [choreType]: { ...prev[choreType], completed: true }
      }));
      
      // Show completion celebration modal
      setCompletedChoreType(choreType);
      setShowCompletionModal(true);
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
      
      // Remove from active chores
      setActiveChores(prev => {
        const updated = { ...prev };
        delete updated[choreType];
        return updated;
      });
      
      // Increment completion count for this chore type
      const newCounts = [...choreCompletionCounts];
      newCounts[choreType] = (newCounts[choreType] || 0) + 1;
      saveCompletionCounts(newCounts);
      
      // Show reward modal with amount and lottery status
      const baseReward = chores[choreType].reward;
      const lottery = Math.random() < 0.1; // 10% chance simulation
      const finalReward = lottery ? (parseFloat(baseReward) * 2).toString() : baseReward;
      
      setRewardAmount(finalReward);
      setIsLotteryWin(lottery);
      setCompletedChoreType(choreType);
      setShowRewardModal(true);
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
              <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
              <p className="text-base-content/70 mb-6">
                Connect your wallet to start earning rewards for completing chores on XDC Apothem testnet!
              </p>
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
                <h2 className="text-xl font-semibold mb-4">🎯 Select Your Chore</h2>
                
                {/* Current Chore Status */}
                {currentChoreStatus && currentChoreStatus[1] > 0 && (
                  <div className="mb-4 p-3 bg-warning/20 border border-warning rounded-lg">
                    <p className="text-sm font-medium text-warning-content">
                      ⚠️ You have an active {chores[selectedChore]?.name} chore. 
                      {currentChoreStatus[3] ? " Complete and claim it first!" : " Complete it to select again."}
                    </p>
                  </div>
                )}

                {/* Walk Dog Debug Info */}
                {walkDogStatus && walkDogStatus[1] > 0 && (
                  <div className="mb-4 p-3 bg-info/20 border border-info rounded-lg">
                    <p className="text-sm font-medium text-info-content">
                      🐕 Walk Dog Status: Started at {new Date(Number(walkDogStatus[1]) * 1000).toLocaleString()} | 
                      Completed: {walkDogStatus[3] ? "✅" : "❌"} | 
                      Redeemed: {walkDogStatus[4] ? "✅" : "❌"}
                    </p>
                    {walkDogStatus[3] && !walkDogStatus[4] && (
                      <p className="text-xs mt-1">Walk Dog is completed but not redeemed. Use the chore cards below to claim your reward!</p>
                    )}
                  </div>
                )}
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

              {/* Chore in Progress */}
              {Object.keys(activeChores).length > 0 && (
                <div className="bg-base-100 p-6 rounded-2xl shadow-lg border border-base-300">
                  <h2 className="text-xl font-semibold mb-4">⏳ Chore in Progress</h2>
                  <div className="space-y-4">
                    {Object.entries(activeChores).map(([choreIndex, choreStatus]) => {
                      const index = parseInt(choreIndex);
                      const chore = chores[index];
                      const timeLeft = Math.max(0, choreStatus.deadline - Date.now());
                      const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
                      const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
                      
                      return (
                        <div key={index} className="bg-gradient-to-r from-primary/20 to-secondary/20 p-4 rounded-xl border border-primary/30">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="font-semibold text-lg">{chore.name}</h3>
                              <p className="text-sm text-base-content/70">{chore.description}</p>
                            </div>
                            <div className="text-right">
                              <div className="badge badge-primary">💰 {chore.reward} XDC</div>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex gap-2">
                              {choreStatus.completed ? (
                                <span className="badge badge-success">✅ Completed</span>
                              ) : (
                                <span className="badge badge-warning">⏳ In Progress</span>
                              )}
                              <span className="badge badge-info">
                                ⏰ {timeLeft > 0 ? `${hoursLeft}h ${minutesLeft}m left` : "Time expired"}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

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
                          className="btn btn-sm btn-success w-full"
                          onClick={() => handleCompleteChore(index)}
                          disabled={isCompletingChore}
                        >
                          ✅ Mark as Completed
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
                  {chores.map((chore, index) => {
                    const completionCount = choreCompletionCounts[index] || 0;
                    return (
                      <div key={index} className="bg-base-200 p-4 rounded-xl text-center">
                        <div className="text-3xl mb-2">🏅</div>
                        <p className="text-xs font-medium">{chore.name}</p>
                        <p className="text-xs text-base-content/50">
                          {completionCount === 0 ? "Not completed" : `Completed ${completionCount}x`}
                        </p>
                      </div>
                    );
                  })}
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

      {/* Completion Celebration Modal */}
      {showCompletionModal && (
        <div className="modal modal-open">
          <div className="modal-box text-center relative">
            <div className="text-6xl mb-4 animate-bounce">🎉</div>
            <h3 className="font-bold text-2xl mb-4 text-success">Congratulations!</h3>
            <p className="text-lg mb-6">
              You&apos;ve successfully completed <span className="font-semibold text-primary">{chores[completedChoreType]?.name}</span>!
            </p>
            <div className="bg-success/20 p-4 rounded-lg mb-6">
              <p className="text-success font-medium">✅ Task marked as completed</p>
              <p className="text-sm text-base-content/70 mt-2">Now claim your reward to earn XDC and an achievement badge!</p>
            </div>
            <div className="modal-action justify-center">
              <button 
                className="btn btn-primary btn-lg"
                onClick={() => {
                  setShowCompletionModal(false);
                  handleBurnForReward(completedChoreType);
                }}
                disabled={isBurningForReward}
              >
                {isBurningForReward ? "Claiming..." : "🎁 Claim My Reward!"}
              </button>
              <button 
                className="btn btn-ghost"
                onClick={() => setShowCompletionModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reward Collection Modal */}
      {showRewardModal && (
        <div className="modal modal-open">
          <div className="modal-box text-center relative">
            <div className="text-6xl mb-4 animate-pulse">
              {isLotteryWin ? "🎰💰" : "🏆"}
            </div>
            <h3 className="font-bold text-2xl mb-4 text-success">
              {isLotteryWin ? "LOTTERY WINNER!" : "Reward Claimed!"}
            </h3>
            <div className="bg-gradient-to-r from-success/20 to-primary/20 p-6 rounded-xl mb-6">
              <div className="text-3xl font-bold text-primary mb-2">
                {rewardAmount} XDC
              </div>
              {isLotteryWin && (
                <div className="badge badge-warning badge-lg mb-2">
                  🎰 2x LOTTERY BONUS!
                </div>
              )}
              <p className="text-sm text-base-content/70">
                Reward for completing <span className="font-semibold">{chores[completedChoreType]?.name}</span>
              </p>
            </div>
            <div className="flex justify-center gap-2 mb-4">
              <div className="badge badge-success">💰 XDC Earned</div>
              <div className="badge badge-primary">🏅 Achievement Badge</div>
              <div className="badge badge-secondary">📈 Progress Tracked</div>
            </div>
            <div className="modal-action justify-center">
              <button 
                className="btn btn-primary btn-lg"
                onClick={() => setShowRewardModal(false)}
              >
                🚀 Awesome!
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Home;
