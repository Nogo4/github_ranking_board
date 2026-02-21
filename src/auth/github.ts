import { GitHub } from "arctic";

export const github = new GitHub(
  process.env.GITHUB_CLIENT_ID!,
  process.env.GITHUB_CLIENT_SECRET!,
  process.env.GITHUB_REDIRECT_URI ?? null,
);

export interface GitHubUser {
  login: string;
  name: string | null;
}

export interface GitHubEmail {
  email: string;
  primary: boolean;
  verified: boolean;
}

export async function getGitHubUser(
  accessToken: string,
): Promise<{ pseudo: string; email: string }> {
  const [userRes, emailsRes] = await Promise.all([
    fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "User-Agent": "github-ranking-board",
      },
    }),
    fetch("https://api.github.com/user/emails", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "User-Agent": "github-ranking-board",
      },
    }),
  ]);

  if (!userRes.ok || !emailsRes.ok) {
    throw new Error("Failed to fetch GitHub user data");
  }

  const user = (await userRes.json()) as GitHubUser;
  const emails = (await emailsRes.json()) as GitHubEmail[];

  const primaryEmail = emails.find((e) => e.primary && e.verified);
  if (!primaryEmail) {
    throw new Error("No verified primary email found on GitHub account");
  }

  return {
    pseudo: user.login,
    email: primaryEmail.email,
  };
}
