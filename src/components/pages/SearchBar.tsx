import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { Input } from "../ui/input";

interface SearchBarProps {
  placeholder?: string;
  className?: string;
  /** Fungsi yang dijalankan saat user mengetik atau menekan Enter */
  onSearch: (query: string) => void;
  /** Opsional: nilai default dari pencarian */
  defaultValue?: string;
}

export function SearchBar({
  placeholder = "Cari destinasi impianmu...",
  className = "",
  onSearch,
  defaultValue = "",
}: SearchBarProps) {
  const [query, setQuery] = useState(defaultValue);
  const [isFocused, setIsFocused] = useState(false);

  // 🔹 Jalankan pencarian otomatis (real-time) dengan debounce 500ms
  useEffect(() => {
    const timeout = setTimeout(() => {
      // Pastikan pencarian tidak dijalankan saat input kosong
      if (query.trim() !== defaultValue.trim()) {
        onSearch(query.trim());
      }
    }, 500);
    return () => clearTimeout(timeout);
  // Tambahkan defaultValue ke dependency array untuk mengatasi kasus reset
  }, [query, onSearch, defaultValue]); 

  // 🔹 Saat menekan Enter → pencarian langsung tanpa delay
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      onSearch(query.trim());
    }
  };

  // 🔹 Reset pencarian
  const handleClear = () => {
    setQuery("");
    // Penting: Panggil onSearch setelah setQuery
    onSearch(""); 
    // Setelah clear, fokus harus dikembalikan ke input agar keyboard tidak hilang (UX)
    document.getElementById('search-input')?.focus(); 
  };
  
  // Perbaikan: Gunakan state untuk melacak apakah tombol clear sedang dihover
  const [isClearHovered, setIsClearHovered] = useState(false);

  // Perbaikan: Gunakan fungsi onBlur yang lebih cermat
  const handleBlur = () => {
    // Hanya hilangkan fokus jika tombol clear tidak di-hover
    // Ini mencegah input kehilangan fokus (dan tombol clear hilang) saat kita ingin mengkliknya
    if (!isClearHovered) {
        setIsFocused(false);
    }
  };


  return (
    <div
      className={`relative flex items-center transition-all duration-300 ${
        isFocused ? "scale-[1.02]" : "scale-100"
      } ${className}`}
    >
      {/* Icon Search */}
      <Search
        className={`absolute left-4 h-5 w-5 transition-colors ${
          isFocused ? "text-sky-500" : "text-gray-400"
        }`}
      />

      {/* Input utama */}
      <Input
        id="search-input" // Tambahkan ID untuk fokus
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={handleBlur} // Gunakan fungsi handleBlur baru
        className="w-full pl-12 pr-10 py-4 rounded-full border-2 border-white/30 bg-white/90 
          backdrop-blur-sm shadow-md placeholder:text-gray-400 
          focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30 text-gray-800"
      />

      {/* Tombol clear (muncul hanya jika ada teks) */}
      {query && (
        <button
          onClick={handleClear}
          // Tambahkan handler hover untuk mencegah blur yang tidak disengaja
          onMouseEnter={() => setIsClearHovered(true)} 
          onMouseLeave={() => setIsClearHovered(false)}
          type="button" // Tentukan type button
          className="absolute right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Hapus pencarian"
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}