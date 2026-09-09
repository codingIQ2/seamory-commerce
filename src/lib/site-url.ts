const localUrl = "http://localhost:3000";

export function getPublicAppUrl() {
  const candidate = process.env.NEXT_PUBLIC_APP_URL ?? process.env.BETTER_AUTH_URL ?? localUrl;
  try {
    const url = new URL(candidate);
    return url.protocol === "https:" || url.hostname === "localhost" || url.hostname === "127.0.0.1"
      ? url
      : new URL(localUrl);
  } catch {
    return new URL(localUrl);
  }
}
