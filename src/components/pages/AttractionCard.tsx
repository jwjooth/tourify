import { MapPin, Star, Heart } from "lucide-react"; // ✅ IMPORT BARU: Heart
import { Attraction} from "../../data/mockData";
import { formatPrice } from "../../utils/formatters";
import { Badge } from "../ui/badge";
import { ImageWithFallback } from "../figma/ImageWithFallback"; 

interface AttractionCardProps {
  attraction: Attraction;
  onClick: () => void;
  // ✅ PROPS BARU UNTUK FAVORIT
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

export function AttractionCard({ 
    attraction, 
    onClick, 
    isFavorite, 
    onToggleFavorite // Destructure props baru
}: AttractionCardProps) {
    
  // Handler untuk mengklik tombol favorit
  const handleFavoriteClick = (e: React.MouseEvent) => {
    // ⚠️ PENTING: Mencegah event 'onClick' card berjalan
    e.stopPropagation(); 
    onToggleFavorite();
  };

  return (
    <div
      onClick={onClick}
      className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer hover:-translate-y-1"
    >
      <div className="relative h-48 overflow-hidden">
        <ImageWithFallback
          src={attraction.main_image_url}
          alt={attraction.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        
        {/* ✅ Tombol Favorite Spektakuler */}
        <button
            onClick={handleFavoriteClick}
            type="button"
            aria-label={isFavorite ? "Hapus dari favorit" : "Tambahkan ke favorit"}
            className="absolute top-3 left-3 z-20 p-2 rounded-full 
                       bg-white/80 backdrop-blur-sm shadow-lg 
                       hover:scale-110 transition-transform duration-300"
        >
            <Heart 
                className={`h-6 w-6 transition-colors duration-300 ${
                    // Styling kondisional berdasarkan status favorit
                    isFavorite 
                        ? "fill-red-500 text-red-500" // Jika favorit: Hati Merah Penuh
                        : "fill-gray-300/50 text-gray-500 hover:text-red-500 hover:fill-red-500/80" // Jika tidak: Hati Abu-abu Outline
                }`} 
            />
        </button>

        {/* Badge Tipe */}
        <Badge className="absolute top-3 right-3 z-20 bg-white/95 text-gray-800 hover:bg-white">
          {attraction.type}
        </Badge>
      </div>
      
      <div className="p-4">
        <h3 className="mb-2 line-clamp-1 font-semibold text-lg">{attraction.name}</h3>
        
        {/* Rating Section */}
        <div className="flex items-center gap-1 mb-2">
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          <span className="text-gray-900 font-medium">{attraction.rating_avg.toFixed(1)}</span>
          <span className="text-gray-500 text-sm">({attraction.rating_count.toLocaleString('id-ID')} review)</span>
        </div>
        
        {/* Location Section */}
        <div className="flex items-center gap-1 mb-3 text-gray-600">
          <MapPin className="h-4 w-4 flex-shrink-0" />
          <p className="text-sm line-clamp-1">{attraction.location.city}, {attraction.country}</p>
        </div>
        
        {/* Price Section */}
        <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
          <span className="text-gray-800 text-xl font-bold">
            {formatPrice(attraction.entrance_fee)}
          </span>
          <span className="text-gray-500 text-sm">per orang</span>
        </div>
      </div>
    </div>
  );
}