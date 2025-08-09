// Types used across marketplace components
import React from 'react';

// Extension interface for marketplace listings
export interface Extension {
  id: string;
  extension_id: string;
  title: string;
  description: string;
  owner: string;
  owner_id: string;
  owner_email?: string; // Email of the extension owner/seller
  username?: string;
  price_codon: number;
  rating: number;
  category: string;
  tags: string[];
  purchased: boolean;
  owned_by_current_user?: boolean; // Flag from API indicating if the current user owns this extension
  created_at: string;
  // Fields for download functionality
  access_key?: string;
  resource_identifier?: string;
  download_count?: number;
}

// Props for PurchaseModal component
export interface PurchaseModalProps {
  listingId: string;
  title: string;
  price: number;
  sellerEmail?: string; // Email of the seller for transparency
  onClose: () => void;
  onPurchase: () => void;
}

// Props for FilterPanel component
export interface FilterPanelProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  selectedCategory: string;
  setSelectedCategory: (value: string) => void;
  sortBy: string;
  setSortBy: (value: string) => void;
  categories: string[];
  clearFilters: () => void;
  showMobileFilters: boolean;
  setShowMobileFilters: (value: boolean) => void;
}

// Props for MarketplaceHeader component
export interface MarketplaceHeaderProps {
  extensionsCount: number;
  publishExtensionId: string | null;
  router: any;
  error: string | null;
  setError: (error: string | null) => void;
  activeTab: 'browse' | 'my-extensions';
  setActiveTab: (tab: 'browse' | 'my-extensions') => void;
}

// Props for ExtensionsGrid component
export interface ExtensionsGridProps {
  isLoading: boolean;
  filteredExtensions: Extension[];
  extensions: Extension[];
  downloadingExtensions: Set<string>;
  selectedCategory: string;
  searchTerm: string;
  clearFilters: () => void;
  handlePurchaseClick: (id: string) => void;
  handleRatingSubmit: (id: string, rating: number) => void;
  handleDownloadExtension: (extension: Extension) => void;
  setError: (error: string | null) => void;
  renderActions?: (extension: Extension) => React.ReactNode; // Optional custom actions renderer
  customEmptyState?: {
    title: string;
    description: string;
    icon?: React.ReactNode;
  }; // Optional custom empty state
  // Pagination props
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
}

// Props for PublishFormModal component
export interface PublishFormModalProps {
  showPublishForm: boolean;
  publishExtensionId: string | null;
  setShowPublishForm: (value: boolean) => void;
  sortBy: string; 
  setExtensions: (extensions: Extension[]) => void;
  setFilteredExtensions: (extensions: Extension[]) => void;
  setError: (error: string | null) => void;
}
