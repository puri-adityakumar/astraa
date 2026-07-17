"use client";

import { useEffect, useState } from "react";

export interface Contributor {
  id: number;
  login: string;
  avatar_url: string;
  html_url: string;
  contributions: number;
}

const EXCLUDED_USERS = ["puri-adityakumar", "vercel[bot]", "dependabot[bot]", "github-actions[bot]"];

const CONTRIBUTORS_URL = "https://api.github.com/repos/puri-adityakumar/astraa/contributors";

/**
 * Fetches the GitHub contributors for the astraa repo, filtering out the
 * founder and known bots. Returns an empty list on failure (the UI degrades
 * gracefully to "Be the first to contribute").
 */
export function useContributors(): Contributor[] {
  const [contributors, setContributors] = useState<Contributor[]>([]);

  useEffect(() => {
    fetch(CONTRIBUTORS_URL)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const filtered = data.filter(
            (contributor: Contributor) => !EXCLUDED_USERS.includes(contributor.login),
          );
          setContributors(filtered);
        }
      })
      .catch((err) => console.error("Failed to fetch contributors:", err));
  }, []);

  return contributors;
}
