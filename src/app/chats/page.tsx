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

  const [creatingGroup, setCreatingGroup] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupMembers, setGroupMembers] = useState<string[]>([]); // names

  useEffect(() => setHasMounted(true), []);
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
        (payload) => setMessages((prev) => [...prev, payload.new])
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [hasMounted, chatId]);

  const fetchUsers = async (userId) => {
    const { data } = await supabase
      .from("users")
      .select("id, name, email")
      .neq("id", userId);
    if (data) setUsers(data);
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

  // 🆕 Handle group creation
  const handleCreateGroup = async () => {
    if (!groupName.trim() || groupMembers.length === 0) return;

    const memberIds = users
      .filter((u) => groupMembers.includes(u.name))
      .map((u) => u.id);

    const { data: newChat } = await supabase
      .from("chats")
      .insert([{ is_group: true, name: groupName }])
      .select()
      .single();

    await supabase
      .from("chat_participants")
      .insert([
        { chat_id: newChat.id, user_id: user?.id },
        ...memberIds.map((id) => ({ chat_id: newChat.id, user_id: id })),
      ]);

    setChatId(newChat.id);
    setSelectedUser({ id: "group", name: groupName });
    setMessages([]);
    setCreatingGroup(false);
    setGroupName("");
    setGroupMembers([]);
  };

  if (!hasMounted) return null;

  return (
    <div className="flex h-screen font-sans bg-[#f0f2f5]">
      {/* Sidebar */}
      <div className="w-1/4 bg-white border-r border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-[#075e54]">Chats</h2>
            {/* 🆕 Group Creation Button */}
            <button
              onClick={() => setCreatingGroup(!creatingGroup)}
              className="text-xs text-[#075e54] font-semibold underline"
            >
              {creatingGroup ? "Cancel" : "Create Group"}
            </button>
          </div>

          {/* 🆕 Group Form */}
          {creatingGroup && (
            <div className="space-y-2 mb-3">
              <input
                className="w-full border rounded px-3 py-1 text-sm"
                placeholder="Group Name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
              />
              <div className="space-y-1">
                {users.map((u) => (
                  <label key={u.id} className="block text-sm">
                    <input
                      type="checkbox"
                      checked={groupMembers.includes(u.name)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setGroupMembers([...groupMembers, u.name]);
                        } else {
                          setGroupMembers(
                            groupMembers.filter((n) => n !== u.name)
                          );
                        }
                      }}
                      className="mr-2"
                    />
                    {u.name}
                  </label>
                ))}
              </div>
              <button
                onClick={handleCreateGroup}
                className="w-full bg-[#25d366] text-white py-1 rounded hover:bg-[#1ebe5d]"
              >
                Create
              </button>
            </div>
          )}

          {/* Search Input */}
          <div className="flex items-center bg-gray-100 rounded-full px-3 py-2">
            <IoSearchCircle className="w-6 h-6 text-gray-500" />
            <input
              type="text"
              placeholder="Search users..."
              className="flex-1 ml-2 p-1 bg-transparent text-sm text-gray-800 outline-none"
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <ul className="overflow-y-auto p-2 space-y-2">
          {users
            .filter((u) =>
              u.name.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map((u) => (
              <li
                key={u.id}
                onClick={() => openChatWithUser(u.id)}
                className="flex items-center gap-3 p-3 cursor-pointer rounded-lg hover:bg-[#e1f3f0] transition"
              >
                <FaUserCircle className="w-8 h-8 text-gray-600" />
                <div className="text-gray-900 font-medium">{u.name}</div>
              </li>
            ))}
        </ul>

        <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-gray-800">
              {user?.name}
            </div>
            <div className="text-xs text-gray-500">{user?.email}</div>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem("user");
              router.push("/login");
            }}
            className="text-white bg-red-500 p-2 rounded-full hover:bg-red-600"
          >
            <BiLogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Chat Section */}
      <div className="flex-1 flex flex-col bg-[#f0f2f5]">
        {/* Chat Header */}
        <div className="p-4 bg-[#075e54] text-white flex items-center justify-between shadow-md">
          {selectedUser ? (
            <>
              <div className="text-lg font-medium">{selectedUser.name}</div>
              <div className="flex items-center gap-4">
                <PiPhoneCall className="w-5 h-5" />
                <BiVideoRecording className="w-5 h-5" />
                <BiSearchAlt2 className="w-5 h-5" />
              </div>
            </>
          ) : (
            <div className="text-sm text-gray-100">
              Select a user to start chatting
            </div>
          )}
        </div>

        {/* Message Box */}
        <div className="flex-1 p-4 overflow-y-auto">
          {chatId ? (
            <div className="space-y-2">
              {messages.map((msg) => {
                const date = new Date(msg.created_at);
                const hours = date.getHours().toString().padStart(2, "0");
                const minutes = date.getMinutes().toString().padStart(2, "0");
                const timeString = `${hours}:${minutes}`;

                return (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.sender_id === user?.id
                        ? "justify-end"
                        : "justify-start"
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
              })}
            </div>
          ) : (
            <div className="text-center text-gray-500 mt-20 text-sm">
              No chat selected
            </div>
          )}
        </div>

        {/* Message Input */}
        {chatId && (
          <div className="p-4 bg-white border-t border-gray-200 flex items-center gap-2">
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
          </div>
        )}
      </div>
    </div>
  );
}
