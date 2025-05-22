"use client";

import { BiUser } from "react-icons/bi";
import { FaUsers } from "react-icons/fa";
import { IoSearchCircle } from "react-icons/io5";

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
  return (
    <div className="w-1/4 bg-white border-r border-gray-200 flex flex-col">
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
      <div className="flex-1 overflow-y-auto px-2 space-y-1">
        <ul className="pt-2">
          {users
            .filter((u) =>
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
                  <div className="text-gray-900 font-medium">{u.name}</div>
                </div>
                {u.unreadCount > 0 && (
                  <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                    {u.unreadCount}
                  </span>
                )}
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
    </div>
  );
};

export default Sidebar;
