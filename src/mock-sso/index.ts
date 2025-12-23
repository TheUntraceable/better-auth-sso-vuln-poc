import express from "express";

const app = express();
const PORT = 8080;

// This is the one and only correct redirect URI.
const a_redirect_uri =
  "https://dev.untraceable.dev/api/auth/sso/callback/fakeattackersprovider";

// Endpoint 1: The Discovery Document
app.get("/.well-known/openid-configuration", (req, res) => {
  console.log("[Dumb SSO] /discovery: Sending configuration.");
  const issuer = `https://api.untraceable.dev`; // Use localhost for backend
  const publicIssuer = `https://api.untraceable.dev`; // Use public for browser
  res.json({
    issuer: issuer,
    authorization_endpoint: `${publicIssuer}/auth`, // BROWSER uses this
    token_endpoint: `${issuer}/token`, // BACKEND uses this
    userinfo_endpoint: `${issuer}/me`, // BACKEND uses this
    jwks_uri: `${issuer}/jwks`,
  });
});

// Endpoint 2: The Authorization Endpoint (for the browser)
app.get("/auth", (req, res) => {
  const state = req.query.state;
  const redirectUrl = new URL(a_redirect_uri);
  redirectUrl.searchParams.set("code", "this_is_a_totally_fake_code");
  redirectUrl.searchParams.set("state", state!.toString());

  console.log(
    `[Dumb SSO] /auth: Received login request. Redirecting back to app.`
  );
  res.redirect(redirectUrl.toString());
});

// Endpoint 3: The Token Endpoint (for the backend)
app.post("/token", (req, res) => {
  res.json({
    access_token: "this_is_a_totally_fake_access_token",
    token_type: "Bearer",
    expires_in: 3600*60,
  });
});

// Endpoint 4: The User Info Endpoint (for the backend)
app.get("/me", (req, res) => {
  console.log(
    "✅ [Dumb SSO] /me: Got a GET request for user info. Sending attacker details."
  );
  res.json({
    id: "attacker-user-id-from-dumb-server",
    email: "victim1@innocent.org",
    email_verified: true,
    name: "Malicious Attacker",
    role: "admin",
  });
});

// Endpoint 5: A required but useless JWKS endpoint.
app.get("/jwks", (req, res) => res.json({ keys: [] }));

app.listen(PORT, () => {
  console.log(`-- The DUMBEST POSSIBLE Mock SSO is running on port ${PORT} --`);
});
