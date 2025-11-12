// src/data/api.ts

import { db } from "../firebase/firebase"; 
import {
  collection,
  getDocs,
  getDoc,
  doc,
  query,
  orderBy,
  limit,
  collectionGroup // <-- PENTING: Untuk query sub-koleksi
} from "firebase/firestore";

// Impor Tipe (mockData hanya untuk tipe data, bukan data mentah)
import { Country, Attraction } from './mockData'; 

/**
 * Mengambil semua negara dari koleksi 'countries'.
 */
export const getCountries = async (): Promise<Country[]> => {
  try {
    const countriesCol = collection(db, "countries");
    const countrySnapshot = await getDocs(countriesCol);
    const countryList = countrySnapshot.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        name: data.name,
        // Pastikan field ini ada di dokumen 'countries' Anda
        imageUrl: data.imageUrl || '', 
        attractionCount: data.attractionCount || 0 
      } as Country; 
    });
    return countryList;
  } catch (e) {
    console.error("Error mengambil countries: ", e);
    return [];
  }
};

/**
 * Mengambil semua wisata berdasarkan ID negara (membaca SUB-KOLEKSI).
 */
export const getAttractionsByCountry = async (countryId: string): Promise<Attraction[]> => {
  try {
    // Path: countries -> {countryId} -> attractions
    const attractionsCol = collection(db, "countries", countryId, "attractions");
    const snapshot = await getDocs(attractionsCol);
    
    const attractionList = snapshot.docs.map((d) => {
      return { 
        id: d.id, 
        ...d.data(),
        country: countryId // Menambahkan properti 'country' secara manual
      } as Attraction;
    });
    return attractionList;
  } catch (e) {
    console.error("Error mengambil attractions by country: ", e);
    return [];
  }
};


/**
 * Mengambil satu data wisata berdasarkan ID negara DAN ID atraksi.
 */
export const getAttractionById = async (countryId: string, attractionId: string): Promise<Attraction | undefined> => {
  try {
    // Path: countries -> {countryId} -> attractions -> {attractionId}
    const docRef = doc(db, "countries", countryId, "attractions", attractionId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { 
        id: docSnap.id, 
        ...docSnap.data(),
        country: countryId // Menambahkan properti 'country' secara manual
      } as Attraction;
    } else {
      console.log("No such document!");
      return undefined;
    }
  } catch (e) {
    console.error("Error mengambil attraction by ID: ", e);
    return undefined;
  }
};

/**
 * Mengambil wisata dengan rating tertinggi dari SEMUA negara.
 * (Menggunakan Collection Group Query)
 */
export const getTopRatedAttractions = async (count: number = 6): Promise<Attraction[]> => {
  try {
    // Query ini mencari di SEMUA sub-koleksi 'attractions'
    const attractionsGroup = collectionGroup(db, "attractions");
    
    const q = query(
      attractionsGroup,
      orderBy("rating_avg", "desc"),
      limit(count)
    );
    
    const snapshot = await getDocs(q);
    const attractionList = snapshot.docs.map((d) => {
      // Kita perlu mengambil ID negara dari path-nya
      const countryId = d.ref.parent.parent?.id || ""; // (countries/{countryId}/attractions/{attractionId})
      return { 
        id: d.id, 
        ...d.data(),
        country: countryId // Menambahkan properti 'country' dari path
      } as Attraction;
    });
    
    return attractionList;
    
  } catch (e) {
    console.error("Error mengambil top rated attractions: ", e);
    console.warn("PENTING: Query ini memerlukan INDEX. Firebase akan memberikan link di console error untuk membuat index. Klik link itu.");
    return [];
  }
};

/**
 * ✅ FUNGSI BARU: Mencari atraksi di seluruh data berdasarkan kata kunci.
 * MENGGUNAKAN Collection Group Query dan Filtering Klien.
 * Catatan: Ini TIDAK efisien untuk data yang sangat besar. Untuk skalabilitas, gunakan Algolia.
 */
export const searchAttractions = async (queryText: string): Promise<Attraction[]> => {
  const normalizedQuery = queryText.toLowerCase().trim();

  if (!normalizedQuery) {
    return []; 
  }

  try {
    // 1. Ambil semua atraksi menggunakan Collection Group Query
    const attractionsGroup = collectionGroup(db, "attractions");
    const snapshot = await getDocs(attractionsGroup);

    const allAttractions: Attraction[] = snapshot.docs.map((d) => {
      // Ambil ID negara dari path
      const countryId = d.ref.parent.parent?.id || ""; 
      return { 
        id: d.id, 
        ...d.data(),
        country: countryId 
      } as Attraction;
    });

    // 2. Filter atraksi di memori (client-side filtering)
    const results = allAttractions.filter(attraction => 
      // Cek di nama atraksi
      attraction.name.toLowerCase().includes(normalizedQuery) ||
      // Cek di nama kota
      attraction.location.city.toLowerCase().includes(normalizedQuery) ||
      // Cek di nama negara
      attraction.country.toLowerCase().includes(normalizedQuery) ||
      // Cek di tipe atraksi
      attraction.type.toLowerCase().includes(normalizedQuery)
    );
    
    return results;

  } catch (e) {
    console.error("Error saat melakukan pencarian atraksi: ", e);
    return [];
  }
}