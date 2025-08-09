'use client';

import { useState, useEffect } from 'react';
import { authenticatedFetch } from '@/lib/api-utils';
import { toast } from 'react-hot-toast';
import { Extension } from './types';
import { getUserFromCookie } from '@/lib/cookie-utils';

// Hook for fetching marketplace extensions with pagination
export function useMarketplaceExtensions(sortBy: string) {
  const [extensions, setExtensions] = useState<Extension[]>([]);
  const [filteredExtensions, setFilteredExtensions] = useState<Extension[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20
  });
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  // Fetch extensions with improved error handling and pagination
  const fetchExtensions = async (page: number = 1, append: boolean = false) => {
    if (page === 1) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }
    setError(null);
    
    try {
      const response = await authenticatedFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/marketplace/listings?sort_by=${sortBy}&page=${page}&limit=20`
      );        
      
      if (response.ok) {
        const data = await response.json();
        
        if (!data.listings || !Array.isArray(data.listings)) {
          throw new Error('Invalid response format from server');
        }
          // Normalize the data - map extension_id to id for consistency
        const normalizedExtensions = data.listings.map((ext: any) => ({
          ...ext,
          id: ext.extension_id || ext.id,
          owner: ext.owner_name || ext.owner || 'Unknown',
          owner_email: ext.owner_email, // Include seller email for transparency
          // Preserve owned_by_current_user flag from API
          owned_by_current_user: ext.owned_by_current_user === true
        }));
        
        if (append && page > 1) {
          // Append new extensions for pagination
          setExtensions(prev => [...prev, ...normalizedExtensions]);
          setFilteredExtensions(prev => [...prev, ...normalizedExtensions]);
        } else {
          // Replace extensions for initial load or sort change
          setExtensions(normalizedExtensions);
          setFilteredExtensions(normalizedExtensions);
        }
        
        // Update pagination info
        if (data.pagination) {
          setPagination({
            currentPage: data.pagination.current_page,
            totalPages: data.pagination.total_pages,
            totalItems: data.pagination.total_items,
            itemsPerPage: data.pagination.items_per_page
          });
        }
        
        setError(null); // Clear any previous errors
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || 'Failed to load extensions';
        setError(errorMessage);
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Something went wrong. Please try again in a while.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  // Load more extensions function
  const loadMoreExtensions = async () => {
    if (isLoadingMore || pagination.currentPage >= pagination.totalPages) return;
    
    await fetchExtensions(pagination.currentPage + 1, true);
  };
  
  useEffect(() => {
    // Fetch categories
    const fetchCategories = async () => {
      try {
        const response = await authenticatedFetch(
          `${process.env.NEXT_PUBLIC_API_URL}/marketplace/categories`
        );

        if (response.ok) {
          const data = await response.json();
          setCategories(data.categories || []);
        }
      } catch (error) {
        // Categories are not critical for page function
      }
    };

    fetchCategories();
    fetchExtensions();
  }, [sortBy]);
  
  return { 
    extensions, 
    setExtensions, 
    filteredExtensions, 
    setFilteredExtensions,
    isLoading,
    isLoadingMore,
    error,
    setError,
    categories,
    pagination,
    loadMoreExtensions
  };
}

// Hook for managing filter functionality  
export function useMarketplaceFilters(extensions: Extension[]) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [filteredExtensions, setFilteredExtensions] = useState<Extension[]>([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);
    // Apply filters when search term or category changes
  useEffect(() => {
    const hasFilters = Boolean(searchTerm) || Boolean(selectedCategory);
    setIsFiltering(hasFilters);
    
    if (!hasFilters) {
      // No filters, show all extensions (pagination handles loading)
      setFilteredExtensions(extensions);
      return;
    }
    
    // Apply client-side filtering when filters are active
    let filtered = [...extensions];
    
    if (searchTerm) {
      filtered = filtered.filter(ext => 
        ext.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        ext.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ext.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    if (selectedCategory) {
      filtered = filtered.filter(ext => ext.category === selectedCategory);
    }
    
    setFilteredExtensions(filtered);
  }, [searchTerm, selectedCategory, extensions]);
  
  // Function to clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setFilteredExtensions(extensions);
    setIsFiltering(false);
  };
  
  return {
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    filteredExtensions,
    showMobileFilters,
    setShowMobileFilters,
    clearFilters,
    isFiltering
  };
}

// Hook for download functionality
export function useExtensionDownload() {
  const [downloadingExtensions, setDownloadingExtensions] = useState<Set<string>>(new Set());
  
  const handleDownloadExtension = async (extension: Extension) => {
    if (!extension.access_key || !extension.resource_identifier) {
      toast.error('Download information not available for this extension');
      return;
    }

    // Add to downloading set
    setDownloadingExtensions(prev => new Set(prev).add(extension.id));

    try {
      // console.log('Downloading extension:', {
      //   title: extension.title,
      //   sessionId: extension.resource_identifier,
      //   hasDownloadToken: !!extension.access_key
      // });

      const response = await authenticatedFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/middleware/extension/download`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            session_id: extension.resource_identifier,
          }),
        }
      );

      if (!response.ok) {
        let errorMessage = 'Failed to download extension';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (jsonError) {
          errorMessage = `Download failed (${response.status}): ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      // Get the file blob
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${extension.title.replace(/[^a-zA-Z0-9]/g, '_')}_extension.zip`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success(`${extension.title} downloaded successfully!`);
      
      return extension.id;    } catch (error: any) {
      toast.error(error.message || 'Failed to download extension');
      return null;
    } finally {
      // Remove from downloading set
      setDownloadingExtensions(prev => {
        const newSet = new Set(prev);
        newSet.delete(extension.id);
        return newSet;
      });
    }
  };
  
  return { downloadingExtensions, handleDownloadExtension };
}

// Hook for rating submissions
export function useRatingSubmission(sortBy: string, searchTerm: string, selectedCategory: string) {
  // Handle rating submissions
  const handleRatingSubmit = async (
    extensionId: string, 
    newRating: number, 
    setExtensions: React.Dispatch<React.SetStateAction<Extension[]>>,
    setFilteredExtensions: React.Dispatch<React.SetStateAction<Extension[]>>,
    setError: React.Dispatch<React.SetStateAction<string | null>>
  ) => {
    try {
      // Update the local state immediately for better UX
      const updateExtensions = (extensions: Extension[]) => 
        extensions.map(ext => 
          ext.id === extensionId 
            ? { ...ext, rating: newRating }
            : ext
        );
      
      setExtensions(prev => updateExtensions(prev));
      setFilteredExtensions(prev => updateExtensions(prev));
      
    } catch (error: any) {
      setError('Something went wrong while updating the rating. Please try again in a while.');
    }
  };
  
  return { handleRatingSubmit };
}

// Hook for purchase management
export function usePurchaseManagement() {
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [currentExtension, setCurrentExtension] = useState<Extension | null>(null);
  
  const handlePurchaseClick = (
    extensionId: string, 
    filteredExtensions: Extension[],
    setError: React.Dispatch<React.SetStateAction<string | null>>
  ) => {
    
    // Find the extension by ID - use filteredExtensions
    const extension = filteredExtensions.find(ext => ext.id === extensionId);
    
    if (extension) {
      // Clear any existing state first
      setShowPurchaseModal(false);
      setCurrentExtension(null);
      
      // Use setTimeout to ensure state is cleared before setting new state
      setTimeout(() => {
        setCurrentExtension(extension);
        setShowPurchaseModal(true);
      }, 10);
    } else {
      setError(`Extension with ID ${extensionId} not found. Please refresh and try again.`);
    }
  };
    const handlePurchaseComplete = async (
    sortBy: string,
    searchTerm: string,
    selectedCategory: string,
    setExtensions: React.Dispatch<React.SetStateAction<Extension[]>>,
    setFilteredExtensions: React.Dispatch<React.SetStateAction<Extension[]>>
  ) => {
    // Refresh the listings to show updated purchase status and get access keys
    setShowPurchaseModal(false);
    
    // Update the purchased extension in local state for immediate feedback
    if (currentExtension) {
      const updateExtensions = (extensions: Extension[]) => 
        extensions.map(ext => 
          ext.id === currentExtension.id 
            ? { ...ext, purchased: true }
            : ext
        );
      
      setExtensions(prev => updateExtensions(prev));
      setFilteredExtensions(prev => updateExtensions(prev));
    }
  };
  
  return {
    showPurchaseModal,
    setShowPurchaseModal,
    currentExtension,
    setCurrentExtension,
    handlePurchaseClick,
    handlePurchaseComplete
  };
}

// Wallet connection hook
export function useWalletConnection() {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  
  useEffect(() => {
    // Check for wallet connection from cookie
    const userData = getUserFromCookie();
    if (userData?.walletAddress) {
      setWalletAddress(userData.walletAddress);
      setIsConnected(true);
    }
  }, []);
  
  const handleWalletConnected = (address: string) => {
    setWalletAddress(address);
    setIsConnected(true);
  };
  
  return { isConnected, setIsConnected, walletAddress, setWalletAddress, handleWalletConnected };
}
