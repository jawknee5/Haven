// HAVEN — Camping resources around the Bay Area / Santa Clara County.
// Used by the dedicated Camping page AND surfaced on the main resource map
// (type: 'camping') so they show up alongside shelters, food, health, etc.

export const CAMPING_RESOURCES = [
  // Paid sites
  { id: 'camp-1',  name: 'Big Basin Redwoods Camping',        kind: 'paid', lat: 37.1761, lng: -122.2313, address: 'Boulder Creek, CA 95006',     phone: '(831) 338-6132', price: '$35–65/night', website: 'bigbasinredwoods.org', services: ['RV sites', 'Tent camping', 'Day use', 'Cabins'] },
  { id: 'camp-2',  name: 'Sunnyvale RV Park',                 kind: 'paid', lat: 37.3729, lng: -122.0323, address: 'Sunnyvale, CA 94086',         phone: '(408) 739-0363', price: '$45–75/night', website: 'sunnyvalepark.com',   services: ['Full hookups', 'Cable/WiFi', 'Laundry', 'Pool'] },
  { id: 'camp-3',  name: 'Santa Cruz Beach Campground',       kind: 'paid', lat: 37.0032, lng: -122.0088, address: 'Santa Cruz, CA 95060',        phone: '(831) 423-7100', price: '$55–90/night', website: '',                    services: ['Beach access', 'Boardwalk nearby', 'Restrooms'] },
  { id: 'camp-4',  name: 'Mount Diablo State Park Camping',   kind: 'paid', lat: 37.8717, lng: -121.8723, address: 'Danville, CA 94526',          phone: '(925) 837-2525', price: '$40–70/night', website: '',                    services: ['Mountain views', 'Hiking trails', 'Picnic areas'] },
  { id: 'camp-5',  name: 'Half Moon Bay KOA',                 kind: 'paid', lat: 37.4569, lng: -122.4298, address: 'Half Moon Bay, CA 94019',     phone: '(650) 726-8654', price: '$50–80/night', website: '',                    services: ['Beach nearby', 'Hot showers', 'Camp store', 'WiFi'] },
  { id: 'camp-6',  name: 'Joseph D. Grant County Park',       kind: 'paid', lat: 37.3475, lng: -121.7283, address: '18405 Mt Hamilton Rd, San Jose, CA', phone: '(408) 274-6121', price: '$25–35/night', website: '', services: ['Tent camping', 'Equestrian', 'Hiking'] },

  // Free / dispersed sites
  { id: 'camp-7',  name: 'Ohlone Regional Wilderness',        kind: 'free', lat: 37.4208, lng: -121.6514, address: 'Sunol, CA 94586',             phone: '(888) 327-2757', services: ['Backcountry camping', 'Hiking trails', 'Water sources'] },
  { id: 'camp-8',  name: 'Del Valle Regional Park',           kind: 'free', lat: 37.3871, lng: -121.6639, address: 'Livermore, CA 94550',         phone: '(510) 635-0135', services: ['Group sites', 'Day use', 'Water access', 'Fishing'] },
  { id: 'camp-9',  name: 'Morgan Territory Regional Park',    kind: 'free', lat: 37.8313, lng: -121.7297, address: 'Livermore, CA 94551',         phone: '(510) 635-0135', services: ['Hiking', 'Picnic areas', 'Views'] },
  { id: 'camp-10', name: 'Henry W. Coe State Park',           kind: 'free', lat: 37.2470, lng: -121.5447, address: 'Morgan Hill, CA 95037',       phone: '(408) 779-2728', services: ['Backcountry', 'Hiking', 'Camping sites', 'Water holes'] },
  { id: 'camp-11', name: 'Big Sur Coastal Camping',           kind: 'free', lat: 36.2704, lng: -121.8084, address: 'Big Sur, CA 93920',           phone: '(831) 667-2315', services: ['Ocean views', 'Hiking', 'Remote'] },
  { id: 'camp-12', name: 'Sanborn County Park (walk-in)',     kind: 'free', lat: 37.2275, lng: -122.0769, address: '16055 Sanborn Rd, Saratoga, CA', phone: '(408) 867-9959', services: ['Walk-in primitive sites', 'Redwoods'] },
];

// Reshape to the same shape the live resource map expects (so we can union it
// with backend `/api/resources` and render on the main map too).
export const CAMPING_AS_MAP_RESOURCES = CAMPING_RESOURCES.map((c) => ({
  id: c.id,
  type: 'camping',
  name: c.name,
  lat: c.lat,
  lng: c.lng,
  address: c.address,
  phone: c.phone,
  hours: c.kind === 'free' ? 'Dispersed / dawn–dusk' : 'See site for hours',
  description:
    (c.kind === 'paid' ? 'Paid campground' : 'Free / dispersed campsite') +
    (c.price ? ` · ${c.price}` : '') +
    (c.services?.length ? ` · ${c.services.join(', ')}` : ''),
  eligibility: c.kind === 'paid' ? 'Reservation typically required' : 'Open to public — first-come first-served',
  camping_kind: c.kind,
  price: c.price || '',
  website: c.website || '',
  services: c.services || [],
}));
