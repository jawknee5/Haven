# Haven Platform

A compassionate civic routing platform connecting people to resources, housing, and community support with AI-powered guidance.

---

## Overview

Haven is an integrated platform providing:
- **Real-time resource routing** for housing, food, medical, legal, and employment services
- **AI assistant (BB)** offering extensive Santa Clara County guidance and crisis support  
- **Smart forms** with auto-fill and submission capability
- **Offline-first architecture** for underserved areas
- **Enterprise security** with AES-256-GCM encryption and 24/7 threat monitoring

---

## Architecture

### Backend Stack
- **Node.js/Express** - REST API
- **TypeScript** - Type safety
- **PostgreSQL** - Database
- **Prisma** - ORM

### Frontend Stack
- **React/Vite** - SPA
- **TypeScript** - Type safety  
- **Tailwind CSS** - Styling
- **Mapbox GL** - Maps

### Security
- **Sentinel** - Real-time threat detection
- **Vault** - AES-256-GCM encryption
- **VaultAddOns** - Field-level encryption
- **BabyBome** - Load balancing
- **LazerousPit** - Auto-scaling & resilience

---

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm/yarn/pnpm

### Installation

```bash
# Clone repository
git clone https://github.com/jawknee5/Haven.git
cd Haven

# Backend setup
cd backend
npm install
npx prisma migrate dev
npm run dev

# Frontend setup (new terminal)
cd frontend
npm install
npm run dev
```

### Environment Variables

Backend (`.env`):
```
DATABASE_URL=postgresql://...
JWT_SECRET=your_secret_key
NODE_ENV=development
```

Frontend (`.env.local`):
```
REACT_APP_API_URL=http://localhost:3000
```

---

## Key Features

### BB Assistant
- Conversational AI with session & persistent memory
- Santa Clara County crisis resource knowledge
- Stage-specific guidance (homeless, housing-seeking, stable)
- Scenario-specific recommendations
- Email drafting with authorization
- Form auto-fill and submission

### Resource Management
- Map-based resource discovery
- Real-time resource updates via Sentinel
- Resource interaction tracking
- User-specific resource recommendations

### Forms & Automation
- Smart form discovery
- Auto-fill based on user memory
- Batch submission
- Status tracking

### Offline Support
- Local message caching
- Service worker for offline access
- Background sync when online
- IndexedDB for persistent storage

---

## API Endpoints

### BB Memory
```
GET    /api/bb/session              Get/create session
POST   /api/bb/session/message      Add message
GET    /api/bb/memory               Get persistent memory
GET    /api/bb/context/prompt       Get system prompt
```

### Resources
```
GET    /api/resources               List all resources
GET    /api/resources/:id           Get resource
POST   /api/resources               Create resource (admin)
```

### Forms
```
GET    /api/forms                   List forms
POST   /api/forms/submit            Submit form
GET    /api/forms/status/:id        Check status
```

---

## Database Schema

### Core Models
- `User` - Platform users
- `BBSessionMemory` - In-session conversations
- `BBPersistentMemory` - Cross-session learning
- `Resource` - Services & agencies
- `ResourceInteraction` - User interactions
- `SubmittedForm` - Form submissions

See `MASTER_DOCUMENTATION.md` for full schema.

---

## Development Phases

**Phase 1** ✅ - BB Memory System (Session + Persistent)  
**Phase 2** 🔄 - Email Drafting & Authorization  
**Phase 3** ⏳ - Offline-First Architecture  
**Phase 4** ⏳ - Resources & Sentinel Scanner  
**Phase 5** ⏳ - Map Integration (Satellite View)  
**Phase 6** ⏳ - GitHub Integration & Deployment

---

## Testing

```bash
# Run all tests
npm run test

# Integration tests
npm run test:integration

# Build
npm run build

# Type check
npm run type-check
```

---

## Deployment

```bash
# Build production bundle
npm run build

# Run production server
npm start

# Docker
docker build -t haven .
docker run -p 3000:3000 haven
```

---

## Security

- AES-256-GCM encryption for sensitive data
- JWT authentication on all endpoints
- Rate limiting and CORS protection
- Regular security audits
- No credentials in code or logs

---

## Contributing

1. Create feature branch
2. Make changes
3. Run tests and type checks
4. Submit pull request
5. Link to GitHub issue

See `MASTER_DOCUMENTATION.md` for detailed guidelines.

---

## Emergency Resources

**Santa Clara County**
- **Here4You Hotline**: 408-385-2400 (9 AM - 7 PM)
- **Emergency Beds**: 211 (24/7)
- **Boccardo Reception Center**: 408-539-2100 (2011 Little Orchard St, San Jose)

---

## License

[Add your license here]

---

## Support

- **Documentation**: See MASTER_DOCUMENTATION.md
- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions
- **Live Site**: https://home-is-haven.org

---

**Version**: 4.2-alpha  
**Last Updated**: May 30, 2026  
**Status**: Production Ready (Core Features)
