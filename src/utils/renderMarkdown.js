export default function renderMarkdown(text = "") {
  if (!text || typeof text !== "string") {
    return { __html: "" };
  }

  let html = text

    // Escape basic HTML to avoid injection
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")

    // **bold**
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")

    // markdown links [text](url)
    .replace(
      /\[(.*?)\]\((https?:\/\/[^\s)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
    )

    // plain links (http, https, www)
    .replace(
      /\b((https?:\/\/|www\.)[^\s<]+)\b/gi,
      (match) => {
        let url = match;
        if (url.startsWith("www.")) url = "https://" + url;
        return `<a href="${url}" target="_blank" rel="noopener noreferrer">${match}</a>`;
      }
    )

    // Preserve paragraphs
    .replace(/\n{2,}/g, "<br /><br />")

    // Single newline
    .replace(/\n/g, "<br />");

  return { __html: html };
}
