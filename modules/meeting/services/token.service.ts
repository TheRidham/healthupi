import jwt from "jsonwebtoken";

export function generateVideoSdkToken(
  roomId: string,
  role: "doctor" | "patient"
): string {
  // Client token for VideoSDK - signed with the secret, includes room and permissions
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: "videosdk", // Issuer claim
    sub: "client", // Subject claim
    roomId,
    permissions: role === "doctor" ? ["allow_mod"] : ["allow_join"],
    iat: now,
    exp: now + 7200, // 2 hours
  };

  if (!process.env.VIDEOSDK_SECRET) {
    throw new Error("VIDEOSDK_SECRET not configured");
  }

  const token = jwt.sign(payload, process.env.VIDEOSDK_SECRET, {
    algorithm: "HS256",
  });

  console.log("✅ JWT Token generated");
  console.log("   - Room:", roomId);
  console.log("   - Role:", role);

  return token;
}