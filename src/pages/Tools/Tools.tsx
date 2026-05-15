import React, { useState } from 'react';
import { SURVIVAL_GUIDE } from '../../data/survivalGuide';
import { ENHANCED_SURVIVAL_GUIDE } from '../../data/enhancedSurvivalGuide';

export default function Tools() {
  const [selectedTab, setSelectedTab] = useState<'tools' | 'field-manual'>('tools');
  const [selectedGuideSection, setSelectedGuideSection] = useState(SURVIVAL_GUIDE.sections[0]);
  const [searchGuide, setSearchGuide] = useState('');
  const [selectedTool, setSelectedTool] = useState(null);
  const [selectedKnot, setSelectedKnot] = useState<any>(null);
  const [selectedShelter, setSelectedShelter] = useState<any>(null);

  const tools = [
    {
      id: 'budget',
      name: 'Budget Tracker',
      icon: '💰',
      color: '#10B981',
      desc: 'Track income, expenses, and savings goals in real-time.',
      features: ['Income tracker', 'Expense categories', 'Monthly reports', 'Savings goals'],
      fullContent: `BUDGET TRACKER - Personal Finance Management\n\nOVERVIEW:\nMonitor all your financial activity in one secure location. Track income, categorize expenses, and work toward savings goals.\n\nFEATURES:\n• Income Tracking\n  - Log all income sources\n  - Salary, gig work, benefits\n  - Regular and one-time payments\n  - Historical records\n\n• Expense Categories\n  - Pre-defined categories (Housing, Food, Transport, Healthcare, Entertainment)\n  - Custom categories\n  - Receipt scanning\n  - Tag system for organization\n\n• Monthly Reports\n  - Income vs Expenses analysis\n  - Category breakdown charts\n  - Spending trends\n  - Monthly comparisons\n\n• Savings Goals\n  - Set target amounts\n  - Track progress\n  - Milestone celebrations\n  - Goal history\n\nHOW TO USE:\n1. Start by entering your monthly income\n2. Categorize all expenses as they occur\n3. Review reports at month-end\n4. Adjust budget for next month\n5. Track savings progress\n\nTIPS:\n- Log expenses immediately for accuracy\n- Review weekly, not just monthly\n- Keep receipts for verification\n- Set realistic savings goals\n- Celebrate milestones\n\nBUDGET CATEGORIES:\n- Housing (Rent, utilities, maintenance)\n- Food (Groceries, meals out)\n- Transportation (Gas, transit, vehicle)\n- Healthcare (Medications, doctor visits)\n- Entertainment (Hobbies, subscriptions)\n- Emergency Fund (Savings target)\n- Debt Repayment (Loans, credit cards)`
    },
    {
      id: 'tasks',
      name: 'Task Manager',
      icon: '✅',
      color: '#3B82F6',
      desc: 'Organize tasks, set reminders, and track progress.',
      features: ['Create tasks', 'Set priorities', 'Due dates', 'Progress tracking'],
      fullContent: `TASK MANAGER - Goal & Activity Organization\n\nOVERVIEW:\nStay organized by breaking goals into manageable tasks. Set priorities, track progress, and celebrate completions.\n\nFEATURES:\n• Create Tasks\n  - Simple text entry\n  - Detailed descriptions\n  - Subtasks for complex items\n  - Task templates\n\n• Set Priorities\n  - High/Medium/Low levels\n  - Urgent vs Important matrix\n  - Visual priority indicators\n  - Auto-prioritization\n\n• Due Dates\n  - Calendar integration\n  - Recurring tasks\n  - Reminders (1 day before, morning of)\n  - Overdue tracking\n\n• Progress Tracking\n  - Completion percentage\n  - Milestone markers\n  - Time tracking\n  - Completion history\n\nHOW TO USE:\n1. Create task with description\n2. Set priority level\n3. Add due date\n4. Set reminders\n5. Check off when complete\n6. Review progress\n\nTASK TYPES:\n- Daily tasks (routine activities)\n- Weekly tasks (recurring weekly)\n- Project tasks (long-term goals)\n- One-time tasks (single events)\n\nTIPS:\n- Break large goals into smaller tasks\n- Set realistic due dates\n- Prioritize ruthlessly\n- Review daily\n- Celebrate completions\n\nPRODUCTIVITY HACKS:\n- Set 3 priority tasks daily\n- Time-block high priority\n- Review weekly progress\n- Adjust as needed\n- Build momentum`
    },
    {
      id: 'jobs',
      name: 'Job Finder',
      icon: '🔍',
      color: '#F59E0B',
      desc: 'Search, apply, and track job applications.',
      features: ['Job search', 'Apply tracking', 'Saved jobs', 'Interview prep'],
      fullContent: `JOB FINDER - Employment Search & Application Tracking\n\nOVERVIEW:\nNavigate the job market efficiently. Search opportunities, track applications, prepare for interviews, and land your next role.\n\nFEATURES:\n• Job Search\n  - Search by keywords\n  - Filter by location\n  - Salary range filters\n  - Experience level\n  - Company information\n  - Job descriptions\n\n• Apply Tracking\n  - Track application date\n  - Follow-up schedule\n  - Response tracking\n  - Status updates\n  - Notes field\n\n• Saved Jobs\n  - Bookmark interesting positions\n  - Compare multiple jobs\n  - Create job comparison charts\n  - Share with mentors\n\n• Interview Prep\n  - Company research guides\n  - Common question database\n  - Mock interview scenarios\n  - Interview tips & tricks\n  - Follow-up templates\n\nHOW TO USE:\n1. Search for jobs matching your skills\n2. Review job descriptions\n3. Customize resume for position\n4. Submit application\n5. Track status\n6. Prepare for interview\n7. Document outcome\n\nAPPLICATION TRACKING:\n- Company name & URL\n- Position title\n- Application date\n- Contact person\n- Expected follow-up date\n- Application status\n- Notes & feedback\n\nINTERVIEW PREPARATION:\n- Research company culture\n- Practice common questions\n- Prepare examples (STAR method)\n- Know your talking points\n- Plan your questions\n- Practice mock interviews\n\nTIPS FOR SUCCESS:\n- Tailor resume to job posting\n- Follow application instructions\n- Send personalized cover letters\n- Follow up after 2 weeks\n- Thank interviewers promptly\n- Network actively\n- Keep detailed records`
    },
    {
      id: 'health',
      name: 'Health Log',
      icon: '📔',
      color: '#EF4444',
      desc: 'Track wellness, appointments, and medical records.',
      features: ['Appointment tracking', 'Health notes', 'Medications', 'Test results'],
      fullContent: `HEALTH LOG - Medical & Wellness Tracking\n\nOVERVIEW:\nMaintain comprehensive health records. Track appointments, medications, test results, and wellness metrics all in one place.\n\nFEATURES:\n• Appointment Tracking\n  - Doctor appointments\n  - Specialist visits\n  - Preventive care schedule\n  - Reminder notifications\n  - Notes from visits\n\n• Health Notes\n  - Daily health observations\n  - Symptom tracking\n  - Mood & energy levels\n  - Sleep quality\n  - Exercise & nutrition\n\n• Medications\n  - Current medications list\n  - Dosage & frequency\n  - Refill schedules\n  - Side effects tracker\n  - Allergies & warnings\n\n• Test Results\n  - Lab results storage\n  - Test date & doctor\n  - Results interpretation\n  - Trending over time\n  - Normal ranges\n\nHOW TO USE:\n1. Schedule appointments\n2. Set reminders\n3. Log daily health notes\n4. Track medications\n5. Store test results\n6. Review trends\n7. Share with doctors\n\nHEALTH METRICS TO TRACK:\n- Blood pressure\n- Weight\n- Sleep hours\n- Exercise minutes\n- Water intake\n- Mood/stress level\n- Energy level\n- Pain levels\n\nMEDICATION MANAGEMENT:\n- Medication name\n- Dosage & form\n- Frequency\n- Prescribing doctor\n- Refill date\n- Pharmacy contact\n- Known side effects\n- Interactions\n\nAPPOINTMENT CHECKLIST:\n- Prepare list of concerns\n- Bring insurance card\n- List current medications\n- Note recent changes\n- Ask about test results\n- Clarify follow-up plan\n- Request copies of notes\n\nWELLNESS TIPS:\n- Regular exercise (30 min/day)\n- Balanced nutrition\n- Adequate sleep (7-9 hours)\n- Stress management\n- Regular check-ups\n- Preventive care\n- Mental health support`
    },
    {
      id: 'learning',
      name: 'Skills Hub',
      icon: '📚',
      color: '#8B5CF6',
      desc: 'Learn new skills with courses and certifications.',
      features: ['Courses', 'Certifications', 'Progress tracking', 'Badges'],
      fullContent: `SKILLS HUB - Learning & Development Platform\n\nOVERVIEW:\nInvest in yourself through continuous learning. Access courses, earn certifications, and track your skill development.\n\nFEATURES:\n• Courses\n  - Video lessons\n  - Hands-on projects\n  - Quizzes & assessments\n  - Downloadable resources\n  - Certificate of completion\n\n• Certifications\n  - Industry-recognized certs\n  - Exam preparation\n  - Study guides\n  - Practice tests\n  - Digital badges\n\n• Progress Tracking\n  - Course completion %\n  - Skill assessment scores\n  - Learning streak counter\n  - Time invested\n  - Achievement badges\n\n• Badges\n  - Skill badges earned\n  - Progress milestones\n  - Challenge completions\n  - Social sharing\n\nHOW TO USE:\n1. Browse available courses\n2. Enroll in course\n3. Complete lessons at your pace\n4. Take quizzes\n5. Complete projects\n6. Earn certificate\n7. Share achievement\n\nRECOMMENDED LEARNING PATHS:\n• Job Skills\n  - Technical skills (trade-specific)\n  - Software & tech\n  - Business skills\n  - Leadership training\n\n• Personal Development\n  - Communication\n  - Time management\n  - Financial literacy\n  - Digital literacy\n\n• Creative Skills\n  - Writing & storytelling\n  - Art & design\n  - Music & performance\n  - Photography\n\nSTUDY TIPS:\n- Set learning goals\n- Schedule regular study time\n- Take detailed notes\n- Complete all projects\n- Join study groups\n- Practice consistently\n- Review regularly\n\nCAREER ADVANCEMENT:\n- Choose relevant skills\n- Prioritize high-demand skills\n- Get industry certifications\n- Build portfolio projects\n- Network with professionals\n- Share learning publicly\n- Update resume regularly\n\nLEARNING RESOURCES:\n- Online courses (free & paid)\n- Webinars & workshops\n- Books & ebooks\n- YouTube tutorials\n- Podcasts & audio learning\n- Mentorship programs\n- Professional associations`
    },
    {
      id: 'documents',
      name: 'File Storage',
      icon: '📁',
      color: '#EC4899',
      desc: 'Securely store and organize important documents.',
      features: ['Cloud storage', 'File organization', 'Sharing', 'Backup'],
      fullContent: `FILE STORAGE - Secure Document Management\n\nOVERVIEW:\nKeep all important documents safe, organized, and accessible. Store, organize, share, and backup critical files with ease.\n\nFEATURES:\n• Cloud Storage\n  - Encrypted storage\n  - Automatic backups\n  - Version history\n  - File recovery\n  - Unlimited access\n\n• File Organization\n  - Custom folders\n  - Tagging system\n  - Search functionality\n  - Favorites\n  - Recent files\n\n• Sharing\n  - Share with specific people\n  - Set permissions (view/edit)\n  - Expiring links\n  - Password protection\n  - Share history\n\n• Backup\n  - Automatic daily backups\n  - Manual backup option\n  - Recovery options\n  - Redundant storage\n  - Disaster recovery\n\nHOW TO USE:\n1. Organize folders\n2. Upload documents\n3. Tag for searchability\n4. Share as needed\n5. Set permissions\n6. Review access logs\n7. Manage versions\n\nDOCUMENTS TO STORE:\n- Personal\n  - Birth certificate\n  - Social security card\n  - Passport\n  - Driver's license\n\n- Financial\n  - Bank statements\n  - Tax returns\n  - Receipts & invoices\n  - Insurance policies\n\n- Legal\n  - Lease agreements\n  - Contracts\n  - Will & power of attorney\n  - Medical directives\n\n- Employment\n  - Resume & cover letter\n  - Job offers\n  - Contracts\n  - Certifications\n\nSECURITY BEST PRACTICES:\n- Use strong passwords\n- Enable two-factor auth\n- Review access regularly\n- Encrypt sensitive files\n- Don't share carelessly\n- Update privacy settings\n- Monitor activity\n\nFILE ORGANIZATION SYSTEM:\n- Personal\n  - ID & Documents\n  - Financial\n  - Health\n  - Taxes\n- Employment\n  - Resume\n  - Certifications\n  - Job offers\n  - Contracts\n- Home\n  - Lease\n  - Bills\n  - Receipts\n  - Warranties\n\nBACKUP CHECKLIST:\n- Weekly backups scheduled ✓\n- Test recovery monthly ✓\n- Keep offline copy ✓\n- Encrypt backups ✓\n- Document procedures ✓\n- Update emergency contacts ✓`
    }
  ];

  const filteredGuideSections = searchGuide
    ? SURVIVAL_GUIDE.sections.filter(s =>
        s.title.toLowerCase().includes(searchGuide.toLowerCase()) ||
        s.content.toLowerCase().includes(searchGuide.toLowerCase())
      )
    : SURVIVAL_GUIDE.sections;

  return (
    <div style={{
      background: '#0D0F12',
      minHeight: '100vh',
      color: '#fff',
      fontFamily: 'system-ui, sans-serif',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{
        padding: '32px',
        textAlign: 'center',
        borderBottom: '1px solid rgba(42, 47, 54, 0.6)',
      }}>
        <h1 style={{
          fontSize: '36px',
          fontWeight: '900',
          margin: '0 0 12px 0',
          background: 'linear-gradient(135deg, #d4af37 0%, #f0d66d 50%, #d4af37 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          📖 Survival Bible
        </h1>
        <p style={{ color: '#a7b0bc', margin: 0, fontSize: '14px' }}>
          Essential tools and wilderness survival knowledge
        </p>
      </div>

      {/* Tab Switcher */}
      <div style={{
        display: 'flex',
        gap: '0',
        borderBottom: '1px solid rgba(42, 47, 54, 0.6)',
        padding: '0 32px',
      }}>
        <button
          onClick={() => setSelectedTab('tools')}
          style={{
            flex: 1,
            padding: '16px',
            background: selectedTab === 'tools' ? 'rgba(26, 30, 36, 0.8)' : 'transparent',
            border: 'none',
            borderBottom: selectedTab === 'tools' ? '3px solid #1F6F78' : 'none',
            color: selectedTab === 'tools' ? '#1F6F78' : '#a7b0bc',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            transition: 'all 0.2s',
          }}
        >
          🛠️ Life Tools
        </button>
        <button
          onClick={() => setSelectedTab('field-manual')}
          style={{
            flex: 1,
            padding: '16px',
            background: selectedTab === 'field-manual' ? 'rgba(26, 30, 36, 0.8)' : 'transparent',
            border: 'none',
            borderBottom: selectedTab === 'field-manual' ? '3px solid #1F6F78' : 'none',
            color: selectedTab === 'field-manual' ? '#1F6F78' : '#a7b0bc',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            transition: 'all 0.2s',
          }}
        >
          📕 Wilderness Field Manual
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: '32px' }}>
        {selectedTab === 'tools' && (
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '24px', color: '#d4af37' }}>
              6 Essential Life Tools
            </h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))',
              gap: '16px',
              marginBottom: '32px'
            }}>
              {tools.map(tool => (
                <div
                  key={tool.id}
                  onClick={() => setSelectedTool(tool)}
                  style={{
                    background: 'rgba(26, 30, 36, 0.8)',
                    border: `2px solid ${tool.color}33`,
                    borderRadius: '12px',
                    padding: '18px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    borderTop: `4px solid ${tool.color}`
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = tool.color;
                    e.currentTarget.style.boxShadow = `0 0 15px ${tool.color}33`;
                    e.currentTarget.style.transform = 'translateY(-4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = `${tool.color}33`;
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{ fontSize: '36px', marginBottom: '10px' }}>{tool.icon}</div>
                  <h3 style={{ fontSize: '14px', fontWeight: '700', margin: '0 0 6px 0' }}>
                    {tool.name}
                  </h3>
                  <p style={{ fontSize: '11px', color: '#a7b0bc', margin: 0, lineHeight: '1.4' }}>
                    {tool.desc}
                  </p>
                </div>
              ))}
            </div>

            {selectedTool && (
              <div style={{
                background: 'rgba(26, 30, 36, 0.9)',
                border: `1px solid ${selectedTool.color}`,
                borderRadius: '12px',
                padding: '24px',
                marginTop: '24px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <span style={{ fontSize: '32px' }}>{selectedTool.icon}</span>
                    <div>
                      <h2 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>{selectedTool.name}</h2>
                      <p style={{ fontSize: '12px', color: '#a7b0bc', margin: 0 }}>{selectedTool.desc}</p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedTool(null)} style={{
                    background: 'none',
                    border: 'none',
                    color: '#a7b0bc',
                    fontSize: '20px',
                    cursor: 'pointer'
                  }}>
                    ✕
                  </button>
                </div>

                <div style={{
                  color: '#a7b0bc',
                  fontSize: '12px',
                  lineHeight: '1.8',
                  whiteSpace: 'pre-wrap',
                  maxHeight: '600px',
                  overflowY: 'auto'
                }}>
                  {selectedTool.fullContent}
                </div>
              </div>
            )}
          </div>
        )}

        {selectedTab === 'field-manual' && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 2fr',
            gap: '24px',
            maxWidth: '1400px',
          }}>
            {/* Navigation */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              maxHeight: 'calc(100vh - 300px)',
              overflowY: 'auto',
            }}>
              <div style={{
                position: 'sticky',
                top: 0,
                background: 'rgba(13, 15, 18, 0.95)',
                padding: '12px 0',
                zIndex: 10,
              }}>
                <input
                  type="text"
                  placeholder="Search guide..."
                  value={searchGuide}
                  onChange={(e) => setSearchGuide(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    background: 'rgba(26, 30, 36, 0.8)',
                    border: '1px solid rgba(42, 47, 54, 0.6)',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '13px',
                  }}
                />
              </div>

              {filteredGuideSections.map(section => (
                <div key={section.id}>
                  <button
                    onClick={() => {
                      setSelectedGuideSection(section);
                      setSelectedKnot(null);
                      setSelectedShelter(null);
                    }}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: selectedGuideSection.id === section.id ? 'rgba(31, 111, 120, 0.3)' : 'rgba(26, 30, 36, 0.8)',
                      border: selectedGuideSection.id === section.id ? '2px solid #1F6F78' : '1px solid rgba(42, 47, 54, 0.6)',
                      color: selectedGuideSection.id === section.id ? '#1F6F78' : '#a7b0bc',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontSize: '13px',
                      fontWeight: '600',
                      transition: 'all 0.2s',
                    }}
                  >
                    {section.icon} {section.title}
                  </button>

                  {selectedGuideSection.id === section.id && section.knots && (
                    <div style={{ marginTop: '8px', marginLeft: '8px', borderLeft: '2px solid rgba(31, 111, 120, 0.3)', paddingLeft: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {section.knots.map(knot => (
                        <button
                          key={knot.id}
                          onClick={() => setSelectedKnot(knot)}
                          style={{
                            width: '100%',
                            padding: '8px 10px',
                            background: selectedKnot?.id === knot.id ? 'rgba(31, 111, 120, 0.2)' : 'transparent',
                            border: 'none',
                            color: selectedKnot?.id === knot.id ? '#1F6F78' : '#8A96A5',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            textAlign: 'left',
                            fontSize: '11px',
                            transition: 'all 0.2s',
                          }}
                        >
                          {knot.icon} {knot.name}
                        </button>
                      ))}
                    </div>
                  )}

                  {selectedGuideSection.id === section.id && section.shelters && (
                    <div style={{ marginTop: '8px', marginLeft: '8px', borderLeft: '2px solid rgba(31, 111, 120, 0.3)', paddingLeft: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {section.shelters.map(shelter => (
                        <button
                          key={shelter.name}
                          onClick={() => setSelectedShelter(shelter)}
                          style={{
                            width: '100%',
                            padding: '8px 10px',
                            background: selectedShelter?.name === shelter.name ? 'rgba(31, 111, 120, 0.2)' : 'transparent',
                            border: 'none',
                            color: selectedShelter?.name === shelter.name ? '#1F6F78' : '#8A96A5',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            textAlign: 'left',
                            fontSize: '11px',
                            transition: 'all 0.2s',
                          }}
                        >
                          {shelter.icon} {shelter.name}
                        </button>
                      ))}
                    </div>
                  )}

                  {selectedGuideSection.id === section.id && section.sections && (
                    <div style={{ marginTop: '8px', marginLeft: '8px', borderLeft: '2px solid rgba(31, 111, 120, 0.3)', paddingLeft: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {section.sections.map(subsection => (
                        <button
                          key={subsection.name}
                          onClick={() => {
                            setSelectedGuideSection({ ...section, currentSubsection: subsection.name });
                            setSelectedKnot(null);
                          }}
                          style={{
                            width: '100%',
                            padding: '8px 10px',
                            background: section.currentSubsection === subsection.name ? 'rgba(31, 111, 120, 0.2)' : 'transparent',
                            border: 'none',
                            color: section.currentSubsection === subsection.name ? '#1F6F78' : '#8A96A5',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            textAlign: 'left',
                            fontSize: '11px',
                            transition: 'all 0.2s',
                          }}
                        >
                          📖 {subsection.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Content Display */}
            <div style={{
              background: 'rgba(26, 30, 36, 0.6)',
              border: '1px solid rgba(42, 47, 54, 0.6)',
              borderRadius: '12px',
              padding: '24px',
              maxHeight: 'calc(100vh - 300px)',
              overflowY: 'auto',
            }}>
              {selectedKnot ? (
                <div>
                  <h2 style={{
                    fontSize: '24px',
                    fontWeight: '700',
                    margin: '0 0 16px 0',
                    color: '#d4af37',
                  }}>
                    {selectedKnot.icon} {selectedKnot.name}
                  </h2>

                  <div style={{ color: '#a7b0bc', fontSize: '13px', lineHeight: '1.8' }}>
                    <p><strong>Uses:</strong> {selectedKnot.uses}</p>
                    <p><strong>Difficulty:</strong> {selectedKnot.difficulty}</p>
                    <p><strong>Memory Aid:</strong> {selectedKnot.memory}</p>

                    <h3 style={{ color: '#1F6F78', marginTop: '20px', marginBottom: '12px' }}>Step-by-Step Instructions:</h3>
                    <ol style={{ paddingLeft: '20px', margin: '0 0 20px 0' }}>
                      {selectedKnot.steps.map((step, idx) => (
                        <li key={idx} style={{ marginBottom: '8px' }}>{step}</li>
                      ))}
                    </ol>

                    <p><strong>Strength:</strong> {selectedKnot.strength}</p>
                    <p><strong>Warnings:</strong> {selectedKnot.warnings}</p>

                    {selectedKnot.imageUrl && (
                      <div style={{ marginTop: '20px', padding: '12px', background: 'rgba(31, 111, 120, 0.1)', borderRadius: '6px', fontSize: '12px', color: '#8A96A5' }}>
                        Reference image: <a href={selectedKnot.imageUrl} style={{ color: '#1F6F78' }} target="_blank">View knot illustration</a>
                      </div>
                    )}
                  </div>
                </div>
              ) : selectedShelter ? (
                <div>
                  <h2 style={{
                    fontSize: '24px',
                    fontWeight: '700',
                    margin: '0 0 16px 0',
                    color: '#d4af37',
                  }}>
                    {selectedShelter.icon} {selectedShelter.name}
                  </h2>

                  <div style={{ color: '#a7b0bc', fontSize: '13px', lineHeight: '1.8' }}>
                    <p><strong>Environment:</strong> {selectedShelter.environment}</p>
                    <p><strong>Difficulty:</strong> {selectedShelter.difficulty}</p>
                    <p><strong>Time to Complete:</strong> {selectedShelter.timeToComplete}</p>

                    <h3 style={{ color: '#1F6F78', marginTop: '20px', marginBottom: '12px' }}>Materials:</h3>
                    <ul>
                      {selectedShelter.materials.map((material, idx) => (
                        <li key={idx}>{material}</li>
                      ))}
                    </ul>

                    <h3 style={{ color: '#1F6F78', marginTop: '20px', marginBottom: '12px' }}>Build Steps:</h3>
                    <ol style={{ paddingLeft: '20px' }}>
                      {selectedShelter.steps.map((step, idx) => (
                        <li key={idx} style={{ marginBottom: '8px' }}>{step}</li>
                      ))}
                    </ol>

                    <h3 style={{ color: '#1F6F78', marginTop: '20px', marginBottom: '12px' }}>Advantages:</h3>
                    <ul>
                      {selectedShelter.advantages.map((adv, idx) => (
                        <li key={idx}>{adv}</li>
                      ))}
                    </ul>

                    <h3 style={{ color: '#1F6F78', marginTop: '20px', marginBottom: '12px' }}>Disadvantages:</h3>
                    <ul>
                      {selectedShelter.disadvantages.map((dis, idx) => (
                        <li key={idx}>{dis}</li>
                      ))}
                    </ul>

                    <p style={{ marginTop: '20px' }}><strong>Modifications:</strong> {selectedShelter.modifications}</p>

                    {selectedShelter.imageUrl && (
                      <div style={{ marginTop: '20px', padding: '12px', background: 'rgba(31, 111, 120, 0.1)', borderRadius: '6px', fontSize: '12px', color: '#8A96A5' }}>
                        Reference image: <a href={selectedShelter.imageUrl} style={{ color: '#1F6F78' }} target="_blank">View shelter design</a>
                      </div>
                    )}
                  </div>
                </div>
              ) : (selectedGuideSection.currentSubsection ? (
                <div>
                  {selectedGuideSection.sections?.find(s => s.name === selectedGuideSection.currentSubsection) && (
                    <div>
                      <h2 style={{
                        fontSize: '24px',
                        fontWeight: '700',
                        margin: '0 0 16px 0',
                        color: '#d4af37',
                      }}>
                        {selectedGuideSection.sections.find(s => s.name === selectedGuideSection.currentSubsection)?.name}
                      </h2>
                      <div style={{
                        color: '#a7b0bc',
                        fontSize: '13px',
                        lineHeight: '1.8',
                        whiteSpace: 'pre-wrap',
                      }}>
                        {selectedGuideSection.sections.find(s => s.name === selectedGuideSection.currentSubsection)?.content}
                      </div>
                      {selectedGuideSection.sections.find(s => s.name === selectedGuideSection.currentSubsection)?.imageUrl && (
                        <div style={{ marginTop: '20px', padding: '12px', background: 'rgba(31, 111, 120, 0.1)', borderRadius: '6px', fontSize: '12px', color: '#8A96A5' }}>
                          Reference image: <a href={selectedGuideSection.sections.find(s => s.name === selectedGuideSection.currentSubsection)?.imageUrl} style={{ color: '#1F6F78' }} target="_blank">View illustration</a>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <h2 style={{
                    fontSize: '24px',
                    fontWeight: '700',
                    margin: '0 0 16px 0',
                    color: '#d4af37',
                  }}>
                    {selectedGuideSection.icon} {selectedGuideSection.title}
                  </h2>

                  <div style={{
                    color: '#a7b0bc',
                    fontSize: '13px',
                    lineHeight: '1.8',
                    whiteSpace: 'pre-wrap',
                    marginBottom: '24px',
                  }}>
                    {selectedGuideSection.content}
                  </div>

                  {selectedGuideSection.knots && (
                    <div>
                      <h3 style={{ color: '#1F6F78', marginBottom: '16px' }}>Select a knot from the left menu to view detailed instructions</h3>
                    </div>
                  )}

                  {selectedGuideSection.shelters && (
                    <div>
                      <h3 style={{ color: '#1F6F78', marginBottom: '16px' }}>Select a shelter design from the left menu to view build instructions</h3>
                    </div>
                  )}

                  {selectedGuideSection.sections && (
                    <div>
                      <h3 style={{ color: '#1F6F78', marginBottom: '16px' }}>Select a subsection from the left menu to view content</h3>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
