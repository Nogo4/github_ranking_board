export interface FlagConfig {
  id: string;
  name: string;
  description: string;
  points: number;
  repoUrl: string;
  answer: string;
}

// example : 
//   {
//     id: "flag-01",
//     name: "Hello World",
//     description: "Fork le repo et ouvre ta première Pull Request.",
//     points: 10,
//     repoUrl: "https://github.com/Nogo4/flag-hello-world",
//     answer: "CTF{hello_world_flag}",
//   },

export const FLAGS: FlagConfig[] = [
];

export const FLAG_MAP = new Map<string, FlagConfig>(
  FLAGS.map((f) => [f.id, f]),
);

export const FLAG_BY_ANSWER = new Map<string, FlagConfig>(
  FLAGS.map((f) => [f.answer.toLowerCase(), f]),
);
