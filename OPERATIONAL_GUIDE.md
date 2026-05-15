# 🛠️ OPERATIONAL GUIDE - Apex Vault in Production

**Purpose**: Daily operations, maintenance, and emergency procedures  
**Audience**: Operations team, system administrators, on-call engineers  

---

## 📊 MONITORING DASHBOARD

### Key Metrics to Watch

```bash
# 1. Encryption Operation Time
SELECT 
  event_type,
  COUNT(*) as count,
  AVG(EXTRACT(EPOCH FROM timestamp)) as avg_time_sec
FROM vault_audit_log
WHERE timestamp > NOW() - INTERVAL '1 hour'
GROUP BY event_type;

# 2. Failed Operations
SELECT 
  result,
  error_code,
  COUNT(*) as count
FROM vault_audit_log
WHERE timestamp > NOW() - INTERVAL '24 hours'
AND result = 'FAILURE'
GROUP BY result, error_code;

# 3. Key Usage
SELECT 
  key_version,
  COUNT(*) as records
FROM encrypted_resources
GROUP BY key_version
ORDER BY key_version DESC;
```

### Alert Thresholds

| Metric | Warning | Critical |
|--------|---------|----------|
| Encrypt time | >20ms | >50ms |
| Decrypt time | >20ms | >50ms |
| Failed decrypts | >5/hour | >20/hour |
| Rotation progress | Stalled 1h | Stalled 4h |
| Database errors | >1/hour | >5/hour |

---

## 🔄 DAILY OPERATIONS

### Morning Check (30 minutes)

```bash
# 1. Check system health
curl http://localhost:4000/api/health

# 2. Verify database connectivity
docker exec haven_db pg_isready -U haven_prod

# 3. Review overnight logs
docker compose logs backend --since 10h | grep -i error

# 4. Check encryption stats
psql -h db -U haven_prod -d haven_prod -c "
  SELECT 
    COUNT(*) as total_encrypted,
    COUNT(CASE WHEN key_version=1 THEN 1 END) as v1_records
  FROM encrypted_resources;"

# 5. Verify audit logs flowing
psql -h db -U haven_prod -d haven_prod -c "
  SELECT 
    event_type,
    COUNT(*) as count
  FROM vault_audit_log
  WHERE timestamp > NOW() - INTERVAL '1 hour'
  GROUP BY event_type
  ORDER BY count DESC;"
```

### End of Day Check (15 minutes)

```bash
# 1. Check error counts
docker compose logs --tail=1000 backend | grep ERROR | wc -l

# 2. Database size check
psql -h db -U haven_prod -d haven_prod -c "
  SELECT 
    pg_size_pretty(pg_total_relation_size('encrypted_resources')) 
    as encrypted_size,
    pg_size_pretty(pg_total_relation_size('vault_audit_log')) 
    as audit_log_size;"

# 3. Backup verification
ls -lh /backups/database_backup_*.sql.gz | tail -5

# 4. Generate daily report
./scripts/daily-report.sh
```

---

## 🔑 KEY MANAGEMENT

### Checking Current Key Version

```bash
# View all key versions in system
SELECT 
  key_version,
  COUNT(*) as encrypted_records,
  MIN(created_at) as oldest_record,
  MAX(created_at) as newest_record
FROM encrypted_resources
GROUP BY key_version
ORDER BY key_version DESC;
```

### Master Key Rotation (Quarterly)

**Prerequisites**:
- [ ] Scheduled during low-traffic period (2am-4am)
- [ ] Backup current database
- [ ] Generate new master key
- [ ] Test with staging first

**Step 1: Generate new key**
```bash
NEW_KEY=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
echo "New key: $NEW_KEY"

# Save to secure location (AWS KMS recommended)
aws secretsmanager update-secret --secret-id haven/vault-master-key --secret-string $NEW_KEY
```

**Step 2: Update environment**
```bash
# Set new key in production environment
export VAULT_MASTER_KEY=$NEW_KEY

# Restart backend service
docker compose restart backend
sleep 10
```

**Step 3: Initiate rotation**
```typescript
// Via API or CLI
const vault = new VaultService(newMasterKey);
await vault.initiateKeyRotation(newMasterKey);
```

**Step 4: Monitor progress**
```bash
# Check rotation status every 5 minutes
watch -n 300 'psql -h db -U haven_prod -d haven_prod -c \
  "SELECT key_version, COUNT(*) FROM encrypted_resources GROUP BY key_version;"'
```

**Step 5: Verify completion**
```bash
# Spot-check random samples
psql -h db -U haven_prod -d haven_prod -c \
  "SELECT id, key_version FROM encrypted_resources ORDER BY RANDOM() LIMIT 10;"
```

**Step 6: Archive old key**
```bash
# Move old key to archive (keep for 1 year for compliance)
aws secretsmanager create-secret \
  --name haven/vault-master-key-archive-$(date +%Y%m%d) \
  --secret-string $OLD_KEY
```

---

## 🚨 EMERGENCY PROCEDURES

### Encryption Failure (High Severity)

**Symptoms**:
- Recurring "KEY_UNWRAP_FAILED" errors
- Unable to decrypt stored data
- Audit log shows spike in failures

**Immediate Actions**:

```bash
# 1. Alert on-call security team
slack @security-oncall "CRITICAL: Encryption failure detected"

# 2. Check master key
echo $VAULT_MASTER_KEY  # Verify key is set

# 3. Verify database
psql -h db -U haven_prod -d haven_prod -c \
  "SELECT COUNT(*) FROM encrypted_resources WHERE created_at > NOW() - INTERVAL '1 hour';"

# 4. Check recent audit logs
psql -h db -U haven_prod -d haven_prod -c \
  "SELECT * FROM vault_audit_log WHERE result='FAILURE' 
   ORDER BY timestamp DESC LIMIT 10;"
```

**Resolution Steps**:

1. **If key is wrong**: Restore correct key and restart
2. **If database corrupt**: Restore from backup
3. **If data corrupt**: Notify affected users
4. **If system issue**: Contact support

---

### Key Compromise (Critical Severity)

**Response Time**: Immediate (within 15 minutes)

**Step 1: Assess Impact**
```bash
# Count affected records
psql -h db -U haven_prod -d haven_prod -c \
  "SELECT COUNT(*) FROM encrypted_resources 
   WHERE key_version=1 AND created_at > NOW() - INTERVAL '30 days';"
```

**Step 2: Emergency Key Rotation**
```bash
# Generate emergency key
NEW_KEY=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")

# Skip normal rotation, force immediate update
# (Typically non-blocking, but in emergency can do blocking)
docker exec backend npx ts-node -e "
  const vault = require('./src/services/VaultService').default;
  new vault(process.env.VAULT_MASTER_KEY).initiateKeyRotation('$NEW_KEY');
"
```

**Step 3: Notify Stakeholders**
- [ ] Notify security team
- [ ] Notify legal team
- [ ] Notify affected users (if PII compromised)
- [ ] Document incident

**Step 4: Audit & Investigation**
- [ ] Review access logs
- [ ] Check for unauthorized decryption
- [ ] Document timeline of compromise

---

### Database Corruption

**Symptoms**:
- Decryption errors on valid data
- Audit log gaps
- Database query failures

**Recovery Steps**:

```bash
# 1. Stop all writes
docker compose exec backend npx ts-node -e "
  console.log('Stopping writes - place system in read-only mode');"

# 2. Backup current state
pg_dump -h db -U haven_prod -d haven_prod > backup_corrupted_$(date +%s).sql

# 3. Identify corrupted records
psql -h db -U haven_prod -d haven_prod -c "
  SELECT id, resource_type, created_at 
  FROM encrypted_resources 
  WHERE ciphertext IS NULL OR iv IS NULL;"

# 4. Either:
#    a) Delete corrupted records (if not critical)
#    b) Restore from backup (if widespread)

# 5. Resume normal operation
# docker compose up -d
```

---

### Disk Space Exhaustion

**Prevention**:
```bash
# Check disk usage
docker exec haven_db du -sh /var/lib/postgresql/data

# Set up alert at 80% capacity
# Configure daily cleanup:
docker compose exec haven_db vacuumdb -U haven_prod -d haven_prod -F
```

**If Exhausted**:
```bash
# 1. Archive old audit logs
psql -h db -U haven_prod -d haven_prod -c \
  "CREATE TABLE vault_audit_log_archive AS 
   SELECT * FROM vault_audit_log 
   WHERE timestamp < NOW() - INTERVAL '90 days';"

# 2. Delete archived logs
psql -h db -U haven_prod -d haven_prod -c \
  "DELETE FROM vault_audit_log 
   WHERE timestamp < NOW() - INTERVAL '90 days';"

# 3. Run vacuum
docker exec haven_db vacuumdb -U haven_prod -d haven_prod -F

# 4. Expand storage if needed
# docker volume ls | grep pgdata
# (Expand volume via infrastructure)
```

---

## 📋 MAINTENANCE SCHEDULE

### Daily
- [ ] Morning health check
- [ ] Monitor error logs
- [ ] Check disk space

### Weekly
- [ ] Review encryption statistics
- [ ] Check audit log completeness
- [ ] Verify backup success
- [ ] Security update review

### Monthly
- [ ] Full system health audit
- [ ] Performance analysis
- [ ] Compliance report
- [ ] Disaster recovery test

### Quarterly
- [ ] Key rotation
- [ ] Security assessment
- [ ] Performance optimization
- [ ] Team training refresh

### Annually
- [ ] Major security audit
- [ ] Compliance certification
- [ ] Disaster recovery drill
- [ ] Strategic review

---

## 📋 CHECKLIST: Normal Operations

### Pre-Deployment
- [ ] Master key secured in KMS
- [ ] Database backed up
- [ ] Monitoring configured
- [ ] Team trained
- [ ] Documentation updated
- [ ] Runbook published

### After Deployment
- [ ] System health verified
- [ ] All tests passing
- [ ] Encryption working
- [ ] Audit logs flowing
- [ ] Performance acceptable
- [ ] No errors in logs

### Daily
- [ ] Morning check passed
- [ ] No alerts triggered
- [ ] Encryption stats normal
- [ ] Audit logs complete
- [ ] End of day check passed

### Weekly
- [ ] Statistics reviewed
- [ ] Backups verified
- [ ] No security incidents
- [ ] Team communication complete

---

## 📞 ESCALATION PROCEDURES

### Level 1: On-Call Engineer
- Encryption operations slow
- Audit logs delayed
- Minor database issues
- Performance degradation

**Action**: Investigate and resolve within 4 hours

### Level 2: Senior Engineer
- Encryption failures
- Key management issues
- Data integrity concerns
- Failed rotations

**Action**: Investigate and resolve within 1 hour

### Level 3: Security Team
- Key compromise
- Unauthorized access
- Data breach suspected
- Compliance violation

**Action**: Immediate incident response

### Level 4: Executive Leadership
- Significant downtime
- Data loss
- Regulatory investigation
- Public disclosure needed

**Action**: Crisis management

---

## 🔐 SECURITY CHECKLIST

### Weekly
- [ ] Review access logs
- [ ] Check for anomalies
- [ ] Verify audit trail integrity
- [ ] Confirm no PII in logs

### Monthly
- [ ] Security scan for vulnerabilities
- [ ] Penetration testing review
- [ ] Key access verification
- [ ] Compliance checklist

### Quarterly
- [ ] Security audit by external firm
- [ ] Policy review and updates
- [ ] Team security training
- [ ] Incident response drill

### Annually
- [ ] Full security assessment
- [ ] Compliance certification
- [ ] Key rotation verification
- [ ] Disaster recovery test

---

## 📊 METRICS & REPORTING

### Daily Metrics
- Encryption success rate
- Average operation time
- Failed operations count
- Audit log entries

### Weekly Report
- Encryption volume
- Performance trends
- Any incidents
- Maintenance completed

### Monthly Report
- Detailed statistics
- Trend analysis
- Capacity planning
- Recommendations

### Quarterly Report
- Security assessment
- Compliance status
- Performance review
- Key rotation status

---

## 🛠️ TROUBLESHOOTING REFERENCE

| Issue | Cause | Solution |
|-------|-------|----------|
| Encrypt slow | High load | Check CPU, scale horizontally |
| Decrypt fails | Wrong key | Verify VAULT_MASTER_KEY |
| Tamper detected | Corrupt data | Restore from backup |
| Rotation stalled | Database lock | Restart backend |
| Audit logs missing | Log job failed | Check cron job |

---

## 📞 CONTACTS

| Role | Name | Phone | Email |
|------|------|-------|-------|
| Security Lead | _______ | _____ | _______ |
| DevOps Lead | _______ | _____ | _______ |
| On-Call Engineer | Rotating | _____ | _______ |
| CTO | _______ | _____ | _______ |

---

**Operational Guide**  
**Haven v4.0 - Apex Vault**  
**Version 1.0**  
**Last Updated**: May 14, 2026
