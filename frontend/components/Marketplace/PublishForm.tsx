/**
 * PublishForm Component
 * 
 * Handles the marketplace publishing flow with proper API call sequence:
 * 
 * On Component Mount:
 * 1. Username status check (/marketplace/my-username) - fetches existing username status
 *    - If username_set is true: auto-populates field and disables editing
 *    - If username_set is false: allows new username input and validation
 * 
 * For First-time Publishers (isEditing = false):
 * 1. Username validation (/marketplace/validate-username) - on input change with debounce
 * 2. Wallet registration (/marketplace/register-wallet) - before publishing
 * 3. Extension publishing (/marketplace/publish) - creates new listing
 * 
 * For Updating Existing Extensions (isEditing = true):
 * 1. Username validation (/marketplace/validate-username) - if username changed
 * 2. Extension update (/marketplace/listing/{extensionId}) - updates existing listing
 * 3. Wallet registration (/marketplace/register-wallet) - after update if needed
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Package, Tag, X, Upload, DollarSign, Check, AlertCircle, Loader2, Wallet } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { authenticatedFetch } from '@/lib/api-utils';
import WalletConnection from '@/components/Wallet/WalletConnection';
import WalletAddressDisplay from '@/components/Wallet/WalletAddressDisplay';
import { getUserFromCookie } from '@/lib/cookie-utils';

interface PublishFormProps {
  extensionId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  redirectToChat?: boolean;
  isEditing?: boolean;
  existingData?: {
    id: string;
    title: string;
    description: string;
    price_codon: number;
    category: string;
    tags: string[];
    username?: string;
  };
}

const PublishForm: React.FC<PublishFormProps> = ({ extensionId, onSuccess, onCancel, redirectToChat = false, isEditing = false, existingData }) => {
  const [title, setTitle] = useState(existingData?.title || '');
  const [description, setDescription] = useState(existingData?.description || '');
  const [price, setPrice] = useState<number>(existingData?.price_codon ?? 0);
  const [category, setCategory] = useState(existingData?.category || '');
  const [tags, setTags] = useState<string[]>(existingData?.tags || []);
  const [currentTag, setCurrentTag] = useState('');
  const [username, setUsername] = useState(existingData?.username || '');  const [isUsernameSet, setIsUsernameSet] = useState(false); // Track if user already has a username set
  const [isLoadingUsername, setIsLoadingUsername] = useState(true); // Track loading state for username fetch
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null); // Track submission errors
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [usernameStatus, setUsernameStatus] = useState<'checking' | 'available' | 'unavailable' | null>(
    existingData?.username ? 'available' : null
  );
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);  const [usernameTimeout, setUsernameTimeout] = useState<NodeJS.Timeout | null>(null);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [isCheckingWallet, setIsCheckingWallet] = useState(true);
  const [registeredWallet, setRegisteredWallet] = useState<{
    wallet_address: string;
    wallet_type: string;
    wallet_registered: boolean;
  } | null>(null);
  const router = useRouter();
    // Helper function to register wallet
  const registerWallet = async (walletAddress: string) => {
    try {
      const response = await authenticatedFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/marketplace/register-wallet`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            wallet_address: walletAddress,
            wallet_type: 'phantom'
          })
        }
      );      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        // If we have a specific error message from API, use it. Otherwise, provide a generic message
        const errorMessage = errorData.message || errorData.detail || 'Unable to register wallet';
        throw new Error(errorMessage);
      }
      
      return await response.json();    } catch (error) {
      throw error; // Re-throw for proper error handling in the calling function
    }
  };
    // Check if wallet is already connected
  useEffect(() => {
    const checkExistingWallet = async () => {
      setIsCheckingWallet(true);
      
      try {
        // First check if wallet is in cookie (for immediate display)
        const userData = getUserFromCookie();
        if (userData?.walletAddress) {
          setWalletAddress(userData.walletAddress);
        }

        // Then check if user has a registered wallet on the backend
        const response = await authenticatedFetch(
          `${process.env.NEXT_PUBLIC_API_URL}/marketplace/my-wallet`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          
          if (data.success && data.wallet_registered && data.wallet) {
            // User has a registered wallet
            setRegisteredWallet({
              wallet_address: data.wallet.wallet_address,
              wallet_type: data.wallet.wallet_type || 'phantom',
              wallet_registered: true
            });
            
            // Set the wallet address for form validation
            setWalletAddress(data.wallet.wallet_address);
            
            // Clear wallet errors since we have a registered wallet
            setErrors(prevErrors => {
              const newErrors = {...prevErrors};
              delete newErrors.wallet;
              return newErrors;
            });
          } else {
            // No registered wallet, keep existing behavior
            setRegisteredWallet(null);
          }
        }
      } catch (error) {
        // If API call fails, don't block the user - just continue with cookie wallet if available
        console.log('Could not check registered wallet:', error);
        setRegisteredWallet(null);
      } finally {
        setIsCheckingWallet(false);
      }
    };

    checkExistingWallet();
  }, []);

  // Fetch user's existing username on component mount
  useEffect(() => {
    const fetchExistingUsername = async () => {
      setIsLoadingUsername(true);
      try {
        const response = await authenticatedFetch(
          `${process.env.NEXT_PUBLIC_API_URL}/marketplace/my-username`,
          {
            method: 'GET'
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (data.username_set && data.username) {
            setUsername(data.username);
            setIsUsernameSet(true);
            setUsernameStatus('available');
          } else {
            // Username not set, allow user input
            setIsUsernameSet(false);
            // Only use existingData username if we're editing and user hasn't set a username yet
            if (isEditing && existingData?.username) {
              setUsername(existingData.username);
            } else {
              setUsername('');
            }
          }        } else {
          // If API fails, fallback to existing behavior
          setIsUsernameSet(false);
          if (isEditing && existingData?.username) {
            setUsername(existingData.username);
          }
        }} catch (error) {
        // On error, fallback to existing behavior
        setIsUsernameSet(false);
        if (isEditing && existingData?.username) {
          setUsername(existingData.username);
        }
      } finally {
        setIsLoadingUsername(false);
      }
    };

    fetchExistingUsername();
  }, [isEditing, existingData?.username]);

  const categories = [
        "DeFi Development",
        "Blockchain Integration", 
        "Smart Contracts",
        "Web3",
        "Crypto Trading",
        "NFT Development",
        "Wallet Integration",
        "DAO Tools",
        "Solidity Development",
        "Token Standards",
        "Cross-Chain",
        "Data Science",
        "Machine Learning",
        "DevOps",
        "Security",
        "Other"
    ];  // Helper function to get username status message for better UX
  const getUsernameStatusMessage = () => {
    if (!username.trim()) return null;
    
    if (usernameStatus === 'checking') {
      return { type: 'info', message: 'Checking availability...' };
    }
    
    if (usernameStatus === 'available') {
      return { type: 'success', message: '✓ Username is available!' };
    }
    
    if (errors.username) {
      return { type: 'error', message: errors.username };
    }
    
    return null;
  };
  // Username format validation helper
  const validateUsernameFormat = useCallback((username: string): string | null => {
    const trimmedUsername = username.trim();
    
    if (!trimmedUsername) {
      return 'Username is required';
    }
    
    if (trimmedUsername.length < 3) {
      return 'Username must be at least 3 characters long';
    }
    
    if (trimmedUsername.length > 30) {
      return 'Username must be no more than 30 characters long';
    }
    
    // Allow letters, numbers, underscores, and hyphens
    const usernameRegex = /^[a-zA-Z0-9_-]+$/;
    if (!usernameRegex.test(trimmedUsername)) {
      return 'Username can only contain letters, numbers, underscores, and hyphens';
    }
    
    // Must start with a letter or number
    if (!/^[a-zA-Z0-9]/.test(trimmedUsername)) {
      return 'Username must start with a letter or number';
    }
    
    // Must end with a letter or number
    if (!/[a-zA-Z0-9]$/.test(trimmedUsername)) {
      return 'Username must end with a letter or number';
    }
    
    return null;
  }, []);

  const validate = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!category) {
      newErrors.category = 'Category is required';
    }
    
    if (price < 0) {
      newErrors.price = 'Price cannot be negative';
    }    // Enhanced username validation
    if (!isUsernameSet) {
      // Only validate username if it's not already set
      const usernameFormatError = validateUsernameFormat(username);
      if (usernameFormatError) {
        newErrors.username = usernameFormatError;
      } else if (usernameStatus === 'unavailable') {
        newErrors.username = 'This username is already taken';
      } else if (usernameStatus === 'checking') {
        newErrors.username = 'Please wait while we check username availability';
      }
    }
    
    if (!walletAddress) {
      newErrors.wallet = 'You must connect a Phantom wallet to receive payments';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && currentTag.trim()) {
      e.preventDefault();
      if (tags.includes(currentTag.trim())) {
        return;
      }
      if (tags.length >= 5) {
        toast.error('Maximum 5 tags allowed');
        return;
      }
      setTags([...tags, currentTag.trim()]);
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };  const validateUsername = useCallback(async (usernameToCheck: string) => {
    const trimmedUsername = usernameToCheck.trim();
    
    if (!trimmedUsername) {
      setUsernameStatus(null);
      return;
    }

    // Check format first before making API call
    const formatError = validateUsernameFormat(trimmedUsername);
    if (formatError) {
      setUsernameStatus('unavailable');
      setErrors(prevErrors => ({...prevErrors, username: formatError}));
      return;
    }

    // Don't check if we're already checking or if the input is the same as the last checked value
    if (isCheckingUsername) {
      return;
    }

    setIsCheckingUsername(true);
    setUsernameStatus('checking');
    
    try {
      const response = await authenticatedFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/marketplace/validate-username`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: trimmedUsername
          })
        }
      );

      const data = await response.json();
      
      if (response.ok) {
        if (data.available) {
          setUsernameStatus('available');
          // Remove username from errors if it exists
          setErrors(prevErrors => {
            const newErrors = {...prevErrors};
            delete newErrors.username;
            return newErrors;
          });
        } else {
          setUsernameStatus('unavailable');
          setErrors(prevErrors => ({
            ...prevErrors, 
            username: data.message || 'This username is already taken'
          }));
        }
      } else {
        // If there's an API error, show appropriate message
        setUsernameStatus('unavailable');
        const errorMessage = data.message || 'Unable to verify username availability. Please try again.';
        setErrors(prevErrors => ({...prevErrors, username: errorMessage}));
      }    } catch (error) {
      setUsernameStatus('unavailable');
      setErrors(prevErrors => ({
        ...prevErrors, 
        username: 'Unable to verify username availability. Please check your connection and try again.'
      }));
    } finally {
      setIsCheckingUsername(false);
    }
  }, [validateUsernameFormat, isCheckingUsername]);// Add validateUsernameFormat to dependencies
  // Handler for wallet connection
  const handleWalletConnected = (address: string) => {
    setWalletAddress(address);
    // Clear wallet error if it exists
    setErrors(prevErrors => {
      const newErrors = {...prevErrors};
      delete newErrors.wallet;
      return newErrors;
    });
  };
  // Handler for disconnecting wallet
  const handleDisconnectWallet = () => {
    setWalletAddress('');
    setRegisteredWallet(null);
    
    // Clear from cookie as well
    const userData = getUserFromCookie();
    if (userData) {
      userData.walletAddress = '';
      document.cookie = `user=${JSON.stringify(userData)}; path=/;`;
    }
    
    // Set wallet error since wallet is now required
    setErrors(prevErrors => ({
      ...prevErrors,
      wallet: 'You must connect a Phantom wallet to receive payments'
    }));
  };

  // Handler to clear submit error when user makes changes
  const clearSubmitError = () => {
    if (submitError) {
      setSubmitError(null);
    }
  };// Handle username check with debounce
  useEffect(() => {
    // Skip validation if username is already set or still loading
    if (isUsernameSet || isLoadingUsername) {
      return;
    }

    // Clear any existing timeout
    if (usernameTimeout) {
      clearTimeout(usernameTimeout);
    }

    if (username.trim() === '') {
      setUsernameStatus(null);
      // Clear username errors when field is empty
      setErrors(prevErrors => {
        const newErrors = {...prevErrors};
        delete newErrors.username;
        return newErrors;
      });
      return;
    }

    // If editing and username is the same as existingData, no need to validate
    if (isEditing && existingData?.username === username) {
      setUsernameStatus('available');
      return;
    }

    // Check format first before setting timeout for API call
    const formatError = validateUsernameFormat(username);
    if (formatError) {
      // Don't make API call for format errors, set status immediately
      setUsernameStatus('unavailable');
      setErrors(prevErrors => ({...prevErrors, username: formatError}));
      return;
    }

    // Set new timeout for 500ms (only for valid format)
    const timeoutId = setTimeout(() => {
      validateUsername(username);
    }, 500);

    setUsernameTimeout(timeoutId);

    // Cleanup on unmount or username change
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [username, isEditing, existingData?.username, validateUsername, validateUsernameFormat, isUsernameSet, isLoadingUsername]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();    
    
    // Don't allow submission while username is being checked
    if (usernameStatus === 'checking') {
      toast.error('Please wait while we verify your username availability');
      return;
    }
    
    if (!validate()) {
      // Focus on first error field for better UX
      const firstErrorField = Object.keys(errors)[0];
      if (firstErrorField) {
        const element = document.querySelector(`[name="${firstErrorField}"], #${firstErrorField}`) as HTMLElement;
        element?.focus();
      }
      return;
    }
      setIsSubmitting(true);
    setSubmitError(null); // Clear any previous errors
    try {
      // For first-time publishers, register wallet BEFORE publishing
      // This ensures the wallet is registered in the system before creating the listing
      if (!isEditing && walletAddress) {
        toast.loading('Registering wallet for marketplace payments...', { id: 'wallet-registration' });
        try {
          await registerWallet(walletAddress);
          toast.dismiss('wallet-registration');
          toast.success('Wallet registered successfully!', { duration: 1000 });        } catch (walletError) {
          toast.dismiss('wallet-registration');
          // Just throw the wallet error message without adding more prefixes
          throw walletError;
        }
      }

      // Determine if we're creating a new listing or updating an existing one
      let endpoint: string;
      let method: string;
      let payload: any;
      
      if (isEditing) {
        endpoint = `${process.env.NEXT_PUBLIC_API_URL}/marketplace/listing/${extensionId}`;
        method = 'PATCH';
        // Only send fields that can be updated (exclude extension_id, seller_wallet)
        payload = {
          title,
          description,
          price_codon: price,
          category,
          tags,
          username
        };
      } else {
        endpoint = `${process.env.NEXT_PUBLIC_API_URL}/marketplace/publish`;
        method = 'POST';
        payload = {
          extension_id: extensionId,
          title,
          description,
          price_codon: price,
          category,
          tags,
          username,
          seller_wallet: walletAddress
        };
      }

      toast.loading(isEditing ? 'Updating extension...' : 'Publishing extension...', { id: 'publish-action' });
      
      const response = await authenticatedFetch(
        endpoint,
        {
          method: method,
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        }
      );
      
      toast.dismiss('publish-action');
          if (response.ok) {
        // For updates, we might need to register/update the wallet after successful update
        if (isEditing && walletAddress) {
          try {
            await registerWallet(walletAddress);          } catch (walletError) {
            // Non-blocking error for updates - wallet registration failure shouldn't stop the update
          }
        }
          const successMessage = isEditing 
          ? '✅ Extension updated successfully!' 
          : '🎉 Extension published to marketplace successfully!';
        
        // Show success toast
        toast.success(successMessage, { duration: 3000 });
        
        // Close the form first
        if (onCancel) {
          onCancel();
        }
        
        // Call onSuccess callback if provided
        if (onSuccess) {
          onSuccess();
        }
        
        // Navigate to marketplace page immediately without delay
        // The toast will show the success message, no need for additional delay
        router.push('/marketplace');
          } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || 'Something went wrong. Please try again or try again in some time.';
        setSubmitError(errorMessage);
        toast.error(`❌ ${errorMessage}`, { duration: 5000 });
      }    } catch (error) {
      // Handle wallet registration errors specifically
      if (error instanceof Error && error.message.includes('already registered')) {
        // Specific message for wallet already registered
        const walletErrorMessage = `This wallet is already registered by another user. Please use a different wallet.`;
        setSubmitError(walletErrorMessage);
        toast.error(`❌ ${walletErrorMessage}`, { duration: 5000 });
      } else if (error instanceof Error && error.message.toLowerCase().includes('wallet')) {
        // Generic message for all other wallet-related errors
        const walletErrorMessage = `Unable to register wallet. Please try again or use a different wallet.`;
        setSubmitError(walletErrorMessage);
        toast.error(`❌ ${walletErrorMessage}`, { duration: 5000 });
      } else {
        // General publishing errors
        const generalErrorMessage = `Something went wrong while ${isEditing ? 'updating' : 'publishing'} your extension. Please try again.`;
        setSubmitError(generalErrorMessage);
        toast.error(`❌ ${generalErrorMessage}`, { duration: 5000 });
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="max-w-2xl mx-auto bg-[#111] border border-gray-800 rounded-xl p-6 relative max-h-[90vh] overflow-y-auto">
      {/* Close button */}
      <button
        type="button"
        onClick={onCancel}
        className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Close modal"
      >
        <X className="w-5 h-5 text-gray-400" />
      </button>

      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-purple-900/30 rounded-lg">
          <Package className="w-5 h-5 text-purple-400" />
        </div>        <h2 className="text-xl font-semibold text-white">
          {isEditing ? 'Edit Marketplace Extension' : 'Publish to Marketplace'}
        </h2>
      </div>

      {/* Error Display Section */}
      {submitError && (
        <div className="mb-6 bg-red-900/20 border border-red-700/30 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <div>
              <h3 className="text-red-400 font-medium mb-1">
                {isEditing ? 'Update Failed' : 'Publishing Failed'}
              </h3>
              <p className="text-red-300 text-sm">{submitError}</p>
            </div>
            <button
              type="button"
              onClick={() => setSubmitError(null)}
              className="ml-auto p-1 hover:bg-red-800/30 rounded-full transition-colors"
              aria-label="Dismiss error"
            >
              <X className="w-4 h-4 text-red-400" />
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Extension Title
            </label>            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                clearSubmitError();
              }}
              className={`w-full px-4 py-2.5 bg-black/50 border ${
                errors.title ? 'border-red-500' : 'border-gray-700'
              } rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-blue-500`}
              placeholder="Enter extension title"
            />
            {errors.title && (
              <p className="text-red-500 text-xs">{errors.title}</p>
            )}
          </div>          {/* Username */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Developer Username
              {isLoadingUsername && (
                <span className="text-xs text-blue-400 ml-2">
                  <Loader2 className="inline w-3 h-3 animate-spin mr-1" />
                  Loading...
                </span>
              )}
            </label>            <div className="relative">
              {isUsernameSet ? (
                // Display existing username as read-only
                <div className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-600 rounded-lg text-gray-300 flex items-center justify-between">
                  <span className="flex items-center">
                    <Check className="w-4 h-4 text-green-500 mr-2" />
                    {username}
                  </span>
                  <span className="text-xs text-gray-500">Already set</span>
                </div>
              ) : (
                // Show input field for setting username
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={username}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Allow typing but don't validate format in real-time to avoid jarring UX
                    setUsername(value);
                  }}
                  className={`w-full px-4 py-2.5 ${usernameStatus === 'available' ? 'pr-10' : ''} bg-black/50 border ${
                    errors.username ? 'border-red-500' : 
                    usernameStatus === 'available' ? 'border-green-500' : 
                    usernameStatus === 'checking' ? 'border-blue-500' : 'border-gray-700'
                  } rounded-lg text-white focus:outline-none focus:ring-1 ${
                    usernameStatus === 'available' ? 'focus:ring-green-500' :
                    usernameStatus === 'unavailable' ? 'focus:ring-red-500' : 'focus:ring-blue-500' 
                  }`}
                  placeholder={isLoadingUsername ? "Loading..." : "Enter your developer username"}
                  maxLength={30}
                  aria-describedby="username-help"
                  aria-invalid={!!errors.username}
                  disabled={isSubmitting || isLoadingUsername}
                />
              )}              {!isUsernameSet && usernameStatus === 'checking' && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2" aria-label="Checking username availability">
                  <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                </div>
              )}
              {!isUsernameSet && usernameStatus === 'available' && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2" aria-label="Username is available">
                  <Check className="w-5 h-5 text-green-500" />
                </div>
              )}
              {!isUsernameSet && usernameStatus === 'unavailable' && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2" aria-label="Username is not available">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                </div>
              )}            </div>            <div id="username-help">
              {(() => {
                // Show loading state message
                if (isLoadingUsername) {
                  return (
                    <p className="text-xs text-blue-500" role="status">
                      Checking your username status...
                    </p>
                  );
                }
                
                // Don't show any message for already set username - just keep it clean
                if (isUsernameSet) {
                  return null;
                }
                
                // Show validation messages for new username input
                const statusMessage = getUsernameStatusMessage();
                if (statusMessage) {
                  const { type, message } = statusMessage;
                  return (
                    <p className={`text-xs ${
                      type === 'error' ? 'text-red-500' : 
                      type === 'success' ? 'text-green-500' : 
                      'text-blue-500'
                    }`} role={type === 'error' ? 'alert' : 'status'}>
                      {message}
                    </p>
                  );
                }
                
                // Show requirements when setting new username
                return (
                  <div className="space-y-1">
                    <p className="text-xs text-gray-400">This name will be displayed as the extension author</p>
                    <div className="text-xs text-gray-500">
                      <div>Requirements:</div>
                      <ul className="list-disc list-inside ml-2 space-y-0.5">
                        <li>3-30 characters long</li>
                        <li>Letters, numbers, underscores, and hyphens only</li>
                        <li>Must start and end with a letter or number</li>
                      </ul>
                    </div>
                  </div>                );
              })()}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Description
            </label>            <textarea
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                clearSubmitError();
              }}
              className={`w-full px-4 py-2.5 bg-black/50 border ${
                errors.description ? 'border-red-500' : 'border-gray-700'
              } rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[100px]`}
              placeholder="Describe what your extension does"
            />
            {errors.description && (
              <p className="text-red-500 text-xs">{errors.description}</p>
            )}
          </div>

          {/* Price */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Price (CODON tokens)
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <DollarSign className="w-4 h-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={price === 0 && !String(price).length ? '' : price}
                onChange={(e) => {
                  // Handle empty input
                  if (e.target.value === '') {
                    setPrice(0);
                    return;
                  }
                  
                  // Remove any non-numeric characters
                  const numericValue = e.target.value.replace(/[^0-9]/g, '');
                  
                  // Convert to number, removing leading zeros
                  const numberValue = numericValue ? parseInt(numericValue, 10) : 0;
                  
                  setPrice(numberValue);
                }}
                className={`w-full pl-10 pr-4 py-2.5 bg-black/50 border ${
                  errors.price ? 'border-red-500' : 'border-gray-700'
                } rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-blue-500`}
                placeholder="0"
              />
            </div>
            {errors.price && (
              <p className="text-red-500 text-xs">{errors.price}</p>
            )}
            <p className="text-xs text-gray-400">Set to 0 for a free extension</p>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Category
            </label>
            <div className="relative">              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  clearSubmitError();
                }}
                className={`w-full px-4 py-2.5 bg-black/50 border ${
                  errors.category ? 'border-red-500' : 'border-gray-700'
                } rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none`}
              >
                <option value="" className="text-gray-400">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </div>
            </div>
            {errors.category && (
              <p className="text-red-500 text-xs">{errors.category}</p>
            )}
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Tags (up to 5)
            </label>
            <div className="flex items-center">
              <div className="relative flex-grow">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <Tag className="w-4 h-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  className="w-full pl-10 pr-4 py-2.5 bg-black/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Add a tag (press Enter)"
                  disabled={tags.length >= 5}
                />
              </div>
            </div>
            
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag, index) => (
                  <div
                    key={index}
                    className="inline-flex items-center gap-1 bg-blue-900/30 text-blue-400 px-2 py-1 rounded-md text-xs"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="p-0.5 hover:bg-blue-800/50 rounded-full"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-gray-400">Press Enter to add a tag</p>
          </div>

          {/* Wallet Connection */}
          <div className="space-y-3 mt-2">
            <label className="block text-sm font-medium text-gray-300">
              Connect Wallet to Receive Payments
            </label>
            
            {isCheckingWallet ? (
              <div className="bg-[#111] border border-gray-800 rounded-lg p-4">
                <div className="flex items-center">
                  <Loader2 className="w-4 h-4 text-purple-400 animate-spin mr-2" />
                  <span className="text-gray-300 text-sm">Checking registered wallet...</span>
                </div>
              </div>
            ) : registeredWallet?.wallet_registered ? (
              <div className="bg-[#111] border border-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <Wallet className="w-5 h-5 text-blue-400 mr-2" />
                    <span className="text-white font-medium">Registered Wallet</span>
                  </div>
                  <span className="px-2 py-1 bg-green-900/30 text-green-400 text-xs rounded-md">
                    Ready for Payments
                  </span>
                </div>                <div className="bg-black/50 border border-gray-800 rounded-lg p-2.5 flex items-center justify-between gap-2">
                  <div className="flex-1">
                    <WalletAddressDisplay address={registeredWallet.wallet_address} />
                    <p className="text-xs text-gray-400 mt-1">
                      {registeredWallet.wallet_type === 'phantom' ? 'Phantom Wallet' : 'Wallet'} • Registered
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleDisconnectWallet}
                    className="ml-2 px-3 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-xs"
                  >
                    Change
                  </button>
                </div>
              </div>
            ) : walletAddress ? (
              <div className="bg-[#111] border border-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <Wallet className="w-5 h-5 text-blue-400 mr-2" />
                    <span className="text-white font-medium">Wallet Connected</span>
                  </div>
                  <span className="px-2 py-1 bg-green-900/30 text-green-400 text-xs rounded-md">
                    Ready for Payments
                  </span>
                </div>                <div className="bg-black/50 border border-gray-800 rounded-lg p-2.5 flex items-center justify-between gap-2">
                  <div className="flex-1">
                    <WalletAddressDisplay address={walletAddress} />
                  </div>
                  <button
                    type="button"
                    onClick={handleDisconnectWallet}
                    className="ml-2 px-3 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-xs"
                  >
                    Disconnect
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-gray-300 mb-3">Connect your wallet to receive payments from extension purchases</p>
                <WalletConnection onWalletConnected={handleWalletConnected} />
                {errors.wallet && (
                  <p className="text-red-500 text-xs mt-2">{errors.wallet}</p>
                )}              </div>
            )}
          </div>
        </div>

        <div className="mt-8 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-300 border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2 ${
              isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            <Upload size={16} />
            {isSubmitting 
              ? (isEditing ? 'Updating...' : 'Publishing...') 
              : (isEditing ? 'Update Extension' : 'Publish Extension')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PublishForm;
