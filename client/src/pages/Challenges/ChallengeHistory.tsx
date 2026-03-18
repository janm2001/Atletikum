import { useState } from "react";
import { Button, Container, Group, Stack, Text, Title } from "@mantine/core";
import { IconChevronLeft } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useChallengeHistory } from "@/hooks/useChallenges";
import type { ChallengeHistoryWeek } from "@/types/Challenge/challenge";
import SpinnerComponent from "@/components/SpinnerComponent/SpinnerComponent";
import ChallengeHistoryWeekCard from "@/components/Challenges/ChallengeHistoryWeekCard";

const ChallengeHistory = () => {
  const { t } = useTranslation();
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [prevWeeks, setPrevWeeks] = useState<ChallengeHistoryWeek[]>([]);

  const { data, isLoading, isFetching } = useChallengeHistory({
    limit: 8,
    cursorWeekStart: cursor,
  });

  const displayedWeeks = [...prevWeeks, ...(data?.items ?? [])];
  const hasMore = data?.pageInfo.hasNextPage ?? false;

  const handleLoadMore = () => {
    if (!data?.pageInfo.nextCursorWeekStart) return;
    setPrevWeeks((prev) => [...prev, ...data.items]);
    setCursor(data.pageInfo.nextCursorWeekStart);
  };

  if (isLoading && prevWeeks.length === 0) return <SpinnerComponent />;

  return (
    <Container size="md" py="xl">
      <Group mb="lg">
        <Button
          component={Link}
          to="/pregled"
          variant="subtle"
          leftSection={<IconChevronLeft size={16} />}
          size="sm"
        >
          {t("common.back")}
        </Button>
      </Group>

      <Title order={2} mb="md">
        {t("challenges.history.title")}
      </Title>

      {displayedWeeks.length === 0 && !isLoading ? (
        <Text c="dimmed">{t("challenges.history.empty")}</Text>
      ) : (
        <Stack gap="md">
          {displayedWeeks.map((week) => (
            <ChallengeHistoryWeekCard key={week.weekStart} week={week} />
          ))}
          {hasMore && (
            <Button
              variant="subtle"
              onClick={handleLoadMore}
              loading={isFetching}
              fullWidth
            >
              {t("challenges.history.loadMore")}
            </Button>
          )}
        </Stack>
      )}
    </Container>
  );
};

export default ChallengeHistory;
