"use client";

const MessageList = ({ messages, user, users = [] }) => {
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

          // Find the sender's name based on sender_id
          const sender = users.find((u) => u.id === msg.sender_id);

          return (
            <div
              key={msg.id}
              className={`flex ${
                msg.sender_id === user?.id ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`px-4 py-2 rounded-lg text-sm shadow ${
                  msg.sender_id === user?.id
                    ? "bg-[#d9fdd3] text-gray-800"
                    : "bg-white text-gray-900 border"
                }`}
              >
                <div className="flex justify-between">
                  <span>
                    {sender ? (
                      <>
                        <div className="text-xs text-gray-500">{sender.name}</div> <div>{msg.content}</div>{" "}
                      </>
                    ) : (
                      <div>>{msg.content}</div>
                    )}
                  </span>
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
