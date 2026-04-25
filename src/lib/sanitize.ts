import DOMPurify from "isomorphic-dompurify";

export function isomorphicDompurify(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [
      "p", "br", "b", "i", "em", "strong", "a", "ul", "ol", "li",
      "h1", "h2", "h3", "h4", "h5", "h6", "blockquote", "pre", "code",
      "img", "figure", "figcaption", "table", "thead", "tbody", "tr", "td", "th",
      "hr", "span", "div",
    ],
    ALLOWED_ATTR: ["href", "src", "alt", "title", "class", "target", "rel"],
    FORCE_BODY: true,
  });
}
