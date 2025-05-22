"use client";

const MessageInput = ({
  messageText,
  setMessageText,
  handleSendMessage,
  isChatSelected,
}) => {
  return (
    <div className="p-4 bg-white border-t border-gray-200 flex items-center gap-1">
      {isChatSelected && (
        <>
          <input
            type="text"
            className="flex-1 text-black text-sm px-4 py-2 border border-gray-300 rounded-full outline-none focus:ring-2 focus:ring-[#25d366]"
            placeholder="Type a message"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
          />
          <button
            onClick={handleSendMessage}
            className="bg-[#25d366] text-white px-4 py-2 rounded-full hover:bg-[#1ebe5d] transition"
          >
            Send
          </button>
        </>
      )}
    </div>
  );
};

export default MessageInput;
