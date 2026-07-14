import { Navigate } from "react-router-dom";

// The combined profile page was split into per-topic pages under /tentang/*.
// Keep /profil working by redirecting to the first topic.
export default function ProfilPage() {
  return <Navigate to="/tentang/profil" replace />;
}
