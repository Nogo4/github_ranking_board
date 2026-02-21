export interface FlagConfig {
  id: string;
  name: string;
  description: string;
  points: number;
  repoUrl: string;
  answer: string;
}

export const FLAGS: FlagConfig[] = [
  {
    id: "flag-01",
    name: "Hello World",
    description: "Fork le repo et ouvre ta première Pull Request.",
    points: 10,
    repoUrl: "https://github.com/Nogo4/flag-hello-world",
    answer: "CTF{hello_world_flag}",
  },
  {
    id: "flag-02",
    name: "First Issue",
    description: "Ouvre une issue dans le repo dédié.",
    points: 20,
    repoUrl: "https://github.com/Nogo4/flag-first-issue",
    answer: "CTF{first_issue_flag}",
  },
  {
    id: "flag-03",
    name: "Merge Master",
    description: "Fais merger une PR dans la branche main.",
    points: 50,
    repoUrl: "https://github.com/Nogo4/flag-merge-master",
    answer: "CTF{merge_master_flag}",
  },
  {
    id: "flag-04",
    name: "Code Reviewer",
    description: "Laisse une review approuvée sur une PR.",
    points: 30,
    repoUrl: "https://github.com/Nogo4/flag-code-reviewer",
    answer: "CTF{code_reviewer_flag}",
  },
  {
    id: "flag-05",
    name: "CI Hero",
    description: "Fais passer un pipeline GitHub Actions.",
    points: 75,
    repoUrl: "https://github.com/Nogo4/flag-ci-hero",
    answer: "CTF{ci_hero_flag}",
  },
];

export const FLAG_MAP = new Map<string, FlagConfig>(
  FLAGS.map((f) => [f.id, f]),
);

export const FLAG_BY_ANSWER = new Map<string, FlagConfig>(
  FLAGS.map((f) => [f.answer.toLowerCase(), f]),
);
