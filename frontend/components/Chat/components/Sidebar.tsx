// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import { X, Trash2, Clock } from 'lucide-react';
// import { useRouter, usePathname } from 'next/navigation';
// import Cookies from 'js-cookie';
// import { authenticatedFetch } from '@/lib/api-utils';
// import { getStoredToken } from '@/lib/auth-utils';

// interface Message {
//   id: string;
//   title: string;
//   createdAt: string;
//   messagesCount?: number;
// }

// interface SidebarProps {
//   isOpen: boolean;
//   onClose: () => void;
// }

// const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
//   const router = useRouter();
//   const pathname = usePathname();
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
//   const [isDeleting, setIsDeleting] = useState<boolean>(false);

//   useEffect(() => {
//     const fetchMessages = async () => {
//       setIsLoading(true);
//       try {
//         // Get Firebase ID token for authentication
//         const user = Cookies.get('user') ? JSON.parse(Cookies.get('user') as string) : null;
//         const idToken = user?.idToken || getStoredToken();
        
//         if (!idToken) {
//           console.error('No authentication token found');
//           return;
//         }
        
//         // Use authenticated Axios call
//         const response = await axios.get(
//           `${process.env.NEXT_PUBLIC_API_URL}/middleware/api/user`, 
//           { 
//             headers: { 
//               'Authorization': `Bearer ${idToken}` 
//             } 
//           }
//         );
        
//         if (response.data && response.data.sessions) {
//           // Transform sessions to match the expected Message interface
//           const formattedSessions = response.data.sessions.map((session: any) => ({
//             id: session.session_id,
//             title: session.title || `Chat ${session._id?.substring(0, 8) || session.session_id?.substring(0, 8)}`,
//             createdAt: session.created_at || session.createdAt,
//             messagesCount: session.messages_count || session.messagesCount
//           }));
//           setMessages(formattedSessions);
//         }
//       } catch (error) {
//         console.error('Failed to fetch messages', error);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     if (isOpen) {
//       fetchMessages();
//     }
//   }, [isOpen]);

  
//   const groupMessages = (days: number) => {
//     // Get the current date in user's local timezone
//     const now = new Date();
    
//     // Set time to start of the day (midnight) in local timezone
//     const todayStart = new Date(now);
//     todayStart.setHours(0, 0, 0, 0);
    
//     // Set boundary date for this period
//     const boundaryDate = new Date(todayStart);
//     boundaryDate.setDate(todayStart.getDate() - (days - 1)); // Subtract days-1 to include today
    
//     return messages
//       .filter((msg) => {
//         const msgDate = new Date(msg.createdAt);
        
//         // For "Today", check if message is from today
//         if (days === 1) {
//           return msgDate >= todayStart;
//         }
        
//         // For other periods, check if message is within the boundary
//         return msgDate >= boundaryDate;
//       })
//       .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); // Sort by most recent first
//   };


//   const handleSessionClick = (sessionId: string) => {
//     router.push(`/chat/${sessionId}`);
//     onClose();
//   };

//   const handleDeleteSession = async (sessionId: string) => {
//     if (isDeleting) return; // Prevent multiple delete attempts
    
//     try {
//       setIsDeleting(true);
      
//       // Use authenticatedFetch for deletion
//       const response = await authenticatedFetch(
//         `${process.env.NEXT_PUBLIC_API_URL}/middleware/sessions/${sessionId}`,
//         {
//           method: 'DELETE'
//         }
//       );
      
//       if (!response.ok) {
//         throw new Error('Failed to delete session');
//       }
      
//       // Remove the deleted session from the local state
//       setMessages(messages.filter(msg => msg.id !== sessionId));
      
//       // If we're on the deleted session's page, redirect to a new session
//       if (pathname === `/chat/${sessionId}`) {
//         router.push('/chat');
//       }
//     } catch (error) {
//       console.error('Error deleting session:', error);
//     } finally {
//       setIsDeleting(false);
//     }
//   };

//   const formatDate = (dateString: string) => {
//     const date = new Date(dateString);
//     return date.toLocaleDateString();
//   };

//   // If the sidebar is not open, don't render it at all
//   if (!isOpen) return null;

//   return (
//     <>
//       {/* Overlay to close sidebar when clicking outside */}
//       <div 
//         className="fixed inset-0 bg-black/50 z-30"
//         onClick={onClose}
//       />
      
//       {/* Sidebar component */}
//       <div className="fixed top-0 left-0 h-full w-64 md:w-80 bg-[#1e1e1e] text-white shadow-lg z-40 overflow-hidden">
//         <div className="flex justify-between items-center p-4 border-b border-gray-700">
//           <div className="flex items-center gap-2">
//             <Clock size={20} />
//             <h2 className="text-xl font-bold">Chat History</h2>
//           </div>
//           <button onClick={onClose} className="hover:bg-gray-700 p-1 rounded">
//             <X className="w-5 h-5" />
//           </button>
//         </div>

//         {/* Sidebar Content */}
//         <div className="p-4 space-y-4 overflow-y-auto h-[calc(100%-60px)]">
//           {isLoading ? (
//             <div className="flex justify-center items-center py-8">
//               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
//             </div>
//           ) : messages.length === 0 ? (
//             <p className="text-center text-gray-400 py-4">No conversations yet</p>
//           ) : (
//             <>
//               <Section 
//                 title="Today" 
//                 messages={groupMessages(1)}
//                 onItemClick={handleSessionClick}
//                 onDeleteClick={setSessionToDelete}
//                 currentPath={pathname}
//               />
//               <Section 
//                 title="Previous 7 Days" 
//                 messages={messages
//                   .filter(msg => {
//                     const msgDate = new Date(msg.createdAt);
//                     const todayStart = new Date();
//                     todayStart.setHours(0, 0, 0, 0);
                    
//                     // Get date 7 days ago
//                     const sevenDaysAgo = new Date(todayStart);
//                     sevenDaysAgo.setDate(todayStart.getDate() - 6); // -6 to include yesterday through 7 days ago
                    
//                     // Get date 1 day ago (yesterday's start)
//                     const yesterdayStart = new Date(todayStart);
//                     yesterdayStart.setDate(todayStart.getDate() - 1);
                    
//                     // Include if message is between yesterday and 7 days ago
//                     return msgDate >= sevenDaysAgo && msgDate < todayStart;
//                   })
//                   .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())}
//                 onItemClick={handleSessionClick}
//                 onDeleteClick={setSessionToDelete}
//                 currentPath={pathname}
//               />
//               <Section 
//                 title="Previous 30 Days" 
//                 messages={messages
//                   .filter(msg => {
//                     const msgDate = new Date(msg.createdAt);
//                     const todayStart = new Date();
//                     todayStart.setHours(0, 0, 0, 0);
                    
//                     // Get date 30 days ago
//                     const thirtyDaysAgo = new Date(todayStart);
//                     thirtyDaysAgo.setDate(todayStart.getDate() - 29); // -29 to include last 30 days including today
                    
//                     // Get date 7 days ago
//                     const sevenDaysAgo = new Date(todayStart);
//                     sevenDaysAgo.setDate(todayStart.getDate() - 6);
                    
//                     // Include if message is between 8 and 30 days ago
//                     return msgDate >= thirtyDaysAgo && msgDate < sevenDaysAgo;
//                   })
//                   .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())}
//                 onItemClick={handleSessionClick}
//                 onDeleteClick={setSessionToDelete}
//                 currentPath={pathname}
//               />
//             </>
//           )}
//         </div>
//       </div>

//       {/* Confirmation Dialog */}
//       {sessionToDelete && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-lg">
//             <h2 className="text-lg font-semibold mb-4 text-white">Are you sure you want to delete this session?</h2>
//             <div className="flex justify-end space-x-4">
//               <button
//                 className="px-3 py-2 text-white bg-transparent hover:bg-gray-700 rounded"
//                 onClick={() => setSessionToDelete(null)}
//               >
//                 Cancel
//               </button>
//               <button
//                 className="px-3 py-2 text-white bg-red-600 hover:bg-red-700 rounded flex items-center justify-center"
//                 onClick={() => {
//                   handleDeleteSession(sessionToDelete);
//                   setSessionToDelete(null);
//                 }}
//                 disabled={isDeleting}
//               >
//                 {isDeleting ? (
//                   <span className="flex items-center">
//                     <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
//                     Deleting...
//                   </span>
//                 ) : 'Delete'}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// };

// interface SectionProps {
//   title: string;
//   messages: Message[];
//   onItemClick: (id: string) => void;
//   onDeleteClick: (id: string) => void;
//   currentPath: string;
// }

// const Section: React.FC<SectionProps> = ({ 
//   title, 
//   messages,
//   onItemClick,
//   onDeleteClick,
//   currentPath
// }) => {
//   if (messages.length === 0) return null;

//   return (
//     <div>
//       <h3 className="text-gray-400 text-sm uppercase mb-2">{title}</h3>
//       <div className="space-y-2">
//         {messages.map((msg) => {
//           const isActive = currentPath === `/chat/${msg.id}`;
          
//           return (
//             <div key={msg.id} className="relative">
//               <div 
//                 className={`p-3 hover:bg-gray-700 rounded cursor-pointer flex flex-col transition-colors ${
//                   isActive ? "bg-gray-700/70 border-l-2 border-blue-500" : ""
//                 }`}
//                 onClick={() => onItemClick(msg.id)}
//               >
//                 <div className="flex justify-between items-center">
//                   <span className="font-medium truncate text-sm">
//                     {msg.title || `Chat ${msg.id.slice(0, 8)}`}
//                   </span>
//                   <button
//                     className="p-0 h-6 w-6 hover:bg-red-500/20 text-gray-400 hover:text-red-400 bg-transparent"
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       onDeleteClick(msg.id);
//                     }}
//                   >
//                     <Trash2 className="h-4 w-4" />
//                   </button>
//                 </div>
//                 <div className="flex justify-between text-xs text-gray-400 mt-1">
//                   {msg.messagesCount && (
//                     <span>{msg.messagesCount} messages</span>
//                   )}
//                   <span>{new Date(msg.createdAt).toLocaleDateString()}</span>
//                 </div>
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// };

// export default Sidebar;

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { X, Trash2, Clock } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { authenticatedFetch } from '@/lib/api-utils';
import { safeAuthenticatedFetch } from '@/lib/error-handling';
import { getStoredToken } from '@/lib/auth-utils';
import { getUserFromCookie } from '@/lib/cookie-utils';

interface Message {
  id: string;
  title: string;
  createdAt: string;
  messagesCount?: number;
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  useEffect(() => {
    const fetchMessages = async () => {
      setIsLoading(true);
      try {
        // Get Firebase ID token for authentication using secure cookie utils
        const userData = getUserFromCookie();
        const idToken = userData?.idToken || getStoredToken();
        
        if (!idToken) {
          // Handle gracefully without console.error
          return;
        }
        
        // Use authenticated Axios call
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/middleware/api/user`, 
          { 
            headers: { 
              'Authorization': `Bearer ${idToken}` 
            } 
          }
        );
        
        if (response.data && response.data.sessions) {
          // Transform sessions to match the expected Message interface
          const formattedSessions = response.data.sessions.map((session: any) => ({
            id: session.session_id,
            title: session.title || `Chat ${session._id?.substring(0, 8) || session.session_id?.substring(0, 8)}`,
            createdAt: session.created_at || session.createdAt,
            messagesCount: session.messages_count || session.messagesCount
          }));
          setMessages(formattedSessions);
        }
      } catch (error) {
        // Handle gracefully without console.error
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      fetchMessages();
    }
  }, [isOpen]);

  
  const groupMessages = (days: number) => {
    // Get the current date in user's local timezone
    const now = new Date();
    
    // Set time to start of the day (midnight) in local timezone
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    
    // Set boundary date for this period
    const boundaryDate = new Date(todayStart);
    boundaryDate.setDate(todayStart.getDate() - (days - 1)); // Subtract days-1 to include today
    
    return messages
      .filter((msg) => {
        const msgDate = new Date(msg.createdAt);
        
        // For "Today", check if message is from today
        if (days === 1) {
          return msgDate >= todayStart;
        }
        
        // For other periods, check if message is within the boundary
        return msgDate >= boundaryDate;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); // Sort by most recent first
  };


  const handleSessionClick = (sessionId: string) => {
    router.push(`/chat/${sessionId}`);
    onClose();
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (isDeleting) return; // Prevent multiple delete attempts
    
    try {
      setIsDeleting(true);
      
      // Use safeAuthenticatedFetch for deletion
      const { data, error } = await safeAuthenticatedFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/middleware/sessions/${sessionId}`,
        {
          method: 'DELETE'
        },
        {
          showToast: true // Show error toasts if needed
        }
      );
      
      if (error) {
        // Error already handled by safeAuthenticatedFetch
        return;
      }
      
      // Remove the deleted session from the local state
      setMessages(messages.filter(msg => msg.id !== sessionId));
      
      // If we're on the deleted session's page, redirect to a new session
      if (pathname === `/chat/${sessionId}`) {
        router.push('/chat');
      }
    } catch (error) {
      // Graceful fallback - errors already handled by safeAuthenticatedFetch
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // If the sidebar is not open, don't render it at all
  if (!isOpen) return null;

  return (
    <>
      {/* Overlay to close sidebar when clicking outside */}
      <div 
        className="fixed inset-0 bg-black/50 z-30"
        onClick={onClose}
      />
      
      {/* Sidebar component */}
      <div className="fixed top-0 left-0 h-full w-64 md:w-80 bg-[#1e1e1e] text-white shadow-lg z-40 overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <Clock size={20} />
            <h2 className="text-xl font-bold">Chat History</h2>
          </div>
          <button onClick={onClose} className="hover:bg-gray-700 p-1 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Content */}
        <div className="p-4 space-y-4 overflow-y-auto h-[calc(100%-60px)]">
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          ) : messages.length === 0 ? (
            <p className="text-center text-gray-400 py-4">No conversations yet</p>
          ) : (
            <>
              <Section 
                title="Today" 
                messages={groupMessages(1)}
                onItemClick={handleSessionClick}
                onDeleteClick={setSessionToDelete}
                currentPath={pathname}
              />
              <Section 
                title="Previous 7 Days" 
                messages={messages
                  .filter(msg => {
                    const msgDate = new Date(msg.createdAt);
                    const todayStart = new Date();
                    todayStart.setHours(0, 0, 0, 0);
                    
                    // Get date 7 days ago
                    const sevenDaysAgo = new Date(todayStart);
                    sevenDaysAgo.setDate(todayStart.getDate() - 6); // -6 to include yesterday through 7 days ago
                    
                    // Get date 1 day ago (yesterday's start)
                    const yesterdayStart = new Date(todayStart);
                    yesterdayStart.setDate(todayStart.getDate() - 1);
                    
                    // Include if message is between yesterday and 7 days ago
                    return msgDate >= sevenDaysAgo && msgDate < todayStart;
                  })
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())}
                onItemClick={handleSessionClick}
                onDeleteClick={setSessionToDelete}
                currentPath={pathname}
              />
              <Section 
                title="Previous 30 Days" 
                messages={messages
                  .filter(msg => {
                    const msgDate = new Date(msg.createdAt);
                    const todayStart = new Date();
                    todayStart.setHours(0, 0, 0, 0);
                    
                    // Get date 30 days ago
                    const thirtyDaysAgo = new Date(todayStart);
                    thirtyDaysAgo.setDate(todayStart.getDate() - 29); // -29 to include last 30 days including today
                    
                    // Get date 7 days ago
                    const sevenDaysAgo = new Date(todayStart);
                    sevenDaysAgo.setDate(todayStart.getDate() - 6);
                    
                    // Include if message is between 8 and 30 days ago
                    return msgDate >= thirtyDaysAgo && msgDate < sevenDaysAgo;
                  })
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())}
                onItemClick={handleSessionClick}
                onDeleteClick={setSessionToDelete}
                currentPath={pathname}
              />
            </>
          )}
        </div>
      </div>

      {/* Confirmation Dialog */}
      {sessionToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-lg">
            <h2 className="text-lg font-semibold mb-4 text-white">Are you sure you want to delete this session?</h2>
            <div className="flex justify-end space-x-4">
              <button
                className="px-3 py-2 text-white bg-transparent hover:bg-gray-700 rounded"
                onClick={() => setSessionToDelete(null)}
              >
                Cancel
              </button>
              <button
                className="px-3 py-2 text-white bg-red-600 hover:bg-red-700 rounded flex items-center justify-center"
                onClick={() => {
                  handleDeleteSession(sessionToDelete);
                  setSessionToDelete(null);
                }}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <span className="flex items-center">
                    <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
                    Deleting...
                  </span>
                ) : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

interface SectionProps {
  title: string;
  messages: Message[];
  onItemClick: (id: string) => void;
  onDeleteClick: (id: string) => void;
  currentPath: string;
}

const Section: React.FC<SectionProps> = ({ 
  title, 
  messages,
  onItemClick,
  onDeleteClick,
  currentPath
}) => {
  if (messages.length === 0) return null;

  return (
    <div>
      <h3 className="text-gray-400 text-sm uppercase mb-2">{title}</h3>
      <div className="space-y-2">
        {messages.map((msg) => {
          const isActive = currentPath === `/chat/${msg.id}`;
          
          return (
            <div key={msg.id} className="relative">
              <div 
                className={`p-3 hover:bg-gray-700 rounded cursor-pointer flex flex-col transition-colors ${
                  isActive ? "bg-gray-700/70 border-l-2 border-blue-500" : ""
                }`}
                onClick={() => onItemClick(msg.id)}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium truncate text-sm">
                    {msg.title || `Chat ${msg.id.slice(0, 8)}`}
                  </span>
                  <button
                    className="p-0 h-6 w-6 hover:bg-red-500/20 text-gray-400 hover:text-red-400 bg-transparent"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteClick(msg.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  {msg.messagesCount && (
                    <span>{msg.messagesCount} messages</span>
                  )}
                  <span>{new Date(msg.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Sidebar;