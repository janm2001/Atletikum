import { Chip, Group, ScrollArea, SegmentedControl } from "@mantine/core";
import {
  ArticleTag,
  ARTICLE_TAG_LABELS,
  type ArticleTagType,
} from "@/types/Article/article";

export type KnowledgeBaseArticleFilter = "all" | "saved";

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
  return (
    <>
      <SegmentedControl
        value={articleFilter}
        onChange={(value) =>
          onArticleFilterChange(value as KnowledgeBaseArticleFilter)
        }
        data={[
          { value: "all", label: "Svi članci" },
          { value: "saved", label: "Spremljeno" },
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
                {ARTICLE_TAG_LABELS[tag as ArticleTagType]}
              </Chip>
            ))}
          </Group>
        </Chip.Group>
      </ScrollArea>
    </>
  );
};

export default KnowledgeBaseFilters;
