'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Coins, DollarSign, Upload, X, Check, AlertCircle, Loader2, Globe, Users, Gift, Shield, Eye, EyeOff, Sparkles, Star, Zap, Info, Plus, Minus, HelpCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { authenticatedFetch } from '@/lib/api-utils';
import TokenPreview from './TokenPreview';

interface TokenizationFormProps {
  extensionId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

// Enhanced input component moved outside to prevent recreation on every render
const EnhancedInput = React.memo(({ 
  label, 
  value, 
  onChange, 
  placeholder, 
  error, 
  status, 
  icon: Icon, 
  type = "text",
  maxLength,
  hint,
  ...props 
}: any) => (
  <motion.div 
    variants={{
      hidden: { opacity: 0, x: -20 },
      visible: { opacity: 1, x: 0 }
    }} 
    className="space-y-2"
  >
    <label className="flex text-sm font-medium text-gray-300 items-center gap-2">
      {Icon && <Icon className="w-4 h-4" />}
      {label}
    </label>
    <div className="relative group">
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-4 py-3 ${status === 'available' ? 'pr-12' : 'pr-4'} 
          bg-gray-900/50 backdrop-blur-sm border-2 transition-all duration-300
          ${error ? 'border-red-500 focus:border-red-400' : 
            status === 'available' ? 'border-green-500 focus:border-green-400' : 
            status === 'checking' ? 'border-blue-500 focus:border-blue-400' : 
            'border-gray-700 focus:border-blue-500'
          } 
          rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2
          ${status === 'available' ? 'focus:ring-green-500/20' :
            error ? 'focus:ring-red-500/20' : 'focus:ring-blue-500/20'
          }
          group-hover:border-gray-600 transition-all duration-200`}
        placeholder={placeholder}
        maxLength={maxLength}
        disabled={false}
        {...props}
      />
      
      <AnimatePresence>
        {status === 'checking' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2"
          >
            <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
          </motion.div>
        )}
        {status === 'available' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2"
          >
            <Check className="w-5 h-5 text-green-500" />
          </motion.div>
        )}
        {status === 'unavailable' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2"
          >
            <AlertCircle className="w-5 h-5 text-red-500" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    <AnimatePresence>
      {error && (
        <motion.p 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="text-red-400 text-xs flex items-center gap-1"
        >
          <AlertCircle className="w-3 h-3" />
          {error}
        </motion.p>
      )}
    </AnimatePresence>
    {hint && (
      <p className="text-xs text-gray-400">{hint}</p>
    )}
  </motion.div>
));

EnhancedInput.displayName = 'EnhancedInput';

// Tooltip component for form field explanations
const Tooltip = React.memo(({ text, children }: { text: string; children: React.ReactNode }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [placement, setPlacement] = useState<'right' | 'left'>('right');
  const triggerRef = useRef<HTMLDivElement | null>(null);

  const handleMouseEnter = () => {
    // Decide placement based on viewport space to avoid overflow
    const estimatedWidth = 260; // px
    const margin = 12; // px
    const rect = triggerRef.current?.getBoundingClientRect();
    if (rect) {
      const spaceRight = window.innerWidth - rect.right;
      const spaceLeft = rect.left;
      if (spaceRight < estimatedWidth + margin && spaceLeft > estimatedWidth + margin) {
        setPlacement('left');
      } else {
        setPlacement('right');
      }
    }
    setIsVisible(true);
  };

  const handleMouseLeave = () => setIsVisible(false);

  return (
    <div className="relative inline-block">
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="cursor-help"
      >
        {children}
      </div>
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, x: placement === 'right' ? 10 : -10, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: placement === 'right' ? 10 : -10, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className={`absolute z-50 top-1/2 -translate-y-1/2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg shadow-lg border border-gray-700 max-w-[260px] whitespace-normal break-words ${placement === 'right' ? 'left-full ml-2' : 'right-full mr-2'}`}
          >
            {text}
            {placement === 'right' ? (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 -ml-2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-800"></div>
            ) : (
              <div className="absolute right-0 top-1/2 -translate-y-1/2 -mr-2 w-0 h-0 border-t-4 border-b-4 border-l-4 border-transparent border-l-gray-800"></div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

Tooltip.displayName = 'Tooltip';

// Number input component with spinner controls
const NumberInput = React.memo(({ 
  label, 
  value, 
  onChange, 
  min = 0, 
  max = 100, 
  step = 1,
  tooltip,
  error,
  icon: Icon,
  suffix = "%",
  ...props 
}: any) => (
  <motion.div 
    variants={{
      hidden: { opacity: 0, x: -20 },
      visible: { opacity: 1, x: 0 }
    }} 
    className="space-y-2"
  >
    <label className="flex text-sm font-medium text-gray-300 items-center gap-2">
      {Icon && <Icon className="w-4 h-4" />}
      {label}
      {tooltip && (
        <Tooltip text={tooltip}>
          <HelpCircle className="w-4 h-4 text-gray-400 hover:text-blue-400 transition-colors" />
        </Tooltip>
      )}
    </label>
    <div className="relative group">
      <div className="flex items-center bg-gray-900/50 backdrop-blur-sm border-2 border-gray-700 rounded-xl overflow-hidden">
        <button
          type="button"
          onClick={() => {
            const newValue = Math.max(min, value - step);
            onChange(newValue);
          }}
          className="p-2 hover:bg-gray-700 transition-colors text-gray-400 hover:text-white"
          disabled={value <= min}
        >
          <Minus className="w-4 h-4" />
        </button>
        <input
          type="number"
          value={value}
          onChange={(e) => {
            const newValue = Math.max(min, Math.min(max, parseInt(e.target.value) || min));
            onChange(newValue);
          }}
          className="flex-1 px-3 py-2 bg-transparent text-white text-center focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          min={min}
          max={max}
          step={step}
          {...props}
        />
        <span className="px-2 text-gray-400 text-sm">{suffix}</span>
        <button
          type="button"
          onClick={() => {
            const newValue = Math.min(max, value + step);
            onChange(newValue);
          }}
          className="p-2 hover:bg-gray-700 transition-colors text-gray-400 hover:text-white"
          disabled={value >= max}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
    <AnimatePresence>
      {error && (
        <motion.p 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="text-red-400 text-xs flex items-center gap-1"
        >
          <AlertCircle className="w-3 h-3" />
          {error}
        </motion.p>
      )}
    </AnimatePresence>
  </motion.div>
));

NumberInput.displayName = 'NumberInput';

// Hedera Wallet Setup Component
const HederaWalletSetup = React.memo(({ onWalletSet }: { onWalletSet: (walletId: string) => void }) => {
  const [walletId, setWalletId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate format (0.0.123456)
    if (!/^\d+\.\d+\.\d+$/.test(walletId)) {
      setError('Please enter a valid Hedera wallet ID (format: 0.0.123456)');
      return;
    }

    setIsSubmitting(true);
    setError('');
    
    try {
      await onWalletSet(walletId);
      setWalletId('');
    } catch (error) {
      setError('Failed to set wallet');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Hedera Wallet ID
        </label>
        <div className="flex gap-3">
          <input
            type="text"
            value={walletId}
            onChange={(e) => setWalletId(e.target.value)}
            placeholder="0.0.123456"
            className="flex-1 px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            disabled={isSubmitting}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSubmit(e as any);
              }
            }}
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !walletId}
            className={`px-6 py-3 rounded-xl transition-all duration-300 flex items-center gap-2 ${
              isSubmitting || !walletId
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Setting...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Set Wallet
              </>
            )}
          </motion.button>
        </div>
      </div>
      {error && (
        <p className="text-red-400 text-sm flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
      <p className="text-xs text-gray-400">
        Enter your Hedera wallet address where you'll receive your allocated creator tokens and trading fees.
      </p>
    </div>
  );
});

HederaWalletSetup.displayName = 'HederaWalletSetup';

const TokenizationForm: React.FC<TokenizationFormProps> = ({ extensionId, onSuccess, onCancel }) => {
  const router = useRouter();
  
  // Form state
  const [tokenName, setTokenName] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [totalSupply, setTotalSupply] = useState<number>(1000000);
  const [liquidityAllocation, setLiquidityAllocation] = useState<number>(90); // Default 90% to DEX, 10% to creator
  // Initial price removed - not sent to Hedera smart contract
  const [description, setDescription] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  
  // Extension and wallet info
  const [extensionInfo, setExtensionInfo] = useState<any>(null);
  const [hederaWallet, setHederaWallet] = useState<string | null>(null);
  const [loadingWallet, setLoadingWallet] = useState(true);
  const [loadingExtensionInfo, setLoadingExtensionInfo] = useState(true);
  
  // Social media handles
  const [socialTwitter, setSocialTwitter] = useState('');
  const [socialDiscord, setSocialDiscord] = useState('');
  const [socialTelegram, setSocialTelegram] = useState('');
  
  // Optional features
  const [bundleOptIn, setBundleOptIn] = useState(false);
  const [earlyBuyerAirdrop, setEarlyBuyerAirdrop] = useState(false);
  const [enableDaoVoting, setEnableDaoVoting] = useState(false);
  
  // Validation state
  const [tokenNameStatus, setTokenNameStatus] = useState<'checking' | 'available' | 'unavailable' | null>(null);
  const [tokenSymbolStatus, setTokenSymbolStatus] = useState<'checking' | 'available' | 'unavailable' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  // Preview state
  const [showPreview, setShowPreview] = useState(false);
  
  // Success modal state
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successTokenInfo, setSuccessTokenInfo] = useState<any>(null);
  const [isNavigatingToTokenPage, setIsNavigatingToTokenPage] = useState(false);
  const [showWalletEditor, setShowWalletEditor] = useState(false);

  // Enhanced animations - memoized to prevent recreation
  const containerVariants = useMemo(() => ({
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6,
        staggerChildren: 0.1 
      }
    }
  }), []);

  const itemVariants = useMemo(() => ({
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  }), []);

  // Handle cancel - navigate back to chat
  const handleCancel = useCallback(() => {
    if (onCancel) {
      onCancel();
    } else {
      router.push(`/chat/${extensionId}`);
    }
  }, [onCancel, router, extensionId]);

  // Load extension info and Hedera wallet on mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Load extension info
        const extensionResponse = await authenticatedFetch(
          `${process.env.NEXT_PUBLIC_API_URL}/middleware/hedera/extension-info/${extensionId}`
        );
        
        if (extensionResponse.ok) {
          const data = await extensionResponse.json();
          if (data.success) {
            setExtensionInfo(data.extension_info);
            // Auto-fill description
            if (data.extension_info.suggested_description) {
              setDescription(data.extension_info.suggested_description);
            }
            // Don't auto-fill token name - let user choose their own
          } else {
            // Extension already tokenized or other error
            toast.error(data.message);
            if (data.tokenization_info) {
              // Show tokenization info and redirect
              toast.success(`Extension already tokenized as ${data.tokenization_info.token_name} (${data.tokenization_info.token_symbol})`);
              handleCancel();
            }
          }
        }
        
        // Load Hedera wallet
        const walletResponse = await authenticatedFetch(
          `${process.env.NEXT_PUBLIC_API_URL}/middleware/hedera/get-wallet`
        );
        
        if (walletResponse.ok) {
          const walletData = await walletResponse.json();
          if (walletData.success) {
            setHederaWallet(walletData.hedera_wallet_id);
          } else {
            // No wallet set - will show setup prompt
            setHederaWallet(null);
          }
        }
      } catch (error) {
        console.error('Error loading initial data:', error);
        toast.error('Failed to load extension information');
      } finally {
        setLoadingExtensionInfo(false);
        setLoadingWallet(false);
      }
    };

    loadInitialData();
  }, [extensionId, handleCancel]);

  // Handle success - navigate back to chat with success message
  const handleSuccess = useCallback(() => {
    if (onSuccess) {
      onSuccess();
    } else {
      router.push(`/chat/${extensionId}`);
    }
  }, [onSuccess, router, extensionId]);

  // Memoized validation functions to prevent recreation
  const validateTokenName = useCallback(async (name: string) => {
    if (!name || name.length < 3) {
      setTokenNameStatus(null);
      return;
    }

    try {
      const response = await authenticatedFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/middleware/tokenization/validate-token`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token_name: name })
        }
      );

      if (response.ok) {
        const data = await response.json();
        setTokenNameStatus(data.is_available ? 'available' : 'unavailable');
        if (!data.is_available) {
          setErrors(prev => ({ ...prev, tokenName: data.message }));
        } else {
          setErrors(prev => ({ ...prev, tokenName: '' }));
        }
      }
    } catch (error) {
      console.error('Error validating token name:', error);
    }
  }, []);

  const validateTokenSymbol = useCallback(async (symbol: string) => {
    if (!symbol || symbol.length < 3) {
      setTokenSymbolStatus(null);
      return;
    }

    try {
      const response = await authenticatedFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/middleware/tokenization/validate-token`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token_name: tokenName, token_symbol: symbol })
        }
      );

      if (response.ok) {
        const data = await response.json();
        setTokenSymbolStatus(data.is_available ? 'available' : 'unavailable');
        if (!data.is_available) {
          setErrors(prev => ({ ...prev, tokenSymbol: data.message }));
        } else {
          setErrors(prev => ({ ...prev, tokenSymbol: '' }));
        }
      }
    } catch (error) {
      console.error('Error validating token symbol:', error);
    }
  }, [tokenName]);

  // Check form validity - optimized with useMemo
  const isFormValid = useMemo(() => {
    return tokenName.length >= 3 && 
           tokenSymbol.length >= 3 && 
           description.length >= 10 && 
           totalSupply >= 100000 && // Minimum 100k supply
           // initialPrice >= 0 && // Removed initialPrice from validation
           tokenNameStatus === 'available' && 
           tokenSymbolStatus === 'available' &&
           hederaWallet !== null &&  // Require Hedera wallet
           !loadingWallet && !loadingExtensionInfo;  // Ensure data is loaded
  }, [tokenName, tokenSymbol, description, totalSupply, tokenNameStatus, tokenSymbolStatus, hederaWallet, loadingWallet, loadingExtensionInfo]);

  // Progress percentage for header bar
  const progressPercent = useMemo(() => {
    const stepsCompleted = (tokenName.length >= 3 ? 1 : 0)
      + (tokenSymbol.length >= 3 ? 1 : 0)
      + (description.length >= 10 ? 1 : 0)
      + (hederaWallet ? 1 : 0);
    return Math.round((stepsCompleted / 4) * 100);
  }, [tokenName, tokenSymbol, description, hederaWallet]);

  // Optimized debounced handlers
  const handleTokenNameChange = useCallback((value: string) => {
    // Disallow spaces in token name
    const sanitized = value.replace(/\s+/g, '');
    setTokenName(sanitized);
    setTokenNameStatus('checking');
    
    const timeout = setTimeout(() => {
      validateTokenName(sanitized);
    }, 500);

    return () => clearTimeout(timeout);
  }, [validateTokenName]);

  const handleTokenSymbolChange = useCallback((value: string) => {
    const upperValue = value.toUpperCase();
    setTokenSymbol(upperValue);
    setTokenSymbolStatus('checking');
    
    const timeout = setTimeout(() => {
      validateTokenSymbol(upperValue);
    }, 500);

    return () => clearTimeout(timeout);
  }, [validateTokenSymbol]);

  // Enhanced file upload handler with Firebase integration
  const handleLogoUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload a valid image file (PNG, JPG, GIF, WebP)');
        return;
      }

      // Validate file size (max 1MB)
      if (file.size > 1 * 1024 * 1024) {
        toast.error('Image must be less than 1MB');
        return;
      }

      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  // Upload logo to Firebase storage
  const uploadLogoToFirebase = useCallback(async (file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('logo', file);
      formData.append('session_id', extensionId);

      const response = await authenticatedFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/middleware/hedera/upload-logo`,
        {
          method: 'POST',
          body: formData
        }
      );

      if (!response.ok) {
        throw new Error('Failed to upload logo');
      }

      const data = await response.json();
      return data.logo_url;
    } catch (error) {
      console.error('Error uploading logo:', error);
      throw error;
    }
  }, [extensionId]);

  // Enhanced form validation
  const validateForm = useCallback(() => {
    const newErrors: {[key: string]: string} = {};

    if (!tokenName || tokenName.length < 3) {
      newErrors.tokenName = 'Token name must be at least 3 characters';
    }

    if (!tokenSymbol || tokenSymbol.length < 3) {
      newErrors.tokenSymbol = 'Token symbol must be at least 3 characters';
    }

    if (totalSupply < 100000) {
      newErrors.totalSupply = 'Total supply must be at least 100,000';
    }

    // initialPrice removed - not sent to Hedera smart contract
    if (!description || description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [tokenName, tokenSymbol, totalSupply, description]);

  // Enhanced form submission
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors before submitting');
      return;
    }

    if (tokenNameStatus !== 'available' || tokenSymbolStatus !== 'available') {
      toast.error('Please ensure token name and symbol are available');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Frontend validation before API call
      if (!extensionId || !tokenName || !tokenSymbol || !description) {
        setSubmitError('Please fill in all required fields.');
        setIsSubmitting(false);
        return;
      }

      if (!Number.isInteger(liquidityAllocation) || liquidityAllocation < 70 || liquidityAllocation > 95) {
        setSubmitError('Liquidity allocation must be a whole number between 70% and 95%.');
        setIsSubmitting(false);
        return;
      }

      if (!Number.isInteger(totalSupply) || totalSupply <= 0) {
        setSubmitError('Total supply must be a positive whole number.');
        setIsSubmitting(false);
        return;
      }

      // Upload logo to Firebase if provided
      let logoUrl = '';
      if (logoFile) {
        try {
          logoUrl = await uploadLogoToFirebase(logoFile);
          toast.success('Logo uploaded successfully!');
        } catch (error) {
          toast.error('Failed to upload logo. Please try again.');
          throw error;
        }
      }

      const tokenData = {
        extension_id: extensionId,
        token_name: tokenName,
        token_symbol: tokenSymbol,
        total_supply: totalSupply,
        liquidity_allocation: parseInt(liquidityAllocation.toString()), // Ensure integer
        creator_allocation: parseInt((100 - liquidityAllocation).toString()), // Ensure integer
        initial_price: 0.01, // Default initial price
        description,
        logo_url: logoUrl || null,
        social_twitter: socialTwitter || null,
        social_discord: socialDiscord || null,
        social_website: socialTelegram || null, // Map telegram to website field
        bundle_opt_in: false, // Default to false, will be enabled later on token page
        early_buyer_airdrop: false, // Default to false, will be enabled later on token page
        enable_dao_voting: false // Default to false, will be enabled later on token page
      };

      const response = await authenticatedFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/middleware/tokenization/create-token`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(tokenData)
        }
      );

      if (response.ok) {
        const result = await response.json();
        
        // Show success modal with token information
        const tokenInfo = {
          token_name: tokenName,
          token_symbol: tokenSymbol,
          token_id: result.token_id,
          hedera_token_id: result.hedera_token_id,
          transaction_id: result.transaction_id,
          explorer_url: result.explorer_url
        };
        
        setSuccessTokenInfo(tokenInfo);
        setShowSuccessModal(true);
        toast.success('🎉 Token created successfully on Hedera network!');
      } else {
        const errorData = await response.json();
        
        // Extract error message safely
        let errorMessage = 'Failed to create token';
        
        try {
          if (response.status === 422 && Array.isArray(errorData.detail)) {
            // Pydantic validation errors
            const validationErrors = errorData.detail.map((error: any) => {
              if (error && typeof error === 'object') {
                const field = Array.isArray(error.loc) ? error.loc.join('.') : 'field';
                const msg = error.msg || 'invalid value';
                return `${field}: ${msg}`;
              }
              return 'Invalid field value';
            }).join(', ');
            errorMessage = `Please check: ${validationErrors}`;
          } else if (typeof errorData.detail === 'string') {
            errorMessage = errorData.detail;
          } else if (typeof errorData.message === 'string') {
            errorMessage = errorData.message;
          }
        } catch (parseError) {
          console.error('Error parsing error response:', parseError);
          errorMessage = 'An error occurred. Please check your input and try again.';
        }
        
        setSubmitError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Error creating token:', error);
      const errorMessage = error instanceof Error ? error.message : 'Something went wrong. Please try again.';
      setSubmitError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }, [validateForm, tokenNameStatus, tokenSymbolStatus, extensionId, tokenName, tokenSymbol, totalSupply, description, logoFile, socialTwitter, socialDiscord, socialTelegram, bundleOptIn, earlyBuyerAirdrop, enableDaoVoting, handleSuccess]);

  // Handler for setting Hedera wallet
  const handleSetWallet = useCallback(async (walletId: string) => {
    try {
      const response = await authenticatedFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/middleware/hedera/set-wallet`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ hedera_wallet_id: walletId })
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setHederaWallet(walletId);
          toast.success('Hedera wallet set successfully!');
          return;
        } else {
          toast.error(data.message);
          throw new Error(data.message || 'Failed to set wallet');
        }
      } else {
        const errorData = await response.json();
        const message = errorData.detail || 'Failed to set wallet';
        toast.error(message);
        throw new Error(message);
      }
    } catch (error) {
      console.error('Error setting wallet:', error);
      if (!(error instanceof Error)) {
        toast.error('Failed to set wallet');
      }
      throw error;
    }
  }, []);

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="relative"
    >
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-purple-600/5 to-cyan-600/5 rounded-2xl"></div>
      <div className="absolute top-0 left-1/4 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl"></div>
      
      <div className="relative bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-800/50 shadow-2xl max-w-4xl mx-auto overflow-hidden">
        {/* Enhanced Header */}
        <motion.div variants={itemVariants} className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 p-8 border-b border-gray-800/50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl">
                  <Coins className="w-8 h-8 text-blue-400" />
                </div>
                Tokenize Your Extension
              </h2>
              <p className="text-gray-300">
                Transform your Chrome extension into a tradeable digital asset on the Hedera network
              </p>
              <div className="flex items-center gap-4 mt-3 text-sm">
                <div className="flex items-center gap-1 text-blue-400">
                  <Shield className="w-4 h-4" />
                  <span>Secure on Hedera</span>
                </div>
                <div className="flex items-center gap-1 text-purple-400">
                  <Zap className="w-4 h-4" />
                  <span>Instant liquidity</span>
                </div>
                <div className="flex items-center gap-1 text-emerald-400">
                  <DollarSign className="w-4 h-4" />
                  <span>Passive income</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-400 mb-1">Form Progress</div>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-gray-800 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <span className="text-xs text-gray-300">{progressPercent}%</span>
              </div>
            </div>
          </div>
        </motion.div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* Loading State */}
          {(loadingExtensionInfo || loadingWallet) && (
            <motion.div variants={itemVariants} className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
              <span className="ml-3 text-gray-300">Loading extension information...</span>
            </motion.div>
          )}

          {/* Hedera Wallet Setup */}
          {!loadingWallet && !hederaWallet && (
            <motion.div variants={itemVariants} className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-orange-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-2">Hedera Wallet Required</h3>
                  <p className="text-gray-300 mb-4">
                    To create tokens on the Hedera network, you need to set your Hedera wallet address. 
                    This is where you'll receive creator fees from token trading.
                  </p>
                  <HederaWalletSetup onWalletSet={handleSetWallet} />
                </div>
              </div>
            </motion.div>
          )}

          {/* Hedera Wallet Display */}
          {!loadingWallet && hederaWallet && (
            <motion.div variants={itemVariants} className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/30 rounded-xl p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-400" />
                  <div>
                    <span className="text-green-400 font-medium">Hedera Wallet Connected:</span>
                    <span className="text-white ml-2 font-mono">{hederaWallet}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowWalletEditor((prev) => !prev)}
                  className="px-3 py-2 text-xs rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition-colors"
                >
                  {showWalletEditor ? 'Cancel' : 'Switch Wallet'}
                </button>
              </div>
              {showWalletEditor && (
                <div className="mt-4">
                  <HederaWalletSetup onWalletSet={async (walletId: string) => {
                    await handleSetWallet(walletId);
                    setShowWalletEditor(false);
                  }} />
                </div>
              )}
            </motion.div>
          )}

          {/* Core Token Details */}
          <motion.div variants={itemVariants} className="space-y-6">
            <h3 className="text-xl font-semibold text-white flex items-center gap-2 mb-6">
              <Star className="w-5 h-5 text-yellow-400" />
              Core Token Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div variants={{
                hidden: { opacity: 0, x: -20 },
                visible: { opacity: 1, x: 0 }
              }} className="space-y-2">
                <label className="flex text-sm font-medium text-gray-300 items-center gap-2">
                  Token Name *
                  <Tooltip text="The public name of your token that will appear on exchanges and in wallets. Choose something memorable and related to your extension's purpose.">
                    <HelpCircle className="w-4 h-4 text-gray-400 hover:text-blue-400 transition-colors" />
                  </Tooltip>
                </label>
                <div className="relative group">
                  <input
                    type="text"
                    value={tokenName}
                    onChange={(e) => handleTokenNameChange(e.target.value)}
                    className={`w-full px-4 py-3 ${tokenNameStatus === 'available' ? 'pr-12' : 'pr-4'} 
                      bg-gray-900/50 backdrop-blur-sm border-2 transition-all duration-300
                      ${errors.tokenName ? 'border-red-500 focus:border-red-400' : 
                        tokenNameStatus === 'available' ? 'border-green-500 focus:border-green-400' : 
                        tokenNameStatus === 'checking' ? 'border-blue-500 focus:border-blue-400' : 
                        'border-gray-700 focus:border-blue-500'
                      } 
                      rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2
                      ${tokenNameStatus === 'available' ? 'focus:ring-green-500/20' :
                        errors.tokenName ? 'focus:ring-red-500/20' : 'focus:ring-blue-500/20'
                      }
                      group-hover:border-gray-600 transition-all duration-200`}
                    placeholder="e.g., Alice's AI Summarizer"
                    maxLength={50}
                    disabled={false}
                  />
                  
                  <AnimatePresence>
                    {tokenNameStatus === 'checking' && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                      </motion.div>
                    )}
                    {tokenNameStatus === 'available' && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        <Check className="w-5 h-5 text-green-500" />
                      </motion.div>
                    )}
                    {tokenNameStatus === 'unavailable' && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        <AlertCircle className="w-5 h-5 text-red-500" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <AnimatePresence>
                  {errors.tokenName && (
                    <motion.p 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-red-400 text-xs flex items-center gap-1"
                    >
                      <AlertCircle className="w-3 h-3" />
                      {errors.tokenName}
                    </motion.p>
                  )}
                </AnimatePresence>
                <p className="text-xs text-gray-400">Unique and memorable names perform better in the marketplace</p>
              </motion.div>
              
              <motion.div variants={{
                hidden: { opacity: 0, x: -20 },
                visible: { opacity: 1, x: 0 }
              }} className="space-y-2">
                <label className="flex text-sm font-medium text-gray-300 items-center gap-2">
                  Token Symbol *
                  <Tooltip text="A short abbreviation for your token (3-8 characters). This appears on exchanges and trading platforms. Example: BTC for Bitcoin.">
                    <HelpCircle className="w-4 h-4 text-gray-400 hover:text-blue-400 transition-colors" />
                  </Tooltip>
                </label>
                <div className="relative group">
                  <input
                    type="text"
                    value={tokenSymbol}
                    onChange={(e) => handleTokenSymbolChange(e.target.value)}
                    className={`w-full px-4 py-3 ${tokenSymbolStatus === 'available' ? 'pr-12' : 'pr-4'} 
                      bg-gray-900/50 backdrop-blur-sm border-2 transition-all duration-300
                      ${errors.tokenSymbol ? 'border-red-500 focus:border-red-400' : 
                        tokenSymbolStatus === 'available' ? 'border-green-500 focus:border-green-400' : 
                        tokenSymbolStatus === 'checking' ? 'border-blue-500 focus:border-blue-400' : 
                        'border-gray-700 focus:border-blue-500'
                      } 
                      rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2
                      ${tokenSymbolStatus === 'available' ? 'focus:ring-green-500/20' :
                        errors.tokenSymbol ? 'focus:ring-red-500/20' : 'focus:ring-blue-500/20'
                      }
                      group-hover:border-gray-600 transition-all duration-200`}
                    placeholder="e.g., ALICEAI"
                    maxLength={8}
                    disabled={false}
                  />
                  
                  <AnimatePresence>
                    {tokenSymbolStatus === 'checking' && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                      </motion.div>
                    )}
                    {tokenSymbolStatus === 'available' && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        <Check className="w-5 h-5 text-green-500" />
                      </motion.div>
                    )}
                    {tokenSymbolStatus === 'unavailable' && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        <AlertCircle className="w-5 h-5 text-red-500" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <AnimatePresence>
                  {errors.tokenSymbol && (
                    <motion.p 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-red-400 text-xs flex items-center gap-1"
                    >
                      <AlertCircle className="w-3 h-3" />
                      {errors.tokenSymbol}
                    </motion.p>
                  )}
                </AnimatePresence>
                <p className="text-xs text-gray-400">3-8 characters, typically related to your token name</p>
              </motion.div>
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              {/* Total Supply Slider */}
              <div className="space-y-4">
                <label className="flex text-sm font-medium text-gray-300 items-center gap-2">
                  Total Supply *
                  <Tooltip text="The maximum number of tokens that will ever exist. Limited supply can create scarcity and increase value over time.">
                    <HelpCircle className="w-4 h-4 text-gray-400 hover:text-blue-400 transition-colors" />
                  </Tooltip>
                </label>
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                  <div className="flex justify-between items-center mb-4 gap-3">
                    <span className="text-sm text-gray-400">100K</span>
                    <input
                      type="number"
                      value={totalSupply}
                      onChange={(e) => {
                        const raw = parseInt(e.target.value || '0', 10);
                        if (Number.isNaN(raw)) return;
                        const clamped = Math.max(100000, Math.min(1000000000, raw));
                        setTotalSupply(clamped);
                      }}
                      onBlur={(e) => {
                        const raw = parseInt(e.target.value || '0', 10);
                        const clamped = Math.max(100000, Math.min(1000000000, raw));
                        if (clamped !== totalSupply) setTotalSupply(clamped);
                      }}
                      min={100000}
                      max={1000000000}
                      step={100000}
                      className="w-40 px-3 py-2 bg-gray-900/60 border border-gray-700 rounded-lg text-white text-center focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    />
                    <span className="text-sm text-gray-400">1B</span>
                  </div>
                  <div className="relative">
                    <input
                      type="range"
                      min="100000"
                      max="1000000000"
                      value={totalSupply}
                      onChange={(e) => setTotalSupply(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer range-slider"
                      step="100000"
                      style={{
                        background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((totalSupply - 100000) / (1000000000 - 100000)) * 100}%, #374151 ${((totalSupply - 100000) / (1000000000 - 100000)) * 100}%, #374151 100%)`
                      }}
                    />
                    <style jsx>{`
                      .range-slider::-webkit-slider-thumb {
                        appearance: none;
                        width: 20px;
                        height: 20px;
                        border-radius: 50%;
                        background: #3b82f6;
                        cursor: pointer;
                        border: 2px solid #1e293b;
                        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                      }
                      .range-slider::-webkit-slider-thumb:hover {
                        background: #2563eb;
                        transform: scale(1.1);
                      }
                      .range-slider::-moz-range-thumb {
                        width: 20px;
                        height: 20px;
                        border-radius: 50%;
                        background: #3b82f6;
                        cursor: pointer;
                        border: 2px solid #1e293b;
                        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                      }
                      .range-slider::-moz-range-track {
                        height: 8px;
                        background: transparent;
                        border: none;
                      }
                    `}</style>
                  </div>
                  {errors.totalSupply && (
                    <p className="text-red-400 text-sm mt-2">{errors.totalSupply}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-2">Limited supply can create scarcity and value</p>
                </div>
              </div>
              
              {/* Liquidity Allocation Input Boxes */}
              <div className="space-y-4">
                <h4 className="flex text-lg font-semibold text-white items-center gap-2">
                  <Zap className="w-5 h-5 text-blue-400" />
                  Token Allocation *
                </h4>
                <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <NumberInput
                      label="DEX Liquidity Pool"
                      value={liquidityAllocation}
                      onChange={setLiquidityAllocation}
                      min={70}
                      max={95}
                      step={1}
                      tooltip="Percentage of tokens allocated to the liquidity pool for trading on DEXs. Higher percentage means better liquidity and easier trading for users."
                      suffix="%"
                    />
                    
                    <NumberInput
                      label="Creator Allocation"
                      value={100 - liquidityAllocation}
                      onChange={(value: number) => setLiquidityAllocation(100 - value)}
                      min={5}
                      max={30}
                      step={1}
                      tooltip="Percentage of tokens you receive as the creator. We recommend 10-15% maximum to maintain trader confidence and avoid pump-and-dump concerns."
                      suffix="%"
                    />
                  </div>
                  
                  <div className="mt-6 space-y-3">
                    <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                        <div className="text-sm">
                          <div className="text-blue-400 font-medium mb-2">💡 Understanding Token Allocation</div>
                          <div className="text-gray-300 space-y-1">
                            <p><strong>Liquidity Pool ({liquidityAllocation}%):</strong> Tokens available for trading on exchanges. Higher = better liquidity = easier for users to buy/sell.</p>
                            <p><strong>Creator Share ({100 - liquidityAllocation}%):</strong> Tokens you receive as the creator. Use these for development, marketing, or hold as investment.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {(100 - liquidityAllocation) > 15 && (
                      <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                          <div className="text-sm">
                            <div className="text-orange-400 font-medium mb-2">⚠️ High Creator Share Warning</div>
                            <div className="text-gray-300">
                              Creator share above 15% may concern traders as you could potentially dump tokens and crash the market. Consider reducing to 10-15% for better community trust.
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {(100 - liquidityAllocation) <= 15 && (
                      <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                          <div className="text-sm">
                            <div className="text-green-400 font-medium mb-2">✅ Optimal Allocation</div>
                            <div className="text-gray-300">
                              Your allocation looks good! {100 - liquidityAllocation}% creator share builds trader confidence while {liquidityAllocation}% ensures good liquidity.
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Removed Initial Price Input */}
            </div>
          </motion.div>

          {/* Description */}
          <motion.div variants={itemVariants} className="space-y-4">
            <label className="flex text-sm font-medium text-gray-300 items-center gap-2">
              Extension Description *
              <Tooltip text="Describe what makes your extension special and valuable to users. This appears on your token page and marketplace listings to attract potential investors.">
                <HelpCircle className="w-4 h-4 text-gray-400 hover:text-blue-400 transition-colors" />
              </Tooltip>
            </label>
            <div className="relative group">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={`w-full px-4 py-3 bg-gray-900/50 backdrop-blur-sm border-2 transition-all duration-300
                  ${errors.description ? 'border-red-500 focus:border-red-400' : 'border-gray-700 focus:border-blue-500'} 
                  rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2
                  ${errors.description ? 'focus:ring-red-500/20' : 'focus:ring-blue-500/20'}
                  group-hover:border-gray-600 min-h-[120px] resize-none`}
                placeholder="Describe what makes your extension special and valuable to users..."
                maxLength={500}
                disabled={isSubmitting}
              />
              <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                {description.length}/500
              </div>
            </div>
            <AnimatePresence>
              {errors.description && (
                <motion.p 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-red-400 text-xs flex items-center gap-1"
                >
                  <AlertCircle className="w-3 h-3" />
                  {errors.description}
                </motion.p>
              )}
            </AnimatePresence>
            <p className="text-xs text-gray-400">This appears on your token page and marketplace listings</p>
          </motion.div>

          {/* Logo Upload */}
          <motion.div variants={itemVariants} className="space-y-4">
            <label className="flex text-sm font-medium text-gray-300 items-center gap-2">
              Extension Logo
              <Tooltip text="Upload a professional logo for your token (max 1MB). This builds trust and recognition on exchanges and token pages. Supported formats: PNG, JPG, GIF, WebP.">
                <HelpCircle className="w-4 h-4 text-gray-400 hover:text-blue-400 transition-colors" />
              </Tooltip>
            </label>
            <div className="flex items-center gap-6">
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                  id="logo-upload"
                  disabled={isSubmitting}
                />
                <label
                  htmlFor="logo-upload"
                  className="flex items-center justify-center px-6 py-4 bg-gray-900/50 backdrop-blur-sm border-2 border-dashed border-gray-700 rounded-xl text-gray-300 hover:bg-gray-800/50 hover:border-blue-500/50 cursor-pointer transition-all duration-300 group"
                >
                  <Upload className="w-5 h-5 mr-2 group-hover:text-blue-400 transition-colors" />
                  <span className="group-hover:text-blue-400 transition-colors">Choose Image (Max 2MB)</span>
                </label>
              </div>
              <AnimatePresence>
                {logoPreview && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="relative"
                  >
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="w-20 h-20 rounded-xl object-cover border-2 border-gray-700 shadow-lg"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setLogoFile(null);
                        setLogoPreview('');
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors shadow-lg"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <p className="text-xs text-gray-400">A professional logo builds trust and recognition</p>
          </motion.div>

          {/* Social Media */}
          <motion.div variants={itemVariants} className="space-y-6">
            <h3 className="text-xl font-semibold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" />
              Social Presence (Optional)
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div variants={{
                hidden: { opacity: 0, x: -20 },
                visible: { opacity: 1, x: 0 }
              }} className="space-y-2">
                <label className="flex text-sm font-medium text-gray-300 items-center gap-2">
                  X (Twitter)
                  <Tooltip text="Your Twitter/X handle to build community and share updates about your token. Use format @username">
                    <HelpCircle className="w-4 h-4 text-gray-400 hover:text-blue-400 transition-colors" />
                  </Tooltip>
                </label>
                <input
                  type="text"
                  value={socialTwitter}
                  onChange={(e) => setSocialTwitter(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-900/50 backdrop-blur-sm border-2 border-gray-700 focus:border-blue-500 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="@username"
                />
                <p className="text-xs text-gray-400">Build a following</p>
              </motion.div>
              
              <motion.div variants={{
                hidden: { opacity: 0, x: -20 },
                visible: { opacity: 1, x: 0 }
              }} className="space-y-2">
                <label className="flex text-sm font-medium text-gray-300 items-center gap-2">
                  Discord
                  <Tooltip text="Discord server invite link for your community. Great for real-time discussions and community building.">
                    <HelpCircle className="w-4 h-4 text-gray-400 hover:text-blue-400 transition-colors" />
                  </Tooltip>
                </label>
                <input
                  type="text"
                  value={socialDiscord}
                  onChange={(e) => setSocialDiscord(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-900/50 backdrop-blur-sm border-2 border-gray-700 focus:border-blue-500 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="Discord server invite"
                />
                <p className="text-xs text-gray-400">Community hub</p>
              </motion.div>
              
              <motion.div variants={{
                hidden: { opacity: 0, x: -20 },
                visible: { opacity: 1, x: 0 }
              }} className="space-y-2">
                <label className="flex text-sm font-medium text-gray-300 items-center gap-2">
                  Telegram
                  <Tooltip text="Telegram channel or group link. Popular for crypto communities and announcements.">
                    <HelpCircle className="w-4 h-4 text-gray-400 hover:text-blue-400 transition-colors" />
                  </Tooltip>
                </label>
                <input
                  type="text"
                  value={socialTelegram}
                  onChange={(e) => setSocialTelegram(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-900/50 backdrop-blur-sm border-2 border-gray-700 focus:border-blue-500 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="@channel or t.me/link"
                />
                <p className="text-xs text-gray-400">Telegram community</p>
              </motion.div>
            </div>
          </motion.div>

          {/* Optional Features - Removed for now, will be enabled later on token page */}
          {/* <motion.div variants={itemVariants} className="space-y-6">
            <h3 className="text-xl font-semibold text-white flex items-center gap-2">
              <Gift className="w-5 h-5 text-green-400" />
              Optional Features
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <motion.label 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex flex-col p-4 bg-gray-900/30 backdrop-blur-sm border border-gray-700 rounded-xl cursor-pointer hover:border-blue-500/50 transition-all duration-300 group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <input
                    type="checkbox"
                    checked={bundleOptIn}
                    onChange={(e) => setBundleOptIn(e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                    disabled={isSubmitting}
                  />
                  <Users className="w-5 h-5 text-blue-400" />
                  <span className="font-medium text-gray-300 group-hover:text-white transition-colors">Bundle Opt-in</span>
                </div>
                <p className="text-xs text-gray-400 mb-1">Allow bundling with other extensions</p>
                <p className="text-xs text-green-400">💡 Increases reach and earning potential</p>
              </motion.label>

              <motion.label 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex flex-col p-4 bg-gray-900/30 backdrop-blur-sm border border-gray-700 rounded-xl cursor-pointer hover:border-green-500/50 transition-all duration-300 group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <input
                    type="checkbox"
                    checked={earlyBuyerAirdrop}
                    onChange={(e) => setEarlyBuyerAirdrop(e.target.checked)}
                    className="w-4 h-4 text-green-600 bg-gray-800 border-gray-600 rounded focus:ring-green-500 focus:ring-2"
                    disabled={isSubmitting}
                  />
                  <Gift className="w-5 h-5 text-green-400" />
                  <span className="font-medium text-gray-300 group-hover:text-white transition-colors">Airdrop Perk</span>
                </div>
                <p className="text-xs text-gray-400 mb-1">Extra 10% tokens for early buyers</p>
                <p className="text-xs text-green-400">💡 Creates viral momentum</p>
              </motion.label>

              <motion.label 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex flex-col p-4 bg-gray-900/30 backdrop-blur-sm border border-gray-700 rounded-xl cursor-pointer hover:border-purple-500/50 transition-all duration-300 group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <input
                    type="checkbox"
                    checked={enableDaoVoting}
                    onChange={(e) => setEnableDaoVoting(e.target.checked)}
                    className="w-4 h-4 text-purple-600 bg-gray-800 border-gray-600 rounded focus:ring-purple-500 focus:ring-2"
                    disabled={isSubmitting}
                  />
                  <Shield className="w-5 h-5 text-purple-400" />
                  <span className="font-medium text-gray-300 group-hover:text-white transition-colors">DAO Governance</span>
                </div>
                <p className="text-xs text-gray-400 mb-1">Enable community voting</p>
                <p className="text-xs text-green-400">💡 Builds engaged community</p>
              </motion.label>
            </div>
          </motion.div> */}

          {/* Preview Toggle */}
          <motion.div variants={itemVariants} className="flex justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-800 to-gray-700 hover:from-gray-700 hover:to-gray-600 text-gray-300 rounded-xl transition-all duration-300 shadow-lg"
            >
              {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showPreview ? 'Hide Preview' : 'Show Preview'}
            </motion.button>
          </motion.div>

          {/* Token Preview */}
          <AnimatePresence>
            {showPreview && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="border-t border-gray-700 pt-8"
              >
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                  <Eye className="w-5 h-5 text-blue-400" />
                  Token Page Preview
                </h3>
                <TokenPreview
                  tokenName={tokenName}
                  tokenSymbol={tokenSymbol}
                  totalSupply={totalSupply}
                  // initialPrice={initialPrice} // Removed initialPrice
                  description={description}
                  logoPreview={logoPreview}
                  socialTwitter={socialTwitter}
                  socialDiscord={socialDiscord}
                  socialTelegram={socialTelegram}
                  bundleOptIn={false}
                  earlyBuyerAirdrop={false}
                  enableDaoVoting={false}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error Display */}
          <AnimatePresence>
            {submitError && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3"
              >
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <p className="text-red-400 text-sm">{typeof submitError === 'string' ? submitError : 'An error occurred. Please try again.'}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Buttons */}
          <motion.div variants={itemVariants} className="flex justify-between items-center pt-6 border-t border-gray-800">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={handleCancel}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-all duration-300 shadow-lg"
              disabled={isSubmitting}
            >
              Cancel
            </motion.button>
            
            <motion.button
              whileHover={{ scale: isFormValid ? 1.05 : 1 }}
              whileTap={{ scale: isFormValid ? 0.95 : 1 }}
              type="submit"
              disabled={isSubmitting || !isFormValid}
              className={`px-8 py-3 rounded-xl transition-all duration-300 flex items-center gap-3 shadow-lg
                ${isFormValid && !isSubmitting
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating Token...
                </>
              ) : !hederaWallet ? (
                <>
                  <AlertCircle className="w-5 h-5" />
                  Set Hedera Wallet First
                </>
              ) : (
                <>
                  <Coins className="w-5 h-5" />
                  Create Token on Hedera
                </>
              )}
            </motion.button>
          </motion.div>
        </form>
      </div>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccessModal && successTokenInfo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-gray-900 border border-gray-800 rounded-2xl p-8 max-w-lg w-full mx-4 shadow-2xl"
            >
              <div className="text-center">
                {/* Success Animation */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <Check className="w-10 h-10 text-white" />
                </motion.div>

                {/* Success Content */}
                <h2 className="text-3xl font-bold text-white mb-4">
                  🎉 Token Created Successfully!
                </h2>
                
                <div className="bg-gray-800/50 rounded-xl p-4 mb-6 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Token Name:</span>
                    <span className="text-white font-medium">{successTokenInfo.token_name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Symbol:</span>
                    <span className="text-white font-mono">{successTokenInfo.token_symbol}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Hedera Token ID:</span>
                    <span className="text-white font-mono text-sm">{successTokenInfo.hedera_token_id}</span>
                  </div>
                </div>

                <p className="text-gray-300 mb-6">
                  Your extension has been successfully tokenized on the Hedera network! 
                  You can now manage your token, track analytics, and earn from trading fees.
                </p>

                {/* Explorer Link */}
                {successTokenInfo.explorer_url && (
                  <div className="mb-6">
                    <a
                      href={successTokenInfo.explorer_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors text-sm"
                    >
                      <Globe className="w-4 h-4" />
                      View on Hedera Explorer
                    </a>
                  </div>
                )}

                {/* Action Button */}
                <div className="flex justify-center">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setIsNavigatingToTokenPage(true);
                      router.push(`/token/${encodeURIComponent(successTokenInfo.token_name)}`);
                    }}
                    disabled={isNavigatingToTokenPage}
                    className={`px-8 py-4 rounded-xl transition-all font-medium flex items-center justify-center gap-2 text-lg shadow-lg ${
                      isNavigatingToTokenPage
                        ? 'bg-gray-600 text-gray-300 cursor-wait'
                        : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                    }`}
                  >
                    {isNavigatingToTokenPage ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Loading Token...
                      </>
                    ) : (
                      <>
                        <Coins className="w-5 h-5" />
                        View My Token
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default TokenizationForm; 