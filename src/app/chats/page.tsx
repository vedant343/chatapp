"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "@/lib/supabase";

export default function ChatsPage() {
  const router = useRouter();
  const [hasMounted, setHasMounted] = useState(false);
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [chatId, setChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (!hasMounted) return;
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/login");
    } else {
      const parsed = JSON.parse(storedUser);
      setUser(parsed);
      fetchUsers(parsed.id);
    }
  }, [hasMounted]);

  useEffect(() => {
    if (!hasMounted || !chatId) return;

    fetchMessages(chatId);

    const channel = supabase
      .channel(`chat:${chatId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `chat_id=eq.${chatId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [hasMounted, chatId]);

  const fetchUsers = async (userId) => {
    const { data, error } = await supabase
      .from("users")
      .select("id, name, email")
      .neq("id", userId);

    if (!error) setUsers(data);
  };

  const fetchMessages = async (chatId) => {
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("chat_id", chatId)
      .order("created_at", { ascending: true });

    if (data) setMessages(data);
  };

  const openChatWithUser = async (otherUserId) => {
    const { data: myChats } = await supabase
      .from("chat_participants")
      .select("chat_id")
      .eq("user_id", user?.id);

    const myChatIds = myChats?.map((c) => c.chat_id);

    const { data: shared } = await supabase
      .from("chat_participants")
      .select("chat_id")
      .in("chat_id", myChatIds || [])
      .eq("user_id", otherUserId);

    if (shared && shared.length > 0) {
      setChatId(shared[0].chat_id);
      setSelectedUser(users.find((u) => u.id === otherUserId));
      return;
    }

    const { data: newChat } = await supabase
      .from("chats")
      .insert([{ is_group: false }])
      .select()
      .single();

    await supabase.from("chat_participants").insert([
      { chat_id: newChat.id, user_id: user?.id },
      { chat_id: newChat.id, user_id: otherUserId },
    ]);

    setChatId(newChat.id);
    setSelectedUser(users.find((u) => u.id === otherUserId));
    setMessages([]);
  };

  const handleSendMessage = async () => {
    if (!messageText.trim()) return;

    await supabase.from("messages").insert([
      {
        chat_id: chatId,
        sender_id: user?.id,
        content: messageText.trim(),
      },
    ]);

    setMessageText("");
  };

  if (!hasMounted) return null;

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-1/4 bg-gray-100 border-r p-4">
        <h2 className="text-xl font-bold mb-4 text-black">
          Chats : {user?.name}
        </h2>
        <ul className="space-y-2">
          {users.map((u) => (
            <li
              key={u.id}
              onClick={() => openChatWithUser(u.id)}
              className="text-black cursor-pointer p-2 bg-white hover:bg-gray-200 rounded"
            >
              {u.name} : {u.email}
            </li>
          ))}
        </ul>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b text-black bg-white font-semibold">
          {selectedUser ? selectedUser.name : "Select a user to chat"}
        </div>

        <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
          {chatId ? (
            <div className="space-y-2">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`${
                    msg.sender_id === user?.id ? "text-right" : "text-left"
                  }`}
                >
                  <div
                    className={`inline-block px-3 py-2 rounded-lg ${
                      msg.sender_id === user?.id
                        ? "bg-green-200"
                        : "bg-white border"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 mt-20">
              No chat selected
            </div>
          )}
        </div>

        {chatId && (
          <div className="p-4 border-t bg-white flex items-center gap-2">
            <input
              type="text"
              className="flex-1 border px-3 py-2 rounded"
              placeholder="Type your message..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            />
            <button
              onClick={handleSendMessage}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Send
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
