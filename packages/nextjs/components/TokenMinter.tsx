import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  Coins, 
  Send, 
  CheckCircle, 
  AlertCircle, 
  Shield, 
  ShieldCheck, 
  ShieldX,
  Info,
  X
} from 'lucide-react';

const TokenMinter = () => {
  const [account, setAccount] = useState('');
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  
  // Token minting state
  const [mintTo, setMintTo] = useState('');
  const [mintAmount, setMintAmount] = useState('');
  
  // Token info state
  const [tokenName, setTokenName] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [totalSupply, setTotalSupply] = useState('');
  const [userBalance, setUserBalance] = useState('');
  const [isOwner, setIsOwner] = useState(false);
  const [isMinter, setIsMinter] = useState(false);

  // Contract ABI for ERC20 token with minting functionality
  const contractABI = [
    {
      "inputs": [],
      "name": "name",
      "outputs": [{"internalType": "string", "name": "", "type": "string"}],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
      "name": "isMinter",
      "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{"internalType": "address", "name": "minter", "type": "address"}],
      "name": "addMinter",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "symbol", 
      "outputs": [{"internalType": "string", "name": "", "type": "string"}],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "totalSupply",
      "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
      "name": "balanceOf",
      "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {"internalType": "address", "name": "to", "type": "address"},
        {"internalType": "uint256", "name": "amount", "type": "uint256"}
      ],
      "name": "mint",
      "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [{"internalType": "address", "name": "", "type": "address"}],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "anonymous": false,
      "inputs": [
        {"indexed": true, "internalType": "address", "name": "from", "type": "address"},
        {"indexed": true, "internalType": "address", "name": "to", "type": "address"},
        {"indexed": false, "internalType": "uint256", "name": "value", "type": "uint256"}
      ],
      "name": "Transfer",
      "type": "event"
    }
  ];

  // Replace with your actual contract address
  const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

  useEffect(() => {
    initializeWeb3();
  }, []);

  useEffect(() => {
    if (contract && account) {
      loadTokenInfo();
    }
  }, [contract, account]);

  const initializeWeb3 = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        // Create Web3 instance
        const web3Instance = new window.Web3(window.ethereum);
        setWeb3(web3Instance);
        
        // Check if already connected
        const accounts = await web3Instance.eth.getAccounts();
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          
          const contractInstance = new web3Instance.eth.Contract(contractABI, CONTRACT_ADDRESS);
          setContract(contractInstance);
        }
      } catch (err) {
        setError('Failed to initialize Web3: ' + err.message);
      }
    } else {
      setError('Please install MetaMask to use this application');
    }
  };

  const connectWallet = async () => {
    if (!web3) return;
    
    try {
      setLoading(true);
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      const accounts = await web3.eth.getAccounts();
      const address = accounts[0];
      setAccount(address);
      
      const contractInstance = new web3.eth.Contract(contractABI, CONTRACT_ADDRESS);
      setContract(contractInstance);
      
      setStatus('Wallet connected successfully!');
      setError('');
    } catch (err) {
      setError('Failed to connect wallet: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const weiToEther = (wei) => {
    if (!wei) return '0';
    return (parseInt(wei) / Math.pow(10, 18)).toString();
  };

  const etherToWei = (ether) => {
    return (parseFloat(ether) * Math.pow(10, 18)).toString();
  };

  const loadTokenInfo = async () => {
    if (!contract) return;
    
    try {
      const [name, symbol, supply] = await Promise.all([
        contract.methods.name().call(),
        contract.methods.symbol().call(),
        contract.methods.totalSupply().call()
      ]);
      
      setTokenName(name);
      setTokenSymbol(symbol);
      setTotalSupply(weiToEther(supply));
      
      if (account) {
        const [balance, owner, minterStatus] = await Promise.all([
          contract.methods.balanceOf(account).call(),
          contract.methods.owner().call(),
          contract.methods.isMinter ? contract.methods.isMinter(account).call() : Promise.resolve(false)
        ]);
        
        setUserBalance(weiToEther(balance));
        setIsOwner(owner.toLowerCase() === account.toLowerCase());
        setIsMinter(minterStatus);
      }
    } catch (err) {
      setError('Failed to load token info: ' + err.message);
    }
  };

  const mintTokens = async () => {
    if (!contract || !mintTo || !mintAmount || !account) return;
    
    try {
      setLoading(true);
      setError('');
      setStatus('Minting tokens...');
      
      const amount = etherToWei(mintAmount);
      
      // Estimate gas
      const gasEstimate = await contract.methods.mint(mintTo, amount).estimateGas({
        from: account
      });
      
      // Send transaction
      const result = await contract.methods.mint(mintTo, amount).send({
        from: account,
        gas: Math.floor(gasEstimate * 1.2) // Add 20% buffer
      });
      
      setStatus(`Successfully minted ${mintAmount} ${tokenSymbol} tokens to ${mintTo}`);
      
      // Refresh token info
      await loadTokenInfo();
      
      // Clear form
      setMintTo('');
      setMintAmount('');
    } catch (err) {
      setError('Failed to mint tokens: ' + err.message);
      setStatus('');
    } finally {
      setLoading(false);
    }
  };

  const shortenAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Add Web3 script to head if not present
  useEffect(() => {
    if (typeof window.Web3 === 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/web3/1.8.0/web3.min.js';
      script.onload = () => {
        initializeWeb3();
      };
      document.head.appendChild(script);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Coins className="h-12 w-12 text-indigo-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Token Minter</h1>
            <p className="text-gray-600">Mint ERC20 tokens on Scaffold-ETH</p>
          </div>

          {/* Connection Status */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-indigo-600 rounded-full flex items-center justify-center">
                  <Wallet className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">
                    {account ? 'Connected' : 'Not Connected'}
                  </p>
                  {account && (
                    <p className="text-sm text-gray-600">{shortenAddress(account)}</p>
                  )}
                </div>
              </div>
              {!account && (
                <button
                  onClick={connectWallet}
                  disabled={loading}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
                >
                  <Wallet className="h-4 w-4" />
                  <span>{loading ? 'Connecting...' : 'Connect Wallet'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Token Information */}
          {tokenName && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800">Token Name</h3>
                <p className="text-blue-600">{tokenName}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="font-semibold text-green-800">Symbol</h3>
                <p className="text-green-600">{tokenSymbol}</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <h3 className="font-semibold text-purple-800">Total Supply</h3>
                <p className="text-purple-600">{totalSupply}</p>
              </div>
              <div className="bg-orange-50 rounded-lg p-4">
                <h3 className="font-semibold text-orange-800">Your Balance</h3>
                <p className="text-orange-600">{userBalance}</p>
              </div>
            </div>
          )}

          {/* Authorization Status */}
          {account && tokenName && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2 mb-2">
                <Shield className="h-5 w-5 text-yellow-600" />
                <h3 className="font-semibold text-yellow-800">Authorization Status</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className={`px-3 py-1 rounded-full text-sm flex items-center space-x-1 ${isOwner ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                  {isOwner ? <ShieldCheck className="h-3 w-3" /> : <ShieldX className="h-3 w-3" />}
                  <span>{isOwner ? 'Owner' : 'Not Owner'}</span>
                </span>
                <span className={`px-3 py-1 rounded-full text-sm flex items-center space-x-1 ${isMinter ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                  {isMinter ? <CheckCircle className="h-3 w-3" /> : <X className="h-3 w-3" />}
                  <span>{isMinter ? 'Can Mint' : 'Cannot Mint'}</span>
                </span>
              </div>
              {!isOwner && !isMinter && (
                <div className="flex items-start space-x-2 mt-2">
                  <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <p className="text-yellow-700 text-sm">
                    You need to be the contract owner or an authorized minter to mint tokens.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Minting Form */}
          {account && (isOwner || isMinter) && (
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="h-8 w-8 bg-indigo-600 rounded-full flex items-center justify-center">
                  <Coins className="h-4 w-4 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">Mint Tokens</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recipient Address
                  </label>
                  <input
                    type="text"
                    value={mintTo}
                    onChange={(e) => setMintTo(e.target.value)}
                    placeholder="0x..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount (ETH units)
                  </label>
                  <input
                    type="number"
                    value={mintAmount}
                    onChange={(e) => setMintAmount(e.target.value)}
                    placeholder="1.0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              
              <button
                onClick={mintTokens}
                disabled={loading || !mintTo || !mintAmount || (!isOwner && !isMinter)}
                className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center justify-center space-x-2"
              >
                <Send className="h-4 w-4" />
                <span>{loading ? 'Minting...' : 'Mint Tokens'}</span>
              </button>
            </div>
          )}

          {/* Unauthorized Message */}
          {account && !isOwner && !isMinter && tokenName && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
              <div className="flex items-center space-x-2 mb-2">
                <ShieldX className="h-5 w-5 text-red-600" />
                <h3 className="font-semibold text-red-800">Not Authorized to Mint</h3>
              </div>
              <p className="text-red-700 mb-4">
                You are not authorized to mint tokens. Only the contract owner or authorized minters can mint tokens.
              </p>
              <div className="bg-red-100 rounded p-3">
                <p className="text-sm text-red-800 font-medium">Solutions:</p>
                <ul className="text-sm text-red-700 mt-1 list-disc list-inside">
                  <li>Switch to the account that deployed the contract</li>
                  <li>Ask the contract owner to add you as a minter</li>
                  <li>Use Account #0 from your local Hardhat network</li>
                </ul>
              </div>
            </div>
          )}

          {/* Status Messages */}
          {status && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4 flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
              <p className="text-green-800">{status}</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex items-center space-x-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Contract Info */}
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Info className="h-4 w-4 text-gray-500" />
              <p className="text-sm text-gray-600 font-medium">Contract Information</p>
            </div>
            <p className="text-sm text-gray-600">
              Address: <span className="font-mono">{CONTRACT_ADDRESS}</span>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Make sure to update this with your deployed contract address
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenMinter;