# 👔 CASEWORKER DASHBOARD GUIDE - Complete How-To

**Purpose**: Master the Caseworker Dashboard for case management  
**Time**: 15 minutes to learn, use daily  
**Audience**: Case managers, supervisors, administrators  

---

## 🎯 OVERVIEW

The Caseworker Dashboard is Haven's central hub for managing cases, routing resources, and tracking outcomes.

**Key Sections**:
- Dashboard (overview & metrics)
- Cases (list, view, manage)
- Resources (available services)
- Team Management (caseworkers)
- Analytics (reporting & trends)
- Settings (configuration)

---

## 🚀 ACCESSING THE DASHBOARD

### Login
1. Open: **http://localhost:3000/caseworker**
2. Or from citizen portal: Click "Caseworker Dashboard" (if authorized)

### Login Credentials
```
Email: caseworker@haven.local
Password: test123
```

### First Login
- Accept terms
- Set profile preferences
- Configure notification settings
- Setup resource filters

---

## 📊 DASHBOARD SECTION

### Overview Tab
**What You See**:
- Total cases assigned
- Open vs. closed cases
- Pending actions
- Team performance
- Quick stats

**Actions**:
- View key metrics
- See top priorities
- Access recent cases
- View notifications

### Case Summary Widget
```
Total Cases: 47
├─ New: 12
├─ In Progress: 23
├─ Resolved: 8
├─ On Hold: 4
```

### Team Performance Widget
```
Team Performance
├─ John (Case Manager): 8 cases
├─ Sarah (Social Worker): 6 cases
├─ Mike (Coordinator): 5 cases
└─ Team Average: 6.3 cases/person
```

### Urgent Actions Widget
```
Requires Attention
├─ 3 cases pending approval
├─ 5 overdue follow-ups
├─ 2 resource allocation failures
└─ 1 client escalation
```

---

## 📋 CASES SECTION

### View Cases List

#### Access Cases
1. Click "Cases" in sidebar
2. You see all assigned cases

#### Case List View
```
Case ID    | Title                    | Status    | Assigned | Priority
-----------|---------------------------------|-----------|----------|----------
C-2026-001 | Housing assistance       | NEW       | You      | HIGH
C-2026-002 | Food insecurity          | ROUTED    | John     | MEDIUM
C-2026-003 | Employment support       | RESOLVED  | Sarah    | LOW
```

#### Filter Cases
```
Status:      [All ▼]  [New]  [In Progress]  [Resolved]  [On Hold]
Priority:    [All ▼]  [High]  [Medium]  [Low]
Assigned:    [All ▼]  [Me]  [Team]
Date:        [Last 7 days ▼]
```

### Open a Case

#### View Case Details
1. Click case from list
2. See full details:
   - Case description
   - Client information (encrypted)
   - History & timeline
   - Assigned resources
   - Notes & comments
   - Attached documents

#### Case Information
```
Case: C-2026-001
Title: Housing assistance
Status: NEW
Priority: HIGH
Client: John Doe (ID: CLT-001)
Assigned To: You
Created: 2026-05-14
Updated: 2026-05-14 14:23
```

#### Client Information (Encrypted)
```
⚠️ Encrypted Data
Click to decrypt (logged in audit trail)

[Show Client Details]
├─ Name: [ENCRYPTED]
├─ Phone: [ENCRYPTED]
├─ Address: [ENCRYPTED]
└─ Income: [ENCRYPTED]
```

---

## 🎬 MANAGING CASES

### Create New Case

#### Option 1: Manual Entry
1. Click "New Case" button
2. Fill in form:
   ```
   Title: [Case title]
   Description: [Detailed description]
   Category: [Housing | Food | Medical | Jobs | Other]
   Priority: [Low | Medium | High | Critical]
   Client Name: [Name]
   Contact: [Email/Phone]
   ```
3. Click "Create"
4. Case assigned ID (C-2026-XXX)

#### Option 2: From Citizen Portal
- Citizen creates case
- Auto-appears in your dashboard
- Status: NEW
- Requires your review

### Enrich Case (AI Analysis)

#### Automatic Enrichment
- Assign when case created
- Click "Enrich Case" button
- System analyzes:
  - Urgency score (0-100)
  - Category match
  - Risk factors
  - Recommended resources

#### Review Enrichment
```
Enrichment Results

Urgency Score: 87/100 (HIGH)
├─ Homeless indicators: 3
├─ Health concerns: 1
└─ Time sensitivity: Critical

Recommended Resources:
1. Downtown Emergency Shelter (90% match)
2. Housing Authority (85% match)
3. Social Services (80% match)

Risk Factors:
├─ Immediate housing needed
├─ Potential health complications
└─ Family with children
```

### Route Case (Resource Allocation)

#### Assign Resources
1. Click "Route Case" button
2. Select resources:
   ```
   Resource Type: Housing
   Available Resources:
   ☐ Downtown Emergency Shelter - 5 beds available
   ☐ Community Housing Center - 3 beds available
   ☐ Transitional Housing Program - 2 beds available
   ```
3. Click "Assign"
4. Notification sent to resource

#### Track Routing Status
```
Resource Assignment Status

Downtown Emergency Shelter
├─ Status: ACCEPTED
├─ Contact: John Smith
├─ Phone: (555) 123-4567
├─ Expected Start: Today
└─ Follow-up: Tomorrow

Timeline:
2026-05-14 14:30 - Routed to Downtown Shelter
2026-05-14 14:35 - Accepted by resource
2026-05-14 15:00 - Client notified
```

### Update Case Status

#### Status Flow
```
NEW → ENRICHED → ROUTED → IN_PROGRESS → RESOLVED
      (Optional)          (Optional)
                └─ ON_HOLD ──→ Reactivate
```

#### Change Status
1. Open case
2. Click "Update Status"
3. Select new status
4. Add note/reason
5. Click "Update"

#### Status Explanations
- **NEW**: Just created, awaiting review
- **ENRICHED**: AI analysis complete, ready to route
- **ROUTED**: Resources assigned
- **IN_PROGRESS**: Client receiving services
- **RESOLVED**: Case completed
- **ON_HOLD**: Paused, waiting for something

### Add Notes & Comments

#### Add Case Note
```
[Text area]
Add note or update...

[✓ Add Note]  [Cancel]
```

#### Notes Include
- Timestamp
- Author (your name)
- Note content
- Automatically logged to audit trail

#### View Notes
```
Case Timeline
2026-05-14 15:45 - You: "Client called, confirmed appointment"
2026-05-14 15:30 - John: "Resource contacted client"
2026-05-14 15:00 - System: "Case routed to Downtown Shelter"
```

### Upload Documents

#### Add Documents
1. Click "Documents" tab
2. Drag & drop or click to upload
3. Documents encrypted automatically
4. Encrypted in database

#### Document Types
- Intake forms
- Assessments
- Medical records
- ID documents
- Agreements
- Follow-up notes

---

## 👥 RESOURCES SECTION

### View Available Resources

#### Resource List
```
Resource Name              | Type    | Capacity | Available
--------------------------|---------|----------|----------
Downtown Emergency Shelter | Housing | 50       | 5
Community Food Bank       | Food    | 200      | 45
Job Training Center       | Employment | 30   | 8
Medical Clinic           | Health  | 100      | 22
```

### Filter Resources
```
Category:    [All ▼]  [Housing]  [Food]  [Medical]  [Jobs]
Status:      [Active ▼]  [Active]  [Full]  [Closed]
Distance:    [Any ▼]  [< 1 mile]  [< 5 miles]  [< 10 miles]
```

### Manage Resource Capacity

#### Update Availability
1. Click resource name
2. Adjust capacity:
   ```
   Total Capacity: 50
   Current Usage: 45
   Available: 5
   
   [Update Capacity]
   ```
3. Add note if changing
4. System tracks history

---

## 👨‍💼 TEAM MANAGEMENT

### View Team Members
```
Team: Haven Case Management

John Smith (Case Manager)
├─ Cases: 8
├─ Avg Priority: Medium
└─ Status: Online

Sarah Chen (Social Worker)
├─ Cases: 6
├─ Avg Priority: High
└─ Status: Away

Mike Johnson (Coordinator)
├─ Cases: 5
├─ Avg Priority: Low
└─ Status: Online
```

### Assign Cases to Team
1. Open case
2. Click "Assign"
3. Select team member
4. Click "Assign"
5. Notification sent

### View Team Performance
```
Performance Metrics

Cases Completed (This Month): 23
├─ John: 8
├─ Sarah: 9
├─ Mike: 6

Resolution Time (Average)
├─ John: 5.2 days
├─ Sarah: 4.8 days
├─ Mike: 6.1 days

Client Satisfaction
├─ John: 4.8/5
├─ Sarah: 4.9/5
├─ Mike: 4.6/5
```

---

## 📊 ANALYTICS SECTION

### View Reports

#### Case Analytics
```
Cases by Status
├─ New: 12 (15%)
├─ In Progress: 23 (28%)
├─ Resolved: 38 (47%)
└─ On Hold: 8 (10%)

Cases by Category
├─ Housing: 34 (42%)
├─ Food: 22 (27%)
├─ Medical: 15 (19%)
└─ Jobs: 10 (12%)

Cases by Priority
├─ High: 15 (18%)
├─ Medium: 38 (47%)
└─ Low: 31 (38%)
```

#### Team Analytics
```
Team Performance
├─ Total Cases: 81
├─ Avg Cases per Caseworker: 27
├─ Completion Rate: 89%
├─ Avg Resolution Time: 5.4 days

Top Performer: Sarah Chen (9 completed)
```

### Generate Reports

#### Create Custom Report
1. Click "Reports"
2. Select filters:
   ```
   Date Range: [Last 30 days ▼]
   Status: [All statuses ▼]
   Category: [All ▼]
   Team Member: [All ▼]
   ```
3. Click "Generate Report"
4. View or download (PDF/CSV)

---

## ⚙️ SETTINGS

### Personal Preferences
```
Profile Settings
├─ Name: [Editable]
├─ Email: [Display]
├─ Phone: [Editable]
├─ Department: [Editable]
└─ Notification Preferences: [Configure]
```

### Notification Settings
```
Email Notifications
☑ New case assigned
☑ Case status changed
☑ Resource assignment failed
☑ Client escalation
☑ Team member messages
☐ Daily summary report

SMS Notifications
☑ Urgent escalations only
```

### Resource Filters
```
Default View
├─ Show all resources ☑
├─ Show nearby resources only ☐
├─ Show available only ☑
└─ Default sort: By distance
```

---

## 📱 MOBILE ACCESS

### Mobile Dashboard
- Same features as desktop
- Touch-optimized interface
- Offline case viewing
- Push notifications

### Accessing Mobile
1. Open http://localhost:3000/caseworker on mobile
2. Or install app (if available)
3. Login with credentials
4. Full functionality available

---

## 🔐 SECURITY & PRIVACY

### Encrypted Data Handling
- Click to decrypt sensitive data
- All actions logged to audit trail
- Decryption noted in case timeline
- Automatic session timeout

### Audit Trail
```
All Your Actions Logged:
├─ Case created
├─ Case viewed
├─ Case updated
├─ Documents uploaded
├─ Decryption access
└─ Resources assigned
```

### Your Responsibilities
- ✅ Handle PII securely
- ✅ Lock computer when away
- ✅ Don't share credentials
- ✅ Report suspicious activity
- ✅ Follow data handling procedures

---

## 🆘 COMMON TASKS

### Task 1: Create and Assign a Case
```
1. Click "New Case"
2. Fill in case details
3. Click "Create"
4. Click "Enrich Case"
5. Click "Route Case"
6. Select resources
7. Click "Assign"
8. Done!
```

### Task 2: Follow Up on Client
```
1. Find case in list
2. Click to open
3. Click "Add Note"
4. Write follow-up note
5. Attach documents (if needed)
6. Click "Save"
7. Done!
```

### Task 3: View Team Performance
```
1. Click "Analytics"
2. Select "Team Performance"
3. View metrics
4. Adjust filters as needed
5. Generate report if needed
```

### Task 4: Update Resource Availability
```
1. Click "Resources"
2. Find resource
3. Click to open
4. Click "Update Capacity"
5. Adjust numbers
6. Click "Save"
7. Done!
```

---

## ❓ FAQ

**Q: How do I decrypt client data?**  
A: Click "Show Details" button next to encrypted field. All decryptions are logged.

**Q: What if I can't route a case?**  
A: Check resource availability. May need to try different resource type or add to waitlist.

**Q: How do I know if a client was assigned?**  
A: Check case status - will show ROUTED. View timeline for notifications sent.

**Q: Can I reassign a case?**  
A: Yes, click case → "Reassign" → select new resource. Old resource is notified.

**Q: Where are audit logs?**  
A: Admin panel → "Audit Logs". Shows all activity with timestamps.

**Q: How long does AI enrichment take?**  
A: Usually 1-2 seconds. May take up to 30 seconds for complex cases.

**Q: Can I export reports?**  
A: Yes, go to Reports → Select filters → Generate → Download PDF/CSV.

**Q: What if I made a mistake?**  
A: Contact admin. All changes logged so they can help fix it.

---

## 🎓 TRAINING RESOURCES

### Video Tutorials (Coming Soon)
- Dashboard Overview
- Creating Cases
- Routing Resources
- Managing Team
- Running Reports

### Documentation
- Complete API Reference: `HAVE N_UNIFIED_DOCUMENTATION_V2.md`
- Troubleshooting: `ENCRYPTION_VAULT_GUIDE.md`
- Operations Manual: `OPERATIONAL_GUIDE.md`

### Support
- Contact: support@haven.local
- Slack: #haven-support
- Email: help@haven.local

---

## ✅ YOU'RE READY!

You now know how to:
- ✅ Access the dashboard
- ✅ Create and manage cases
- ✅ Enrich cases with AI
- ✅ Route to resources
- ✅ Manage team
- ✅ View analytics
- ✅ Handle encrypted data securely

**Start here**: http://localhost:3000/caseworker

---

**Caseworker Dashboard Guide**  
**Complete How-To**  
**Time**: 15 minutes to learn  
**Status**: Ready to Use
