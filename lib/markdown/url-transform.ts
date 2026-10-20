import { defaultUrlTransform, type UrlTransform } from "react-markdown";

export const markdownUrlTransform: UrlTransform = (url, key, node) => {
  if (
    key === "src" &&
    node.tagName === "img" &&
    /^data:image\/(?:png|jpeg|gif|webp);base64,/i.test(url)
  ) {
    return url;
  }
  return defaultUrlTransform(url);
};
