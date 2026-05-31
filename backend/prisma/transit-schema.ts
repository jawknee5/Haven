// Prisma Schema Extensions - Transportation System
// Add to backend/prisma/schema.prisma

/*
// ========== TRANSPORTATION & TRANSIT SYSTEM ==========

model TransitRoute {
  id              String    @id @default(cuid())
  routeName       String
  routeNumber     String?
  routeColor      String    @default("#000000")
  textColor       String    @default("#FFFFFF")
  transitMode     String    // bus, train, light-rail, subway, plane, ferry, etc.
  transportationType String  // ground, air, water
  description     String?   @db.LongText
  operatingHours  Json?     // { start: "05:00", end: "23:00" }
  agency          String?   // VTA, Caltrain, BART, etc.
  
  isActive        Boolean   @default(true)
  
  stops           TransitStop[]
  vehicles        TransitVehicle[]
  arrivals        TransitArrival[]
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  @@index([transitMode])
  @@index([transportationType])
  @@index([isActive])
}

model TransitStop {
  id              String    @id @default(cuid())
  routeId         String
  route           TransitRoute @relation(fields: [routeId], references: [id], onDelete: Cascade)
  
  stopName        String
  latitude        Float
  longitude       Float
  address         String?
  sequence        Int       // Order in route
  
  arrivals        TransitArrival[]
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  @@unique([routeId, sequence])
  @@index([routeId])
  @@index([latitude, longitude])
}

model TransitVehicle {
  id              String    @id @default(cuid())
  routeId         String
  route           TransitRoute @relation(fields: [routeId], references: [id], onDelete: Cascade)
  
  vehicleNumber   String    @unique
  currentLatitude Float
  currentLongitude Float
  currentStopId   String?
  nextStopId      String?
  
  status          String    // in-transit, stopped, delayed, out-of-service
  occupancy       Int?      // 0-100 percentage
  heading         Int?      // 0-360 degrees
  speed           Float?    // km/h
  
  lastUpdate      DateTime  @default(now()) @updatedAt
  isActive        Boolean   @default(true)
  
  createdAt       DateTime  @default(now())
  
  @@index([routeId])
  @@index([isActive])
  @@index([lastUpdate])
}

model TransitArrival {
  id              String    @id @default(cuid())
  routeId         String
  route           TransitRoute @relation(fields: [routeId], references: [id], onDelete: Cascade)
  
  stopId          String
  stop            TransitStop @relation(fields: [stopId], references: [id], onDelete: Cascade)
  
  vehicleId       String?
  arrivalTime     DateTime
  departureTime   DateTime?
  
  status          String    // on-time, delayed, cancelled
  occupancy       Int?
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  @@index([stopId])
  @@index([routeId])
  @@index([arrivalTime])
}

model TransitFavorite {
  id              String    @id @default(cuid())
  userId          String
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  routeId         String?
  route           TransitRoute? @relation(fields: [routeId], references: [id], onDelete: SetNull)
  
  stopId          String?
  stop            TransitStop? @relation(fields: [stopId], references: [id], onDelete: SetNull)
  
  label           String?   // "My commute", "Downtown shuttle", etc.
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  @@unique([userId, routeId, stopId])
  @@index([userId])
}

// Update User model to include:
// transitFavorites    TransitFavorite[]
*/
