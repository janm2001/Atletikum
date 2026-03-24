import { ActionIcon, Badge, Group, Table, Text } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import {
  getArticleTagLabel,
  type ArticleSummary,
} from "../../types/Article/article";

interface ArticlesTableProps {
  articles: ArticleSummary[];
  onEdit: (article: ArticleSummary) => void;
  onDelete: (id: string) => void;
}

const tagColors: Record<string, string> = {
  TRAINING: "blue",
  NUTRITION: "green",
  RECOVERY: "teal",
  PHYSIOLOGY: "red",
  PSYCHOLOGY: "violet",
  BIOMECHANICS: "orange",
  PERIODIZATION: "grape",
};

const ArticlesTable = ({ articles, onEdit, onDelete }: ArticlesTableProps) => {
  const { t } = useTranslation();

  if (!articles || articles.length === 0) {
    return (
      <Text c="dimmed" ta="center" py="xl">
        {t("admin.articlesTable.empty")}
      </Text>
    );
  }

  const tableData = {
    head: [
      t("admin.articlesTable.title"),
      t("admin.articlesTable.tag"),
      t("admin.articlesTable.summary"),
      t("admin.articlesTable.created"),
      t("common.actions"),
    ],
    body: articles.map((article) => [
      <Text size="sm" fw={500} key="title">
        {article.title}
      </Text>,
      <Badge key="tag" color={tagColors[article.tag] || "blue"} variant="light">
        {getArticleTagLabel(article.tag)}
      </Badge>,
      <Text size="sm" c="dimmed" lineClamp={1} key="summary">
        {article.summary}
      </Text>,
      new Date(article.createdAt).toLocaleDateString("hr-HR"),
      <Group gap="xs" justify="flex-end" wrap="nowrap" key="actions">
        <ActionIcon
          variant="light"
          color="blue"
          onClick={() => onEdit(article)}
          title={t("common.edit")}
        >
          <IconEdit size={16} />
        </ActionIcon>
        <ActionIcon
          variant="light"
          color="red"
          onClick={() => onDelete(article._id)}
          title={t("common.delete")}
        >
          <IconTrash size={16} />
        </ActionIcon>
      </Group>,
    ]),
  };

  return (
    <Table.ScrollContainer minWidth={600}>
      <Table striped highlightOnHover data={tableData} />
    </Table.ScrollContainer>
  );
};

export default ArticlesTable;
