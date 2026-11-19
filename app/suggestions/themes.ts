export const themes = {
  evenements: "Événements",
  menu: "Menu",
  application: "Application",
} as const;

export type Theme = keyof typeof themes;

export function isTheme(value: unknown): value is Theme {
  return typeof value === "string" && Object.hasOwn(themes, value);
}
