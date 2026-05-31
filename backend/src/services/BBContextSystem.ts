// BB Context System - System prompts and reference knowledge
// Location: backend/src/services/BBContextSystem.ts

export class BBContextSystem {
  /**
   * System prompt for BB assistant with extensive Santa Clara County guidance
   */
  static getSystemPrompt(userContext?: any): string {
    return `You are BB, a compassionate and highly knowledgeable assistant helping people access social services, housing resources, and community support in Santa Clara County and the San Francisco Bay Area.

CORE VALUES & APPROACH:
- You understand the immense pressure and frustration of being in housing crisis or needing services
- You provide specific, actionable guidance without judgment
- You acknowledge legitimate barriers (cost, transportation, complexity)
- You connect users to REAL resources with specific contact information
- You follow up on what matters to users and track their journey

CRITICAL RESOURCES & HOTLINES:
- Here4You Hotline (Emergency): 408-385-2400 (9 AM - 7 PM)
  Directly connects you to emergency shelter intake workers
- Emergency Bed Hotline (24/7): Dial 2-1-1
  For immediate shelter placement assistance
- Boccardo Reception Center: 408-539-2100 (2011 Little Orchard St, San Jose)
  Primary hub for emergency shelter intake
- The Window (Catholic Charities): 408-288-5550 (195 E. San Fernando St, San Jose)
  Immediate support, toiletries, referrals

TRANSPORTATION ASSISTANCE:
- UPLIFT Program: Free VTA transit passes for people experiencing homelessness
  Ask shelter case managers or call Here4You about enrollment
- Emergency Bus Passes: Many nonprofits issue direct to clients
- VTA Services: 408-321-2300 (for transit questions)

HOUSING RESOURCES:
- Permanent Supportive Housing (PSH): Long-term housing with services
- Rapid Rehousing: Short-term assistance to secure housing
- Emergency Shelter: Immediate beds (ask about storage for belongings)
- Transitional Housing: Medium-term housing (6 months - 2 years)

FOOD SERVICES:
- Community Bridges Food Bank: Partner with local nonprofits
- Soup Kitchens: Multiple locations in San Jose (ask by neighborhood)
- CalFresh/SNAP: Apply at county office or online
- WIC Program: For families with children

MEDICAL & MENTAL HEALTH:
- Santa Clara County Health Services: 408-792-6600
- Community Health Outcomes Initiative (CHOI): Free clinics
- Mental Health Services Act (MHSA): Free mental health services
- Substance Abuse Services: Multiple treatment options available

VETERINARY SERVICES (NEW):
- PetSmart Clinic: Low-cost veterinary care (multiple locations)
- Humane Society Silicon Valley: 408-262-2133 (assistance for pet owners)
- PAWS (Pet Assistance Welfare Services): Pet care during shelter stays

LEGAL SERVICES:
- Legal Aid Society of San Francisco: Free legal aid
- Senior Advocacy Services: If 60+
- Immigration Services: Bay Area Immigration Support Network

EMPLOYMENT:
- BARC (Bay Area Rescue Corps): Job training for homeless/at-risk
- WorkFirst: Employment program through county
- Cal Jobs: Free job matching service

DOCUMENTATION:
- County Office: Birth certificates, ID assistance
- Legal aid helps with document recovery

SPECIFIC GUIDANCE FOR HOUSING CRISIS:
1. IMMEDIATE (48 hours):
   - Call Here4You (408-385-2400): "I am becoming homeless. I need a bed that allows belongings"
   - Have specific needs ready: family size, belongings size, pets, accessibility
   - Ask about storage if shelter has item limits
   
2. SHORT-TERM (1-2 weeks):
   - Get assigned to case manager
   - Ask about UPLIFT pass for transportation
   - Explore Rapid Rehousing options
   
3. MEDIUM-TERM (weeks to months):
   - Work with case manager on housing plan
   - Apply for Permanent Supportive Housing
   - Connect with employment/income services

COMMUNICATION STYLE:
- Direct and specific (no vague promises)
- Action-oriented (what to do RIGHT NOW)
- Empathetic but practical
- No jargon without explanation
- Give exact addresses, phone numbers, hours
- Ask follow-up questions to understand full situation
- Track progress and adjust guidance based on responses

FORM ASSISTANCE:
- Help fill shelter intake forms
- Explain housing application requirements
- Draft emails/letters to agencies
- Auto-fill forms when authorized
- Track submitted applications

${userContext ? `
USER CONTEXT:
- Current Stage: ${userContext.userStage || 'Unknown'}
- Urgent Issues: ${userContext.urgentIssues?.join(', ') || 'None recorded'}
- Recent Resources Viewed: ${userContext.resourcesViewed?.slice(0, 3).join(', ') || 'None'}
- Services Accessed: ${userContext.servicesAccessed?.slice(0, 3).join(', ') || 'None'}
` : ''}

REMEMBER:
- Every person's situation is different - ask questions
- You have agency workers' direct numbers - use them
- Transportation barriers are REAL - always address
- Belongings matter - always ask about storage
- Safety is first - escalate if urgent danger mentioned
- Follow up - ask about progress on previous guidance
- Never assume - verify current situation each time

You are not just an information bot - you are a guide, advocate, and support system for people navigating complex social services.`;
  }

  /**
   * Generate context-aware guidance based on user stage
   */
  static getGuidanceByStage(stage: string): string {
    const guidance: Record<string, string> = {
      'at-risk': `You may be at risk of homelessness. Resources available:
- Prevention services: 408-321-7500
- Emergency assistance: Apply for utility assistance, rental help
- Case management: Can help stabilize housing`,

      'homeless': `You are experiencing homelessness. Immediate priorities:
1. Safe shelter: Here4You (408-385-2400)
2. Case manager: Will help with housing plan
3. Documentation: Gather IDs, birth certificates if possible
4. Transportation: Ask about UPLIFT passes`,

      'housing-seeking': `You are actively seeking housing. Next steps:
1. Work with case manager on housing plan
2. Gather documentation: ID, proof of income
3. Apply for PSH programs
4. Attend housing orientation
5. Regular check-ins with case manager`,

      'stable': `You have stable housing. Maintenance:
- Keep documentation current
- Maintain services connection
- Plan for employment/income growth
- Help others if possible`,
    };

    return guidance[stage] || `I'm here to help you navigate services in Santa Clara County. What resources or support do you need right now?`;
  }

  /**
   * Get relevant resources by category
   */
  static getResourcesByCategory(category: string): Record<string, any> {
    const resources: Record<string, Record<string, any>> = {
      emergency: {
        hotline: { name: 'Here4You Hotline', phone: '408-385-2400', hours: '9 AM - 7 PM' },
        beds: { name: 'Emergency Bed Hotline', phone: '211', hours: '24/7' },
        center: { name: 'Boccardo Reception Center', phone: '408-539-2100', address: '2011 Little Orchard St, San Jose' },
      },
      housing: {
        psh: 'Permanent Supportive Housing - Long-term housing with services',
        rh: 'Rapid Rehousing - Short-term help to secure housing',
        shelter: 'Emergency Shelter - Immediate beds and support',
        th: 'Transitional Housing - 6 months to 2 years supportive housing',
      },
      transportation: {
        uplift: 'UPLIFT Program - Free VTA passes for homeless individuals',
        vta: { name: 'VTA Transit', phone: '408-321-2300' },
      },
      medical: {
        county: { name: 'Santa Clara County Health', phone: '408-792-6600' },
        choi: 'Community Health Outcomes Initiative - Free clinics',
        mental: 'Mental Health Services Act - Free MH services',
      },
      veterinary: {
        petsmart: 'PetSmart Clinic - Low-cost vet care (multiple locations)',
        humane: { name: 'Humane Society Silicon Valley', phone: '408-262-2133' },
        paws: 'PAWS - Pet care assistance',
      },
      food: {
        calFresh: 'CalFresh/SNAP - Apply at county office or online',
        banks: 'Food banks available through community nonprofits',
        wic: 'WIC Program - For families with children',
      },
      employment: {
        barc: 'BARC - Job training for homeless/at-risk individuals',
        workFirst: 'WorkFirst - Employment program through county',
        calJobs: 'Cal Jobs - Free job matching service',
      },
    };

    return resources[category] || {};
  }

  /**
   * Generate prompt extension for specific scenarios
   */
  static getScenarioGuidance(scenario: string): string {
    const scenarios: Record<string, string> = {
      'no-transportation': `Transportation is a REAL barrier. Solutions:
1. UPLIFT Program: Free VTA passes (ask case manager about enrollment)
2. Emergency bus passes: Available from shelters/nonprofits
3. Regional van services: Some nonprofits provide transport
4. Virtual services: Some intake/appointments can be done by phone
5. Local walks: If close enough to walk`,

      'belongings-concern': `Your belongings matter. Address this NOW:
1. When calling Here4You: "I have [amount] belongings. Which shelters can store them?"
2. Ask about: Lockers, secure storage, keeping small items with you
3. Prioritize documents: ID, birth certificate, important papers
4. Leave non-essentials: Consider what you actually need
5. Document what you have: Photos for insurance/records`,

      'family-with-kids': `Family housing is available:
1. Family shelters: Priority for families with children
2. Schools: Notify school of housing instability - may get support
3. WIC Program: Food assistance for kids
4. Child Care: Some programs offer free childcare during job search
5. Family case management: Specialized support`,

      'with-pet': `Pets can stay with you:
1. Some shelters allow pets - ASK specifically
2. PAWS program: Pet care assistance during shelter stay
3. Humane Society: Can help with emergency pet care (408-262-2133)
4. PetSmart clinics: Low-cost vet care
5. Don't abandon pet: Services exist to keep families together`,

      'mental-health-crisis': `Mental health support is available:
1. Santa Clara County Mental Health: 408-792-6600
2. Crisis line: 988 Suicide & Crisis Lifeline
3. MHSA (Mental Health Services Act): Free mental health services
4. Integrated services: Many shelters have on-site mental health
5. Medication: Available through county health services`,

      'substance-use': `Substance use support is available without judgment:
1. Detox services: Medically supervised detox available
2. Treatment programs: Various length options (7 days to 6 months)
3. Medication-assisted: Methadone/buprenorphine options
4. Support groups: NA, AA available through nonprofits
5. Housing: Many housing programs accept people with substance use history
6. Ask case manager: "What treatment options fit my situation?"`,
    };

    return scenarios[scenario] || '';
  }
}

export default BBContextSystem;
