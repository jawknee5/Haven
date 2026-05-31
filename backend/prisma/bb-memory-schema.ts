// BB Memory System - Schema extensions for Session & Persistent Memory
// Add these models to your existing Prisma schema.prisma file

/*
Add to backend/prisma/schema.prisma:

// ========== BB SESSION MEMORY ==========
model BBSessionMemory {
  id              String    @id @default(cuid())
  userId          String
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  sessionId       String    @unique
  conversationHistory ConversationMessage[]
  
  sessionStart    DateTime  @default(now())
  sessionEnd      DateTime?
  isActive        Boolean   @default(true)
  
  userContext     UserContext?
  preferences     UserPreferences?
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  @@index([userId])
  @@index([sessionId])
}

model ConversationMessage {
  id              String    @id @default(cuid())
  sessionMemory   BBSessionMemory @relation(fields: [sessionMemoryId], references: [id], onDelete: Cascade)
  sessionMemoryId String
  
  role            String    // "user" | "assistant" | "system"
  content         String    @db.LongText
  timestamp       DateTime  @default(now())
  
  contextTags     String[]  @default([])
  topics          String[]  @default([])
  entities        String[]  @default([])
  
  createdAt       DateTime  @default(now())
  
  @@index([sessionMemoryId])
  @@index([timestamp])
}

model UserContext {
  id              String    @id @default(cuid())
  sessionMemory   BBSessionMemory @relation(fields: [sessionMemoryId], references: [id], onDelete: Cascade)
  sessionMemoryId String    @unique
  
  currentNeeds    String[]  @default([])
  userStage       String?
  urgentIssues    String[]  @default([])
  
  currentLocation String?
  accessibilityNeeds String[]  @default([])
  
  servicesAccessed String[]  @default([])
  resourcesViewed String[]   @default([])
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

model UserPreferences {
  id              String    @id @default(cuid())
  sessionMemory   BBSessionMemory @relation(fields: [sessionMemoryId], references: [id], onDelete: Cascade)
  sessionMemoryId String    @unique
  
  communicationStyle String?
  language        String    @default("en")
  timezone        String?
  
  emailNotifications Boolean @default(false)
  smsNotifications  Boolean @default(false)
  
  preferredResources String[]  @default([])
  excludedResources String[]   @default([])
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

// ========== BB PERSISTENT MEMORY ==========
model BBPersistentMemory {
  id              String    @id @default(cuid())
  userId          String    @unique
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  allConversations ConversationHistory[]
  userProfile     UserProfile?
  preferences     StoredPreferences?
  resourceInteractions ResourceInteraction[]
  submittedForms  SubmittedForm[]
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

model ConversationHistory {
  id              String    @id @default(cuid())
  memory          BBPersistentMemory @relation(fields: [memoryId], references: [id], onDelete: Cascade)
  memoryId        String
  
  role            String
  content         String    @db.LongText
  
  contextTags     String[]  @default([])
  topics          String[]  @default([])
  sentiment       String?
  
  actionTaken     String?
  actionStatus    String?
  
  timestamp       DateTime  @default(now())
  
  @@index([memoryId])
  @@index([timestamp])
}

model UserProfile {
  id              String    @id @default(cuid())
  memory          BBPersistentMemory @relation(fields: [memoryId], references: [id], onDelete: Cascade)
  memoryId        String    @unique
  
  demographics    String?   @db.LongText
  currentSituation String?
  interests       String[]  @default([])
  services        String[]  @default([])
  
  updatedAt       DateTime  @updatedAt
}

model StoredPreferences {
  id              String    @id @default(cuid())
  memory          BBPersistentMemory @relation(fields: [memoryId], references: [id], onDelete: Cascade)
  memoryId        String    @unique
  
  communicationStyle String?
  language        String    @default("en")
  preferredCategories String[]  @default([])
  excludedServices String[]     @default([])
  
  autoFillForms   Boolean   @default(false)
  saveFormDrafts  Boolean   @default(true)
  
  updatedAt       DateTime  @updatedAt
}

model ResourceInteraction {
  id              String    @id @default(cuid())
  memory          BBPersistentMemory @relation(fields: [memoryId], references: [id], onDelete: Cascade)
  memoryId        String
  
  resourceId      String
  resourceName    String
  resourceCategory String
  
  interactionType String
  timestamp       DateTime  @default(now())
  
  notes           String?
  outcome         String?
  
  @@index([memoryId])
  @@index([resourceId])
}

model SubmittedForm {
  id              String    @id @default(cuid())
  memory          BBPersistentMemory @relation(fields: [memoryId], references: [id], onDelete: Cascade)
  memoryId        String
  
  formName        String
  formUrl         String?
  formData        String    @db.LongText
  
  status          String
  submittedAt     DateTime?
  
  autoFilledFields String[]  @default([])
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  @@index([memoryId])
  @@index([status])
}

// ========== RESOURCES ==========
model Resource {
  id              String    @id @default(cuid())
  
  name            String
  category        String
  
  address         String
  latitude        Float
  longitude       Float
  
  phone           String?
  email           String?
  website         String?
  
  hours           String?
  description     String?   @db.LongText
  services        String[]  @default([])
  eligibility     String?   @db.LongText
  notes           String?   @db.LongText
  
  verified        Boolean   @default(false)
  lastVerified    DateTime?
  
  source          String?
  sentinelTracked Boolean   @default(false)
  
  interactions    ResourceInteraction[]
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  @@index([category])
  @@index([verified])
}
*/
