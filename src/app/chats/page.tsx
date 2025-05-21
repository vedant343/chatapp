"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "@/lib/supabase";
import { BiLogOut, BiSearchAlt2, BiVideoRecording } from "react-icons/bi";
import { FaUserCircle } from "react-icons/fa";
import { IoSearchCircle } from "react-icons/io5";
import { PiPhoneCall } from "react-icons/pi";

export default function ChatsPage() {
  const router = useRouter();
  const [hasMounted, setHasMounted] = useState(false);
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [chatId, setChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

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
  }, [hasMounted, router]);

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
      <div className="w-1/4 bg-white">
        <div className="p-4">
          <h2 className="text-2xl mb-2 text-gray-800">Chats</h2>
          <div className="flex items-center border border-gray-300 rounded-full p-2">
            <IoSearchCircle className="w-10 h-10" />
            <input
              type="text"
              placeholder="Search users..."
              className="flex-1 ml-2 p-2 text-gray-800 focus:outline-none"
              onChange={(e) => {
                setSearchQuery(e.target.value);
              }}
            />
          </div>
        </div>
        <ul className="border-">
          {users
            .filter((u) =>
              u.name.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map((u) => (
              <div className="gap-2" key={u.id}>
                <li
                  onClick={() => openChatWithUser(u.id)}
                  className="text-gray-800 flex cursor-pointer px-2 py-3 bg-gray-50 hover:bg-green-100 rounded-lg"
                >
                  <div>
                    <FaUserCircle className="w-10 h-10 text-gray-800" />
                  </div>
                  <div className="flex px-2 items-center">
                    <div className="text-xl">{u.name}</div>
                  </div>
                </li>
              </div>
            ))}
        </ul>
        <div className="p-2 border-t flex items-center bg-gray-200 bottom-0">
          <div className="flex-col p-2">
            <div className="text-lg mr-4 text-gray-800">{user?.name}</div>
            <div className="text-sm mr-4 text-gray-500">{user?.email}</div>
          </div>
          <div className="ml-auto">
            <button
              onClick={() => {
                localStorage.removeItem("user");
                router.push("/login");
              }}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              <BiLogOut />
            </button>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-[#f0f2f5]">
        <div className="p-4 border-b bg-white text-gray-800 shadow-sm">
          {selectedUser ? (
            <div className="text-xl flex ">
              {selectedUser.name}
              <div className="ml-auto px-2 flex gap-2">
                <PiPhoneCall className="w-6 h-6" />
                <BiVideoRecording className="w-6 h-6" />
                <IoSearchCircle className="w-6 h-6" />
              </div>
            </div>
          ) : (
            "Select a user to chat"
          )}
        </div>

        <div className="flex-1 p-4 overflow-y-auto bg-chat-pattern">
          {chatId ? (
            <div className="space-y-2">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.sender_id === user?.id ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`px-4 py-2 max-w-[65%] rounded-xl text-sm ${
                      msg.sender_id === user?.id
                        ? "bg-[#d9fdd3] text-black"
                        : "bg-white text-gray-800 border"
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
              className="flex-1 text-black border border-gray-300 px-3 py-2 rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
              placeholder="Type your message..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            />
            <button
              onClick={handleSendMessage}
              className="bg-green-500 px-4 py-2 rounded-full hover:bg-green-600"
            >
              Send
            </button>
          </div>
        )}

        {/* User Info and Logout Section */}
      </div>
    </div>
  );
}
