import React, { useState, useMemo } from 'react';
import { SURVIVAL_GUIDE } from '../../data/survivalGuide';

interface CampingResource {
  id: number;
  name: string;
  type: 'paid' | 'free';
  lat: number;
  lng: number;
  address: string;
  phone: string;
  services: string[];
  price?: string;
  website?: string;
}

// Bay Area Camping within 100 miles
const CAMPING_RESOURCES: CampingResource[] = [
  // Paid
  { id: 1, name: 'Big Basin Redwoods Camping', type: 'paid', lat: 37.1761, lng: -122.2313, address: 'Boulder Creek, CA 95006', phone: '(831) 338-6132', services: ['RV sites', 'Tent camping', 'Day use', 'Cabins'], price: '$35-65/night', website: 'bigbasinredwoods.org' },
  { id: 2, name: 'Sunnyvale RV Park', type: 'paid', lat: 37.3729, lng: -122.0323, address: 'Sunnyvale, CA 94086', phone: '(408) 739-0363', services: ['Full hookups', 'Cable/WiFi', 'Laundry', 'Pool'], price: '$45-75/night', website: 'sunnyvalepark.com' },
  { id: 3, name: 'Santa Cruz Beach Boardwalk Camping', type: 'paid', lat: 37.0032, lng: -122.0088, address: 'Santa Cruz, CA 95060', phone: '(831) 423-7100', services: ['Beach access', 'Boardwalk nearby', 'Shops', 'Restaurants'], price: '$55-90/night' },
  { id: 4, name: 'Mount Diablo State Park Camping', type: 'paid', lat: 37.8717, lng: -121.8723, address: 'Danville, CA 94526', phone: '(925) 837-2525', services: ['Mountain views', 'Hiking trails', 'Picnic areas', 'Restrooms'], price: '$40-70/night' },
  { id: 5, name: 'Half Moon Bay KOA', type: 'paid', lat: 37.4569, lng: -122.4298, address: 'Half Moon Bay, CA 94019', phone: '(650) 726-8654', services: ['Beach nearby', 'Hot showers', 'Camp store', 'WiFi'], price: '$50-80/night' },
  
  // Free
  { id: 6, name: 'Ohlone Regional Wilderness', type: 'free', lat: 37.4208, lng: -121.6514, address: 'Sunol, CA 94586', phone: '(888) 327-2757', services: ['Backcountry camping', 'Day use', 'Hiking trails', 'Water sources'] },
  { id: 7, name: 'Del Valle Regional Park', type: 'free', lat: 37.3871, lng: -121.6639, address: 'Livermore, CA 94550', phone: '(510) 635-0135', services: ['Group sites', 'Day use', 'Water access', 'Fishing'] },
  { id: 8, name: 'Morgan Territory Regional Park', type: 'free', lat: 37.8313, lng: -121.7297, address: 'Livermore, CA 94551', phone: '(510) 635-0135', services: ['Hiking', 'Picnic areas', 'Day use', 'Views'] },
  { id: 9, name: 'Henry W. Coe State Park', type: 'free', lat: 37.2470, lng: -121.5447, address: 'Morgan Hill, CA 95037', phone: '(408) 779-2728', services: ['Backcountry', 'Hiking', 'Camping sites', 'Water holes'] },
  { id: 10, name: 'Big Sur Coastal Camping', type: 'free', lat: 36.2704, lng: -121.8084, address: 'Big Sur, CA 93920', phone: '(831) 667-2315', services: ['Ocean views', 'Hiking', 'Remote', 'Pristine wilderness'] },
];

export default function Camping() {
  const [selectedTab, setSelectedTab] = useState<'map' | 'guide'>('map');
  const [selectedResource, setSelectedResource] = useState<CampingResource | null>(null);
  const [campingFilter, setCampingFilter] = useState<'all' | 'paid' | 'free'>('all');
  const [selectedGuideSection, setSelectedGuideSection] = useState(SURVIVAL_GUIDE.sections[0]);
  const [searchGuide, setSearchGuide] = useState('');

  const filteredResources = useMemo(() => {
    return CAMPING_RESOURCES.filter(r => 
      campingFilter === 'all' ? true : r.type === campingFilter
    );
  }, [campingFilter]);

  const filteredGuideSections = useMemo(() => {
    if (!searchGuide) return SURVIVAL_GUIDE.sections;
    return SURVIVAL_GUIDE.sections.filter(s =>
      s.title.toLowerCase().includes(searchGuide.toLowerCase()) ||
      s.content.toLowerCase().includes(searchGuide.toLowerCase())
    );
  }, [searchGuide]);

  return (
    <div style={{
      backgroundColor: '#0D0F12',
      minHeight: '100vh',
      color: '#fff',
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
          ⛺ Camping & Survival
        </h1>
        <p style={{ color: '#a7b0bc', margin: 0, fontSize: '14px' }}>
          Find camping sites & learn essential survival skills
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
          onClick={() => setSelectedTab('map')}
          style={{
            flex: 1,
            padding: '16px',
            background: selectedTab === 'map' ? 'rgba(26, 30, 36, 0.8)' : 'transparent',
            border: 'none',
            borderBottom: selectedTab === 'map' ? '3px solid #1F6F78' : 'none',
            color: selectedTab === 'map' ? '#1F6F78' : '#a7b0bc',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            transition: 'all 0.2s',
          }}
        >
          🗺️ Camping Map
        </button>
        <button
          onClick={() => setSelectedTab('guide')}
          style={{
            flex: 1,
            padding: '16px',
            background: selectedTab === 'guide' ? 'rgba(26, 30, 36, 0.8)' : 'transparent',
            border: 'none',
            borderBottom: selectedTab === 'guide' ? '3px solid #1F6F78' : 'none',
            color: selectedTab === 'guide' ? '#1F6F78' : '#a7b0bc',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            transition: 'all 0.2s',
          }}
        >
          📖 Survival Bible
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: '32px' }}>
        {selectedTab === 'map' && (
          <div>
            {/* Filter Buttons */}
            <div style={{
              display: 'flex',
              gap: '12px',
              marginBottom: '24px',
              flexWrap: 'wrap',
            }}>
              <button
                onClick={() => setCampingFilter('all')}
                style={{
                  padding: '10px 16px',
                  background: campingFilter === 'all' ? 'rgba(31, 111, 120, 0.3)' : 'rgba(26, 30, 36, 0.8)',
                  border: `2px solid ${campingFilter === 'all' ? '#1F6F78' : 'rgba(42, 47, 54, 0.6)'}`,
                  color: campingFilter === 'all' ? '#1F6F78' : '#a7b0bc',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '13px',
                  transition: 'all 0.2s',
                }}
              >
                All Sites ({CAMPING_RESOURCES.length})
              </button>
              <button
                onClick={() => setCampingFilter('paid')}
                style={{
                  padding: '10px 16px',
                  background: campingFilter === 'paid' ? 'rgba(31, 111, 120, 0.3)' : 'rgba(26, 30, 36, 0.8)',
                  border: `2px solid ${campingFilter === 'paid' ? '#1F6F78' : 'rgba(42, 47, 54, 0.6)'}`,
                  color: campingFilter === 'paid' ? '#1F6F78' : '#a7b0bc',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '13px',
                  transition: 'all 0.2s',
                }}
              >
                💵 Paid ({CAMPING_RESOURCES.filter(r => r.type === 'paid').length})
              </button>
              <button
                onClick={() => setCampingFilter('free')}
                style={{
                  padding: '10px 16px',
                  background: campingFilter === 'free' ? 'rgba(31, 111, 120, 0.3)' : 'rgba(26, 30, 36, 0.8)',
                  border: `2px solid ${campingFilter === 'free' ? '#1F6F78' : 'rgba(42, 47, 54, 0.6)'}`,
                  color: campingFilter === 'free' ? '#1F6F78' : '#a7b0bc',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '13px',
                  transition: 'all 0.2s',
                }}
              >
                ✨ Free ({CAMPING_RESOURCES.filter(r => r.type === 'free').length})
              </button>
            </div>

            {/* Camping List */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '20px',
            }}>
              {filteredResources.map(resource => (
                <div
                  key={resource.id}
                  onClick={() => setSelectedResource(resource)}
                  style={{
                    background: 'linear-gradient(135deg, rgba(26, 30, 36, 0.8), rgba(20, 23, 28, 0.9))',
                    border: selectedResource?.id === resource.id ? '2px solid #1F6F78' : '1px solid rgba(42, 47, 54, 0.8)',
                    borderRadius: '12px',
                    padding: '20px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#1F6F78';
                    e.currentTarget.style.boxShadow = '0 0 12px rgba(31, 111, 120, 0.25)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = selectedResource?.id === resource.id ? '#1F6F78' : 'rgba(42, 47, 54, 0.8)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'start',
                    marginBottom: '12px',
                  }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '700', margin: 0, maxWidth: '80%' }}>
                      {resource.name}
                    </h3>
                    <span style={{
                      padding: '4px 8px',
                      background: resource.type === 'paid' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                      color: resource.type === 'paid' ? '#F59E0B' : '#10B981',
                      borderRadius: '4px',
                      fontSize: '10px',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                    }}>
                      {resource.type === 'paid' ? '💵 Paid' : '✨ Free'}
                    </span>
                  </div>

                  <p style={{ color: '#a7b0bc', fontSize: '13px', margin: '0 0 12px 0' }}>
                    📍 {resource.address}
                  </p>

                  {resource.price && (
                    <p style={{ color: '#d4af37', fontSize: '13px', margin: '0 0 12px 0', fontWeight: '600' }}>
                      {resource.price}
                    </p>
                  )}

                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '6px',
                    marginBottom: '12px',
                  }}>
                    {resource.services.slice(0, 3).map((service, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: '10px',
                          background: 'rgba(31, 111, 120, 0.2)',
                          color: '#1F6F78',
                          padding: '4px 8px',
                          borderRadius: '4px',
                        }}
                      >
                        {service}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      window.location.href = `tel:${resource.phone}`;
                    }}
                    style={{
                      width: '100%',
                      padding: '10px',
                      background: '#1F6F78',
                      border: 'none',
                      borderRadius: '6px',
                      color: '#fff',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#2a9aa0';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#1F6F78';
                    }}
                  >
                    📞 Call: {resource.phone}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedTab === 'guide' && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 2fr',
            gap: '24px',
            maxWidth: '1400px',
            margin: '0 auto',
          }}>
            {/* Guide Navigation */}
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
                <button
                  key={section.id}
                  onClick={() => setSelectedGuideSection(section)}
                  style={{
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
              ))}
            </div>

            {/* Guide Content */}
            <div style={{
              background: 'rgba(26, 30, 36, 0.6)',
              border: '1px solid rgba(42, 47, 54, 0.6)',
              borderRadius: '12px',
              padding: '24px',
              maxHeight: 'calc(100vh - 300px)',
              overflowY: 'auto',
            }}>
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

              {selectedGuideSection.subsections && selectedGuideSection.subsections.length > 0 && (
                <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid rgba(42, 47, 54, 0.6)' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1F6F78', marginBottom: '16px' }}>
                    More Information
                  </h3>
                  {selectedGuideSection.subsections.map((subsec, idx) => (
                    <div key={idx} style={{ marginBottom: '16px' }}>
                      <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#d4af37', margin: '0 0 8px 0' }}>
                        {subsec.title}
                      </h4>
                      <p style={{ fontSize: '12px', color: '#a7b0bc', margin: 0, lineHeight: '1.6' }}>
                        {subsec.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
