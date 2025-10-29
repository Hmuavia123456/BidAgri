export function getAllowedAdmins(defaultAdmins = []) {
  const envList = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(",") ?? [];
  const cleaned = envList
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
  if (cleaned.length) {
    return cleaned;
  }
  return defaultAdmins.map((email) => email.trim().toLowerCase()).filter(Boolean);
}
