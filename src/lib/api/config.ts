const getApiBase = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) return envUrl;
  // Prod / dev-proxy fallback: same origin + /api/v1
  if (typeof window !== "undefined") {
    return `${window.location.origin}/api/v1`;
  }
  return "http://localhost:8081/api/v1";
};

export const API_BASE = getApiBase();
