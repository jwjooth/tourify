import { ArrowLeft, Filter, SlidersHorizontal, Loader2 } from "lucide-react";
import { useState, useEffect, useMemo } from "react"; 
import { getAttractionsByCountry } from "../../data/api";
import { Attraction } from "../../data/mockData"; 
// ✅ NEW IMPORT FOR FAVORITES
import { getFavorites, toggleFavorite } from "../../data/favoriteApi"; 

import { AttractionCard } from "./AttractionCard";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface AttractionsListPageProps {
  countryName: string;
  onBack: () => void;
  onAttractionClick: (id: string, countryId: string) => void;
}

export function AttractionsListPage({ countryName, onBack, onAttractionClick }: AttractionsListPageProps) {
  const [allAttractions, setAllAttractions] = useState<Attraction[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [sortBy, setSortBy] = useState<string>("popular");
  const [filterType, setFilterType] = useState<string>("all");

  // ✅ STATE BARU UNTUK FAVORIT
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set()); 

  useEffect(() => {
    const fetchData = async () => {
      if (!countryName) return; 
      setLoading(true); 
      try {
        // Ambil data atraksi dan favorit secara bersamaan
        const [attractions, favorites] = await Promise.all([
          getAttractionsByCountry(countryName), 
          getFavorites()
        ]);
        
        setAllAttractions(attractions);
        setFavoriteIds(new Set(favorites)); // ✅ Set ID favorit
      } catch (error) {
        console.error("Gagal mengambil data atraksi:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [countryName]);

  // ✅ HANDLER BARU UNTUK FAVORIT
  const handleToggleFavorite = async (attractionId: string) => {
    const isCurrentlyFavorite = favoriteIds.has(attractionId);
    const newStatus = !isCurrentlyFavorite; 

    // Optimistic UI Update
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
        // Panggil API (Sekarang butuh 2 argumen: ID dan Status)
        await toggleFavorite(attractionId, newStatus); 
    } catch (error) {
        console.error("Gagal toggle favorit:", error);
        alert("Gagal memperbarui status favorit. Silakan coba lagi.");
        // Rollback state jika gagal
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


  const types = useMemo(() => {
    return ["all", ...Array.from(new Set(allAttractions.map(a => a.type)))];
  }, [allAttractions]);

  const sortedAttractions = useMemo(() => {
    let filteredAttractions = allAttractions;
    if (filterType !== "all") {
      filteredAttractions = filteredAttractions.filter(a => a.type === filterType);
    }

    return [...filteredAttractions].sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return b.rating_avg - a.rating_avg;
        case "price-low":
          // ✅ FIX TYPO: Seharusnya b.entrance_fee
          return a.entrance_fee - b.entrance_fee; 
        case "price-high":
          return b.entrance_fee - a.entrance_fee;
        default: 
          return b.rating_count - a.rating_count;
      }
    });
  }, [allAttractions, filterType, sortBy]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <Loader2 className="h-12 w-12 animate-spin text-sky-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header (Kode tidak berubah) */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-gray-900 capitalize">Wisata di {countryName}</h1>
              <p className="text-gray-600 text-sm">
                Ditemukan {sortedAttractions.length} destinasi
              </p>
            </div>
          </div>

          {/* Filters (Kode tidak berubah) */}
          <div className="flex gap-3 overflow-x-auto pb-2">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Tipe Wisata" />
              </SelectTrigger>
              <SelectContent>
                {types.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type === "all" ? "Semua Tipe" : type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Urutkan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">Paling Populer</SelectItem>
                <SelectItem value="rating">Rating Tertinggi</SelectItem>
                <SelectItem value="price-low">Harga Terendah</SelectItem>
                <SelectItem value="price-high">Harga Tertinggi</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Attractions Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedAttractions.map((attraction) => (
            <AttractionCard
              key={attraction.id}
              attraction={attraction}
              onClick={() => onAttractionClick(attraction.id, attraction.country)}
              // ✅ PASS PROPS FAVORIT BARU
              isFavorite={favoriteIds.has(attraction.id)} 
              onToggleFavorite={() => handleToggleFavorite(attraction.id)} 
            />
          ))}

        </div>

        {/* Tampilan jika tidak ada hasil (Kode tidak berubah) */}
        {sortedAttractions.length === 0 && !loading && ( 
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">Tidak ada destinasi yang ditemukan</p>
          </div>
        )}
      </div>
    </div>
  );
}