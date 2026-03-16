import { Image, Text, TypographyStylesProvider } from "@mantine/core";
import { resolveArticleCoverImageUrl } from "@/utils/articleCoverImage";
import { sanitizeArticleHtml } from "@/utils/sanitizeArticleHtml";

interface ArticleContentSectionProps {
  title: string;
  coverImage?: string;
  summary: string;
  renderedContent: string;
}

const ArticleContentSection = ({
  title,
  coverImage,
  summary,
  renderedContent,
}: ArticleContentSectionProps) => {
  const sanitizedContent = sanitizeArticleHtml(renderedContent);

  return (
    <>
      {coverImage && (
        <Image
          src={resolveArticleCoverImageUrl(coverImage)}
          height={400}
          radius="md"
          mb="xl"
          alt={title}
        />
      )}

      <Text
        size="xl"
        fw={500}
        mb="xl"
        style={{
          fontStyle: "italic",
          borderLeft: "4px solid var(--mantine-color-blue-6)",
          paddingLeft: "1rem",
        }}
      >
        {summary}
      </Text>

      <TypographyStylesProvider>
        <div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
      </TypographyStylesProvider>
    </>
  );
};

export default ArticleContentSection;
