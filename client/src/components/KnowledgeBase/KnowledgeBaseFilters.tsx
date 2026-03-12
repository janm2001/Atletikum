import { Chip, Group, ScrollArea, SegmentedControl } from "@mantine/core";
import {
  ArticleTag,
  getArticleTagLabel,
  type ArticleTagType,
} from "@/types/Article/article";
import type { KnowledgeBaseArticleFilter } from "@/types/Article/knowledgeBase";
import { useTranslation } from "react-i18next";

interface KnowledgeBaseFiltersProps {
  articleFilter: KnowledgeBaseArticleFilter;
  onArticleFilterChange: (value: KnowledgeBaseArticleFilter) => void;
  selectedTags: string[];
  onSelectedTagsChange: (value: string[]) => void;
}

const KnowledgeBaseFilters = ({
  articleFilter,
  onArticleFilterChange,
  selectedTags,
  onSelectedTagsChange,
}: KnowledgeBaseFiltersProps) => {
  const { t } = useTranslation();

  return (
    <>
      <SegmentedControl
        value={articleFilter}
        onChange={(value) =>
          onArticleFilterChange(value as KnowledgeBaseArticleFilter)
        }
        data={[
          { value: "all", label: t('knowledgeBase.filters.all') },
          { value: "saved", label: t('knowledgeBase.filters.saved') },
        ]}
      />

      <ScrollArea type="never">
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
    </>
  );
};

export default KnowledgeBaseFilters;
