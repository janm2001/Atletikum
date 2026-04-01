import { Divider, Stack } from "@mantine/core";
import { useState } from "react";
import FriendsManagementSection from "./FriendsManagementSection";
import FriendLeaderboardTable from "./FriendLeaderboardTable";
import AddFriendModal from "@/pages/Friends/AddFriendModal";
import FriendRequestsPanel from "@/pages/Friends/FriendRequestsPanel";

const FriendsTabPanel = () => {
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [requestsPanelOpen, setRequestsPanelOpen] = useState(false);

  return (
    <Stack gap="md" mt="md">
      <FriendsManagementSection
        onOpenAddModal={() => setAddModalOpen(true)}
        onOpenRequestsPanel={() => setRequestsPanelOpen(true)}
      />

      <Divider label="Ljestvica prijatelja" labelPosition="center" />

      <FriendLeaderboardTable />

      <AddFriendModal
        opened={addModalOpen}
        onClose={() => setAddModalOpen(false)}
      />
      <FriendRequestsPanel
        opened={requestsPanelOpen}
        onClose={() => setRequestsPanelOpen(false)}
      />
    </Stack>
  );
};

export default FriendsTabPanel;
