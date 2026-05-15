# 🎯 HAVEN v4.0 - COMPLETE SETUP & USER GUIDES

**All-in-one reference for getting Haven running and using it**  
**Time**: 30 minutes setup + usage guides  
**Level**: Beginner-friendly  

---

## 📚 COMPLETE GUIDE SET

This package includes everything you need:

### 1. **SETUP_GUIDE_COMPLETE.md** ⚙️
- Complete installation instructions
- Environment setup
- Database configuration
- Service startup
- Verification steps
- Troubleshooting

**Use this to**: Get Haven running on your machine

---

### 2. **CASEWORKER_DASHBOARD_GUIDE.md** 👔
- Caseworker interface overview
- Case management
- Resource allocation
- Team management
- Analytics & reporting
- Security practices

**Use this to**: Manage cases as a caseworker

---

### 3. **CITIZEN_PORTAL_GUIDE.md** 👤
- Citizen interface overview
- Creating accounts & cases
- Tracking progress
- Chat with BB assistant
- Finding resources
- Account management

**Use this to**: Get help as a citizen/resident

---

## 🚀 5-MINUTE QUICK START

### Get Haven Running
```bash
# 1. Clone repository
git clone https://github.com/your-org/haven.git
cd haven

# 2. Setup environment
cp .env.example .env.local

# 3. Generate encryption key
node -e "console.log('VAULT_MASTER_KEY=' + require('crypto').randomBytes(32).toString('hex'))"
# Add output to .env.local

# 4. Start services
docker compose up -d

# 5. Access interfaces
# Citizen Portal:    http://localhost:3000
# Caseworker:        http://localhost:3000/caseworker
# Backend API:       http://localhost:4000
# Monitoring:        http://localhost:3001
```

**Time**: 5 minutes  
**Result**: Haven is running

---

## 📊 WHAT'S RUNNING

After startup, you have:

```
Services Running:

✅ Citizen Portal        http://localhost:3000
   - Create cases
   - Chat with BB
   - Track progress
   - Find resources

✅ Caseworker Dashboard  http://localhost:3000/caseworker
   - Manage cases
   - Allocate resources
   - Team management
   - Analytics

✅ Admin Panel           http://localhost:3000/admin
   - System config
   - User management
   - Audit logs

✅ Backend API           http://localhost:4000
   - REST & tRPC endpoints
   - Data management
   - Encryption service

✅ Database              localhost:5432
   - Case data
   - User info
   - Resources
   - Encrypted data

✅ Monitoring            http://localhost:3001
   - Prometheus metrics
   - Grafana dashboards
   - System health
```

---

## 👥 DEFAULT ACCOUNTS

### Test Accounts (for development)

**Citizen Account**:
```
Email: citizen@haven.local
Password: test123
Access: Citizen Portal (http://localhost:3000)
```

**Caseworker Account**:
```
Email: caseworker@haven.local
Password: test123
Access: Caseworker Dashboard (http://localhost:3000/caseworker)
```

**Admin Account**:
```
Email: admin@haven.local
Password: test123
Access: Admin Panel (http://localhost:3000/admin)
```

---

## 🎯 GETTING STARTED BY ROLE

### For Citizens/Residents

**Step 1**: Read `CITIZEN_PORTAL_GUIDE.md`
- Learn how to use the portal
- Create an account
- Submit your first case

**Time**: 15 minutes

**Then**:
1. Go to http://localhost:3000
2. Create account or login
3. Create your first case
4. Chat with BB
5. Track your progress

---

### For Caseworkers

**Step 1**: Read `CASEWORKER_DASHBOARD_GUIDE.md`
- Learn the dashboard
- Create cases
- Manage resources
- Track outcomes

**Time**: 20 minutes

**Then**:
1. Go to http://localhost:3000/caseworker
2. Login with caseworker credentials
3. View your assigned cases
4. Create a test case
5. Enrich and route it
6. View analytics

---

### For Administrators

**Step 1**: Read `SETUP_GUIDE_COMPLETE.md`
- Complete system setup
- Database configuration
- Service management
- Monitoring setup

**Time**: 30 minutes

**Then**:
1. Complete initial setup
2. Verify all services
3. Configure monitoring
4. Setup users
5. Configure resources
6. Review security

---

### For Developers

**Step 1**: Read `SETUP_GUIDE_COMPLETE.md`
- Setup development environment
- Configure services
- Database setup

**Step 2**: Read relevant docs
- `HAVEN_UNIFIED_DOCUMENTATION_V2.md` - Full reference
- `ENCRYPTION_VAULT_GUIDE.md` - Encryption details
- `IMPLEMENTATION_ROADMAP.md` - Integration guide

**Time**: 1-2 hours

**Then**:
1. Complete setup
2. Explore codebase
3. Run tests
4. Make changes
5. Test locally
6. Deploy

---

## 📖 DETAILED GUIDES

### Setup Guide
**Location**: `SETUP_GUIDE_COMPLETE.md`  
**Topics**:
- Prerequisites (software & hardware)
- 5-minute quick start
- Detailed setup phases
- Environment configuration
- Database setup
- Frontend/backend setup
- Monitoring setup
- Troubleshooting
- Cleanup & reset

**Use when**: Installing Haven for the first time

---

### Caseworker Dashboard
**Location**: `CASEWORKER_DASHBOARD_GUIDE.md`  
**Topics**:
- Dashboard overview
- Accessing dashboard
- Managing cases
- Enriching cases with AI
- Routing to resources
- Team management
- Analytics & reports
- Security & privacy

**Use when**: Managing cases

---

### Citizen Portal
**Location**: `CITIZEN_PORTAL_GUIDE.md`  
**Topics**:
- Portal overview
- Creating account
- Creating cases
- Tracking progress
- Chat with BB
- Finding resources
- Account management
- Privacy & security

**Use when**: Getting help as a citizen

---

## 🧪 TEST SCENARIOS

### Scenario 1: Citizen Creates Case (15 minutes)

**Goal**: Create a case and track it

**Steps**:
1. Open http://localhost:3000
2. Click "Sign Up"
3. Create account (or use test account)
4. Click "Create New Case"
5. Fill in details (housing need)
6. Click "Submit"
7. View case in dashboard
8. Chat with BB assistant

**Result**: Case created and visible in system

---

### Scenario 2: Caseworker Manages Case (15 minutes)

**Goal**: Manage and route a case

**Steps**:
1. Open http://localhost:3000/caseworker
2. Login (caseworker@haven.local / test123)
3. View assigned cases
4. Click a case
5. Click "Enrich Case" (AI analysis)
6. Click "Route Case" (assign resource)
7. Select resource
8. View updated case status

**Result**: Case enriched and routed to resource

---

### Scenario 3: End-to-End Flow (30 minutes)

**Goal**: Complete case from creation to resolution

**Steps**:

1. **Citizen Creates Case**:
   - Open http://localhost:3000
   - Create account
   - Submit housing case

2. **Caseworker Reviews**:
   - Open http://localhost:3000/caseworker
   - See new case
   - Review details

3. **Caseworker Enriches**:
   - Click "Enrich Case"
   - See AI analysis
   - Review recommendations

4. **Caseworker Routes**:
   - Click "Route Case"
   - Assign shelter
   - Notify resource

5. **Citizen Tracks**:
   - Go back to http://localhost:3000
   - View case
   - See assigned shelter
   - Chat with BB for shelter info

6. **Caseworker Closes**:
   - Update status to RESOLVED
   - Add completion note
   - Case complete

**Result**: Complete case management flow

---

## 🔐 ENCRYPTION VERIFICATION

### Test Encryption
```bash
# Run encryption examples
cd backend
npx ts-node src/lib/examples.ts

# Expected output:
# ✅ Basic encryption/decryption
# ✅ Security: wrong key rejection
# ✅ Tamper detection
# ✅ Production service usage
# ✅ Key rotation flow
# ✅ Audit trail integration
```

### Verify Encrypted Data
1. Create a case with personal info
2. Open case in caseworker dashboard
3. Click "Show Details" on encrypted field
4. Data decrypted (action logged)
5. Check audit trail in admin panel

---

## 📊 MONITORING & HEALTH CHECKS

### System Health
```bash
# Check all services
docker compose ps

# Check logs
docker compose logs -f

# Test API
curl http://localhost:4000/api/health

# View metrics
open http://localhost:9090  # Prometheus
open http://localhost:3001  # Grafana
```

### Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| Port in use | Change port or kill process |
| DB not ready | Wait 30 seconds, check `docker compose logs db` |
| Backend won't start | Check `VAULT_MASTER_KEY` is set |
| Frontend blank | Clear Docker cache, rebuild |
| Encryption fails | Verify `VAULT_MASTER_KEY` matches |

---

## 🎓 LEARNING PATH

### Day 1: Setup & Basics (2 hours)
- Read `SETUP_GUIDE_COMPLETE.md`
- Run all services
- Verify everything works
- Create test accounts

### Day 2: Citizen Portal (1 hour)
- Read `CITIZEN_PORTAL_GUIDE.md`
- Create citizen account
- Submit test case
- Explore features

### Day 3: Caseworker Dashboard (1 hour)
- Read `CASEWORKER_DASHBOARD_GUIDE.md`
- Login as caseworker
- View and manage cases
- Route resources

### Day 4: Advanced Topics (2-3 hours)
- Read `HAVEN_UNIFIED_DOCUMENTATION_V2.md`
- Read `ENCRYPTION_VAULT_GUIDE.md`
- Explore analytics
- Review audit logs

### Week 2+: Production Deployment
- Read `IMPLEMENTATION_ROADMAP.md`
- Read `OPERATIONAL_GUIDE.md`
- Plan deployment
- Go live

---

## ✅ QUICK REFERENCE

### URLs
- **Citizen Portal**: http://localhost:3000
- **Caseworker**: http://localhost:3000/caseworker
- **Admin**: http://localhost:3000/admin
- **API**: http://localhost:4000
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3001

### Test Credentials
- Citizen: citizen@haven.local / test123
- Caseworker: caseworker@haven.local / test123
- Admin: admin@haven.local / test123
- Database: pathway_prod / PathwaySecure2026
- Grafana: admin / PathwayAnalytics202

### Common Commands
```bash
# Start all
docker compose up -d

# Stop all
docker compose down

# View status
docker compose ps

# View logs
docker compose logs -f

# Rebuild
docker compose build

# Database access
docker exec -it pathway-db psql -U pathway_prod -d pathway_prod

# Run migrations
npx prisma db push

# Run tests
npm run test
```

---

## 📞 SUPPORT

### Documentation
- Setup: `SETUP_GUIDE_COMPLETE.md`
- Users: `CITIZEN_PORTAL_GUIDE.md` or `CASEWORKER_DASHBOARD_GUIDE.md`
- Technical: `HAVEN_UNIFIED_DOCUMENTATION_V2.md`
- Troubleshooting: See respective guides

### Contact
- Email: support@haven.local
- Slack: #haven-support
- GitHub Issues: [your-repo]/issues

---

## 🎊 YOU'RE READY!

You now have:
- ✅ Complete setup guide
- ✅ Citizen portal guide
- ✅ Caseworker dashboard guide
- ✅ Test scenarios
- ✅ Troubleshooting help
- ✅ Reference materials

**Next Step**: Choose your role above and start reading the appropriate guide!

---

**Haven v4.0**  
**Complete Setup & User Guides**  
**Status**: Ready to Use  
**Time to Ready**: 30 minutes
