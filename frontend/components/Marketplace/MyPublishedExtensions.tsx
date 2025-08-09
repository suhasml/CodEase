import React, { useState, useEffect } from 'react';
import { Edit2, Trash2, ExternalLink, AlertCircle, Check, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { authenticatedFetch } from '@/lib/api-utils';
import { getUserFromCookie } from '@/lib/cookie-utils';
import { getStoredToken } from '@/lib/auth-utils';
import PublishForm from './PublishForm';

interface Extension {
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

const MyPublishedExtensions: React.FC = () => {
  const [myExtensions, setMyExtensions] = useState<Extension[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasWallet, setHasWallet] = useState<boolean>(false);
  const [editingExtension, setEditingExtension] = useState<Extension | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [extensionToDelete, setExtensionToDelete] = useState<string | null>(null);
  const [deleteReason, setDeleteReason] = useState('');  const fetchMyExtensions = async () => {
    setIsLoading(true);
    try {
      // Get user info for authentication
      const userData = getUserFromCookie();
      const storedToken = getStoredToken();
      
      // Use the token from either source
      const idToken = userData?.idToken || storedToken;
      
      if (!idToken) {
        toast.error('Authentication required. Please sign in again.');
        return;
      }
      
      // Manual fetch with explicit Authorization header for debugging
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/marketplace/my-listings`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        }
      });      if (response.ok) {
        const data = await response.json();
        setMyExtensions(data.listings || []);
        // Store the global has_wallet property
        setHasWallet(data.has_wallet || false);
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
        } else {
          toast.error(errorData.message || 'Failed to load your published extensions');
        }
      }    } catch (error) {
      toast.error('An error occurred while loading your published extensions');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyExtensions();
  }, []);

  const handleEditClick = (extension: Extension) => {
    setEditingExtension(extension);
    setShowEditForm(true);
  };

  const handleDeleteClick = (extensionId: string) => {
    setExtensionToDelete(extensionId);
    setShowDeleteConfirmation(true);
  };

  const handleDeleteConfirm = async () => {
    if (!extensionToDelete) return;

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
        setMyExtensions(prev => prev.filter(ext => ext._id !== extensionToDelete));
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to delete extension');
      }    } catch (error) {
      toast.error('An error occurred while deleting the extension');
    } finally {
      setShowDeleteConfirmation(false);
      setExtensionToDelete(null);
      setDeleteReason('');
    }
  };

  const handleEditSuccess = () => {
    setShowEditForm(false);
    setEditingExtension(null);
    // Refresh the extensions list
    fetchMyExtensions();
    toast.success('Extension updated successfully');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-white">My Published Extensions</h2>
        <p className="text-gray-400 mt-1">Manage your extensions on the marketplace</p>
      </div>

      {myExtensions.length === 0 ? (
        <div className="bg-[#0a0a0a] border border-gray-800 rounded-xl p-8 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-blue-900/30 flex items-center justify-center mb-4">
            <ExternalLink className="w-6 h-6 text-blue-400" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">No Published Extensions</h3>
          <p className="text-gray-400 max-w-md mx-auto mb-6">
            You haven't published any extensions to the marketplace yet. Create and publish an extension to get started.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {myExtensions.map((extension) => (
            <div 
              key={extension._id} 
              className="bg-[#0a0a0a] border border-gray-800 rounded-xl p-5 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between"
            >              <div className="flex-grow">
                <div className="flex items-start gap-2">
                  <h3 className="text-lg font-medium text-white">{extension.title}</h3>
                  {!hasWallet && (
                    <div className="px-2 py-1 bg-amber-900/30 text-amber-400 text-xs rounded-md flex items-center gap-1">
                      <AlertCircle size={12} />
                      No Phantom Wallet Connected
                    </div>
                  )}
                </div>
                <p className="text-gray-400 text-sm mt-1 line-clamp-2">{extension.description}</p>
                
                <div className="flex flex-wrap gap-2 mt-3">
                  <div className="px-2 py-1 bg-blue-900/30 text-blue-400 text-xs rounded-md">
                    {extension.price_codon} CODON
                  </div>
                  <div className="px-2 py-1 bg-purple-900/30 text-purple-400 text-xs rounded-md">
                    {extension.category}
                  </div>
                  <div className="px-2 py-1 bg-green-900/30 text-green-400 text-xs rounded-md flex items-center gap-1">
                    {extension.purchases_count} {extension.purchases_count === 1 ? 'Purchase' : 'Purchases'}
                  </div>
                  {extension.rating > 0 && (
                    <div className="px-2 py-1 bg-yellow-900/30 text-yellow-400 text-xs rounded-md flex items-center gap-1">
                      {extension.rating.toFixed(1)} Rating
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex gap-2 self-end md:self-center">
                <button
                  onClick={() => handleEditClick(extension)}
                  className="p-2 bg-blue-900/30 hover:bg-blue-900/50 text-blue-400 rounded-lg transition-colors"
                  title="Edit Extension"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => handleDeleteClick(extension._id)}
                  className="p-2 bg-red-900/30 hover:bg-red-900/50 text-red-400 rounded-lg transition-colors"
                  title="Delete Extension"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}      {/* Edit Form Modal */}
      {showEditForm && editingExtension && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4 sm:p-6">
          <div className="bg-[#0a0a0a] p-6 rounded-xl shadow-2xl border border-gray-800 max-w-4xl w-full mx-auto overflow-y-auto max-h-[90vh]">
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
      )}      {/* Delete Confirmation Modal */}
      {showDeleteConfirmation && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4 sm:p-6">
          <div className="bg-[#0a0a0a] p-6 rounded-xl shadow-2xl border border-gray-800 max-w-md w-full mx-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-red-900/30 rounded-lg">
                  <Trash2 className="w-5 h-5 text-red-400" />
                </div>
                <h2 className="text-xl font-semibold text-white">Delete Extension</h2>
              </div>
              <button 
                onClick={() => {
                  setShowDeleteConfirmation(false);
                  setExtensionToDelete(null);
                  setDeleteReason('');
                }}
                className="p-1.5 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>
            <p className="text-gray-300 mb-4">
              Are you sure you want to delete this extension from the marketplace? This action cannot be undone.
            </p>
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Reason for deletion (optional):
              </label>
              <textarea
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                className="w-full px-4 py-2.5 bg-black/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[80px]"
                placeholder="Provide a reason for deleting this extension"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteConfirmation(false);
                  setExtensionToDelete(null);
                  setDeleteReason('');
                }}
                className="px-4 py-2 text-gray-300 border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-2 transition-colors"
              >
                <Trash2 size={16} />
                Delete Extension
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyPublishedExtensions;
