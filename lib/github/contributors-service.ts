export interface Contributor {
  id: number;
  login: string;
  avatarUrl: string;
  profileUrl: string;
  contributions: number;
}

const CONTRIBUTORS_URL =
  "https://api.github.com/repos/puri-adityakumar/astraa/contributors?per_page=20";
const EXCLUDED_USERS = new Set([
  "puri-adityakumar",
  "vercel[bot]",
  "dependabot[bot]",
  "github-actions[bot]",
]);
const CONTRIBUTORS_REVALIDATE_SECONDS = 60 * 60;
const CONTRIBUTORS_TIMEOUT_MS = 5_000;
const FALLBACK_CONTRIBUTORS: Contributor[] = [];

export function parseContributors(value: unknown): Contributor[] | null {
  if (!Array.isArray(value)) return null;

  return value
    .map(parseContributor)
    .filter((contributor): contributor is Contributor => contributor !== null)
    .filter((contributor) => !isExcludedContributor(contributor.login))
    .slice(0, 20);
}

export async function requestContributors(
  fetchImplementation: typeof fetch = fetch,
): Promise<Contributor[]> {
  try {
    const response = await fetchImplementation(CONTRIBUTORS_URL, {
      headers: {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      next: { revalidate: CONTRIBUTORS_REVALIDATE_SECONDS },
      signal: AbortSignal.timeout(CONTRIBUTORS_TIMEOUT_MS),
    });
    if (!response.ok) return [...FALLBACK_CONTRIBUTORS];

    const contributors = parseContributors(await response.json());
    return contributors ?? [...FALLBACK_CONTRIBUTORS];
  } catch {
    return [...FALLBACK_CONTRIBUTORS];
  }
}

function parseContributor(value: unknown): Contributor | null {
  if (typeof value !== "object" || value === null) return null;
  const candidate = value as Record<string, unknown>;

  if (
    typeof candidate.id !== "number" ||
    !Number.isInteger(candidate.id) ||
    candidate.id <= 0 ||
    typeof candidate.login !== "string" ||
    candidate.login.length === 0 ||
    typeof candidate.avatar_url !== "string" ||
    !isAllowedAvatarUrl(candidate.avatar_url) ||
    typeof candidate.html_url !== "string" ||
    !isAllowedProfileUrl(candidate.html_url) ||
    typeof candidate.contributions !== "number" ||
    !Number.isInteger(candidate.contributions) ||
    candidate.contributions < 0
  ) {
    return null;
  }

  return {
    id: candidate.id,
    login: candidate.login,
    avatarUrl: candidate.avatar_url,
    profileUrl: candidate.html_url,
    contributions: candidate.contributions,
  };
}

function isExcludedContributor(login: string): boolean {
  return EXCLUDED_USERS.has(login.toLowerCase()) || login.toLowerCase().endsWith("[bot]");
}

function isAllowedAvatarUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      (url.hostname === "avatars.githubusercontent.com" || url.hostname === "github.com")
    );
  } catch {
    return false;
  }
}

function isAllowedProfileUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === "github.com";
  } catch {
    return false;
  }
}
