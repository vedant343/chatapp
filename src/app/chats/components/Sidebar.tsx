"use client";

import { BiUser, BiSearch } from "react-icons/bi";
import { FaUsers, FaComments, FaClock, FaFilter } from "react-icons/fa";
import { useState } from "react";

interface User {
  id: string;
  name: string;
  lastMessage?: { content: string };
}

interface Group {
  id: string;
  name: string;
  members: { id: string; name: string }[];
}

interface SidebarProps {
  users: User[];
  groups: Group[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  openChatWithUser: (userId: string) => void;
  openGroupChat: (groupId: string) => void;
  setShowGroupModal: (show: boolean) => void;
  user: User | null;
}

const Sidebar: React.FC<SidebarProps> = ({
  users,
  groups,
  searchQuery,
  setSearchQuery,
  openChatWithUser,
  openGroupChat,
  setShowGroupModal,
  user,
}) => {
  const [activeTab, setActiveTab] = useState("chats");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mini Sidebar */}
      <div className="w-12 bg-[#f1f3f4] border-r border-gray-400 flex flex-col items-center py-4 space-y-6">
        <FaComments className="w-5 h-5 cursor-pointer text-gray-800" />
        <BiUser className="w-5 h-5 cursor-pointer text-gray-800" />
        <FaUsers className="w-5 h-5 cursor-pointer text-gray-800" />
        <FaClock className="w-5 h-5 cursor-pointer text-gray-800" />
        <FaFilter className="w-5 h-5 cursor-pointer text-gray-800" />
      </div>

      {/* Main Sidebar */}
      <div className="flex-1 bg-white border-r border-gray-400 flex flex-col">
        <div className="p-4 border-b border-gray-400 bg-gray-100">
          <h2 className="text-2xl font-semibold text-[#075e54] mb-4">Chats</h2>
          <div className="flex items-center bg-gray-200 rounded-full px-3 py-2">
            <BiSearch className="w-6 h-6 text-gray-500" />
            <input
              type="text"
              placeholder="Search users or groups..."
              className="flex-1 ml-2 p-1 bg-transparent text-sm text-gray-800 outline-none"
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-1 space-y-1">
          <ul className="pt-2">
            {users
              .filter(
                (u) =>
                  u.id !== user?.id &&
                  u.name.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((u) => (
                <li
                  key={u.id}
                  onClick={() => openChatWithUser(u.id)}
                  className={`flex items-center justify-between gap-3 p-3 border-b border-gray-200 cursor-pointer hover:bg-gray-100 transition ${
                    selectedUser?.id === u.id ? "bg-gray-300" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <BiUser className="text-gray-600" />
                    </div>
                    <div>
                      <div className="text-gray-900 font-semibold">
                        {u.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {u.lastMessage
                          ? u.lastMessage.content
                          : "No messages yet"}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
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
                  className={`flex items-center justify-between gap-3 p-3 border-b border-gray-200 cursor-pointer hover:bg-gray-100 transition ${
                    selectedUser?.id === g.id ? "bg-gray-300" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <FaUsers className="text-gray-600" />
                    </div>
                    <div>
                      <div className="text-gray-900 font-semibold">
                        {g.name}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {g.members.map((m) => m.name).join(", ")}
                      </div>
                    </div>
                  </div>
                  {/* {g.unreadCount > 0 && (
                    <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                      {g.unreadCount}
                    </span>
                  )} */}
                </li>
              ))}
          </ul>
        </div>

        <div className="p-4 border-t bg-gray-100 border-gray-400">
          <div className="flex items-center justify-between">
            <span className="text-gray-900 font-medium">{user?.name}</span>
            <a href="/login">
              <button className="text-red-500 hover:text-red-700">
                Logout
              </button>
            </a>
          </div>
        </div>
        <div className="relative">
          <span className="absolute bottom-14 left-[-2rem] bg-gray-700 text-white text-xs rounded py-1 px-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            Create Group
          </span>
          <button
            onClick={() => setShowGroupModal(true)}
            className="absolute bottom-20 left-[13rem] w-12 h-12 bg-[#25d366] text-white rounded-full shadow-lg flex items-center justify-center hover:bg-[#1ebe5d] z-50 group"
            title="Create Group"
          >
            <FaUsers className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
