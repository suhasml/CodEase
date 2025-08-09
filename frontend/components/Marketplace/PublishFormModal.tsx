'use client';

import React from 'react';
import { toast } from 'react-hot-toast';
import PublishForm from './PublishForm';
import { authenticatedFetch } from '@/lib/api-utils';
import { PublishFormModalProps } from './types';

const PublishFormModal: React.FC<PublishFormModalProps> = ({
  showPublishForm,
  publishExtensionId,
  setShowPublishForm,
  sortBy,
  setExtensions,
  setFilteredExtensions,
  setError
}) => {
  if (!showPublishForm || !publishExtensionId) return null;
  
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 sm:p-6">
      <div className="bg-gradient-to-b from-gray-800/95 to-gray-900/95 p-6 sm:p-8 md:p-10 rounded-2xl shadow-2xl border border-gray-700 max-w-5xl w-full mx-auto max-h-[95vh] overflow-y-auto backdrop-blur-md">
        <PublishForm 
          extensionId={publishExtensionId} 
          redirectToChat={false}
          onSuccess={() => {
            toast.success('Extension published to marketplace successfully!');
            setShowPublishForm(false);            // Refresh the listings to show the new extension
            const fetchExtensions = async () => {
              try {
                const response = await authenticatedFetch(
                  `${process.env.NEXT_PUBLIC_API_URL}/marketplace/listings?sort_by=${sortBy}&page=1&limit=20`
                );
                if (response.ok) {
                  const data = await response.json();
                  
                  // Normalize the data - map extension_id to id for consistency
                  const normalizedExtensions = data.listings.map((ext: any) => ({
                    ...ext,
                    id: ext.extension_id || ext.id,
                    owner: ext.owner_name || ext.owner || 'Unknown'
                  }));
                  
                  setExtensions(normalizedExtensions);
                  setFilteredExtensions(normalizedExtensions);
                } else {
                  const errorData = await response.json().catch(() => ({}));
                  setError(errorData.message || 'Failed to refresh listings. Please try again.');
                }
              } catch (error: any) {
                setError('Something went wrong while refreshing the listings. Please try again in a while.');
              }
            };
            fetchExtensions();
          }} 
          onCancel={() => setShowPublishForm(false)} 
        />
      </div>
    </div>
  );
};

export default PublishFormModal;
