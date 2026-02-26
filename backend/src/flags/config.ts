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
    name: "Branch and Merge",
    description: "Fork le repo, créé ta première banch et merge la.",
    points: 100,
    repoUrl: "https://github.com/Workshop-Git-Epitech/workshop_1",
    answer: "GIT{M3RG3_R350LU}",
  },
  {
    id: "flag-02",
    name: "Conflict Junior",
    description: "Fork le repo, merge les branch et résous les conflits.",
    points: 150,
    repoUrl: "https://github.com/Workshop-Git-Epitech/workshop_2",
    answer: "GIT{BR4V0_P0UR_L3_C0NFL1T}",
  },
  {
    id: "flag-03",
    name: "Commit Junior",
    description: "Fork le repo, fait un commit inutile, et modifie le.",
    points: 150,
    repoUrl: "https://github.com/Workshop-Git-Epitech/workshop_3",
    answer: "GIT{c0mm1t_p0urr1}",
  },
  {
    id: "flag-04",
    name: "Back to the Commit",
    description: "Fork le repo, et revient sur le bon commit pour trouver le flag.",
    points: 200,
    repoUrl: "https://github.com/Workshop-Git-Epitech/workshop_4",
    answer: "GIT{B4CK_T0_TH3_FUTUR}",
  }
];

export const FLAG_MAP = new Map<string, FlagConfig>(
  FLAGS.map((f) => [f.id, f]),
);

export const FLAG_BY_ANSWER = new Map<string, FlagConfig>(
  FLAGS.map((f) => [f.answer.toLowerCase(), f]),
);
