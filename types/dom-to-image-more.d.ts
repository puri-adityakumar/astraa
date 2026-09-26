declare module "dom-to-image-more" {
  export interface DomToImageOptions {
    width?: number;
    height?: number;
    style?: Partial<CSSStyleDeclaration> | Record<string, string>;
    cacheBust?: boolean;
    quality?: number;
    filter?: (node: Node) => boolean;
    bgcolor?: string;
  }

  export function toBlob(node: HTMLElement, options?: DomToImageOptions): Promise<Blob | null>;
  export function toPng(node: HTMLElement, options?: DomToImageOptions): Promise<string>;
  export function toSvg(node: HTMLElement, options?: DomToImageOptions): Promise<string>;
  export function toJpeg(node: HTMLElement, options?: DomToImageOptions): Promise<string>;
  export function toPixelData(node: HTMLElement, options?: DomToImageOptions): Promise<Uint8ClampedArray>;

  const _default: {
    toBlob: typeof toBlob;
    toPng: typeof toPng;
    toSvg: typeof toSvg;
    toJpeg: typeof toJpeg;
    toPixelData: typeof toPixelData;
  };
  export default _default;
}
