// src/data/mockData.ts (atau src/types.ts)

export interface Country {
  id: string;
  name: string;
  imageUrl: string;
  attractionCount: number;
}

export interface Location {
  city: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface Attraction {
  id: string;
  name: string;
  description: string;
  main_image_url: string;
  country: string; // Ini penting untuk query (getAttractionsByCountry)
  location: Location;
  type: string;
  rating_avg: number;
  rating_count: number;
  entrance_fee: number;
  activities: string[];
}