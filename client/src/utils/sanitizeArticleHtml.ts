import xss from "xss";

const articleHtmlWhitelist = {
  p: [],
  br: [],
  strong: [],
  b: [],
  em: [],
  i: [],
  u: [],
  s: [],
  ul: [],
  ol: [],
  li: [],
  h1: [],
  h2: [],
  h3: [],
  h4: [],
  h5: [],
  h6: [],
  blockquote: [],
  pre: [],
  code: [],
  a: ["href", "title", "target", "rel"],
};

export const sanitizeArticleHtml = (html: string): string =>
  xss(html ?? "", {
    whiteList: articleHtmlWhitelist,
    stripIgnoreTag: true,
    stripIgnoreTagBody: ["script"],
  });
