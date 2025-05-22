"use client";

import { BiUser } from "react-icons/bi";
import {
  FaUsers,
  FaComments,
  FaClock,
  FaFilter,
  FaSearch,
} from "react-icons/fa";
import { IoSearchCircle } from "react-icons/io5";
import { useState } from "react";

const Sidebar = ({
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

  return (
    <div className="flex h-screen">
      {/* Mini Sidebar */}
      <div className="w-14 bg-[#f1f3f4] border-r border-gray-300 flex flex-col items-center py-4 space-y-6">
        <FaComments
          className={`w-5 h-5 cursor-pointer ${
            activeTab === "chats" ? "text-[#25d366]" : "text-gray-500"
          }`}
          onClick={() => setActiveTab("chats")}
        />
        <BiUser
          className={`w-5 h-5 cursor-pointer ${
            activeTab === "users" ? "text-[#25d366]" : "text-gray-500"
          }`}
          onClick={() => setActiveTab("users")}
        />
        <FaUsers
          className={`w-5 h-5 cursor-pointer ${
            activeTab === "groups" ? "text-[#25d366]" : "text-gray-500"
          }`}
          onClick={() => setActiveTab("groups")}
        />
        <FaClock className="w-5 h-5 text-gray-500 cursor-pointer" />
        <FaFilter className="w-5 h-5 text-gray-500 cursor-pointer" />
      </div>

      {/* Main Sidebar */}
      <div className="w-72 bg-white border-r border-gray-200 flex flex-col relative">
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
        </div>

        <div className="flex-1 overflow-y-auto px-2 space-y-1">
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
                  className="flex items-center justify-between gap-3 p-3 border-b border-gray-200 cursor-pointer hover:bg-gray-100 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <BiUser className="text-gray-600" />
                    </div>
                    <div>
                      <div className="text-gray-900 font-semibold">{u.name}</div>
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
                  className="flex items-center justify-between gap-3 p-3 border-b border-gray-200 cursor-pointer hover:bg-gray-100 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <FaUsers className="text-gray-600" />
                    </div>
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

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-gray-900 font-medium">{user?.name}</span>
            <a href="/login">
              <button className="text-red-500 hover:text-red-700">
                Logout
              </button>
            </a>
          </div>
        </div>
        <button
          onClick={() => setShowGroupModal(true)}
          className="absolute bottom-20 left-[13rem] w-12 h-12 bg-[#25d366] text-white rounded-full shadow-lg flex items-center justify-center hover:bg-[#1ebe5d] z-50"
          title="Create Group"
        >
          <FaUsers className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
