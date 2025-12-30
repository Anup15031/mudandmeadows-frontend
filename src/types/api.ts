// Review type for testimonials/reviews
export interface Review {
  _id?: string;
  reviewer: string;
  rating: number;
  comment: string;
  date: string;
}
// API Response Types
export interface Accommodation {
  id?: string;
  name: string;
  description: string;
  price_per_night: number;
  price?: number;
  original_price?: number;
  strike_price?: number;
  basePrice?: number;
  capacity: number;
  capacity_adults?: number;
  capacity_max?: number;
  maxGuests?: number;
  amenities?: string[];
  images?: string[];
  media?: string[];
  rating?: number;
  created_at?: string;
  slug?: string;
  rooms?: any[];
  available_rooms?: number;
  availableRooms?: number;
  board_type?: string;
  extraBeddingOptions?: any[];
  extra_bedding?: number;
  extra_beds?: number;
  extraBedding?: number;
  extra_bedding_price?: number;
  children?: number;
  available?: boolean;
  image?: string;
}

export interface Package {
  id?: string;
  name: string;
  description: string;
  price: number;
  duration_days: number;
  includes: string[];
  images: string[];
  rating: number;
  created_at?: string;
}

export interface Experience {
  id?: string;
  name: string;
  description: string;
  price: number;
  duration_hours: number;
  activities: string[];
  images: string[];
  rating: number;
  created_at?: string;
}

export interface Wellness {
  id?: string;
  name: string;
  description: string;
  price: number;
  duration_minutes: number;
  benefits: string[];
  images: string[];
  rating: number;
  created_at?: string;
}

export interface Booking {
  id?: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  accommodation_id: string;
  package_id?: string;
  experience_ids?: string[];
  wellness_ids?: string[];
  check_in: string;
  check_out: string;
  total_price: number;
  status?: string;
  created_at?: string;
}

export interface HomePageData {
  featured_accommodations?: Accommodation[];
  featured_packages?: Package[];
  featured_experiences?: Experience[];
  featured_wellness?: Wellness[];
}

export interface ResortStats {
  total_accommodations?: number;
  total_guests?: number;
  total_bookings?: number;
  average_rating?: number;
}

export interface ApiError {
  status?: number;
  detail?: string | Array<{ loc: string[]; msg: string; type: string }>;
  errors?: Record<string, string[]>;
}
