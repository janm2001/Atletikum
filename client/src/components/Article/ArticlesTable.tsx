import { Table, ActionIcon, Group, Badge, Text } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import type { ArticleSummary } from "../../types/Article/article";

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
        {t('admin.articlesTable.empty')}
      </Text>
    );
  }

  const rows = articles.map((article) => (
    <Table.Tr key={article._id}>
      <Table.Td>
        <Text size="sm" fw={500}>
          {article.title}
        </Text>
      </Table.Td>
      <Table.Td>
        <Badge color={tagColors[article.tag] || "blue"} variant="light">
          {article.tag}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Text size="sm" c="dimmed" lineClamp={1}>
          {article.summary}
        </Text>
      </Table.Td>
      <Table.Td>
        {new Date(article.createdAt).toLocaleDateString("hr-HR")}
      </Table.Td>
      <Table.Td>
        <Group gap="xs" justify="flex-end" wrap="nowrap">
          <ActionIcon
            variant="light"
            color="blue"
            onClick={() => onEdit(article)}
            title={t('common.edit')}
          >
            <IconEdit size={16} />
          </ActionIcon>
          <ActionIcon
            variant="light"
            color="red"
            onClick={() => onDelete(article._id)}
            title={t('common.delete')}
          >
            <IconTrash size={16} />
          </ActionIcon>
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Table.ScrollContainer minWidth={600}>
      <Table striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>{t('admin.articlesTable.title')}</Table.Th>
            <Table.Th>{t('admin.articlesTable.tag')}</Table.Th>
            <Table.Th>{t('admin.articlesTable.summary')}</Table.Th>
            <Table.Th>{t('admin.articlesTable.created')}</Table.Th>
            <Table.Th style={{ textAlign: "right" }}>{t('common.actions')}</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
};

export default ArticlesTable;
