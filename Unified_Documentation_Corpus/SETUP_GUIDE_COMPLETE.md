# 🚀 COMPLETE SETUP GUIDE - Haven v4.0 Caseworker & User Interfaces

**Purpose**: Get Haven running with Caseworker Dashboard and Citizen Portal  
**Time**: 30 minutes (first time)  
**Difficulty**: Beginner-friendly  

---

## 📋 PREREQUISITES

### Required Software
- ✅ Docker & Docker Compose (latest)
- ✅ Git
- ✅ Node.js 20+
- ✅ npm or pnpm
- ✅ OpenAI API key (optional, for AI features)

### System Requirements
- **RAM**: 4GB minimum (8GB recommended)
- **Disk**: 5GB free space
- **OS**: macOS, Linux, or Windows (WSL2)
- **Ports**: 3000, 3001, 4000, 5432, 9090 (free)

### Check Prerequisites
```bash
# Verify Docker
docker --version
docker compose --version

# Verify Node.js
node --version

# Verify Git
git --version
```

---

## 🎯 QUICK START (5 MINUTES)

### Step 1: Clone Repository
```bash
git clone https://github.com/your-org/haven.git
cd haven
```

### Step 2: Setup Environment
```bash
# Copy example env file
cp .env.example .env.local

# Or for production-like setup
cp .env.production .env
```

### Step 3: Start Services
```bash
docker compose up -d
```

### Step 4: Access Interfaces
- **Citizen Portal**: http://localhost:3000
- **Caseworker Dashboard**: http://localhost:3000/caseworker
- **Backend API**: http://localhost:4000
- **Grafana Analytics**: http://localhost:3001

---

## 🔧 DETAILED SETUP GUIDE

### Phase 1: Environment Configuration (5 minutes)

#### 1.1 Copy Environment File
```bash
cd haven
cp .env.example .env.local
```

#### 1.2 Generate Master Key for Encryption
```bash
# Generate a strong encryption key
node -e "console.log('VAULT_MASTER_KEY=' + require('crypto').randomBytes(32).toString('hex'))"

# Output example:
# VAULT_MASTER_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6

# Add to .env.local
echo "VAULT_MASTER_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6" >> .env.local
```

#### 1.3 Generate JWT Secret
```bash
# Generate JWT secret
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"

# Add to .env.local
echo "JWT_SECRET=your_jwt_secret" >> .env.local
```

#### 1.4 Add OpenAI API Key (Optional)
```bash
# If you have an OpenAI API key, add it:
echo "OPENAI_API_KEY=sk-your-key-here" >> .env.local
```

#### 1.5 Verify Configuration
```bash
# View your configuration
cat .env.local
```

---

### Phase 2: Database Setup (5 minutes)

#### 2.1 Start Database Service
```bash
docker compose up -d db
```

#### 2.2 Wait for Database to be Ready
```bash
# Check database health
docker compose exec db pg_isready -U pathway_prod

# Expected output: accepting connections
```

#### 2.3 Run Migrations
```bash
# Install dependencies (first time)
npm install
# or
pnpm install

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma db push

# Seed database (optional - creates test data)
npx prisma db seed
```

#### 2.4 Verify Database
```bash
# Connect to database
docker exec -it pathway-db psql -U pathway_prod -d pathway_prod

# Run a query
SELECT * FROM users LIMIT 1;

# Exit
\q
```

---

### Phase 3: Backend Setup (5 minutes)

#### 3.1 Install Backend Dependencies
```bash
cd backend
npm install
# or
pnpm install

cd ..
```

#### 3.2 Build Backend
```bash
docker compose build backend
```

#### 3.3 Start Backend
```bash
docker compose up -d backend
```

#### 3.4 Verify Backend
```bash
# Wait 10 seconds for startup
sleep 10

# Check backend health
curl http://localhost:4000/api/health

# Expected response:
# {"status":"ok","timestamp":"2026-05-14T...","version":"4.0"}
```

---

### Phase 4: Frontend Setup (5 minutes)

#### 4.1 Install Frontend Dependencies
```bash
npm install
# or
pnpm install
```

#### 4.2 Build Frontend
```bash
docker compose build frontend
```

#### 4.3 Start Frontend
```bash
docker compose up -d frontend
```

#### 4.4 Verify Frontend
```bash
# Wait 10 seconds for startup
sleep 10

# Check frontend
curl http://localhost:3000

# Expected: HTML response with Haven app
```

---

### Phase 5: Monitoring Setup (2 minutes)

#### 5.1 Start Monitoring Services
```bash
docker compose up -d prometheus grafana
```

#### 5.2 Access Grafana
- **URL**: http://localhost:3001
- **Username**: admin
- **Password**: PathwayAnalytics202

#### 5.3 Setup Grafana Dashboard
```bash
# Grafana will auto-connect to Prometheus
# Configure dashboards in UI
```

---

## 🌐 ACCESSING THE INTERFACES

### Citizen Portal
**URL**: http://localhost:3000

**Features**:
- Create new case/request
- Track case status
- Upload documents
- Chat with BB assistant
- View case history

**Test Account**:
```
Email: citizen@haven.local
Password: test123
```

### Caseworker Dashboard
**URL**: http://localhost:3000/caseworker

**Features**:
- View assigned cases
- Manage resources
- Route cases
- Analytics dashboard
- Team management

**Test Account**:
```
Email: caseworker@haven.local
Password: test123
```

### Admin Panel
**URL**: http://localhost:3000/admin

**Features**:
- System configuration
- User management
- Resource management
- Encryption settings
- Audit logs

**Test Account**:
```
Email: admin@haven.local
Password: test123
```

### Backend API
**URL**: http://localhost:4000

**Endpoints**:
- `/api/health` - System health
- `/trpc/case.list` - List cases
- `/trpc/resource.list` - List resources
- API Documentation: http://localhost:4000/api-docs

### Monitoring
**Prometheus**: http://localhost:9090  
**Grafana**: http://localhost:3001

---

## ✅ FULL SYSTEM START (One Command)

### Start All Services at Once
```bash
docker compose up -d
```

### Verify All Services
```bash
docker compose ps
```

Expected output:
```
NAME                STATUS
pathway-frontend    Up 2 minutes
pathway-backend     Up 2 minutes
pathway-db          Up 3 minutes
pathway-prometheus  Up 1 minute
pathway-grafana     Up 1 minute
```

### View Logs
```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f db
```

---

## 🧪 TESTING THE SETUP

### Test Citizen Portal
```bash
# 1. Open http://localhost:3000
# 2. Click "Create New Case"
# 3. Fill in case details
# 4. Submit
# Expected: Case created successfully
```

### Test Caseworker Dashboard
```bash
# 1. Open http://localhost:3000/caseworker
# 2. Login with caseworker@haven.local / test123
# 3. View cases
# 4. Assign resources
# Expected: Dashboard loads with data
```

### Test API
```bash
# Get system status
curl http://localhost:4000/api/health

# Create a case via API
curl -X POST http://localhost:4000/trpc/case.create \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Housing assistance",
    "description": "Need help finding affordable housing",
    "category": "HOUSING"
  }'
```

### Test Encryption
```bash
# Inside backend container
docker exec pathway-backend npx ts-node src/lib/examples.ts

# Expected: All 6 examples pass ✅
```

---

## 🛠️ COMMON TROUBLESHOOTING

### Port Already in Use
```bash
# Check what's using ports
lsof -i :3000
lsof -i :4000
lsof -i :5432

# Kill process
kill -9 <PID>

# Or use different ports
docker compose -f docker-compose.yml up -d --build
```

### Database Connection Failed
```bash
# Check database status
docker compose ps db

# View database logs
docker compose logs db

# Restart database
docker compose restart db

# Re-run migrations
npx prisma db push
```

### Backend Won't Start
```bash
# Check backend logs
docker compose logs backend

# Verify environment variables
docker compose config

# Rebuild backend
docker compose build --no-cache backend

# Restart backend
docker compose restart backend
```

### Frontend Blank Page
```bash
# Check frontend logs
docker compose logs frontend

# Clear Docker cache
docker system prune -a

# Rebuild frontend
docker compose build --no-cache frontend

# Restart frontend
docker compose restart frontend
```

### Encryption Key Issues
```bash
# Generate new key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Add to .env or .env.local
VAULT_MASTER_KEY=<new-key>

# Restart backend
docker compose restart backend
```

---

## 🔄 STOPPING & CLEANING UP

### Stop All Services (Keep Data)
```bash
docker compose down
```

### Stop and Remove Data
```bash
docker compose down -v
```

### Clean Docker System
```bash
docker system prune -a --volumes
```

### Reset Everything
```bash
# Stop all
docker compose down -v

# Remove all containers
docker system prune -a --volumes

# Start fresh
docker compose up -d
```

---

## 📊 MONITORING & DEBUGGING

### View System Health
```bash
# Check all services
docker compose ps

# Check resource usage
docker stats

# Check disk space
docker system df
```

### View Logs
```bash
# All logs
docker compose logs -f

# Follow specific service
docker compose logs -f backend

# Show last 100 lines
docker compose logs --tail=100 backend
```

### Access Database
```bash
# Connect to database
docker exec -it pathway-db psql -U pathway_prod -d pathway_prod

# Useful commands:
# \dt                    - List tables
# SELECT * FROM users;   - List users
# \q                     - Exit
```

### Test API Endpoints
```bash
# System health
curl http://localhost:4000/api/health

# List cases
curl http://localhost:4000/trpc/case.list

# Create case
curl -X POST http://localhost:4000/trpc/case.create \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","description":"Test case"}'
```

---

## 🔐 SECURITY CHECKLIST

Before Going to Production:

- [ ] Change all default passwords
- [ ] Generate strong JWT_SECRET
- [ ] Generate strong VAULT_MASTER_KEY
- [ ] Set NODE_ENV to production
- [ ] Enable HTTPS
- [ ] Setup firewall rules
- [ ] Enable database backups
- [ ] Setup monitoring alerts
- [ ] Review security logs
- [ ] Run security audit

---

## 📚 NEXT STEPS

### After Getting Started
1. Create test cases
2. Explore caseworker dashboard
3. Test encryption with examples
4. Setup monitoring dashboards
5. Configure resources
6. Create test users
7. Run end-to-end tests
8. Review audit logs

### For Development
- See: `Unified_Documentation_Corpus/START_HERE.md`
- See: `HAVEN_UNIFIED_DOCUMENTATION_V2.md`
- See: `ENCRYPTION_VAULT_GUIDE.md`

### For Production Deployment
- See: `IMPLEMENTATION_ROADMAP.md`
- See: `OPERATIONAL_GUIDE.md`

---

## 📞 SUPPORT

### Common Commands
```bash
# Start all services
docker compose up -d

# View status
docker compose ps

# View logs
docker compose logs -f

# Stop all
docker compose down

# Restart a service
docker compose restart backend

# Access database
docker exec -it pathway-db psql -U pathway_prod -d pathway_prod

# Run tests
npm run test

# Run examples
npx ts-node backend/src/lib/examples.ts
```

### Environment Files
- **Development**: `.env.local`
- **Production**: `.env.production` or `.env`
- **Example**: `.env.example`

### Default Credentials
- **Admin**: admin@haven.local / test123
- **Caseworker**: caseworker@haven.local / test123
- **Citizen**: citizen@haven.local / test123
- **Database**: pathway_prod / PathwaySecure2026
- **Grafana**: admin / PathwayAnalytics202

---

## ✅ VERIFICATION CHECKLIST

After setup, verify:

- [ ] Frontend loads at http://localhost:3000
- [ ] Caseworker dashboard at http://localhost:3000/caseworker
- [ ] Backend API health: http://localhost:4000/api/health
- [ ] Database connected and healthy
- [ ] Encryption working (run examples)
- [ ] Grafana accessible at http://localhost:3001
- [ ] Prometheus scraping metrics
- [ ] Can create a test case
- [ ] Can view cases in dashboard
- [ ] All services healthy (docker compose ps)

---

## 🎊 YOU'RE READY!

Haven is now running with:
- ✅ Citizen Portal
- ✅ Caseworker Dashboard
- ✅ Admin Panel
- ✅ Backend API
- ✅ Database
- ✅ Monitoring & Analytics
- ✅ Encryption System

**Start by visiting**: http://localhost:3000

---

**Haven v4.0 Setup Guide**  
**Complete Setup Instructions**  
**Time**: ~30 minutes  
**Difficulty**: Beginner  
**Status**: Ready to Use
