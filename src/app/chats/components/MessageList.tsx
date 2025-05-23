"use client";
import bgi from "../../../../public/bgii.jpg";

interface Message {
  id: string;
  created_at: string;
  sender_id: string;
  content: string;
}

interface User {
  id: string;
  name: string;
}

interface MessageListProps {
  messages: Message[];
  user: User | null;
  users?: User[];
}

const MessageList: React.FC<MessageListProps> = ({
  messages,
  user,
  users = [],
}) => {
  let lastDisplayedDate: string | null = null;

  return (
    <div
      className="flex-1 overflow-y-auto px-4 py-2 space-y-2"
      style={{ backgroundImage: `url(${bgi})`, backgroundSize: "cover" }}
    >
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

          // Check if the date has changed
          const displayDate = `${String(date.getDate()).padStart(
            2,
            "0"
          )}-${String(date.getMonth() + 1).padStart(
            2,
            "0"
          )}-${date.getFullYear()}`;
          const showDate = lastDisplayedDate !== displayDate;
          lastDisplayedDate = displayDate;

          // Find the sender's name based on sender_id
          const sender = users.find((u) => u.id === msg.sender_id);

          return (
            <div key={msg.id}>
              {showDate && (
                <div className="text-center text-gray-700 text-sm my-2 mx-100 bg-blue-100 p-1 rounded border-gray-500">
                  {displayDate}
                </div>
              )}
              <div
                className={`flex ${
                  msg.sender_id === user?.id ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`px-3 py-2 rounded-lg text-sm shadow ${
                    msg.sender_id === user?.id
                      ? "bg-[#d9fdd3] text-gray-800"
                      : "bg-white text-gray-900 border"
                  }`}
                >
                  <div className="flex justify-between">
                    <span>
                      {sender ? (
                        <>
                          <div className="text-xs text-gray-500">
                            {sender.name}
                          </div>{" "}
                          <div className="text-md">{msg.content}</div>{" "}
                        </>
                      ) : (
                        <div className="text-xl">{msg.content}</div>
                      )}
                    </span>
                    <span className="text-xs text-gray-500 ml-2 text-right">
                      {timeString}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })
      ) : (
        <div className="text-center text-gray-500 mt-20 text-sm flex-1 overflow-y-auto px-4 py-2 space-y-2">
          No chat selected
        </div>
      )}
    </div>
  );
};

export default MessageList;
