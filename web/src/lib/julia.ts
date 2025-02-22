export const JuliaVersions = [
  "1.6",
  "1.7",
  "1.8",
  "1.9",
  "1.10",
  "1.11",
] as const;
export const JuliaModules = [
  "Base",
  "LinearAlgebra",
  "Dates",
  "Printf",
  "Random",
  "Statistics",
] as const;

export type JuliaVersion = (typeof JuliaVersions)[number];
export type JuliaModule = (typeof JuliaModules)[number];
