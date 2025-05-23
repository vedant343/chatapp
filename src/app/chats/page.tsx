"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "@/lib/supabase";
import Sidebar from "./components/Sidebar";
import MessageList from "./components/MessageList";
import MessageInput from "./components/MessageInput";
import GroupCreationModal from "./components/GroupCreationModal";
import ChatHeader from "./components/ChatHeader";
import { FaComments, FaUsers, FaClock, FaFilter } from "react-icons/fa";
import { BiUser } from "react-icons/bi";

interface User {
  id: string;
  name: string;
  lastMessage?: { content: string };
}

interface Chat {
  id: string;
  name: string;
  members: User[];
}

interface Message {
  id: string;
  created_at: string;
  sender_id: string;
  content: string;
}

export default function ChatsPage() {
  const router = useRouter();
  const [hasMounted, setHasMounted] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [chatId, setChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // NEW: States for Group Creation
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [groups, setGroups] = useState<Chat[]>([]);

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
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [hasMounted, chatId]);

  const fetchUsers = async (userId: string) => {
    const { data: usersData, error } = await supabase.from("users").select("*");

    if (error) {
      console.error("Error fetching users:", error);
      return [];
    }

    // Initialize lastMessage for each user
    const usersWithMessages = usersData.map((user) => ({
      ...user,
      lastMessage: null, // Initialize lastMessage
    }));

    setUsers(usersWithMessages);
  };

  const fetchMessages = async (chatId: string) => {
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("chat_id", chatId)
      .order("created_at", { ascending: true });

    if (data) setMessages(data);
  };

  const openChatWithUser = async (otherUserId: string) => {
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
      setSelectedUser(users.find((u) => u.id === otherUserId) || null);
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
    setSelectedUser(users.find((u) => u.id === otherUserId) || null);
    setMessages([]);
  };

  const handleSendMessage = async () => {
    if (!messageText.trim()) return;

    // Send the message to the database
    await supabase.from("messages").insert({
      chat_id: chatId,
      sender_id: user?.id,
      content: messageText.trim(),
    });

    // Update the last message in the users state
    if (selectedUser) {
      setUsers((prevUsers) =>
        prevUsers.map((u) =>
          u.id === selectedUser.id
            ? { ...u, lastMessage: { content: messageText.trim() } }
            : u
        )
      );
    }

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

    // NEW: Include the admin as a member of the group
    groupMemberRows.push({
      group_id: group.id,
      user_id: user?.id || "", // Provide a fallback value (e.g., an empty string)
    });

    await supabase.from("group_members").insert(groupMemberRows);

    const chatParticipantRows = selectedUsers.map((user_id) => ({
      chat_id: chat.id,
      user_id,
    }));
    // NEW: Include the admin as a participant in the chat
    chatParticipantRows.push({
      chat_id: chat.id,
      user_id: user?.id || "", // Provide a fallback value (e.g., an empty string)
    });

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
      members: g.group_members.map((m) => m.users).flat(),
    }));

    setGroups(formattedGroups);
  };

  useEffect(() => {
    fetchGroupsWithMembers();
  }, []);

  const openGroupChat = async (groupId: string) => {
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
      setSelectedUser({ id: chat.id, name: chat.name });
      setMessages([]);
    } else {
      console.error("Group chat not found");
    }
  };

  const isChatSelected = chatId !== null;

  if (!hasMounted) return null;

  return (
    <div className="flex h-screen font-sans bg-[#f0f2f5]">
      <Sidebar
        users={users}
        groups={groups}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        openChatWithUser={openChatWithUser}
        openGroupChat={openGroupChat}
        setShowGroupModal={setShowGroupModal}
        user={user}
      />
      <div className="flex-1 flex flex-col bg-[#f0f2f5] overflow-hidden">
        <ChatHeader selectedUser={selectedUser} />
        {isChatSelected ? (
          <>
            <MessageList messages={messages} user={user} users={users} />
            <MessageInput
              messageText={messageText}
              setMessageText={setMessageText}
              handleSendMessage={handleSendMessage}
              isChatSelected={isChatSelected}
            />
          </>
        ) : (
          <div className="flex items-center justify-center flex-1">
            <h1 className="text-5xl font-bold text-[#075E54]">
              Welcome to ChatAPP
            </h1>
          </div>
        )}
      </div>
      <div className="w-12 bg-[#f1f3f4] border-l border-gray-400 py-3 flex flex-col items-center space-y-5">
        <FaComments className="w-5 h-5 cursor-pointer text-gray-800" />
        <BiUser className="w-5 h-5 cursor-pointer text-gray-800" />
        <FaUsers className="w-5 h-5 cursor-pointer text-gray-800" />
        <FaClock className="w-5 h-5 text-gray-800 cursor-pointer" />
        <FaFilter className="w-5 h-5 text-gray-800 cursor-pointer" />
      </div>

      <GroupCreationModal
        showGroupModal={showGroupModal}
        setShowGroupModal={setShowGroupModal}
        groupName={groupName}
        setGroupName={setGroupName}
        users={users}
        selectedUsers={selectedUsers}
        setSelectedUsers={setSelectedUsers}
        handleCreateGroup={handleCreateGroup}
      />
    </div>
  );
}
