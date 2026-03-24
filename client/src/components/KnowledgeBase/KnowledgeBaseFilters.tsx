import {
  Card,
  Chip,
  Group,
  ScrollArea,
  SegmentedControl,
  Select,
  Stack,
  TextInput,
  useMatches,
} from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import {
  ArticleTag,
  getArticleTagLabel,
  type ArticleTagType,
} from "@/types/Article/article";
import type {
  KnowledgeBaseArticleFilter,
  KnowledgeBaseSortOption,
} from "@/types/Article/knowledgeBase";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

interface KnowledgeBaseFiltersProps {
  articleFilter: KnowledgeBaseArticleFilter;
  onArticleFilterChange: (value: KnowledgeBaseArticleFilter) => void;
  selectedTags: string[];
  onSelectedTagsChange: (value: string[]) => void;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  sortBy: KnowledgeBaseSortOption;
  onSortByChange: (value: KnowledgeBaseSortOption) => void;
}

const KnowledgeBaseFilters = ({
  articleFilter,
  onArticleFilterChange,
  selectedTags,
  onSelectedTagsChange,
  searchQuery,
  onSearchQueryChange,
  sortBy,
  onSortByChange,
}: KnowledgeBaseFiltersProps) => {
  const { t } = useTranslation();
  const isMobile = useMatches({ base: true, sm: false });

  const sortOptions = useMemo(
    () => [
      { value: "newest", label: t("knowledgeBase.sort.newest") },
      { value: "oldest", label: t("knowledgeBase.sort.oldest") },
      { value: "alphabetical", label: t("knowledgeBase.sort.alphabetical") },
    ],
    [t],
  );

  const searchInput = (
    <TextInput
      label={t("knowledgeBase.search.label")}
      placeholder={t("knowledgeBase.search.placeholder")}
      leftSection={<IconSearch size={16} />}
      value={searchQuery}
      onChange={(e) => onSearchQueryChange(e.currentTarget.value)}
      style={isMobile ? undefined : { flex: 1 }}
    />
  );

  const sortSelect = (
    <Select
      label={t("knowledgeBase.sort.label")}
      data={sortOptions}
      value={sortBy}
      onChange={(value) =>
        onSortByChange((value ?? "newest") as KnowledgeBaseSortOption)
      }
      allowDeselect={false}
      w={isMobile ? undefined : 160}
    />
  );

  const topRow = isMobile ? (
    <Stack gap="sm">
      {searchInput}
      {sortSelect}
    </Stack>
  ) : (
    <Group gap="sm" align="flex-end">
      {searchInput}
      {sortSelect}
    </Group>
  );

  return (
    <Card withBorder radius="md" shadow="sm" p="md">
      <Stack gap="sm">
        {topRow}
        <Group gap="sm" align="center" wrap="wrap">
          <SegmentedControl
            value={articleFilter}
            onChange={(value) =>
              onArticleFilterChange(value as KnowledgeBaseArticleFilter)
            }
            data={[
              { value: "all", label: t("knowledgeBase.filters.all") },
              { value: "saved", label: t("knowledgeBase.filters.saved") },
            ]}
          />
          <ScrollArea type="never" style={{ flex: 1 }}>
            <Chip.Group
              multiple
              value={selectedTags}
              onChange={onSelectedTagsChange}
            >
              <Group gap="xs" wrap="nowrap">
                {Object.values(ArticleTag).map((tag) => (
                  <Chip key={tag} value={tag} variant="outline" color="violet">
                    {getArticleTagLabel(tag as ArticleTagType)}
                  </Chip>
                ))}
              </Group>
            </Chip.Group>
          </ScrollArea>
        </Group>
      </Stack>
    </Card>
  );
};

export default KnowledgeBaseFilters;
