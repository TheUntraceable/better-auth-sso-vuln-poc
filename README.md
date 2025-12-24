# Better Auth SSO Authentication Bypass Vulnerability

**Severity**: Critical (CVSS 9.8)
**Affected Versions**: Better Auth >= v1.3.6 (SSO plugin)  
**Status**: Responsibly disclosed, patched in v1.3.7

## Vulnerability Summary

A critical authentication bypass vulnerability exists in Better Auth's SSO implementation
that allows an attacker to gain unauthorized access to any organization by registering
a malicious SSO identity provider without checking if they are inside of the organization
they are trying to register it to.

### Impact

- **Organization Takeover**: Complete unauthorized access to victim organizations
- **Authentication Bypass**: Circumvent normal access controls
- **Privilege Escalation**: With `organizationProvisioning` enabled, attackers can
  assign themselves admin roles
- **Data Breach**: Access to all organization data and resources

### Root Cause

The SSO provider registration endpoint (`/api/auth/sso/register`) lacks authorization
checks to verify that the registering user:

1. Is a member of the target organization
2. Has administrative privileges in that organization

This allows any authenticated user to register an SSO provider for any organization
by simply knowing the organization ID.

## Attack Scenario

1. Attacker discovers or enumerates a victim organization ID
2. Attacker configures their SSO server to return fabricated user claims
3. Attacker authenticates via malicious SSO and gains membership in victim organization
4. With `organizationProvisioning` enabled, attacker can claim admin role

**Note**: Better Auth prevents authentication as existing users, limiting direct
account impersonation. However, attackers can still create new accounts within
the organization.

## Technical Details

**Vulnerable Code Path**: SSO provider registration endpoint  
**Missing Controls**:

- Organization membership verification
- Admin role requirement

## Proof of Concept

### Prerequisites

- TS runtime (bun or whatever)
- Access to a Better Auth instance running v1.3.6+

### Setup

1. Clone this repository:

```bash
   git clone https://github.com/TheUntraceable/better-auth-sso-vuln-poc.git
   cd better-auth-sso-vuln-poc
   ```

1. **Install Dependencies**: Make sure you have Bun installed. Then, install the necessary dependencies.

   ```bash
   bun install # Use npm or whatever if you don't use Bun
   ```

2. **Start the Mock SSO Server**: In one terminal, start the mock SSO server.

   ```bash
   bun mock-sso
   ```

3. **Start the Vulnerable Better Auth Instance**: In another terminal, start the Better
    Auth instance.

    ```bash
    bun dev
    ```

4. **Run the Exploit**: Finally, in a third terminal, run the exploit script.

    ```bash
    bun exploit
    ```

## Important Note

This PoC is for educational purposes only. Do not use this information to exploit systems without explicit permission. Always follow ethical guidelines and legal regulations when testing for vulnerabilities. This was reported responsibly to the Better Auth team on August 16th 2025 and has been acknowledged and fixed in future versions. Please ensure you are using a patched version of Better Auth to avoid this vulnerability.
