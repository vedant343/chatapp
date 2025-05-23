"use client";

import {
  FaPaperclip,
  FaSmile,
  FaClock,
  FaMagic,
  FaMicrophone,
  FaPaperPlane,
} from "react-icons/fa";

interface MessageInputProps {
  messageText: string;
  setMessageText: (text: string) => void;
  handleSendMessage: () => void;
  isChatSelected: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({
  messageText,
  setMessageText,
  handleSendMessage,
  isChatSelected,
}) => {
  return (
    <div className="p-3 bg-white border-t border-gray-300 flex items-center justify-between">
      {isChatSelected && (
        <>
          <div className="flex items-center gap-2 flex-1">
            <FaPaperclip className="text-gray-400 cursor-pointer hover:text-gray-600" />
            <FaSmile className="text-gray-400 cursor-pointer hover:text-gray-600" />
            <FaClock className="text-gray-400 cursor-pointer hover:text-gray-600" />
            <FaMagic className="text-gray-400 cursor-pointer hover:text-gray-600" />
            <FaMicrophone className="text-gray-400 cursor-pointer hover:text-gray-600" />

            <input
              type="text"
              className="flex-1 px-4 py-2 text-sm text-gray-800 border border-gray-300 rounded-full outline-none focus:ring-2 focus:ring-[#25d366]"
              placeholder="Message..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            />
          </div>
          <button
            onClick={handleSendMessage}
            className="ml-3 bg-green-500 text-white hover:bg-green-600 transition rounded-full px-4 py-2"
          >
            <FaPaperPlane size={20} />
          </button>
        </>
      )}
    </div>
  );
};

export default MessageInput;
