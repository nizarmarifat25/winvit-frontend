/**
 * Build a clean URL-safe invitation slug from groom & bride nicknames.
 * Example: ("Budi", "Ani") -> "budi-ani"
 */
export function buildCoupleSlug(
  groomNickname?: string | null,
  brideNickname?: string | null
): string {
  const toSegment = (val?: string | null) =>
    (val || "")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")

  return [toSegment(groomNickname), toSegment(brideNickname)]
    .filter(Boolean)
    .join("-")
}
