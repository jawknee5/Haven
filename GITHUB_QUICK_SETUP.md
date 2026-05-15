# ⚡ QUICK GITHUB SETUP - CHECKLIST

**Fast reference for setting up private Haven GitHub repository**  
**Time**: 15-20 minutes  
**Level**: Quick setup  

---

## 🚀 5-MINUTE QUICK START

### Step 1: Create Private Repo (2 min)
```
1. Go to: https://github.com/new
2. Name: haven
3. Description: Haven Civic Technology Platform
4. Visibility: PRIVATE ⚠️ IMPORTANT
5. Click "Create repository"
```

### Step 2: Get Clone URL (1 min)
```
1. Click "Code" (green button)
2. Copy HTTPS URL
3. Save for next step
```

### Step 3: Push Code (2 min)
```bash
cd /path/to/haven
git remote add origin https://github.com/YOUR-USERNAME/haven.git
git branch -M main
git push -u origin main
```

✅ Done! Your code is on GitHub private

---

## 🔐 SECURITY SETUP (5 MIN)

### Go to Settings

1. **Branch Protection**
   - Settings → Branches
   - Add rule for `main`
   - ☑ Require PR
   - ☑ Require 1 approval
   - ☑ Require status checks
   - ☑ Include admins

2. **Access Control**
   - Settings → Manage Access
   - Add team members (click "Add people")
   - Assign roles

3. **Secrets**
   - Settings → Secrets
   - Add: VAULT_MASTER_KEY
   - Add: JWT_SECRET
   - Add: OPENAI_API_KEY (if using)

4. **Security Features**
   - Settings → Code security
   - ☑ Dependabot alerts
   - ☑ Dependabot updates
   - ☑ Secret scanning

---

## 👥 ADD TEAM MEMBERS (2 MIN EACH)

```
For each contributor:
1. Settings → Manage Access
2. Click "Add people"
3. Enter GitHub username
4. Select role:
   - Core team = Maintain
   - Regular dev = Write
   - Reviewer = Triage
   - Auditor = Read
5. Send invitation
```

**IMPORTANT: Require NDA before access!**

---

## 📋 FILES TO ENSURE ARE IN REPO

```
Essential files (must exist):
✅ README.md
✅ CONTRIBUTING.md (mention NDA)
✅ .gitignore
✅ .env.example (no actual secrets!)
✅ docker-compose.yml
✅ package.json

Files to ADD:
□ LICENSE (choose: MIT, Apache 2.0, or proprietary)
□ CODE_OF_CONDUCT.md (optional)
□ SECURITY.md (optional)

Files to IGNORE (add to .gitignore):
✅ .env (secrets)
✅ .env.local (local config)
✅ node_modules/
✅ *.log
✅ .DS_Store
```

---

## ⚠️ CRITICAL SECURITY

### NEVER Commit:
- ❌ `.env` files with secrets
- ❌ API keys or tokens
- ❌ AWS credentials
- ❌ Database passwords
- ❌ Private keys

### Repository Must Be:
- ✅ PRIVATE (not public)
- ✅ Branch-protected
- ✅ Secrets in GitHub Secrets
- ✅ Access controlled

### NDA Requirement:
- ✅ All contributors sign NDA
- ✅ Before GitHub access
- ✅ Document in CONTRIBUTING.md

---

## 🔄 INITIAL COMMIT

```bash
# 1. Ensure no secrets in files
grep -r "password\|token\|secret\|key" . --exclude-dir=node_modules

# 2. Add all files
git add .

# 3. Commit
git commit -m "Initial commit: Haven Civic Technology Platform

Features:
- Backend with encryption engine
- Frontend with portals
- Complete documentation
- Setup guides
- NDA templates
- Docker configuration"

# 4. Push
git push -u origin main
```

---

## ✅ VERIFICATION

After setup, verify:

```bash
# 1. Verify repo is private
# (Check Settings → Visibility = Private)

# 2. Verify branch protection
# (Check Settings → Branches)

# 3. Verify team access
# (Check Settings → Manage Access)

# 4. Verify code on GitHub
# (Check repository page shows your files)

# 5. Verify no secrets
# (Check no .env files visible)
```

---

## 📞 QUICK REFERENCE

### URLs
- **New Repo**: https://github.com/new
- **Your Repos**: https://github.com/dashboard
- **Settings**: https://github.com/YOUR-REPO/settings

### Commands
```bash
# Clone
git clone https://github.com/YOUR-USERNAME/haven.git

# Add remote
git remote add origin https://github.com/YOUR-USERNAME/haven.git

# First push
git push -u origin main

# Update
git pull origin main

# New branch
git checkout -b feature/name
```

### Common Tasks
```bash
# View branch protection rules
# Go to: Settings → Branches

# Add collaborator
# Go to: Settings → Manage Access

# Add secret
# Go to: Settings → Secrets

# View security status
# Go to: Security tab
```

---

## 🎯 GITHUB WORKFLOW

### For Contributors:

1. **Get access**
   - Sign NDA
   - Get added to repo

2. **Clone repo**
   ```bash
   git clone https://github.com/username/haven.git
   cd haven
   ```

3. **Create branch**
   ```bash
   git checkout -b feature/your-feature
   ```

4. **Make changes**
   ```bash
   # Edit files
   git add .
   git commit -m "Your message"
   ```

5. **Push branch**
   ```bash
   git push origin feature/your-feature
   ```

6. **Create PR on GitHub**
   - Go to repo
   - Click "New Pull Request"
   - Select your branch
   - Add title & description
   - Request review

7. **Wait for approval**
   - Reviewer checks code
   - Approves if good

8. **Merge**
   - Click "Merge pull request"
   - Delete branch

---

## ⚡ SHORTCUTS

### Add Multiple People at Once
```
Settings → Manage Access → Add people
Enter each GitHub username, separated by commas
Select role for all
Send invitations
```

### Bulk Add Secrets
```
Settings → Secrets
For each secret:
  - Click "New repository secret"
  - Enter name
  - Enter value
  - Click "Add secret"
```

### Quick Security Check
```
Settings → Code security and analysis
All green? ✅ (all enabled)
Any red? ⚠️ (enable it)
```

---

## 🔒 PRIVATE REPO REMINDER

**This repository is PRIVATE**

✅ Only authorized people can access  
✅ Code is not visible to public  
✅ Requires authentication to view  
✅ NDA required for access  
✅ Security features enabled  

**Keep it this way!**
- Don't make public
- Don't publish code elsewhere
- Don't share sensitive details
- Don't add unauthorized people

---

## 📋 FINAL CHECKLIST

- [ ] Repository created
- [ ] Visibility set to PRIVATE
- [ ] Branch protection enabled
- [ ] Team members added
- [ ] Secrets configured
- [ ] Security features enabled
- [ ] Code pushed to main
- [ ] No secrets in repository
- [ ] README included
- [ ] CONTRIBUTING.md references NDA
- [ ] Team members signed NDAs
- [ ] Ready for collaboration

---

**Private GitHub Repository Quick Setup**  
**Haven Civic Technology Platform**  
**Version 1.0 | May 14, 2026**

**Time to complete**: 15-20 minutes  
**Status**: Ready to use
