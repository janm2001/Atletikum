import { Avatar, Card, Group, Stack, Text } from "@mantine/core";
import type { ActivityEvent, ActivityEventType } from "@/types/Activity/activity";
import ReactionBar from "./ReactionBar";

interface ActivityCardProps {
  event: ActivityEvent;
  currentUserId: string;
}

function getRelativeTime(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) return "upravo sada";
  if (diffMinutes < 60) return `prije ${diffMinutes} min`;
  if (diffHours < 24) return `prije ${diffHours} ${diffHours === 1 ? "sat" : diffHours < 5 ? "sata" : "sati"}`;
  return `prije ${diffDays} ${diffDays === 1 ? "dan" : "dana"}`;
}

function getEventContent(type: ActivityEventType, data: Record<string, unknown>): string {
  switch (type) {
    case "level_up":
      return `🎉 dostigao razinu ${data.level}!`;
    case "achievement_unlocked":
      return `🏆 otključao dostignuće: ${data.title}`;
    case "personal_best":
      return `💪 postavio novi osobni rekord u treningu: ${data.workoutTitle}`;
    case "workout_completed":
      return `🏋️ završio trening: ${data.workoutTitle} (+${data.xpGained} XP)`;
    case "streak_milestone":
      return `🔥 dostigao streak od ${data.streak} dana!`;
    case "quiz_aced":
      return `🧠 savršeno riješio kviz! (${data.score}/${data.totalQuestions})`;
    default:
      return "";
  }
}

const ActivityCard = ({ event, currentUserId }: ActivityCardProps) => {
  const { user, type, data, reactions, createdAt } = event;
  const content = getEventContent(type, data);

  return (
    <Card withBorder radius="md" shadow="sm" p="md">
      <Stack gap="sm">
        <Group gap="sm" align="flex-start" wrap="nowrap">
          <Avatar
            size={40}
            radius="xl"
            color="violet"
            name={user.username}
            style={{ flexShrink: 0 }}
          >
            {user.username.charAt(0).toUpperCase()}
          </Avatar>
          <Stack gap={2} style={{ minWidth: 0, flex: 1 }}>
            <Group gap={6} align="baseline" wrap="wrap">
              <Text fw={700} size="sm">
                {user.username}
              </Text>
              <Text size="xs" c="dimmed">
                {getRelativeTime(createdAt)}
              </Text>
            </Group>
            {content && (
              <Text size="sm" c="dimmed">
                {content}
              </Text>
            )}
          </Stack>
        </Group>

        <ReactionBar
          reactions={reactions}
          eventId={event._id}
          currentUserId={currentUserId}
        />
      </Stack>
    </Card>
  );
};

export default ActivityCard;
