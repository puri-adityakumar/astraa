export type PathSegment = string | number;

const SAFE_KEY = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

export function joinPath(parent: string, segment: PathSegment): string {
  if (typeof segment === "number") {
    return `${parent}[${segment}]`;
  }
  if (!SAFE_KEY.test(segment)) {
    return `${parent}[${JSON.stringify(segment)}]`;
  }
  return parent === "" ? segment : `${parent}.${segment}`;
}

export function parsePath(path: string): PathSegment[] {
  const out: PathSegment[] = [];
  let i = 0;
  while (i < path.length) {
    if (path[i] === ".") {
      i++;
      continue;
    }
    if (path[i] === "[") {
      const end = path.indexOf("]", i);
      if (end === -1) break;
      const inner = path.slice(i + 1, end);
      if (/^\d+$/.test(inner)) {
        out.push(Number(inner));
      } else {
        out.push(JSON.parse(inner));
      }
      i = end + 1;
      continue;
    }
    let j = i;
    while (j < path.length && path[j] !== "." && path[j] !== "[") j++;
    out.push(path.slice(i, j));
    i = j;
  }
  return out;
}

export function formatPath(segments: PathSegment[]): string {
  let out = "";
  for (const seg of segments) {
    out = joinPath(out, seg);
  }
  return out;
}
