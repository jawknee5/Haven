import React, { useState, useMemo } from 'react';

interface HousingResource {
  id: number;
  name: string;
  type: 'shelter' | 'housing' | 'camping-paid' | 'camping-free';
  category: string;
  lat: number;
  lng: number;
  address: string;
  phone: string;
  services: string[];
  price?: string;
  website?: string;
}

const HOUSING_RESOURCES: HousingResource[] = [
  // Emergency Shelters
  { id: 1, name: 'First Step Communities', type: 'shelter', category: 'Emergency Shelter', lat: 37.3298, lng: -121.8945, address: '2020 Story Rd, San Jose, CA 95122', phone: '(408) 288-4777', services: ['Emergency beds', '24/7 access', 'Meals provided', 'Case management'], price: 'Free' },
  { id: 2, name: 'San Jose Rescue Mission', type: 'shelter', category: 'Emergency Shelter', lat: 37.3208, lng: -121.8735, address: '200 E Santa Clara St, San Jose, CA 95113', phone: '(408) 535-6700', services: ['Emergency beds', 'Showers', 'Meals', 'Job training'], price: 'Free' },
  { id: 3, name: 'Gilroy Shelter', type: 'shelter', category: 'Emergency Shelter', lat: 37.0060, lng: -121.5687, address: '10825 Murray Ave, Gilroy, CA 95020', phone: '(408) 842-6200', services: ['24/7 beds', 'Showers', 'Meals', 'Medical care'], price: 'Free' },
  
  // Transitional Housing
  { id: 4, name: 'Transitional Housing Program', type: 'housing', category: 'Transitional Housing', lat: 37.3510, lng: -121.8772, address: 'San Jose, CA 95110', phone: '(408) 295-4007', services: ['6-24 month program', 'Life skills training', 'Job placement', 'Mental health'], price: 'Sliding scale' },
  { id: 5, name: 'Safe Haven Transitional', type: 'housing', category: 'Transitional Housing', lat: 37.3382, lng: -121.8863, address: 'San Jose, CA 95112', phone: '(408) 287-4242', services: ['Safe housing', 'Counseling', 'Case management', 'Support services'] },
  { id: 6, name: 'Community Housing', type: 'housing', category: 'Transitional Housing', lat: 37.3650, lng: -121.8850, address: 'San Jose, CA 95128', phone: '(408) 288-5555', services: ['Affordable housing', 'Support groups', 'Life coaching', 'Family services'] },
  
  // Paid Camping
  { id: 7, name: 'Big Basin Redwoods Camping', type: 'camping-paid', category: 'Paid Camping', lat: 37.1761, lng: -122.2313, address: 'Boulder Creek, CA 95006', phone: '(831) 338-6132', services: ['RV sites', 'Tent camping', 'Day use', 'Cabins'], price: '$35-65/night' },
  { id: 8, name: 'Sunnyvale RV Park', type: 'camping-paid', category: 'Paid Camping', lat: 37.3729, lng: -122.0323, address: 'Sunnyvale, CA 94086', phone: '(408) 739-0363', services: ['Full hookups', 'Cable/WiFi', 'Laundry', 'Pool'], price: '$45-75/night' },
  { id: 9, name: 'Santa Cruz Beach Camping', type: 'camping-paid', category: 'Paid Camping', lat: 37.0032, lng: -122.0088, address: 'Santa Cruz, CA 95060', phone: '(831) 423-7100', services: ['Beach access', 'Boardwalk nearby', 'Shops', 'Restaurants'], price: '$55-90/night' },
  { id: 10, name: 'Mount Diablo Camping', type: 'camping-paid', category: 'Paid Camping', lat: 37.8717, lng: -121.8723, address: 'Danville, CA 94526', phone: '(925) 837-2525', services: ['Mountain views', 'Hiking trails', 'Picnic areas'], price: '$40-70/night' },
  { id: 11, name: 'Half Moon Bay KOA', type: 'camping-paid', category: 'Paid Camping', lat: 37.4569, lng: -122.4298, address: 'Half Moon Bay, CA 94019', phone: '(650) 726-8654', services: ['Beach nearby', 'Hot showers', 'Camp store'], price: '$50-80/night' },
  
  // Free Camping
  { id: 12, name: 'Ohlone Regional Wilderness', type: 'camping-free', category: 'Free Camping', lat: 37.4208, lng: -121.6514, address: 'Sunol, CA 94586', phone: '(888) 327-2757', services: ['Backcountry camping', 'Day use', 'Hiking trails', 'Water sources'] },
  { id: 13, name: 'Del Valle Regional Park', type: 'camping-free', category: 'Free Camping', lat: 37.3871, lng: -121.6639, address: 'Livermore, CA 94550', phone: '(510) 635-0135', services: ['Group sites', 'Day use', 'Water access', 'Fishing'] },
  { id: 14, name: 'Morgan Territory Park', type: 'camping-free', category: 'Free Camping', lat: 37.8313, lng: -121.7297, address: 'Livermore, CA 94551', phone: '(510) 635-0135', services: ['Hiking', 'Picnic areas', 'Day use', 'Views'] },
  { id: 15, name: 'Henry W. Coe State Park', type: 'camping-free', category: 'Free Camping', lat: 37.2470, lng: -121.5447, address: 'Morgan Hill, CA 95037', phone: '(408) 779-2728', services: ['Backcountry', 'Hiking', 'Camping sites'] },
  { id: 16, name: 'Big Sur Coastal', type: 'camping-free', category: 'Free Camping', lat: 36.2704, lng: -121.8084, address: 'Big Sur, CA 93920', phone: '(831) 667-2315', services: ['Ocean views', 'Hiking', 'Remote wilderness'] },
];

export default function Housing() {
  const [activeTab, setActiveTab] = useState<'housing' | 'camping'>('housing');
  const [housingFilter, setHousingFilter] = useState<'all' | 'shelter' | 'transitional'>('all');
  const [campingFilter, setCampingFilter] = useState<'all' | 'paid' | 'free'>('all');
  const [selectedResource, setSelectedResource] = useState<HousingResource | null>(null);

  const filteredHousing = useMemo(() => {
    return HOUSING_RESOURCES.filter(r => {
      if (housingFilter === 'all') return r.type === 'shelter' || r.type === 'housing';
      if (housingFilter === 'shelter') return r.type === 'shelter';
      if (housingFilter === 'transitional') return r.type === 'housing';
      return true;
    });
  }, [housingFilter]);

  const filteredCamping = useMemo(() => {
    return HOUSING_RESOURCES.filter(r => {
      if (campingFilter === 'all') return r.type === 'camping-paid' || r.type === 'camping-free';
      if (campingFilter === 'paid') return r.type === 'camping-paid';
      if (campingFilter === 'free') return r.type === 'camping-free';
      return true;
    });
  }, [campingFilter]);

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
          🏠 Housing & Shelter
        </h1>
        <p style={{ color: '#a7b0bc', margin: 0, fontSize: '14px' }}>
          Emergency shelter, transitional housing, and camping options
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
          onClick={() => setActiveTab('housing')}
          style={{
            flex: 1,
            padding: '16px',
            background: activeTab === 'housing' ? 'rgba(26, 30, 36, 0.8)' : 'transparent',
            border: 'none',
            borderBottom: activeTab === 'housing' ? '3px solid #1F6F78' : 'none',
            color: activeTab === 'housing' ? '#1F6F78' : '#a7b0bc',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            transition: 'all 0.2s',
          }}
        >
          🏠 Housing & Shelter
        </button>
        <button
          onClick={() => setActiveTab('camping')}
          style={{
            flex: 1,
            padding: '16px',
            background: activeTab === 'camping' ? 'rgba(26, 30, 36, 0.8)' : 'transparent',
            border: 'none',
            borderBottom: activeTab === 'camping' ? '3px solid #1F6F78' : 'none',
            color: activeTab === 'camping' ? '#1F6F78' : '#a7b0bc',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            transition: 'all 0.2s',
          }}
        >
          ⛺ Camping
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: '32px' }}>
        {activeTab === 'housing' && (
          <div>
            {/* Housing Filters */}
            <div style={{
              display: 'flex',
              gap: '12px',
              marginBottom: '24px',
              flexWrap: 'wrap',
            }}>
              <button
                onClick={() => setHousingFilter('all')}
                style={{
                  padding: '10px 16px',
                  background: housingFilter === 'all' ? 'rgba(31, 111, 120, 0.3)' : 'rgba(26, 30, 36, 0.8)',
                  border: `2px solid ${housingFilter === 'all' ? '#1F6F78' : 'rgba(42, 47, 54, 0.6)'}`,
                  color: housingFilter === 'all' ? '#1F6F78' : '#a7b0bc',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '13px',
                  transition: 'all 0.2s',
                }}
              >
                All Housing ({filteredHousing.length})
              </button>
              <button
                onClick={() => setHousingFilter('shelter')}
                style={{
                  padding: '10px 16px',
                  background: housingFilter === 'shelter' ? 'rgba(31, 111, 120, 0.3)' : 'rgba(26, 30, 36, 0.8)',
                  border: `2px solid ${housingFilter === 'shelter' ? '#1F6F78' : 'rgba(42, 47, 54, 0.6)'}`,
                  color: housingFilter === 'shelter' ? '#1F6F78' : '#a7b0bc',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '13px',
                  transition: 'all 0.2s',
                }}
              >
                🛏️ Emergency Shelter ({HOUSING_RESOURCES.filter(r => r.type === 'shelter').length})
              </button>
              <button
                onClick={() => setHousingFilter('transitional')}
                style={{
                  padding: '10px 16px',
                  background: housingFilter === 'transitional' ? 'rgba(31, 111, 120, 0.3)' : 'rgba(26, 30, 36, 0.8)',
                  border: `2px solid ${housingFilter === 'transitional' ? '#1F6F78' : 'rgba(42, 47, 54, 0.6)'}`,
                  color: housingFilter === 'transitional' ? '#1F6F78' : '#a7b0bc',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '13px',
                  transition: 'all 0.2s',
                }}
              >
                🏘️ Transitional ({HOUSING_RESOURCES.filter(r => r.type === 'housing').length})
              </button>
            </div>

            {/* Housing Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '20px',
            }}>
              {filteredHousing.map(resource => (
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
                      background: 'rgba(31, 111, 120, 0.2)',
                      color: '#1F6F78',
                      borderRadius: '4px',
                      fontSize: '10px',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                    }}>
                      {resource.type === 'shelter' ? '🛏️ Shelter' : '🏘️ Housing'}
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

        {activeTab === 'camping' && (
          <div>
            {/* Camping Filters */}
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
                All Camping ({filteredCamping.length})
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
                💵 Paid ({HOUSING_RESOURCES.filter(r => r.type === 'camping-paid').length})
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
                ✨ Free ({HOUSING_RESOURCES.filter(r => r.type === 'camping-free').length})
              </button>
            </div>

            {/* Camping Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '20px',
            }}>
              {filteredCamping.map(resource => (
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
                      background: resource.type === 'camping-paid' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                      color: resource.type === 'camping-paid' ? '#F59E0B' : '#10B981',
                      borderRadius: '4px',
                      fontSize: '10px',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                    }}>
                      {resource.type === 'camping-paid' ? '💵 Paid' : '✨ Free'}
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
      </div>
    </div>
  );
}
