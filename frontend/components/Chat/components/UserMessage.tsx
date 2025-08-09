// import React from 'react';

// interface UserMessageProps {
//   text: string;
// }

// const UserMessage: React.FC<UserMessageProps> = ({ text }) => {
//   return (
//     <div className="flex justify-end p-2">
//       <div className="bg-blue-600 text-white p-3 rounded-lg break-words">
//         {text}
//       </div>
//     </div>
//   );
// };

// export default UserMessage;

import React from 'react';
import { User, Edit, Trash } from 'lucide-react';
import { motion } from 'framer-motion';

interface UserMessageProps {
  text: string;
  onEdit?: () => void;
  onDelete?: () => void;
  allowActions?: boolean;
}

const UserMessage: React.FC<UserMessageProps> = ({ 
  text, 
  onEdit, 
  onDelete, 
  allowActions = false 
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex justify-end p-2"
    >
      <div className="flex items-start space-x-3 max-w-2xl">
        <div className="flex flex-col items-end">
          {allowActions && (
            <div className="flex space-x-1 mb-1">
              {onEdit && (
                <button 
                  onClick={onEdit}
                  className="p-1 hover:bg-gray-800 rounded-full"
                  title="Edit message"
                >
                  <Edit size={14} className="text-gray-400" />
                </button>
              )}
              {onDelete && (
                <button 
                  onClick={onDelete}
                  className="p-1 hover:bg-gray-800 rounded-full"
                  title="Delete message"
                >
                  <Trash size={14} className="text-gray-400" />
                </button>
              )}
            </div>
          )}
          
          <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white p-3 rounded-2xl break-words shadow-lg">
            {text}
          </div>
        </div>
        
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
          <User className="w-4 h-4 text-white" />
        </div>
      </div>
    </motion.div>
  );
};

export default UserMessage;