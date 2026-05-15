# 🔒 PRIVATE GITHUB REPOSITORY SETUP GUIDE - Haven

**Purpose**: Create and configure a private GitHub repository for Haven  
**Time**: 15-20 minutes  
**Level**: Beginner-friendly  

---

## ⚠️ IMPORTANT: KEEP REPOSITORY PRIVATE

Haven contains:
- ✅ Proprietary source code
- ✅ Sensitive encryption systems
- ✅ Security procedures
- ✅ Business logic
- ✅ Infrastructure details
- ✅ User data handling

**MUST REMAIN PRIVATE** to protect:
- Intellectual property
- Security vulnerabilities
- Business competitiveness
- User data
- Contributor agreements

---

## 📋 PREREQUISITES

### GitHub Account Required
- [ ] GitHub account created (if not already)
- [ ] Admin access or organization owner status
- [ ] Verified email address
- [ ] Two-factor authentication enabled (recommended)

### Required Information
- Repository name: `haven` (or your preference)
- Organization name (if using organization): _____________
- Administrator email: _____________

---

## 🚀 STEP-BY-STEP SETUP

### Step 1: Create Private Repository

#### Via GitHub.com

1. Go to: https://github.com/new
2. Fill in repository details:
   ```
   Repository name: haven
   Description: Haven Civic Technology Platform - Private Repository
   Visibility: Private ⚠️ IMPORTANT
   ```

3. Initialize repository:
   - [ ] **DO NOT** initialize with README (we have one)
   - [ ] **DO NOT** add .gitignore (we have one)
   - [ ] **DO NOT** add license initially

4. Click "Create repository"

#### Result
- Private repository created
- URL: `https://github.com/your-username/haven.git`
- Status: Private ✅

---

### Step 2: Configure Repository Settings

#### Access Settings
1. Go to your repository
2. Click "Settings" (gear icon)
3. Verify "Private" is selected under "Danger Zone"

---

### Step 3: Configure Branch Protection

#### Protect Main Branch

1. Go to: Settings → Branches
2. Under "Branch protection rules", click "Add rule"
3. Configure:
   ```
   Branch name pattern: main
   
   ☑ Require a pull request before merging
   ☑ Require approvals: 1
   ☑ Require status checks to pass before merging
   ☑ Require branches to be up to date before merging
   ☑ Restrict who can push to matching branches
   ☑ Include administrators
   ☑ Allow force pushes: [Dismiss]
   ☑ Allow deletions: [Dismiss]
   ```

4. Click "Create"

---

### Step 4: Access Control & Collaborators

#### Add Team Members

1. Go to: Settings → Manage Access
2. Click "Add people" or "Add teams"
3. For each contributor:
   ```
   Username: [GitHub username]
   Role: [Select appropriate]
   ```

#### Assign Roles

| Role | Permissions | For |
|------|-----------|-----|
| **Maintain** | Push, manage PRs, manage issues | Core team leads |
| **Write** | Push, create PRs, manage issues | Regular contributors |
| **Triage** | Manage issues & PRs (no push) | QA & reviewers |
| **Read** | View only (no push) | Security auditors |

#### Add Team Members Example
```
Contributor 1:
├─ Username: john-dev
├─ Role: Write (code contributor)

Contributor 2:
├─ Username: sarah-security
├─ Role: Triage (security reviewer)

Contributor 3:
├─ Username: admin-user
└─ Role: Maintain (admin/lead)
```

---

### Step 5: Configure Secrets & Environments

#### Setup Secrets for CI/CD

1. Go to: Settings → Secrets and variables → Actions
2. Add each secret:

```
VAULT_MASTER_KEY
├─ Value: [Your encryption key]
├─ Scope: This repository
└─ Used for: Encryption operations

JWT_SECRET
├─ Value: [Your JWT secret]
├─ Scope: This repository
└─ Used for: Authentication

OPENAI_API_KEY
├─ Value: [Your OpenAI key]
├─ Scope: This repository
└─ Used for: AI features (optional)
```

3. For each secret:
   - Click "New repository secret"
   - Enter name
   - Enter value
   - Click "Add secret"

⚠️ **WARNING**: Never commit secrets to repository!

---

### Step 6: Setup GitHub Actions (Optional)

#### Create CI/CD Workflow

1. Go to: Actions
2. Setup workflows for:
   - [ ] Build & test on push
   - [ ] Security scanning
   - [ ] Code quality checks
   - [ ] Deployment (if applicable)

Example basic workflow:
```yaml
name: Build & Test
on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node
        uses: actions/setup-node@v2
        with:
          node-version: '20'
      - name: Install dependencies
        run: npm install
      - name: Run tests
        run: npm test
      - name: Security check
        run: npm audit
```

---

### Step 7: Enable Additional Security Features

#### Security Settings

1. Go to: Settings → Code security and analysis
2. Enable:
   ```
   ☑ Dependabot alerts
   ☑ Dependabot security updates
   ☑ Secret scanning
   ☑ Private vulnerability reporting
   ```

---

### Step 8: Initialize Local Repository

#### Clone Repository

```bash
# 1. Clone the private repository
git clone https://github.com/your-username/haven.git
cd haven

# 2. Add remote for existing code (if migrating)
git remote add existing /path/to/existing/code

# 3. Fetch existing code
git fetch existing

# 4. Merge into main
git merge existing/main
```

#### Or Create from Scratch

```bash
# 1. Initialize
git init
git branch -M main

# 2. Add remote
git remote add origin https://github.com/your-username/haven.git

# 3. Add files
git add .

# 4. Initial commit
git commit -m "Initial commit: Haven Civic Technology Platform"

# 5. Push to GitHub
git push -u origin main
```

---

### Step 9: Setup .gitignore

#### Already Included

Haven includes `.gitignore` with:
- [ ] node_modules/
- [ ] .env (secrets)
- [ ] .env.local
- [ ] .env.production
- [ ] dist/
- [ ] build/
- [ ] .DS_Store
- [ ] *.log
- [ ] .vscode/
- [ ] .idea/

**Check that it's in repository:**
```bash
git status | grep .gitignore
```

#### Add Sensitive Files (if needed)

```bash
# Create .gitignore.private for extra security
echo ".env.local" >> .gitignore.private
echo ".ssh/" >> .gitignore.private
echo "secrets/" >> .gitignore.private

# Add to .gitignore
cat .gitignore.private >> .gitignore
```

---

### Step 10: Configure Webhook (Optional)

#### For Notifications

1. Go to: Settings → Webhooks
2. Click "Add webhook"
3. Configure:
   ```
   Payload URL: [Your webhook URL]
   Content type: application/json
   Events: [Select which events]
   ☑ Active
   ```

---

## 🔐 SECURITY CHECKLIST

### Repository Settings
- [ ] Repository is PRIVATE (not public)
- [ ] Branch protection enabled on main
- [ ] Require PR reviews before merge
- [ ] Admin enforcement enabled
- [ ] Status checks required

### Access Control
- [ ] Only authorized people added
- [ ] Roles assigned appropriately
- [ ] Organization/team structure setup
- [ ] Service accounts (if needed) with minimal permissions

### Secrets Management
- [ ] No secrets in code
- [ ] Secrets stored in GitHub Secrets
- [ ] Secrets marked as sensitive
- [ ] Secret rotation scheduled
- [ ] Old secrets removed

### Code Security
- [ ] Secret scanning enabled
- [ ] Dependabot alerts enabled
- [ ] Vulnerability reporting enabled
- [ ] Branch protection enforced
- [ ] PR reviews required

### Documentation
- [ ] README.md in repository
- [ ] CONTRIBUTING.md with NDA reference
- [ ] LICENSE file included
- [ ] Security policy documented

---

## 👥 ADDING CONTRIBUTORS

### For Individual Contributors

1. Get their GitHub username
2. Go to: Settings → Manage Access
3. Click "Add people"
4. Enter username
5. Select role (typically "Write")
6. Contributor receives invitation
7. Contributor accepts invitation

---

### For Organizations

1. Create organization on GitHub (if needed)
2. Add team members to organization
3. Create teams for different roles:
   - [ ] Core Team (admins)
   - [ ] Developers
   - [ ] Security Team
   - [ ] QA Team

4. Assign repository access to teams
5. Team members gain access automatically

---

### Revoking Access

```bash
# When contributor leaves:
1. Go to: Settings → Manage Access
2. Find contributor
3. Click three-dot menu
4. Select "Remove"
5. Confirm removal

# Access revoked immediately
```

---

## 📝 NDA INTEGRATION

### Before Granting Access

Require all contributors to:
1. Read and understand NDA
2. Sign appropriate NDA (short, full, or organizational)
3. Submit signed NDA to: legal@haven.local
4. Wait for approval (1-5 business days)
5. THEN grant GitHub access

### Document NDA Requirement

Add to CONTRIBUTING.md:
```markdown
# Contributing to Haven

## NDA Requirement

All contributors must sign a Non-Disclosure Agreement before accessing this repository.

1. Review: Read the appropriate NDA for your situation
   - Individual: CONTRIBUTOR_NDA_SHORT_FORM.md or CONTRIBUTOR_NDA_TEMPLATE.md
   - Organization: CONTRIBUTOR_NDA_ORGANIZATIONAL.md

2. Sign: Complete and sign the NDA

3. Submit: Email signed NDA to legal@haven.local

4. Wait: Approval typically takes 1-5 business days

5. Access: You'll be added to the repository after approval

See: [NDA_GUIDE_COMPLETE.md](NDA_GUIDE_COMPLETE.md)
```

---

## 🔑 REPOSITORY STRUCTURE

### Recommended Directory Organization

```
haven/
├── README.md (overview & setup)
├── LICENSE (open source or proprietary)
├── CONTRIBUTING.md (contribution guidelines & NDA)
├── CODE_OF_CONDUCT.md (community guidelines)
│
├── .github/
│   ├── workflows/ (CI/CD pipelines)
│   ├── ISSUE_TEMPLATE/ (issue templates)
│   └── PULL_REQUEST_TEMPLATE.md (PR template)
│
├── backend/
│   ├── src/
│   ├── prisma/
│   ├── tests/
│   └── package.json
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── tests/
│   └── package.json
│
├── apps/
│   ├── api/
│   └── web/
│
├── docs/
│   ├── setup/
│   ├── api/
│   ├── architecture/
│   └── security/
│
├── docker-compose.yml
├── docker-compose.dev.yml
├── docker-compose.production.yml
│
├── .env.example
├── .gitignore
├── .gitattributes
└── package.json (monorepo root)
```

---

## 📚 INITIAL FILES TO COMMIT

### Essential Files

```bash
# Before first push, ensure these exist:
├── README.md (repository overview)
├── CONTRIBUTING.md (NDA reference, contribution guidelines)
├── LICENSE (your license choice)
├── .gitignore (already included)
├── docker-compose.yml (already included)
└── package.json (already included)
```

### DO NOT COMMIT

```bash
❌ .env (production secrets)
❌ .env.local (local development secrets)
❌ node_modules/ (too large)
❌ dist/ or build/ (generated files)
❌ *.log (log files)
❌ .vscode/launch.json (IDE config)
❌ AWS credentials or keys
❌ API keys or tokens
```

---

## 🚀 FIRST PUSH

### Initialize & Push

```bash
# 1. Verify all files
git status

# 2. Add all files
git add .

# 3. Create initial commit
git commit -m "Initial commit: Haven Civic Technology Platform

- Complete backend with encryption engine (ApexVault)
- Complete frontend with citizen portal & caseworker dashboard
- Docker setup for local development
- Comprehensive documentation
- NDA templates for contributors
- Setup and user guides"

# 4. Push to GitHub
git push -u origin main

# Verify
git log --oneline -5
```

---

## 📊 REPOSITORY STATS

After initial setup:

```
Repository: haven
Visibility: Private
Location: https://github.com/your-username/haven.git
Status: Ready for contributions

Initial commit:
├─ Files: ~150+
├─ Folders: ~30+
├─ Lines of code: ~5000+ (backend + frontend)
├─ Documentation: ~300+ KB
├─ Setup time: ~20 minutes
└─ First contributor: Ready to add

Security:
├─ Private: ✅
├─ Branch protection: ✅
├─ Secret scanning: ✅
├─ Dependabot: ✅
└─ NDA required: ✅
```

---

## 🔄 ONGOING MANAGEMENT

### Daily Operations

```bash
# Pull latest changes
git pull origin main

# Create feature branch
git checkout -b feature/your-feature

# Make changes and commit
git add .
git commit -m "Your commit message"

# Push branch
git push origin feature/your-feature

# Create Pull Request on GitHub
# 1. Go to your repository
# 2. Click "New Pull Request"
# 3. Compare your branch to main
# 4. Add title and description
# 5. Request review
# 6. Wait for approval
# 7. Merge when approved
```

### Regular Maintenance

```bash
# Weekly
├─ Review & merge pull requests
├─ Check for security alerts
├─ Update dependencies (if needed)

# Monthly
├─ Review contributor access
├─ Check secret rotation
├─ Archive old branches

# Quarterly
├─ Security audit
├─ Performance review
├─ Dependency updates
└─ License compliance check
```

---

## ⚠️ IMPORTANT REMINDERS

### Keep Private
- ✅ Repository visibility: PRIVATE only
- ✅ No public forks
- ✅ No publishing code publicly
- ✅ No sharing on public sites
- ✅ No mentioning sensitive details in public

### Protect Secrets
- ✅ Never commit .env files
- ✅ Use GitHub Secrets for CI/CD
- ✅ Rotate secrets periodically
- ✅ Never share URLs with keys
- ✅ Audit access logs

### Security Practices
- ✅ Enable all security features
- ✅ Require PR reviews
- ✅ Enforce branch protection
- ✅ Monitor for suspicious activity
- ✅ Keep dependencies updated

### NDA Compliance
- ✅ Require NDA before access
- ✅ Document all contributors
- ✅ Remove access when leaving
- ✅ Monitor for unauthorized access
- ✅ Report violations immediately

---

## 🆘 TROUBLESHOOTING

### Can't Clone Repository

```bash
# Problem: Authentication fails

# Solution 1: Use GitHub CLI
gh repo clone your-username/haven

# Solution 2: Generate personal access token
1. Go to: https://github.com/settings/tokens
2. Create new token with 'repo' scope
3. Use token as password when cloning
git clone https://[token]@github.com/your-username/haven.git

# Solution 3: Setup SSH key
ssh-keygen -t ed25519 -C "your-email@example.com"
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519
# Add public key to GitHub
git clone git@github.com:your-username/haven.git
```

### PR Can't Merge

```bash
# Problem: Branch protection preventing merge

# Solution:
1. Ensure PR has 1+ approved review
2. Ensure all status checks pass
3. Ensure branch is up to date with main
4. Try again after addressing issues
```

### Lost Access

```bash
# Problem: Can't access repository

# Contact repository owner:
1. Explain situation
2. Provide GitHub username
3. Request re-invitation
4. Accept new invitation
```

---

## 📞 SUPPORT

### For Repository Issues
- GitHub Support: https://github.com/support
- Documentation: https://docs.github.com
- Community: https://github.community

### For Haven-Specific Issues
- Legal/NDA: legal@haven.local
- Security: security@haven.local
- Technical: contributors@haven.local

---

## ✅ SETUP VERIFICATION CHECKLIST

After completing all steps:

- [ ] Repository created and private
- [ ] Branch protection enabled on main
- [ ] All team members added with correct roles
- [ ] Secrets configured for CI/CD
- [ ] Security features enabled (scanning, Dependabot, etc.)
- [ ] Initial commit pushed to main
- [ ] Contributing guidelines (CONTRIBUTING.md) added
- [ ] NDA policy documented in repository
- [ ] README with setup instructions
- [ ] .gitignore properly configured
- [ ] No secrets in repository
- [ ] All contributors have signed NDAs

---

## 🎯 NEXT STEPS

1. **Create repository** on GitHub (follow Steps 1-2)
2. **Configure security** (follow Steps 3-7)
3. **Add team members** (follow Step 4)
4. **Setup local clone** (follow Step 8)
5. **First push** (follow "First Push" section)
6. **Start contributing!**

---

**Private GitHub Repository Setup Guide**  
**Haven Civic Technology Platform**  
**Version 1.0 | May 14, 2026**

*Keep this repository private to protect intellectual property, security, and user data.*
