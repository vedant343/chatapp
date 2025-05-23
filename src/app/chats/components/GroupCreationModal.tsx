"use client";

interface GroupCreationModalProps {
  showGroupModal: boolean;
  setShowGroupModal: (show: boolean) => void;
  groupName: string;
  setGroupName: (name: string) => void;
  users: { id: string; name: string }[];
  selectedUsers: string[];
  setSelectedUsers: (users: string[]) => void;
  handleCreateGroup: () => void;
}

const GroupCreationModal: React.FC<GroupCreationModalProps> = ({
  showGroupModal,
  setShowGroupModal,
  groupName,
  setGroupName,
  users,
  selectedUsers,
  setSelectedUsers,
  handleCreateGroup,
}) => {
  return (
    showGroupModal && (
      <div className="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50">
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
    )
  );
};

export default GroupCreationModal;
