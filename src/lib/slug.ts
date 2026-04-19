const MAX_SLUG_LEN = 120;

export function slugify(input: string): string {
  const base = input
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const slug = base.slice(0, MAX_SLUG_LEN);
  return slug || "muc";
}
