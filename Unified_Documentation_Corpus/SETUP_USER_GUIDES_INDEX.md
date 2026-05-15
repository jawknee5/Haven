# 🗂️ SETUP & USER GUIDES INDEX

**All guides for getting Haven running and using it**  
**Complete reference for setup, caseworkers, and citizens**  

---

## 📚 GUIDES INCLUDED

### 1. COMPLETE_SETUP_GUIDES.md ⭐ START HERE
**What**: All-in-one master guide  
**Time**: 5 minutes to understand  
**Contains**:
- Overview of all guides
- 5-minute quick start
- Getting started by role
- Test scenarios
- Learning path
- Quick reference

**Read this first** to understand what's available

---

### 2. SETUP_GUIDE_COMPLETE.md ⚙️ INSTALLATION
**What**: Complete setup instructions  
**Time**: 30 minutes to execute  
**Contains**:
- Prerequisites (software & hardware)
- 5-minute quick start
- Detailed setup phases
  - Environment configuration
  - Database setup
  - Backend setup
  - Frontend setup
  - Monitoring setup
- Accessing interfaces
- Testing setup
- Troubleshooting
- Cleanup & reset

**Use this to**: Install Haven on your machine

---

### 3. CASEWORKER_DASHBOARD_GUIDE.md 👔 FOR STAFF
**What**: Complete caseworker guide  
**Time**: 15 minutes to learn  
**Contains**:
- Dashboard overview
- Accessing dashboard
- Dashboard section (metrics)
- Cases section (management)
  - Viewing cases
  - Creating cases
  - Enriching with AI
  - Routing to resources
  - Managing status
  - Adding notes
  - Uploading documents
- Resources section
- Team management
- Analytics section
- Settings
- Mobile access
- Security & privacy
- Common tasks
- FAQ
- Training resources

**Use this to**: Manage cases as a caseworker

---

### 4. CITIZEN_PORTAL_GUIDE.md 👤 FOR USERS
**What**: Complete citizen portal guide  
**Time**: 10 minutes to learn  
**Contains**:
- Portal overview
- Accessing portal
- Creating account
- Login process
- Creating cases
- Tracking cases
- Chat with BB assistant
- Finding resources
- Account management
  - View profile
  - Update profile
  - Change password
  - Delete account
- Notifications
- Need help
- Privacy & security
- Mobile access
- Common tasks

**Use this to**: Get help as a citizen/resident

---

## 🎯 QUICK NAVIGATION

### I want to...

**Get Haven running**
→ Read `SETUP_GUIDE_COMPLETE.md`

**Use the caseworker dashboard**
→ Read `CASEWORKER_DASHBOARD_GUIDE.md`

**Use the citizen portal**
→ Read `CITIZEN_PORTAL_GUIDE.md`

**Understand everything**
→ Read `COMPLETE_SETUP_GUIDES.md` first

**Find information quickly**
→ Use this index

---

## 👥 BY ROLE

### Citizens & Residents
**Primary Guide**: `CITIZEN_PORTAL_GUIDE.md`

**Also Read**:
- `COMPLETE_SETUP_GUIDES.md` (optional)

**Time**: 10 minutes

**What You'll Learn**:
- Create account
- Submit cases
- Track progress
- Chat with BB
- Find resources

---

### Caseworkers & Case Managers
**Primary Guide**: `CASEWORKER_DASHBOARD_GUIDE.md`

**Also Read**:
- `SETUP_GUIDE_COMPLETE.md` (for setup)
- `COMPLETE_SETUP_GUIDES.md` (for overview)

**Time**: 20 minutes

**What You'll Learn**:
- Manage cases
- Enrich with AI
- Allocate resources
- Track team
- View analytics

---

### System Administrators
**Primary Guide**: `SETUP_GUIDE_COMPLETE.md`

**Also Read**:
- `COMPLETE_SETUP_GUIDES.md` (for overview)
- `HAVEN_UNIFIED_DOCUMENTATION_V2.md` (for details)

**Time**: 30 minutes + setup

**What You'll Learn**:
- Install services
- Configure database
- Setup monitoring
- Troubleshoot
- Manage system

---

### Developers
**Primary Guide**: `SETUP_GUIDE_COMPLETE.md`

**Also Read**:
- `COMPLETE_SETUP_GUIDES.md` (for overview)
- `HAVEN_UNIFIED_DOCUMENTATION_V2.md` (for full reference)
- `ENCRYPTION_VAULT_GUIDE.md` (for encryption)

**Time**: 1-2 hours + exploration

**What You'll Learn**:
- Setup development environment
- Run services locally
- Understand architecture
- Modify code
- Deploy changes

---

## 📊 TIME INVESTMENT

| Guide | Time | Purpose |
|-------|------|---------|
| COMPLETE_SETUP_GUIDES.md | 5 min | Overview & nav |
| SETUP_GUIDE_COMPLETE.md | 30 min | Installation |
| CASEWORKER_DASHBOARD_GUIDE.md | 15 min | Dashboard use |
| CITIZEN_PORTAL_GUIDE.md | 10 min | Portal use |

**Total**: ~60 minutes for complete understanding

---

## 🚀 GETTING STARTED

### Step 1: Read Overview (5 minutes)
```
→ COMPLETE_SETUP_GUIDES.md
```

### Step 2: Choose Your Path

**If you're installing Haven**:
```
→ SETUP_GUIDE_COMPLETE.md
```

**If you're a caseworker**:
```
→ CASEWORKER_DASHBOARD_GUIDE.md
```

**If you're a citizen**:
```
→ CITIZEN_PORTAL_GUIDE.md
```

### Step 3: Follow Your Guide

Complete all steps in your chosen guide.

### Step 4: Get Help

If stuck, see the "Support" section of your guide.

---

## 📍 FOLDER LOCATION

All guides are in:
```
Unified_Documentation_Corpus/
├── COMPLETE_SETUP_GUIDES.md
├── SETUP_GUIDE_COMPLETE.md
├── CASEWORKER_DASHBOARD_GUIDE.md
└── CITIZEN_PORTAL_GUIDE.md
```

Plus all other Haven documentation:
- START_HERE.md
- HAVEN_UNIFIED_DOCUMENTATION_V2.md
- ENCRYPTION_VAULT_GUIDE.md
- And more...

---

## ✅ KEY INFORMATION

### Default Test Accounts

**Citizen**:
- Email: citizen@haven.local
- Password: test123
- Access: http://localhost:3000

**Caseworker**:
- Email: caseworker@haven.local
- Password: test123
- Access: http://localhost:3000/caseworker

**Admin**:
- Email: admin@haven.local
- Password: test123
- Access: http://localhost:3000/admin

### Default URLs

| Service | URL |
|---------|-----|
| Citizen Portal | http://localhost:3000 |
| Caseworker Dashboard | http://localhost:3000/caseworker |
| Admin Panel | http://localhost:3000/admin |
| Backend API | http://localhost:4000 |
| Prometheus | http://localhost:9090 |
| Grafana | http://localhost:3001 |

### Quick Commands

```bash
# Start everything
docker compose up -d

# View status
docker compose ps

# View logs
docker compose logs -f

# Stop everything
docker compose down
```

---

## 🧪 TEST SCENARIOS

### Scenario 1: Citizen Journey (15 min)
1. Open citizen portal
2. Create account
3. Create case
4. Track progress
5. Chat with BB

→ See `CITIZEN_PORTAL_GUIDE.md` for details

---

### Scenario 2: Caseworker Journey (15 min)
1. Open caseworker dashboard
2. View assigned cases
3. Enrich a case with AI
4. Route to resource
5. Track outcome

→ See `CASEWORKER_DASHBOARD_GUIDE.md` for details

---

### Scenario 3: Full Setup (30 min)
1. Clone repository
2. Setup environment
3. Start services
4. Verify everything
5. Create test data

→ See `SETUP_GUIDE_COMPLETE.md` for details

---

## 💡 TIPS & TRICKS

### For Faster Setup
- Use quick start commands
- Pre-generate keys before setup
- Have Docker running before starting
- Check prerequisites first

### For Better Learning
- Follow scenarios in order
- Complete one section before moving on
- Test as you go
- Reference guides for quick lookup

### For Troubleshooting
- Check the troubleshooting section in your guide
- View logs: `docker compose logs -f`
- Check status: `docker compose ps`
- Restart service: `docker compose restart [service]`

---

## 📞 SUPPORT

### In the Guides
- Troubleshooting section
- FAQ section
- Common tasks section

### Online
- GitHub Issues: [your-repo]/issues
- Email: support@haven.local
- Slack: #haven-support

### Documentation
- Setup help: `SETUP_GUIDE_COMPLETE.md`
- Dashboard help: `CASEWORKER_DASHBOARD_GUIDE.md`
- Portal help: `CITIZEN_PORTAL_GUIDE.md`
- Technical help: `HAVEN_UNIFIED_DOCUMENTATION_V2.md`

---

## 🎯 WHAT'S NEXT

### After Reading
1. Choose your guide
2. Follow all steps
3. Test the system
4. Create test data
5. Explore features

### After Setup
1. Create test cases
2. Try routing resources
3. View analytics
4. Test encryption
5. Review audit logs

### For Production
1. Read `IMPLEMENTATION_ROADMAP.md`
2. Read `OPERATIONAL_GUIDE.md`
3. Plan deployment
4. Setup monitoring
5. Go live

---

## ✨ COMPLETE SETUP & USER GUIDES

**You now have everything needed to**:
- ✅ Install Haven
- ✅ Use the citizen portal
- ✅ Use the caseworker dashboard
- ✅ Manage the system
- ✅ Troubleshoot issues
- ✅ Learn & explore

**Start with**: `COMPLETE_SETUP_GUIDES.md`

---

**Setup & User Guides Index**  
**Haven v4.0**  
**Complete Reference**  
**Ready to Use**
