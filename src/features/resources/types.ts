export interface Resource {
  id: string;
  category: string;
  title: string;
  description: string;
  address: string | null;
  phone: string | null;
  website: string | null;
  lat: number | null;
  lng: number | null;
  tags: string[];
  distance?: string;
}

export interface ResourceCategory {
  id: string;
  name: string;
  icon: string;
  count: number;
  color: string;
}
