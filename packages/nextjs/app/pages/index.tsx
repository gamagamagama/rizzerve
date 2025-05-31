import { useState, useEffect } from "react";
import { 
  useAccount, 
  useConnect, 
  useDisconnect, 
  useBalance, 
  useWriteContract, 
  useWaitForTransactionReceipt,
  useReadContract,
  createConfig,
  http
} from "wagmi";
import { injected } from "wagmi/connectors";
import { mainnet, sepolia } from 'wagmi/chains';
import { formatEther, parseEther, maxUint256 } from "viem";

// Wagmi configuration
const config = createConfig({
  chains: [mainnet, sepolia],
  connectors: [injected()],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
});

const tokenAddress = "YOUR_TOKEN_ADDRESS";        // Replace with deployed token address
const stakingAddress = "YOUR_STAKING_ADDRESS";    // Replace with deployed staking address

const tokenABI = [
    {
      "inputs": [{"name": "account", "type": "address"}],
      "name": "balanceOf",
      "outputs": [{"name": "", "type": "uint256"}],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {"name": "spender", "type": "address"},
        {"name": "amount", "type": "uint256"}
      ],
      "name": "approve",
      "outputs": [{"name": "", "type": "bool"}],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ];
  
  const stakingABI = [
    {
      "inputs": [
        {"name": "amount", "type": "uint256"},
        {"name": "lockTime", "type": "uint256"}
      ],
      "name": "stake",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "withdraw",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [{"name": "user", "type": "address"}],
      "name": "getStake",
      "outputs": [
        {"name": "amount", "type": "uint256"},
        {"name": "unlockTime", "type": "uint256"}
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ];
  

  export default function StakingDApp() {
    const { address, isConnected } = useAccount();
    const { connectors, connect } = useConnect();
    const { disconnect } = useDisconnect();
    
    const [stakeAmount, setStakeAmount] = useState("");
    const [lockTime, setLockTime] = useState(604800); // 1 week in seconds
    const [isApproving, setIsApproving] = useState(false);
    const [isStaking, setIsStaking] = useState(false);
  

  // Get token balance
  const { data: balanceData, refetch: refetchBalance } = useBalance({
    address,
    token: tokenAddress,
  });


   // Get stake info
   const { data: stakeData, refetch: refetchStake } = useReadContract({
    address: stakingAddress,
    abi: stakingABI,
    functionName: "getStake",
    args: address ? [address] : undefined,
  });

  // Contract write hooks
  const { 
    writeContract: approveContract, 
    data: approveHash,
    isPending: approvePending 
  } = useWriteContract();

  const { 
    writeContract: stakeContract, 
    data: stakeHash,
    isPending: stakePending 
  } = useWriteContract();

  const { 
    writeContract: withdrawContract,
    isPending: withdrawPending 
  } = useWriteContract();

  const { isSuccess: approveSuccess } = useWaitForTransactionReceipt({
    hash: approveHash,
  });

  const { isSuccess: stakeSuccess } = useWaitForTransactionReceipt({
    hash: stakeHash,
  });

 
  useEffect(() => {
    if (stakeSuccess) {
      setStakeAmount("");
      setIsStaking(false);
      refetchBalance();
      refetchStake();
    }
  }, [stakeSuccess, refetchBalance, refetchStake]);
  const handleApproveAndStake = async () => {
    if (!stakeAmount || Number(stakeAmount) <= 0) return;
    
    setIsApproving(true);
    setIsStaking(true);
    
    try {
      approveContract({
        address: tokenAddress,
        abi: tokenABI,
        functionName: "approve",
        args: [stakingAddress, maxUint256],
      });
    } catch (error) {
      console.error("Approve failed:", error);
      setIsApproving(false);
      setIsStaking(false);
    }
  };

  const handleStake = async () => {
    if (!stakeAmount) return;

    try {
      stakeContract({
        address: stakingAddress,
        abi: stakingABI,
        functionName: "stake",
        args: [parseEther(stakeAmount), BigInt(lockTime)],
      });
    } catch (error) {
      console.error("Stake failed:", error);
      setIsStaking(false);
    }
  };

  const handleWithdraw = async () => {
    try {
      withdrawContract({
        address: stakingAddress,
        abi: stakingABI,
        functionName: "withdraw",
      });
    } catch (error) {
      console.error("Withdraw failed:", error);
    }
  };

  const formatTimestamp = (timestamp : bigint) => {
    if (!timestamp || timestamp === 0n) return "No active stake";
    return new Date(Number(timestamp) * 1000).toLocaleString();
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        Token Staking DApp
      </h1>

      {!isConnected ? (
        <div className="text-center">
          <p className="text-gray-600 mb-4">Connect your wallet to start staking</p>
          <button
            onClick={() => connect({ connector: connectors[0] })}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
          >
            Connect Wallet
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Wallet Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">Connected Wallet</p>
                <p className="font-mono text-sm">{address}</p>
              </div>
              <button
                onClick={() => disconnect()}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm transition-colors"
              >
                Disconnect
              </button>
            </div>
          </div>

          {/* Balance Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-600 font-medium">Token Balance</p>
              <p className="text-xl font-bold text-green-800">
                {balanceData ? formatEther(balanceData.value) : "0"} Tokens
              </p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-600 font-medium">Staked Amount</p>
              <p className="text-xl font-bold text-blue-800">
                {stakeData ? formatEther(stakeData[0]) : "0"} Tokens
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-sm text-purple-600 font-medium">Unlock Time</p>
              <p className="text-sm font-medium text-purple-800">
                {stakeData ? formatTimestamp(stakeData[1]) : "No active stake"}
              </p>
            </div>
          </div>

          {/* Staking Form */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Stake Tokens</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount to Stake
                </label>
                <input
                  type="number"
                  placeholder="Enter amount"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lock Period
                </label>
                <select
                  value={lockTime}
                  onChange={(e) => setLockTime(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={604800}>1 Week</option>
                  <option value={1209600}>2 Weeks</option>
                  <option value={2592000}>1 Month</option>
                  <option value={7776000}>3 Months</option>
                </select>
              </div>

              <button
                onClick={handleApproveAndStake}
                disabled={isStaking || !stakeAmount || Number(stakeAmount) <= 0}
                className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                {isStaking ? (
                  isApproving ? "Approving..." : "Staking..."
                ) : (
                  "Approve & Stake Tokens"
                )}
              </button>
            </div>
          </div>

          {/* Withdraw Section */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Withdraw Stake</h2>
            <p className="text-gray-600 mb-4">
              You can only withdraw after the lock period expires.
            </p>
            <button
              onClick={handleWithdraw}
              disabled={withdrawPending || !stakeData || stakeData[0] === 0n}
              className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
            >
              {withdrawPending ? "Withdrawing..." : "Withdraw Stake"}
            </button>
          </div>

          {/* Simulation Panel Placeholder */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Yield & Treasury Simulation
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg">
                <h3 className="font-medium text-gray-700 mb-2">Estimated APY</h3>
                <p className="text-2xl font-bold text-green-600">12.5%</p>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <h3 className="font-medium text-gray-700 mb-2">Total Value Locked</h3>
                <p className="text-2xl font-bold text-blue-600">$1.2M</p>
              </div>
            </div>
            <div className="mt-4 bg-white p-4 rounded-lg">
              <p className="text-gray-600 text-center">
                📊 Interactive charts and detailed analytics will be displayed here
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
