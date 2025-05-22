"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "@/lib/supabase";
import {
  BiLogOut,
  BiMessageRoundedDots,
  BiSearchAlt2,
  BiVideoRecording,
} from "react-icons/bi";
import { FaUserCircle, FaUsers } from "react-icons/fa";
import { IoSearchCircle, IoSettingsSharp } from "react-icons/io5";
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

  // NEW: States for Group Creation
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [groups, setGroups] = useState<
    { id: string; name: string; members: { id: string; name: string }[] }[]
  >([]);

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

    await supabase.from("messages").insert({
      chat_id: chatId,
      sender_id: user?.id,
      content: messageText.trim(),
    });

    setMessageText("");
  };

  // NEW: Handle group creation
  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedUsers.length === 0) return;

    // Create group
    const { data: group, error: groupError } = await supabase
      .from("groups")
      .insert({ name: groupName, admin_id: user?.id })
      .select()
      .single();

    if (groupError) {
      console.error("Error creating group:", groupError);
      return;
    }

    // Create chat for this group
    const { data: chat, error: chatError } = await supabase
      .from("chats")
      .insert({
        name: group.name,
        is_group: true,
        group_id: group.id,
        is_group_chat: true,
      })
      .select()
      .single();

    if (chatError) {
      console.error("Error creating chat:", chatError);
      return;
    }

    // Add all users to group_members and chat_participants
    const groupMemberRows = selectedUsers.map((user_id) => ({
      group_id: group.id,
      user_id,
    }));
    await supabase.from("group_members").insert(groupMemberRows);

    const chatParticipantRows = selectedUsers.map((user_id) => ({
      chat_id: chat.id,
      user_id,
    }));
    await supabase.from("chat_participants").insert(chatParticipantRows);

    console.log("✅ Group created successfully");
    setShowGroupModal(false);
    setGroupName("");
    setSelectedUsers([]);
  };

  const sendGroupMessage = async (chatId: string, content: string) => {
    const { error } = await supabase.from("messages").insert({
      chat_id: chatId,
      sender_id: user?.id,
      content: content,
    });

    if (error) {
      console.error("Error sending message:", error);
    }
  };

  const fetchGroupMessages = async (chatId: string) => {
    const { data, error } = await supabase
      .from("messages")
      .select("*, sender:sender_id(name)")
      .eq("chat_id", chatId)
      .order("created_at");

    if (error) {
      console.error("Error fetching messages:", error);
      return [];
    }

    return data;
  };

  const fetchUserGroups = async () => {
    const { data, error } = await supabase
      .from("group_members")
      .select("group_id, group:group_id(name, id), group:group_id(chats(id))")
      .eq("user_id", user?.id);

    if (error) {
      console.error("Error fetching groups:", error);
      return [];
    }

    return data;
  };

  // Fetch groups with members
  const fetchGroupsWithMembers = async () => {
    const { data: groupsWithMembers, error } = await supabase.from("groups")
      .select(`
        id,
        name,
        group_members (
          user_id,
          users (id, name)
        )
      `);

    if (error) {
      console.error("Error fetching groups:", error);
      return;
    }

    const formattedGroups = groupsWithMembers.map((g) => ({
      id: g.id,
      name: g.name,
      members: g.group_members.map((m) => m.users),
    }));

    setGroups(formattedGroups);
  };

  useEffect(() => {
    fetchGroupsWithMembers();
  }, []);

  const openGroupChat = async (groupId) => {
    const { data: chat, error: chatError } = await supabase
      .from("chats")
      .select("id, name, is_group_chat, group_id")
      .eq("group_id", groupId)
      .single();

    if (chatError) {
      console.error("Error fetching chat:", chatError);
      return;
    }

    const { data: members } = await supabase
      .from("chat_participants")
      .select("user_id, users (id, name)")
      .eq("chat_id", chat.id);

    if (chat) {
      setChatId(chat.id);
      setSelectedUser({ name: chat.name, members });
      setMessages([]);
    } else {
      console.error("Group chat not found");
    }
  };

  if (!hasMounted) return null;

  return (
    <div className="flex h-screen font-sans bg-[#f0f2f5]">
      {/* Mini Sidebar (Logo Column) */}
      <div className="w-14 bg-[#075e54] flex flex-col items-center py-4 space-y-4 text-white">
        <img src="/logo.svg" alt="Logo" className="w-8 h-8" />{" "}
        {/* Replace with your logo path */}
        <BiMessageRoundedDots className="w-6 h-6 hover:text-[#25d366]" />
        <FaUsers className="w-6 h-6 hover:text-[#25d366]" />
        <IoSettingsSharp className="w-6 h-6 hover:text-[#25d366]" />
      </div>

      {/* Main Sidebar */}
      <div className="w-1/4 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-2xl font-semibold text-[#075e54] mb-4">Chats</h2>
          <div className="flex items-center bg-gray-100 rounded-full px-3 py-2">
            <IoSearchCircle className="w-6 h-6 text-gray-500" />
            <input
              type="text"
              placeholder="Search users or groups..."
              className="flex-1 ml-2 p-1 bg-transparent text-sm text-gray-800 outline-none"
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            className="mt-4 w-full bg-[#25d366] text-white py-2 rounded-full hover:bg-[#1ebe5d]"
            onClick={() => setShowGroupModal(true)}
          >
            + Create Group
          </button>
        </div>

        {/* Scrollable User/Group List */}
        <div className="flex-1 overflow-y-auto px-2 space-y-1">
          <ul className="pt-2 space-y-1">
            {/* USERS */}
            {users
              .filter((u) =>
                u.name.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((u) => (
                <li
                  key={u.id}
                  onClick={() => openChatWithUser(u.id)}
                  className="flex items-center justify-between gap-3 p-3 rounded-lg cursor-pointer hover:bg-gray-100 transition"
                >
                  <div className="flex items-center gap-3">
                    <FaUserCircle className="w-8 h-8 text-gray-600" />
                    <div className="text-gray-900 font-medium">{u.name}</div>
                  </div>
                  {u.unreadCount > 0 && (
                    <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                      {u.unreadCount}
                    </span>
                  )}
                </li>
              ))}

            {/* GROUPS */}
            {groups
              .filter(
                (g) =>
                  g.members.some((member) => member.id === user?.id) &&
                  g.name.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((g) => (
                <li
                  key={g.id}
                  onClick={() => openGroupChat(g.id)}
                  className="flex items-center justify-between gap-3 p-3 rounded-lg cursor-pointer hover:bg-gray-100 transition"
                >
                  <div className="flex items-center gap-3">
                    <FaUsers className="w-6 h-6 text-[#075e54]" />
                    <div>
                      <div className="text-gray-900 font-medium">{g.name}</div>
                      <div className="text-xs text-gray-500 truncate">
                        {g.members.map((m) => m.name).join(", ")}
                      </div>
                    </div>
                  </div>
                  {g.unreadCount > 0 && (
                    <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                      {g.unreadCount}
                    </span>
                  )}
                </li>
              ))}
          </ul>
        </div>

        {/* Footer Info */}
        <div className="p-4 bg-gray-100 border-t border-gray-300 flex items-center justify-between">
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
      <div className="flex-1 flex flex-col bg-[#f0f2f5] overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-[#075e54] text-white flex items-center justify-between shadow-md">
          {selectedUser ? (
            <>
              <div className="flex flex-col gap-2">
                <div className="text-lg font-medium">{selectedUser.name}</div>
                {selectedUser?.members && (
                  <div className="text-sm text-gray-100">
                    Members:{" "}
                    {selectedUser.members
                      .map((member) => member.users.name)
                      .join(", ")}
                  </div>
                )}
              </div>
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

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2">
          {chatId ? (
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

        {/* Message Input */}
        {chatId && (
          <div className="p-4 bg-white border-t border-gray-200 flex items-center gap-1">
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

      {/* NEW: Group Creation Modal */}
      {showGroupModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-[#ffffff] p-6 rounded-xl w-96 shadow-lg">
            <h2 className="text-lg font-semibold mb-4 text-[#075e54]">
              Create Group
            </h2>
            <input
              type="text"
              placeholder="Group Name"
              className="w-full text-black mb-3 px-4 py-2 border border-gray-300 rounded-md text-sm"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
            <div className="h-40 overflow-y-auto mb-3">
              {users.map((u) => (
                <label key={u.id} className="flex items-center mb-1 space-x-2">
                  <input
                    type="checkbox"
                    value={u.id}
                    checked={selectedUsers.includes(u.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedUsers([...selectedUsers, u.id]);
                      } else {
                        setSelectedUsers(
                          selectedUsers.filter((id) => id !== u.id)
                        );
                      }
                    }}
                    className="form-checkbox h-4 w-4 text-[#25d366] border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-800">{u.name}</span>
                </label>
              ))}
            </div>
            <div className="flex justify-end space-x-2">
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setShowGroupModal(false)}
              >
                Cancel
              </button>
              <button
                className="bg-[#25d366] text-white px-4 py-1 rounded-full hover:bg-[#1ebe5d]"
                onClick={handleCreateGroup}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
