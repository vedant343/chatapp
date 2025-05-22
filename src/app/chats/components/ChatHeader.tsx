"use client";

import { BiVideoRecording, BiSearchAlt2, BiGroup } from "react-icons/bi";
import { GrDocument } from "react-icons/gr";

const ChatHeader = ({ selectedUser }) => {
  return (
    <div className="px-4 py-3 bg-white text-black flex items-center justify-between shadow-sm border-b">
      {selectedUser ? (
        <>
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
              <BiGroup className="w-5 h-5 text-gray-600" />
            </div>
            <div className="flex flex-col">
              <div className="text-md font-semibold">
                {selectedUser.name}
              </div>
              {selectedUser.email && !selectedUser.is_group && (
                <div className="text-sm text-gray-500">
                  {selectedUser.email}
                </div>
              )}
              {selectedUser?.members && (
                <div className="text-sm text-gray-500 truncate max-w-[300px]">
                  {selectedUser.members
                    .map((member) => member.users.name)
                    .join(", ")}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <GrDocument className="w-5 h-5 text-gray-600 hover:text-black cursor-pointer" />
            <BiVideoRecording className="w-5 h-5 text-gray-600 hover:text-black cursor-pointer" />
            <BiSearchAlt2 className="w-5 h-5 text-gray-600 hover:text-black cursor-pointer" />
          </div>
        </>
      ) : (
        <div className="text-sm text-gray-600">
          Select a user to start chatting
        </div>
      )}
    </div>
  );
};

export default ChatHeader;
