import { useState, useEffect, useMemo } from "react";
import { ArrowLeft, Loader2, Frown } from "lucide-react"; 
import { SearchBar } from "./SearchBar";
import { Attraction } from "../../data/mockData"; // Import tipe Attraction
import { searchAttractions } from "../../data/api"; // Fungsi search dari Firestore
import { getFavorites, toggleFavorite } from "../../data/favoriteApi"; // Fungsi Favorites API

import { AttractionCard } from "./AttractionCard";
import { Button } from "../ui/button";

interface SearchResultsPageProps {
  query: string; // Kata kunci pencarian
  onBack: () => void; // Fungsi untuk kembali ke Home
  onAttractionClick: (id: string, countryId: string) => void;
}

export function SearchResultsPage({ query, onBack, onAttractionClick }: SearchResultsPageProps) {
  const [searchResults, setSearchResults] = useState<Attraction[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentQuery, setCurrentQuery] = useState(query);
  
  // State untuk melacak ID atraksi favorit
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set()); 

  // UseEffect untuk menjalankan pencarian pertama kali & mengambil favorit
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Ambil data pencarian dan favorit secara bersamaan
        const [attractions, favorites] = await Promise.all([
            searchAttractions(currentQuery),
            getFavorites()
        ]);
        
        setSearchResults(attractions);
        setFavoriteIds(new Set(favorites)); 
      } catch (error) {
        console.error("Gagal melakukan pencarian:", error);
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Cleanup function: Jika currentQuery berubah, useEffect akan dijalankan lagi
  }, [currentQuery]); 

  // Handler untuk pencarian baru (dipanggil dari SearchBar)
  const handleNewSearch = (newQuery: string) => {
    if (newQuery.trim() && newQuery.trim() !== currentQuery) {
        setCurrentQuery(newQuery.trim());
    } else if (!newQuery.trim()) {
        // Jika query kosong, kembali ke home (opsional, tapi disarankan)
        onBack();
    }
  };

  // Handler untuk toggle favorite (sama seperti di HomePage/AttractionsListPage)
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
        await toggleFavorite(attractionId, newStatus); 
    } catch (error) {
        console.error("Gagal toggle favorit:", error);
        alert("Gagal memperbarui status favorit. Anda mungkin perlu login.");
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

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Header dengan SearchBar & Tombol Kembali */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
                {/* Tombol Kembali ke Home */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onBack}
                    className="rounded-full flex-shrink-0"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Button>

                {/* SearchBar dengan nilai default dari query */}
                <SearchBar 
                    placeholder="Cari lagi..." 
                    defaultValue={currentQuery}
                    onSearch={handleNewSearch} 
                    className="flex-grow max-w-lg" // Membatasi lebar SearchBar di header
                />
            </div>

            {/* Judul Halaman */}
            <div className="mt-4">
                <h1 className="text-gray-900 text-2xl font-bold">
                    Hasil Pencarian untuk: "{currentQuery}"
                </h1>
                <p className="text-gray-600 text-sm">
                    Ditemukan {searchResults.length} destinasi
                </p>
            </div>
        </div>
      </div>

      {/* Konten Halaman: Loading, Results, atau No Results */}
      <div className="max-w-7xl mx-auto px-4 py-8">

        {loading ? (
            // Loading State (Skeleton bisa ditambahkan di sini)
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
                <span className="ml-3 text-lg text-gray-600">Mencari Destinasi...</span>
            </div>
        ) : searchResults.length > 0 ? (
            // Hasil Ditemukan
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {searchResults.map((attraction) => (
                    <AttractionCard
                        key={attraction.id}
                        attraction={attraction}
                        onClick={() => onAttractionClick(attraction.id, attraction.country)}
                        // Prop Favorite
                        isFavorite={favoriteIds.has(attraction.id)} 
                        onToggleFavorite={() => handleToggleFavorite(attraction.id)} 
                    />
                ))}
            </div>
        ) : (
            // Tidak Ada Hasil
            <div className="text-center py-20 bg-white rounded-lg shadow-lg">
                <Frown className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                    Maaf, tidak ada hasil yang cocok.
                </h2>
                <p className="text-gray-500">Coba kata kunci lain atau periksa ejaan Anda.</p>
            </div>
        )}
      </div>
    </div>
  );
}