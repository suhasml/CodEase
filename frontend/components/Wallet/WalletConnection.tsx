import React, { useState, useEffect } from 'react';
import { Wallet, Plus, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getUserFromCookie, setCookie } from '@/lib/cookie-utils';

interface WalletConnectionProps {
  onWalletConnected?: (wallet: string) => void;
}

declare global {
  interface Window {
    ethereum?: any;
    solana?: any;
    phantom?: {
      solana?: {
        connect(): Promise<{ publicKey: { toString(): string } }>;
        isPhantom?: boolean;
      }
    }
  }
}

const WalletConnection: React.FC<WalletConnectionProps> = ({ onWalletConnected }) => {
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [walletProvider, setWalletProvider] = useState<'phantom' | 'metamask' | null>('phantom');  useEffect(() => {
    // Check if user has a wallet address stored
    const userData = getUserFromCookie();
    if (userData?.walletAddress) {
      setWalletAddress(userData.walletAddress);
      // Try to determine which wallet was used based on address format
      // Solana addresses are base58 encoded and don't start with 0x
      if (!userData.walletAddress.startsWith('0x')) {
        setWalletProvider('phantom');
      } else {
        setWalletProvider('metamask');
      }
      
      // Notify parent component that wallet is already connected
      if (onWalletConnected) {
        onWalletConnected(userData.walletAddress);
      }
    }
  }, [onWalletConnected]);
  const connectWallet = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      // First try Phantom wallet for Solana (our default wallet)
      const isPhantomInstalled = window.phantom?.solana?.isPhantom || window.solana?.isPhantom;
      
      let address: string;      if (isPhantomInstalled) {
        try {
          // Get the provider (ensure we're using Solana API)
          const provider = window.phantom?.solana || window.solana;
          
          // Connect to Phantom and get Solana address
          const response = await provider.connect();
          // Ensure we're getting the Solana public key (not an Ethereum address)
          if (!response.publicKey || typeof response.publicKey.toString !== 'function') {
            throw new Error('Failed to get Solana address from Phantom wallet');
          }          address = response.publicKey.toString();
          // Extra validation: Solana addresses are base58, 32-44 chars, never start with 0x
          const isValidSolana = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address) && !address.startsWith('0x');
          if (!isValidSolana) {
            throw new Error('The address returned is not a valid Solana address. Please ensure your Phantom wallet is set to Solana network.');
          }
          setWalletProvider('phantom');        } catch (phantomError: any) {
          // Show specific error for Phantom rejection
          if (phantomError.message?.includes('User rejected')) {
            throw new Error('Phantom wallet connection was rejected. Please try again.');
          }
          
          // If Phantom is installed but connection fails, ask user to retry
          throw new Error('Phantom wallet connection failed. Please try again or ensure your Phantom wallet is set up properly.');
          
          /* Commented out MetaMask fallback as we're prioritizing Phantom
          if (window.ethereum) {
            const accounts = await window.ethereum.request({
              method: 'eth_requestAccounts',
            });
            
            if (accounts && accounts.length > 0) {
              address = accounts[0];
              setWalletProvider('metamask');
            } else {
              throw new Error('No accounts found in MetaMask');
            }
          } else {
            throw new Error('Phantom connection failed and MetaMask not detected');
          }
          */
        }      } else if (window.ethereum) {
        // We only want to use Phantom wallet for this marketplace
        const errorMsg = 'Phantom wallet is required for this marketplace. Please install Phantom wallet extension.';
        setError(errorMsg);
        toast.error(errorMsg);
        setIsConnecting(false);
        return;
        
        /* Commented out MetaMask support as we're prioritizing Phantom
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        });
        
        if (accounts && accounts.length > 0) {
          address = accounts[0];
          setWalletProvider('metamask');
        } else {
          throw new Error('No accounts found in MetaMask');
        }
        */} else {
        // Always recommend Phantom wallet as our default
        const errorMsg = 'Phantom wallet not detected. Please install Phantom wallet extension, as it is our preferred wallet.';
        setError(errorMsg);
        toast.error(errorMsg);
        setIsConnecting(false);
        return;
      }

      // Set the address in component state
      setWalletAddress(address);
      
      // Store the wallet address in the user cookie
      const userData = getUserFromCookie();
      if (userData) {
        const updatedUserData = {
          ...userData,
          walletAddress: address
        };
        setCookie('user', updatedUserData);
      }      toast.success('Wallet connected successfully!');

      // Call callback if provided
      if (onWalletConnected) {
        onWalletConnected(address);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet');
      toast.error(err.message || 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-md mx-auto">
      {error && (
        <div className="mb-4 flex items-center gap-2 text-red-500 bg-red-500/10 p-3 rounded-lg">
          <AlertCircle size={18} />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {walletAddress ? (
        <div className="bg-[#111] border border-gray-800 rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Wallet className={`w-5 h-5 ${walletProvider === 'phantom' ? 'text-purple-400' : 'text-blue-400'} mr-2`} />
              <span className="text-white font-medium">
                {walletProvider === 'phantom' ? 'Phantom' : 'MetaMask'} Wallet
              </span>
            </div>
            <span className={`px-2 py-1 ${walletProvider === 'phantom' ? 'bg-purple-900/30 text-purple-400' : 'bg-blue-900/30 text-blue-400'} text-xs rounded-md`}>
              Active
            </span>
          </div>
          <div className="mt-3 bg-black/50 border border-gray-800 rounded-lg p-2.5 flex items-center justify-between gap-2">
            <p className="text-gray-300 text-sm font-mono truncate">
              {walletAddress}
            </p>
            <button
              onClick={() => {
                setWalletAddress('');
                setCookie('user', { ...getUserFromCookie(), walletAddress: '' });
                setError(null);
                if (onWalletConnected) onWalletConnected('');
              }}
              className="ml-2 px-3 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-xs"
            >
              Disconnect
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={connectWallet}
          disabled={isConnecting}
          className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium text-white 
          ${isConnecting 
            ? 'bg-purple-800/50 cursor-not-allowed' 
            : 'bg-purple-600 hover:bg-purple-700'} 
          transition-colors`}
        >          <Wallet size={18} className="text-purple-400" />
          {isConnecting ? 'Connecting...' : 'Connect Phantom Wallet'}
        </button>
      )}
    </div>
  );
};

export default WalletConnection;
