'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import { toast } from 'react-hot-toast';
import { AlertCircle, X, Edit2, Trash2 } from 'lucide-react';
import { authenticatedFetch } from '@/lib/api-utils';

// Import modular components
import PurchaseModal from '../../components/Marketplace/PurchaseModal';
import MarketplaceHeader from '../../components/Marketplace/MarketplaceHeader';
import FilterPanel from '../../components/Marketplace/FilterPanel';
import ExtensionsGrid from '../../components/Marketplace/ExtensionsGrid';
import MobileFilterToggle from '../../components/Marketplace/MobileFilterToggle';
import PublishFormModal from '../../components/Marketplace/PublishFormModal';
import MarketplaceStyles from '../../components/Marketplace/MarketplaceStyles';
import PublishForm from '../../components/Marketplace/PublishForm';

// Import custom hooks
import { 
  useMarketplaceExtensions, 
  useMarketplaceFilters, 
  useExtensionDownload, 
  useRatingSubmission,
  usePurchaseManagement
} from '../../components/Marketplace/hooks';

// Import types
import { Extension } from '../../components/Marketplace/types';

// Extended extension interface for my published extensions
interface MyExtension extends Extension {
  purchases_count?: number;
  isMyPublication?: boolean;
}

// Interface for editing extensions
interface EditingExtension {
  _id: string;
  title: string;
  description: string;
  price_codon: number;
  category: string;
  tags: string[];
  username: string;
  created_at: string;
  rating: number;
  purchases_count: number;
  has_wallet: boolean;
}

// Loading component for Suspense fallback
function MarketplaceLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      <div className="max-w-[1900px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-10 2xl:px-12 3xl:px-16 py-4 sm:py-6 lg:py-8 relative z-10">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-400">Loading marketplace...</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main marketplace content component
function MarketplaceContent() {
  // State management
  const [sortBy, setSortBy] = useState('created_at');  
  const [activeTab, setActiveTab] = useState<'browse' | 'my-extensions'>('browse');
  const [showPublishForm, setShowPublishForm] = useState(false);
  const [publishExtensionId, setPublishExtensionId] = useState<string | null>(null);
  
  // Get query parameters and router
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // State for My Published Extensions
  const [myExtensions, setMyExtensions] = useState<MyExtension[]>([]);
  const [myFilteredExtensions, setMyFilteredExtensions] = useState<MyExtension[]>([]);
  const [isLoadingMyExtensions, setIsLoadingMyExtensions] = useState(false);
  const [hasWallet, setHasWallet] = useState<boolean>(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingExtension, setEditingExtension] = useState<EditingExtension | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [extensionToDelete, setExtensionToDelete] = useState<string | null>(null);
  const [deleteReason, setDeleteReason] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeletingExtension, setIsDeletingExtension] = useState(false);

  // Use the marketplace extensions hook
  const { 
    extensions, 
    setExtensions, 
    filteredExtensions: allExtensions, 
    setFilteredExtensions: setAllExtensions,
    isLoading,
    isLoadingMore,
    error,
    setError,
    categories,
    pagination,
    loadMoreExtensions
  } = useMarketplaceExtensions(sortBy);
  
  // Use the filters hook
  const {
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    showMobileFilters,
    setShowMobileFilters,
    clearFilters,
    isFiltering,
    filteredExtensions
  } = useMarketplaceFilters(extensions);
  
  // Use the download hook
  const { downloadingExtensions, handleDownloadExtension } = useExtensionDownload();
  
  // Use the rating submission hook
  const { handleRatingSubmit: baseHandleRatingSubmit } = useRatingSubmission(sortBy, searchTerm, selectedCategory);
  
  // Use the purchase management hook
  const {
    showPurchaseModal,
    setShowPurchaseModal,
    currentExtension,
    setCurrentExtension,
    handlePurchaseClick: basePurchaseClick,
    handlePurchaseComplete: basePurchaseComplete
  } = usePurchaseManagement();
  
  // Create wrapper functions to pass the correct arguments to the hooks
  const handlePurchaseClick = (id: string) => {
    basePurchaseClick(id, filteredExtensions, setError);
  };
  
  const handleRatingSubmit = (id: string, rating: number) => {
    baseHandleRatingSubmit(id, rating, setExtensions, setAllExtensions, setError);
  };
  
  const handlePurchaseComplete = () => {
    basePurchaseComplete(sortBy, searchTerm, selectedCategory, setExtensions, setAllExtensions);
  };

  // ...existing code...
  const fetchMyExtensions = async () => {
    if (activeTab !== 'my-extensions') return;
    
    setIsLoadingMyExtensions(true);
    setError(null); // Clear previous errors
    
    try {
      const response = await authenticatedFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/marketplace/my-listings`
      );

      if (response.ok) {
        const data = await response.json();
        
        // Handle both array response and object with listings array
        const listings = Array.isArray(data) ? data : (data.listings || []);
        
        // Validate that listings is an array
        if (!Array.isArray(listings)) {
          throw new Error('Invalid response format from server');
        }
        
        // Format the data to match the Extension interface used by ExtensionsGrid
        const formattedExtensions = listings.map((ext: any, index: number) => {
          return {
            id: ext._id || ext.id || `temp-${index}`,
            extension_id: ext._id || ext.extension_id || ext.id || `temp-${index}`, 
            title: ext.title || 'Untitled Extension',
            description: ext.description || 'No description available',
            owner: ext.username || ext.owner || 'Unknown',
            username: ext.username || ext.owner || 'Unknown',
            owner_email: ext.owner_email, // Include seller email for transparency
            price_codon: Number(ext.price_codon) || 0,
            rating: Number(ext.rating) || 0,
            category: ext.category || 'Other',
            tags: Array.isArray(ext.tags) ? ext.tags : [],
            purchased: true, // Already owned as they are published by the user
            owned_by_current_user: true, // These are the user's own extensions
            created_at: ext.created_at || new Date().toISOString(),
            owner_id: ext.owner_id || '',
            purchases_count: Number(ext.purchases_count) || 0,
            isMyPublication: true // Additional flag to identify user's own publications
          };
        });
        
        setMyExtensions(formattedExtensions);
        setMyFilteredExtensions(formattedExtensions);
        setHasWallet(data.has_wallet || false);
        
        // Clear search and category filters when switching to my extensions
        setSearchTerm('');
        setSelectedCategory('');
        
        if (formattedExtensions.length === 0) {
          // No extensions found for user - this will show the empty state
        }
      } else {
        const errorText = await response.text();
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText || 'Unknown error' };
        }
        
        if (response.status === 401) {
          toast.error('Authentication failed. Please sign in again.');
        } else if (response.status === 403) {
          toast.error('Access denied. Please check your permissions.');
        } else if (response.status === 404) {
          // Don't show error for 404, just set empty array
          setMyExtensions([]);
          setMyFilteredExtensions([]);
          setHasWallet(false);
          setSearchTerm('');
          setSelectedCategory('');
          return; // Exit early, don't show error
        } else {
          // For other errors, show toast only - don't set persistent error banner
          toast.error(errorData.message || 'Failed to load your published extensions');
        }
      }
    } catch (error: any) {
      const errorMessage = error.message || 'An error occurred while loading your published extensions';
      // For network errors or critical issues, show both toast and persistent banner
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoadingMyExtensions(false);
    }
  };
  
  // Handle editing extensions
  const handleEditClick = (extension: MyExtension) => {
    const originalExt = myExtensions.find(ext => ext.id === extension.id);
    if (originalExt) {
      setEditingExtension({
        _id: originalExt.id,
        title: originalExt.title,
        description: originalExt.description,
        price_codon: originalExt.price_codon,
        category: originalExt.category,
        tags: originalExt.tags,
        username: originalExt.username || originalExt.owner,
        created_at: originalExt.created_at,
        rating: originalExt.rating,
        purchases_count: originalExt.purchases_count || 0,
        has_wallet: hasWallet
      });
      setShowEditForm(true);
    }
  };

  // Helper function to close delete modal and reset states
  const closeDeleteModal = () => {
    setShowDeleteConfirmation(false);
    setExtensionToDelete(null);
    setDeleteReason('');
    setDeleteError(null);
    setIsDeletingExtension(false);
  };

  // Handle deleting extensions
  const handleDeleteClick = (extensionId: string) => {
    setExtensionToDelete(extensionId);
    setDeleteError(null); // Clear any previous error
    setShowDeleteConfirmation(true);
  };

  // Confirm deletion of extension
  const handleDeleteConfirm = async () => {
    if (!extensionToDelete) return;

    setIsDeletingExtension(true);
    setDeleteError(null); // Clear any previous error

    try {
      const response = await authenticatedFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/marketplace/listing/${extensionToDelete}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            reason: deleteReason || 'User requested deletion'
          })
        }
      );

      if (response.ok) {
        toast.success('Extension deleted successfully');
        // Remove the deleted extension from the state
        setMyExtensions(prev => prev.filter(ext => ext.id !== extensionToDelete));
        setMyFilteredExtensions(prev => prev.filter(ext => ext.id !== extensionToDelete));
        
        // Close modal on success
        closeDeleteModal();
      } else {
        const data = await response.json();
        // Check for the specific error about purchased extensions
        const errorMessage = data.detail || data.message || 'Failed to delete extension';
        
        if (data.detail && data.detail.includes('Cannot delete listing that has been purchased')) {
          const specificError = 'Cannot delete extension that has been purchased. Please contact support for assistance.';
          setDeleteError(specificError);
          toast.error(specificError);
        } else {
          setDeleteError(errorMessage);
          toast.error(errorMessage);
        }
        // Don't close modal on error - let user see the error and decide what to do
      }
    } catch (error: any) {
      // Only use setError for network/unexpected errors that need persistent visibility
      const errorMessage = error.message || 'An error occurred while deleting the extension';
      setDeleteError(errorMessage);
      toast.error(errorMessage);
      // Don't close modal on error
    } finally {
      setIsDeletingExtension(false);
    }
  };

  // Handle edit success
  const handleEditSuccess = () => {
    setShowEditForm(false);
    setEditingExtension(null);
    // Refresh the extensions list
    fetchMyExtensions();
    toast.success('Extension updated successfully');
  };
  
  // Effect to filter my extensions when search/category changes
  useEffect(() => {
    if (activeTab !== 'my-extensions' || myExtensions.length === 0) return;
    
    let filtered = [...myExtensions];
    
    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(ext => 
        ext.title.toLowerCase().includes(searchLower) ||
        ext.description.toLowerCase().includes(searchLower) ||
        ext.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }
    
    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter(ext => ext.category === selectedCategory);
    }
    
    // Apply sorting
    if (sortBy === 'created_at') {
      filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sortBy === 'popularity') {
      filtered.sort((a, b) => (b.purchases_count || 0) - (a.purchases_count || 0));
    } else if (sortBy === 'rating') {
      filtered.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'price_low') {
      filtered.sort((a, b) => a.price_codon - b.price_codon);
    } else if (sortBy === 'price_high') {
      filtered.sort((a, b) => b.price_codon - a.price_codon);
    }
    
    setMyFilteredExtensions(filtered);
  }, [activeTab, myExtensions, searchTerm, selectedCategory, sortBy]);
  
  // Effect to reset filters when switching tabs
  useEffect(() => {
    // Clear filters when switching tabs
    setSearchTerm('');
    setSelectedCategory('');
    
    if (activeTab === 'browse') {
      // When switching to browse, reset to all extensions
      if (extensions.length > 0) {
        setAllExtensions([...extensions]);
      }
    } else if (activeTab === 'my-extensions') {
      // When switching to my extensions, fetch them
      fetchMyExtensions();
    }
  }, [activeTab]);
  
  // Effect to fetch my extensions when the tab changes
  useEffect(() => {
    if (activeTab === 'my-extensions') {
      fetchMyExtensions();
    }
  }, []);
  
  // Check for publishExtension query parameter
  useEffect(() => {
    const extensionId = searchParams.get('publishExtension');
    if (extensionId) {
      setPublishExtensionId(extensionId);
      setShowPublishForm(true);
    }
  }, [searchParams]);
  
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
        {/* Background effects */}
        <div className="relative overflow-hidden -z-10">
          {/* Dynamic aurora effects - optimized for wider screens */}
          <div className="absolute -top-[500px] -left-[400px] w-[1400px] h-[1000px] bg-[radial-gradient(ellipse_at_center,hsla(217,100%,50%,0.12)_0%,transparent_70%)] pointer-events-none" 
               style={{ animation: 'aurora-x 25s ease-in-out infinite' }} />
          <div className="absolute -top-[300px] -right-[300px] w-[1200px] h-[800px] bg-[radial-gradient(ellipse_at_center,hsla(265,89%,60%,0.12)_0%,transparent_70%)] pointer-events-none" 
               style={{ animation: 'aurora-y 20s ease-in-out infinite' }} />
          <div className="absolute bottom-[20%] left-[10%] w-[900px] h-[600px] bg-[radial-gradient(ellipse_at_center,hsla(190,95%,50%,0.06)_0%,transparent_70%)] pointer-events-none" 
               style={{ animation: 'aurora-pulse 30s ease infinite' }} />
          <div className="absolute top-[30%] right-[5%] w-[700px] h-[600px] bg-[radial-gradient(ellipse_at_center,hsla(280,100%,70%,0.04)_0%,transparent_70%)] pointer-events-none" 
               style={{ animation: 'aurora-x 35s ease-in-out infinite reverse' }} />
          <div className="absolute bottom-[10%] right-[15%] w-[500px] h-[500px] bg-[radial-gradient(ellipse_at_center,hsla(340,90%,60%,0.03)_0%,transparent_70%)] pointer-events-none" 
               style={{ animation: 'aurora-pulse 40s ease infinite' }} />
          
          {/* Enhanced grid effect */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.05)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_85%)] pointer-events-none" />
        </div>

        <div className="max-w-[1900px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-10 2xl:px-12 3xl:px-16 py-4 sm:py-6 lg:py-8 relative z-10">
          {/* Error Banner */}
          {error && (
            <div className="mb-4 sm:mb-6 p-4 sm:p-5 lg:p-6 bg-gradient-to-br from-red-900/30 to-red-800/20 border border-red-500/30 rounded-xl backdrop-blur-sm shadow-lg">
              <div className="flex items-start gap-3">
                <div className="text-red-400 mt-0.5 flex-shrink-0">
                  <AlertCircle size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-red-400 text-sm sm:text-base break-words">{error}</p>
                  <p className="text-xs sm:text-sm text-red-500/80 mt-1">
                    Please try again in a while. If the issue persists, contact support.
                  </p>
                </div>
                <button 
                  onClick={() => setError(null)}
                  className="text-red-500 hover:text-red-400 flex-shrink-0 p-1 rounded-md hover:bg-red-900/30 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          )}
          
          <Suspense fallback={<div>Loading marketplace...</div>}>
            <div>
              {/* Marketplace Header */}
              <MarketplaceHeader
                extensionsCount={activeTab === 'browse' ? extensions.length : myExtensions.length}
                publishExtensionId={publishExtensionId}
                router={router}
                error={error}
                setError={setError}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
              />
              
              {/* Mobile Filter Toggle - Shows on mobile, hidden on desktop */}
              <MobileFilterToggle 
                showMobileFilters={showMobileFilters}
                setShowMobileFilters={setShowMobileFilters}
                searchTerm={searchTerm}
                selectedCategory={selectedCategory}
                setSearchTerm={setSearchTerm}
                setSelectedCategory={setSelectedCategory}
              />
              
              {/* Main Content Area with Filters and Grid */}
              <div className="lg:flex gap-4 xl:gap-6 2xl:gap-8 3xl:gap-10">
                {/* Filter Panel */}
                <FilterPanel
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                  sortBy={sortBy}
                  setSortBy={setSortBy}
                  categories={categories}
                  clearFilters={clearFilters}
                  showMobileFilters={showMobileFilters}
                  setShowMobileFilters={setShowMobileFilters}
                />
                
                {/* Extensions Grid - Conditionally show different data sources */}
                <div className="flex-grow">
                  {activeTab === 'browse' ? (
                    <ExtensionsGrid
                      isLoading={isLoading}
                      filteredExtensions={filteredExtensions}
                      extensions={extensions}
                      downloadingExtensions={downloadingExtensions}
                      selectedCategory={selectedCategory}
                      searchTerm={searchTerm}
                      clearFilters={clearFilters}
                      handlePurchaseClick={handlePurchaseClick}
                      handleRatingSubmit={handleRatingSubmit}
                      handleDownloadExtension={handleDownloadExtension}
                      setError={setError}
                      pagination={pagination}
                      isLoadingMore={isLoadingMore}
                      onLoadMore={loadMoreExtensions}
                    />
                  ) : (
                    /* My Published Extensions - using ExtensionsGrid with custom empty state */
                    <ExtensionsGrid
                      isLoading={isLoadingMyExtensions}
                      filteredExtensions={myFilteredExtensions}
                      extensions={myExtensions}
                      downloadingExtensions={new Set()}
                      selectedCategory={selectedCategory}
                      searchTerm={searchTerm}
                      clearFilters={clearFilters}
                      handlePurchaseClick={() => {}}  // No-op since these are owned extensions
                      handleRatingSubmit={() => {}}   // No-op for own extensions
                      handleDownloadExtension={() => {}} // No-op for own extensions
                      setError={setError}
                      renderActions={(extension) => (
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => handleEditClick(extension as MyExtension)}
                            className="p-2 bg-blue-900/30 hover:bg-blue-900/50 text-blue-400 rounded-lg transition-colors"
                            title="Edit Extension"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(extension.id)}
                            className="p-2 bg-red-900/30 hover:bg-red-900/50 text-red-400 rounded-lg transition-colors"
                            title="Delete Extension"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      )}
                      customEmptyState={{
                        title: "No Published Extensions",
                        description: "You haven't published any extensions to the marketplace yet. Create and publish an extension to get started.",
                        icon: <Edit2 className="w-14 h-14 sm:w-18 sm:h-18 text-blue-400 animate-float" />
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          </Suspense>
        </div>
      </div>
      
      {/* Purchase Modal - rendered conditionally with proper state management */}
      {showPurchaseModal && currentExtension && (
        <PurchaseModal 
          key={`purchase-modal-${currentExtension.id}-${Date.now()}`}
          listingId={currentExtension.extension_id || currentExtension.id}
          title={currentExtension.title}
          price={currentExtension.price_codon}
          sellerEmail={currentExtension.owner_email}
          onClose={() => {
            setShowPurchaseModal(false);
            setCurrentExtension(null);
          }}
          onPurchase={handlePurchaseComplete}
        />
      )}
      
      {/* Edit Form Modal - for My Published Extensions */}
      {showEditForm && editingExtension && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4 sm:p-6">
          <div className="bg-gradient-to-br from-gray-900/95 to-gray-800/90 backdrop-blur-xl p-6 rounded-xl shadow-2xl border border-gray-700/50 max-w-4xl w-full mx-auto overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-purple-900/30 rounded-lg">
                  <Edit2 className="w-5 h-5 text-purple-400" />
                </div>
                <h2 className="text-xl font-semibold text-white">
                  Edit Marketplace Extension
                </h2>
              </div>
              <button 
                onClick={() => setShowEditForm(false)}
                className="p-1.5 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>
            <PublishForm 
              extensionId={editingExtension._id} 
              redirectToChat={false}
              isEditing={true}
              existingData={{
                id: editingExtension._id,
                title: editingExtension.title,
                description: editingExtension.description,
                price_codon: editingExtension.price_codon,
                category: editingExtension.category,
                tags: editingExtension.tags,
                username: editingExtension.username
              }}
              onSuccess={handleEditSuccess} 
              onCancel={() => setShowEditForm(false)} 
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmation && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4 sm:p-6">
          <div className="bg-gradient-to-br from-gray-900/95 to-gray-800/90 backdrop-blur-xl p-6 rounded-xl shadow-2xl border border-gray-700/50 max-w-md w-full mx-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-red-900/30 rounded-lg">
                  <Trash2 className="w-5 h-5 text-red-400" />
                </div>
                <h2 className="text-xl font-semibold text-white">Delete Extension</h2>
              </div>
              <button 
                onClick={closeDeleteModal}
                className="p-1.5 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>
            <p className="text-gray-300 mb-4">
              Are you sure you want to delete this extension from the marketplace? This action cannot be undone.
            </p>
            
            {/* Error Message */}
            {deleteError && (
              <div className="mb-4 p-3 bg-red-900/20 border border-red-800 rounded-lg">
                <div className="flex items-start gap-2">
                  <div className="text-red-400 mt-0.5 flex-shrink-0">
                    <AlertCircle size={16} />
                  </div>
                  <p className="text-red-400 text-sm">{deleteError}</p>
                </div>
              </div>
            )}
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Reason for deletion (optional):
              </label>
              <textarea
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                className="w-full px-4 py-2.5 bg-gradient-to-b from-gray-900/80 to-gray-800/80 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[80px]"
                placeholder="Provide a reason for deleting this extension"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeDeleteModal}
                disabled={isDeletingExtension}
                className="px-4 py-2 text-gray-300 border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeletingExtension}
                className="px-5 py-2 bg-gradient-to-r from-red-600/90 to-red-700/80 hover:from-red-500 hover:to-red-600 text-white rounded-lg flex items-center gap-2 transition-colors shadow-lg hover:shadow-red-900/20 border border-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeletingExtension ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    Delete Extension
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Publish Form Modal */}
      <PublishFormModal
        showPublishForm={showPublishForm}
        publishExtensionId={publishExtensionId}
        setShowPublishForm={setShowPublishForm}
        sortBy={sortBy}
        setExtensions={setExtensions}
        setFilteredExtensions={setAllExtensions}
        setError={setError}
      />
      
      {/* Apply Marketplace Styles */}
      <MarketplaceStyles />
      
      {/* CSS animations */}
      <style jsx global>{`
        @keyframes aurora-x {
          0%, 100% { transform: translateX(0) rotate(0); opacity: 0.8; }
          50% { transform: translateX(30px) rotate(5deg); opacity: 1; }
        }
        
        @keyframes aurora-y {
          0%, 100% { transform: translateY(0) rotate(0); opacity: 0.7; }
          50% { transform: translateY(30px) rotate(-5deg); opacity: 1; }
        }
        
        @keyframes aurora-pulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.1); }
        }
      `}</style>
    </ErrorBoundary>
  );
}

// Main export with Suspense boundary
export default function MarketplacePage() {
  return (
    <Suspense fallback={<MarketplaceLoading />}>
      <MarketplaceContent />
    </Suspense>
  );
}
