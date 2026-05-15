/**
 * PATHWAY MOBILE APP - OFFICIAL REACT NATIVE COMPONENT TREE
 * Complete navigation, tabs, and sub-components
 */

// ============================================
// APP ROOT
// ============================================

export interface AppState {
  user: {
    id: string;
    name: string;
    email: string;
    role: 'individual' | 'caseworker' | 'admin';
  };
  tasks: Task[];
  resources: Resource[];
  currentTab: 'dashboard' | 'pathway' | 'resources' | 'tools' | 'pack' | 'profile';
  offlineMode: boolean;
}

// ============================================
// BOTTOM NAVIGATION TABS
// ============================================

export interface BottomNavTab {
  id: string;
  label: string;
  icon: string;
  component: React.FC;
}

export const bottomNavTabs: BottomNavTab[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'compass',
    component: DashboardTab,
  },
  {
    id: 'pathway',
    label: 'Pathway',
    icon: 'connected-nodes',
    component: PathwayTab,
  },
  {
    id: 'resources',
    label: 'Resources',
    icon: 'book',
    component: ResourcesTab,
  },
  {
    id: 'tools',
    label: 'Tools',
    icon: 'wrench',
    component: ToolsTab,
  },
  {
    id: 'pack',
    label: 'Pack',
    icon: 'backpack',
    component: PackTab,
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: 'user-silhouette',
    component: ProfileTab,
  },
];

// ============================================
// COMPONENT TREE STRUCTURE
// ============================================

/**
 * App
 *  ├─ BottomNav
 *  │   ├─ DashboardTab
 *  │   │   ├─ DynamicBackground
 *  │   │   ├─ IWillShowYouTheWayWidget
 *  │   │   ├─ TaskWidget
 *  │   │   │   ├─ TaskCard
 *  │   │   │   │   ├─ TaskHeader
 *  │   │   │   │   ├─ TaskDescription
 *  │   │   │   │   ├─ TaskStatusIndicator
 *  │   │   │   │   ├─ MicroActionButtons
 *  │   │   │   │   │   ├─ UploadButton
 *  │   │   │   │   │   ├─ CallButton
 *  │   │   │   │   │   ├─ MapButton
 *  │   │   │   │   │   └─ OpenPathwayButton
 *  │   │   │   │   └─ TaskMetadata
 *  │   │   │   └─ TaskList (scrollable)
 *  │   │   └─ StreaksAndBadges (covert analytics)
 *  │   │
 *  │   ├─ PathwayTab
 *  │   │   ├─ DynamicBackground (Google Street View)
 *  │   │   ├─ RoadmapScroll (vertical)
 *  │   │   ├─ Node[]
 *  │   │   │   ├─ NodeCircle
 *  │   │   │   │   ├─ NodeIcon
 *  │   │   │   │   ├─ CompletionIndicator
 *  │   │   │   │   └─ PulseAnimation (current)
 *  │   │   │   ├─ ConnectorLine
 *  │   │   │   └─ NodeDetailPanel (on tap)
 *  │   │   │       ├─ NodeTitle
 *  │   │   │       ├─ NodeInstructions
 *  │   │   │       ├─ StepList
 *  │   │   │       │   ├─ Step
 *  │   │   │       │   │   ├─ StepLabel
 *  │   │   │       │   │   ├─ StepCheckbox
 *  │   │   │       │   │   └─ CompletedIndicator
 *  │   │   │       ├─ NodeActions
 *  │   │   │       │   ├─ DocumentUploadButton
 *  │   │   │       │   ├─ PhoneCallButton
 *  │   │   │       │   ├─ MapNavigationButton
 *  │   │   │       │   └─ ResourceLinkButton
 *  │   │   │       └─ ClosePanelButton
 *  │   │   └─ ProgressIndicator
 *  │   │
 *  │   ├─ ResourcesTab
 *  │   │   ├─ DynamicBackground (civic buildings)
 *  │   │   ├─ CategoryGrid (3-column)
 *  │   │   │   ├─ CategoryTile
 *  │   │   │   │   ├─ CategoryIcon
 *  │   │   │   │   └─ CategoryLabel
 *  │   │   │   └─ CategoryTile[] (Housing, Food, Transit, etc.)
 *  │   │   ├─ ResourceList
 *  │   │   │   ├─ ResourceCard
 *  │   │   │   │   ├─ ResourceName
 *  │   │   │   │   ├─ ResourceDescription
 *  │   │   │   │   ├─ ResourceAddress
 *  │   │   │   │   ├─ PhoneNumber
 *  │   │   │   │   ├─ Website
 *  │   │   │   │   ├─ BookmarkButton
 *  │   │   │   │   └─ OpenResourceButton
 *  │   │   │   └─ ResourceCard[]
 *  │   │   ├─ ResourceDetail (on tap)
 *  │   │   │   ├─ FullResourceInfo
 *  │   │   │   ├─ Map
 *  │   │   │   ├─ HoursOfOperation
 *  │   │   │   ├─ Eligibility
 *  │   │   │   ├─ CallButton
 *  │   │   │   ├─ NavigateButton
 *  │   │   │   └─ CloseDetailButton
 *  │   │   └─ SearchBar
 *  │   │
 *  │   ├─ ToolsTab
 *  │   │   ├─ DynamicBackground (abstract tech)
 *  │   │   ├─ ToolGrid
 *  │   │   │   ├─ ToolTile
 *  │   │   │   │   ├─ ToolIcon
 *  │   │   │   │   └─ ToolLabel
 *  │   │   │   ├─ ToolTile (Scanner)
 *  │   │   │   ├─ ToolTile (ID Verify)
 *  │   │   │   ├─ ToolTile (Case Notes)
 *  │   │   │   ├─ ToolTile (Scheduler)
 *  │   │   │   ├─ ToolTile (Eligibility)
 *  │   │   │   ├─ ToolTile (Address Validator)
 *  │   │   │   ├─ ToolTile (Offline Forms)
 *  │   │   │   ├─ ToolTile (Resource Matcher)
 *  │   │   │   └─ ToolTile (Crisis Routing)
 *  │   │   └─ ToolScreens
 *  │   │       ├─ DocumentScanner
 *  │   │       ├─ IDVerification
 *  │   │       ├─ CaseNotesRecorder
 *  │   │       ├─ AppointmentScheduler
 *  │   │       ├─ EligibilityEstimator
 *  │   │       ├─ AddressValidator
 *  │   │       ├─ OfflineFormFiller
 *  │   │       ├─ ResourceMatcher
 *  │   │       └─ CrisisRoutingTool
 *  │   │
 *  │   ├─ PackTab
 *  │   │   ├─ DynamicBackground (forest/wilderness)
 *  │   │   ├─ SurvivalBook (submodule)
 *  │   │   │   ├─ CategoryGrid
 *  │   │   │   │   ├─ CategoryTile
 *  │   │   │   │   │   ├─ WildernessBasics
 *  │   │   │   │   │   ├─ FirstAid
 *  │   │   │   │   │   ├─ WaterPurification
 *  │   │   │   │   │   ├─ Firecraft
 *  │   │   │   │   │   ├─ ShelterBuilding
 *  │   │   │   │   │   ├─ Navigation
 *  │   │   │   │   │   ├─ Foraging
 *  │   │   │   │   │   ├─ EmergencyProtocols
 *  │   │   │   │   │   ├─ KnotTying
 *  │   │   │   │   │   ├─ UrbanSurvival
 *  │   │   │   │   │   └─ DisasterReadiness
 *  │   │   │   │   └─ CategoryTile[]
 *  │   │   │   ├─ ArticleList
 *  │   │   │   │   ├─ ArticleCard
 *  │   │   │   │   │   ├─ ArticleTitle
 *  │   │   │   │   │   ├─ ArticlePreview
 *  │   │   │   │   │   └─ ReadButton
 *  │   │   │   │   └─ ArticleCard[]
 *  │   │   │   └─ ArticleDetail
 *  │   │   │       ├─ ArticleHeader
 *  │   │   │       ├─ ArticleContent
 *  │   │   │       ├─ ImageGallery
 *  │   │   │       ├─ RelatedArticles
 *  │   │   │       ├─ ShareButton
 *  │   │   │       ├─ BookmarkButton
 *  │   │   │       └─ BackButton
 *  │   │   └─ OfflinePackIndicator
 *  │   │
 *  │   └─ ProfileTab
 *  │       ├─ DynamicBackground
 *  │       ├─ UserInfo
 *  │       │   ├─ Avatar
 *  │       │   ├─ UserName
 *  │       │   ├─ UserEmail
 *  │       │   ├─ UserRole
 *  │       │   └─ EditProfileButton
 *  │       ├─ AgencySettings
 *  │       ├─ OfflineDataManager
 *  │       │   ├─ SyncStatus
 *  │       │   ├─ SyncButton
 *  │       │   └─ DataUsageIndicator
 *  │       ├─ Notifications
 *  │       ├─ Appearance (Pathway theme only)
 *  │       ├─ Permissions
 *  │       ├─ Logout
 *  │       └─ AccountSettings
 *  │
 *  └─ Modals
 *      ├─ CinematicMapNavigation
 *      │   ├─ MapView
 *      │   ├─ OriginMarker ("This is where your Path begins.")
 *      │   ├─ DestinationMarker ("This is where this Path ends.")
 *      │   ├─ RouteLineAnimation
 *      │   ├─ PITstopMarkers (cascading resource icons)
 *      │   ├─ PathwayLabel ("This is your Path.")
 *      │   ├─ PITstopsLabel ("These are your PITstops.")
 *      │   └─ ConfirmNavigationButton
 *      ├─ DocumentUploadModal
 *      ├─ TaskDetailModal
 *      └─ ResourceDetailModal
 */

// ============================================
// TYPESCRIPT INTERFACES
// ============================================

export interface Task {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate: string | null;
  steps: TaskStep[];
  actions: TaskActions;
  analytics: TaskAnalytics;
  createdAt: string;
  completedAt: string | null;
}

export interface TaskStep {
  id: string;
  label: string;
  completed: boolean;
  completedAt: string | null;
}

export interface TaskActions {
  upload?: {
    enabled: boolean;
    acceptedTypes: ('image' | 'pdf')[];
  };
  call?: {
    enabled: boolean;
    phoneNumber: string;
  };
  map?: {
    enabled: boolean;
    destination: {
      lat: number;
      lng: number;
      address: string;
    };
  };
  openResource?: {
    enabled: boolean;
    resourceId: string;
  };
}

export interface TaskAnalytics {
  streakImpact: number;
  badgeTriggers: string[];
  completionWeight: number;
}

export interface Resource {
  id: string;
  name: string;
  description: string;
  category: string;
  address: string;
  lat: number;
  lng: number;
  phone?: string;
  website?: string;
  email?: string;
  hoursOfOperation?: string;
  eligibility?: string;
}

export interface Node {
  id: string;
  taskId: string;
  position: number;
  title: string;
  instructions: string;
  completed: boolean;
  current: boolean;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string | null;
}

export interface Streak {
  current: number;
  highest: number;
  startDate: string;
}

// ============================================
// THEME PROVIDER
// ============================================

export const pathwayTheme = {
  colors: {
    primary: '#1F6F78',
    secondary: '#1E3A5F',
    background: '#0F1F33',
    surface: '#0A1A2F',
    text: '#E8EEF4',
    textSecondary: '#C7D1DD',
    success: '#3BB273',
    error: '#D9534F',
    warning: '#E8A23A',
  },
  typography: {
    fontFamily: 'Inter',
    sizes: {
      xs: 12,
      sm: 13,
      base: 15,
      lg: 18,
      xl: 22,
      xxl: 28,
    },
    weights: {
      light: 300,
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
  },
  motion: {
    fast: 150,
    normal: 250,
    slow: 400,
    cinematic: 600,
  },
};
