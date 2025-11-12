// src/components/pages/HomePage.tsx
import { useState, useEffect } from "react";
import { Compass, TrendingUp, Loader2 } from "lucide-react"; 
import { getCountries, getTopRatedAttractions } from "../../data/api";

// --- IMPORT BARU UNTUK FAVORIT & SEARCH ---
import { getFavorites, toggleFavorite } from "../../data/favoriteApi"; 
import { SearchBar } from "./SearchBar"; // Perbaiki path
// ------------------------------------------

import { Country, Attraction } from "../../data/mockData"; 
import { AttractionCard } from "./AttractionCard"; // Perbaiki path
import { CountryCard } from "./CountryCard"; // Perbaiki path

interface HomePageProps {
  onCountryClick: (countryId: string) => void;
  onAttractionClick: (id: string, countryId: string) => void;
  onSearch: (query: string) => void; // ✅ FIX: TAMBAHKAN PROP INI
}


export function HomePage({ onCountryClick, onAttractionClick, onSearch }: HomePageProps) {
  
  const [countries, setCountries] = useState<Country[]>([]);
  const [topAttractions, setTopAttractions] = useState<Attraction[]>([]);
  const [loading, setLoading] = useState(true);

  // --- STATE BARU UNTUK FAVORIT ---
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  // ---------------------------------

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Ambil data secara bersamaan
        const [countriesData, attractionsData, favorites] = await Promise.all([
            getCountries(),
            getTopRatedAttractions(6),
            getFavorites() // Ambil status favorit saat ini
        ]);
        
        setFavoriteIds(new Set(favorites));
        setCountries(countriesData);
        setTopAttractions(attractionsData);
      } catch (error) {
        console.error("Gagal mengambil data homepage:", error);
      } finally {
        setLoading(false); // Selesai loading
      }
    };

    fetchData();
  }, []); 

  // --- HANDLER BARU UNTUK FAVORIT dengan Optimistic UI Update ---
  const handleToggleFavorite = async (attractionId: string) => {
    const isCurrentlyFavorite = favoriteIds.has(attractionId);
    const newStatus = !isCurrentlyFavorite; 

    // 1. Update state secara optimistik (tanpa menunggu API)
    setFavoriteIds(prev => {
        const newSet = new Set(prev);
        if (newStatus) {
            newSet.add(attractionId);
        } else {
            newSet.delete(attractionId);
        }
        return newSet;
    });

    try {
        // 2. Panggil API untuk menyimpan ke Firestore
        await toggleFavorite(attractionId, newStatus); 
    } catch (error) {
        console.error("Gagal toggle favorit:", error);
        alert("Gagal memperbarui status favorit. Silakan coba lagi.");
        // 3. Rollback state jika gagal
        setFavoriteIds(prev => {
             const newSet = new Set(prev);
             if (isCurrentlyFavorite) {
                 newSet.add(attractionId);
             } else {
                 newSet.delete(attractionId);
             }
             return newSet;
        });
    }
  };
  // ---------------------------------

  // ✅ Hapus fungsi handleSearch placeholder

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <Loader2 className="h-12 w-12 animate-spin text-sky-500" />
      </div>
    );
  }

  // 8. Render halaman
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-[600px] lg:h-[700px] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1631684181713-e697596d2165?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3VudGFpbiUyMGFkdmVudHVyZSUyMGxhbmRzY2FwZXxlbnwxfHx8fDE3NjEwNDE5NzV8MA&ixlib=rb-4.1.0&q=80&w=1080')"
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-sky-900/70 via-sky-800/60 to-gray-50" />
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-white border border-white/20">
            <Compass className="h-5 w-5" />
            <span className="text-sm">Trip Adventure</span>
          </div>
          <h1 className="text-white mb-4 text-4xl lg:text-6xl">
            Temukan Petualanganmu Berikutnya
          </h1>
          <p className="text-white/90 text-lg lg:text-xl mb-10 max-w-2xl mx-auto">
            Jelajahi ribuan destinasi menakjubkan di seluruh dunia dan ciptakan kenangan tak terlupakan
          </p>
          {/* ✅ FIX: Gunakan onSearch prop dari App.tsx */}
          <SearchBar onSearch={onSearch} className="mx-auto max-w-xl" />
        </div>
      </div>

      {/* Popular Countries Section */}
      <section className="py-12 lg:py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-10 w-1 bg-sky-500 rounded-full" />
            <div>
              <h2 className="text-gray-900">Negara Populer</h2>
              <p className="text-gray-600">Pilih destinasi favoritmu</p>
            </div>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            
            {countries.map((country) => (
              <CountryCard
                key={country.id}
                country={country}
                onClick={() => onCountryClick(country.id)}
              />
            ))}

          </div>
        </div>
      </section>

      {/* Top Rated Attractions Section */}
      <section className="py-12 lg:py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-10 w-1 bg-orange-500 rounded-full" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-gray-900">Wisata Terpopuler</h2>
                <TrendingUp className="h-6 w-6 text-orange-500" />
              </div>
              <p className="text-gray-600">Destinasi dengan rating tertinggi</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

            {/* --- PEMBARUAN: AttractionCard dengan props Favorit --- */}
            {topAttractions.map((attraction) => (
              <AttractionCard
                key={attraction.id}
                attraction={attraction}
                onClick={() => onAttractionClick(attraction.id, attraction.country)}
                // PROPS FAVORIT BARU:
                isFavorite={favoriteIds.has(attraction.id)} 
                onToggleFavorite={() => handleToggleFavorite(attraction.id)} 
              />
            ))}

          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 px-4 bg-gradient-to-br from-sky-600 to-sky-800 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-white mb-4 text-3xl lg:text-5xl">
            Siap Memulai Petualangan?
          </h2>
          <p className="text-white/90 text-lg mb-8">
            Bergabunglah dengan jutaan traveler yang telah menemukan destinasi impian mereka
          </p>
          <button className="px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-full transition-colors shadow-lg hover:shadow-xl hover:cursor-pointer">
            Mulai Jelajahi Sekarang
          </button>
        </div>
      </section>
    </div>
  );
}