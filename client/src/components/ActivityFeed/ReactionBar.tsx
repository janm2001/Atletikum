import { ActionIcon, Badge, Group } from "@mantine/core";
import { ALLOWED_EMOJIS } from "@/types/Activity/activity";
import type { ActivityReaction, AllowedEmoji } from "@/types/Activity/activity";
import { useAddReaction, useRemoveReaction } from "@/hooks/useActivity";

interface ReactionBarProps {
  reactions: ActivityReaction[];
  eventId: string;
  currentUserId: string;
}

const ReactionBar = ({ reactions, eventId, currentUserId }: ReactionBarProps) => {
  const addReaction = useAddReaction();
  const removeReaction = useRemoveReaction();

  const userReaction = reactions.find((r) => r.userId === currentUserId);

  const getCount = (emoji: AllowedEmoji): number =>
    reactions.filter((r) => r.emoji === emoji).length;

  const handleToggle = (emoji: AllowedEmoji) => {
    if (userReaction?.emoji === emoji) {
      removeReaction.mutate(eventId);
    } else {
      addReaction.mutate({ eventId, emoji });
    }
  };

  const isLoading = addReaction.isPending || removeReaction.isPending;

  return (
    <Group gap={4} wrap="wrap">
      {ALLOWED_EMOJIS.map((emoji) => {
        const count = getCount(emoji);
        const isActive = userReaction?.emoji === emoji;

        return (
          <ActionIcon
            key={emoji}
            size="sm"
            variant={isActive ? "filled" : "subtle"}
            color={isActive ? "violet" : "gray"}
            radius="xl"
            onClick={() => handleToggle(emoji)}
            disabled={isLoading}
            style={{ width: "auto", padding: "0 8px", minWidth: 32 }}
          >
            <Group gap={4} wrap="nowrap" align="center">
              <span style={{ fontSize: 14, lineHeight: 1 }}>{emoji}</span>
              {count > 0 && (
                <Badge
                  size="xs"
                  variant="transparent"
                  color={isActive ? "white" : "gray"}
                  style={{ padding: 0, minWidth: "auto" }}
                >
                  {count}
                </Badge>
              )}
            </Group>
          </ActionIcon>
        );
      })}
    </Group>
  );
};

export default ReactionBar;
