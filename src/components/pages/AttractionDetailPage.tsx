import { useState, useEffect } from "react";
// Import Heart untuk tombol Favorite
import { ArrowLeft, Loader2, MapPin, Wind, Star, Heart } from "lucide-react"; 

// === RATING IMPORTS ===
import { getUserRating, submitRating } from "../../data/ratingApi";
import { auth } from "../../firebase/firebase";
// ======================

import { getAttractionById } from "../../data/api";
import { formatPrice } from "../../utils/formatters";
import { Attraction } from "../../data/mockData";

import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { CommentSection } from "../ui/CommentSection"; 
// === RATING COMPONENT IMPORT ===
import { RatingInput } from "../ui/rating-input";
// ===============================

interface AttractionDetailPageProps {
  attractionId: string;
  countryId: string;
  onBack: () => void;
}

export function AttractionDetailPage({ attractionId, countryId, onBack }: AttractionDetailPageProps) {
  const [attraction, setAttraction] = useState<Attraction | undefined>();
  const [loading, setLoading] = useState(true);

  // === STATE BARU UNTUK RATING ===
  const [userRating, setUserRating] = useState<number | null>(null);
  const [ratingLoading, setRatingLoading] = useState(false);
  
  // FIX: Perbaikan typo dari 'const constisLoggedIn' menjadi 'const isLoggedIn'
  const isLoggedIn = !!auth.currentUser; // Cek status login
  // ================================

  useEffect(() => {
    const fetchData = async () => {
      if (!attractionId || !countryId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setRatingLoading(true); // Mulai loading rating
      try {
        const data = await getAttractionById(countryId, attractionId);
        setAttraction(data);

        // Ambil rating pengguna jika sudah login
        if (isLoggedIn) { // Baris yang sebelumnya error
          const rating = await getUserRating(attractionId);
          setUserRating(rating);
        }
      } catch (error) {
        console.error("Gagal mengambil detail atraksi:", error);
      } finally {
        setLoading(false);
        setRatingLoading(false); // Selesai loading rating
      }
    };

    // FIX: Dependency array sekarang menggunakan nama variabel yang benar
    fetchData(); 
  }, [attractionId, countryId, isLoggedIn]); // Baris yang sebelumnya error

  // === HANDLER RATING BARU ===
  const handleRate = async (rating: number) => {
    setRatingLoading(true);
    try {
      await submitRating(attractionId, rating);
      setUserRating(rating); 
    } catch (error: any) {
      alert(`Gagal menyimpan rating: ${error.message}`);
    } finally {
      setRatingLoading(false);
    }
  };
  // ============================

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <Loader2 className="h-12 w-12 animate-spin text-sky-500" />
      </div>
    );
  }

  if (!attraction) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl mb-4">Destinasi Tidak Ditemukan.</h1>
        <Button onClick={onBack}>
          <ArrowLeft className="h-5 w-5 mr-2" /> Kembali
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Gambar */}
      <div className="relative h-[300px] sm:h-[400px] lg:h-[500px]">
        <img
          src={attraction.main_image_url}
          alt={attraction.name}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

        {/* Tombol Kembali & Favorit */}
        <div className="absolute top-0 left-0 right-0 p-4 sm:p-6 lg:p-8 flex justify-between items-center z-10">
          <Button
            variant="secondary"
            size="icon"
            onClick={onBack}
            className="rounded-full shadow-lg h-10 w-10 sm:h-12 sm:w-12 bg-white/90 hover:bg-white text-gray-900 backdrop-blur-sm hover:cursor-pointer"
          >
            <ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6" />
          </Button>
          {/* Tombol Favorit (Langkah 4 - Placeholder) */}
          <Button
            variant="secondary"
            size="icon"
            // onClick={handleToggleFavorite} // Tambahkan handler favorit di sini
            className="rounded-full shadow-lg h-10 w-10 sm:h-12 sm:w-12 bg-white/90 hover:bg-white text-red-500 backdrop-blur-sm"
          >
            {/* Ganti dengan <Heart fill={isFavorite ? 'red' : 'none'} /> */}
            <Heart className="h-5 w-5 sm:h-6 sm:w-6" />
          </Button>
        </div>


        {/* Judul & Info di atas Gambar */}
        <div className="absolute bottom-0 left-0 w-full p-4 sm:p-6 lg:p-8 text-white">
          <Badge variant="secondary" className="mb-3 bg-white/20 text-white backdrop-blur-md border-white/30">
            {attraction.type}
          </Badge>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white shadow-lg">{attraction.name}</h1>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-4 text-lg">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              <span>{attraction.location.city}, {attraction.country}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              <span className="font-bold">{attraction.rating_avg.toFixed(1)}</span> 
              <span className="text-white/80">({attraction.rating_count.toLocaleString('id-ID')} ulasan)</span> 
            </div>
          </div>
        </div>
      </div>

      {/* Konten Detail */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        {/* Grid Container */}
        <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-x-12 gap-y-10">
          {/* Kolom Kiri (Deskripsi, Rating, Aktivitas, Komentar) */}
          <div className="lg:col-span-2 space-y-10">
            
            {/* Bagian Deskripsi */}
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-4">
                Deskripsi
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                {attraction.description}
              </p>
            </div>
            
            {/* BAGIAN RATING INPUT BARU (Langkah 7) */}
            <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-200">
                <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-4">
                    Beri Rating Anda
                </h2>
                <RatingInput
                    initialRating={userRating}
                    onRate={handleRate}
                    isLoading={ratingLoading}
                    isLoggedIn={isLoggedIn} // Baris yang sebelumnya error
                />
            </div>
            {/* ============================================= */}

            {/* Bagian Aktivitas */}
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-5">
                Aktivitas
              </h2>
              <div className="flex flex-wrap gap-3">
                {attraction.activities.map((activity: string, index: number) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="text-sky-700 border-sky-300 bg-sky-50 py-1.5 px-4 text-base"
                  >
                    <Wind className="h-4 w-4 mr-2" />
                    {activity}
                  </Badge>
                ))}
              </div>
            </div>

            {/* INTEGRASI COMMENT SECTION */}
            <div className="mt-12">
              <CommentSection attractionId={attractionId} />
            </div>
            
          </div>

          {/* Kolom Kanan (Info Box Sticky) */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-28">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 
              overflow-hidden divide-y divide-gray-200 
              p-6 sm:p-8 lg:p-10 
              mt-6 lg:mt-0 
              ml-0 lg:ml-6">
                
                {/* Bagian Harga */}
                <div className="p-6 space-y-4">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Info Tiket
                  </h3>
                  <div className="text-4xl font-bold text-sky-600">
                    {formatPrice(attraction.entrance_fee)}
                  </div>
                  <Button size="lg" className="w-full bg-orange-500 hover:bg-orange-600 text-lg py-6 hover:cursor-pointer">
                    Pesan Tiket
                  </Button>
                </div>

                {/* Bagian Detail Lokasi */}
                <div className="p-6 space-y-4">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Detail Lokasi
                  </h3>
                  <dl className="space-y-3">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-gray-500 mt-1" />
                      <div className="text-sm">
                        <dt className="font-medium text-gray-900">Alamat</dt>
                        <dd className="text-gray-600">{attraction.location.address}</dd>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      {/* Mengganti Badge dengan ikon yang sesuai jika ada */}
                      <MapPin className="h-5 w-5 text-gray-500 mt-1" /> 
                      <div className="text-sm">
                        <dt className="font-medium text-gray-900">Kota</dt>
                        <dd className="text-gray-600">{attraction.location.city}</dd>
                      </div>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}