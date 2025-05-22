"use client";

const MessageList = ({ messages, user }) => {
  return (
    <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2">
      {messages.length > 0 ? (
        messages.map((msg) => {
          const date = new Date(msg.created_at);
          const timeString = `${date
            .getHours()
            .toString()
            .padStart(2, "0")}:${date
            .getMinutes()
            .toString()
            .padStart(2, "0")}`;
          return (
            <div
              key={msg.id}
              className={`flex ${
                msg.sender_id === user?.id ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`px-4 py-2 max-w-[70%] rounded-lg text-sm shadow ${
                  msg.sender_id === user?.id
                    ? "bg-[#d9fdd3] text-gray-800"
                    : "bg-white text-gray-900 border"
                }`}
              >
                <div className="flex justify-between">
                  <span>{msg.content}</span>
                  <span className="text-xs text-gray-500 ml-2 text-right">
                    {timeString}
                  </span>
                </div>
              </div>
            </div>
          );
        })
      ) : (
        <div className="text-center text-gray-500 mt-20 text-sm">
          No chat selected
        </div>
      )}
    </div>
  );
};

export default MessageList;
