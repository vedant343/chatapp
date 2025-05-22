"use client";

import { BiVideoRecording, BiSearchAlt2, BiGroup } from "react-icons/bi";
import { GrDocument } from "react-icons/gr";

const ChatHeader = ({ selectedUser }) => {
  return (
    <div className="px-3 py-2 bg-[#075e54] text-white flex items-center justify-between shadow-md">
      {selectedUser ? (
        <>
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center mr-2">
              <BiGroup className="w-5 h-5 text-[#075e54]" />
            </div>
            <div className="flex flex-col">
              <div className="text-lg text-white font-medium">
                {selectedUser.name}
              </div>
              {selectedUser.email && !selectedUser.is_group && (
                <div className="text-sm text-gray-400">
                  {selectedUser.email}
                </div>
              )}
              {selectedUser?.members && (
                <div className="text-sm text-gray-400">
                  {selectedUser.members
                    .map((member) => member.users.name)
                    .join(", ")}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <GrDocument className="w-6 h-6" />
            <BiVideoRecording className="w-6 h-6" />
            <BiSearchAlt2 className="w-6 h-6" />
          </div>
        </>
      ) : (
        <div className="text-sm text-gray-100">
          Select a user to start chatting
        </div>
      )}
    </div>
  );
};

export default ChatHeader;
