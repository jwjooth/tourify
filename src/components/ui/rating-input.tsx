import { Star, Loader2 } from 'lucide-react';
import { useState } from 'react';

interface RatingInputProps {
  initialRating: number | null;
  onRate: (rating: number) => Promise<void>;
  isLoading: boolean;
  isLoggedIn: boolean;
}

/**
 * Komponen Input Rating Bintang 1-5
 */
export function RatingInput({ initialRating, onRate, isLoading, isLoggedIn }: RatingInputProps) {
  const [hoverRating, setHoverRating] = useState(0);
  const [currentRating, setCurrentRating] = useState(initialRating || 0);

  // Sinkronisasi rating internal dengan prop initialRating
  // useEffect(() => {
  //   setCurrentRating(initialRating || 0);
  // }, [initialRating]);
  
  const handleRate = async (rating: number) => {
    if (isLoading || !isLoggedIn) return;

    // Optimistic UI update: langsung ubah tampilan
    setCurrentRating(rating); 
    
    try {
      await onRate(rating);
    } catch (error) {
      console.error("Failed to submit rating:", error);
      // Rollback jika ada error
      setCurrentRating(initialRating || 0); 
    }
  };

  const stars = Array(5).fill(0).map((_, index) => {
    const ratingValue = index + 1;
    
    // Tentukan apakah bintang harus diisi
    const isFilled = ratingValue <= (hoverRating || currentRating);
    
    // Style bintang
    const starStyle = isFilled
      ? "fill-orange-400 text-orange-400" 
      : "text-gray-300";

    return (
      <Star
        key={index}
        className={`h-7 w-7 transition-colors cursor-pointer ${starStyle}`}
        onMouseEnter={() => isLoggedIn && setHoverRating(ratingValue)}
        onMouseLeave={() => setHoverRating(0)}
        onClick={() => handleRate(ratingValue)}
      />
    );
  });

  return (
    <div className="flex items-center gap-1.5 p-4 rounded-lg bg-white shadow-sm border">
        {isLoading ? (
            <Loader2 className="h-7 w-7 animate-spin text-sky-500 mr-2" />
        ) : (
            <>
                <div className="flex">
                    {stars}
                </div>
                {isLoggedIn ? (
                    <span className="text-gray-700 ml-2">
                        {currentRating > 0 ? `Rating Anda: ${currentRating}/5` : 'Beri rating Anda'}
                    </span>
                ) : (
                    <span className="text-gray-500 ml-2 text-sm">
                        Login untuk memberi rating
                    </span>
                )}
            </>
        )}
    </div>
  );
}