import { useState, useEffect } from "react";
import { HomePage } from "./components/pages/HomePage";
import { AttractionsListPage } from "./components/pages/AttractionsListPage";
import { AttractionDetailPage } from "./components/pages/AttractionDetailPage";
import { LoginPage } from "./components/pages/LoginPage";
// ✅ JALUR IMPOR YANG BENAR: Import dari halaman SearchResultsPage
import { SearchResultsPage } from "./components/pages/SearchResultsPage"; 
import { auth } from "./firebase/firebase";
import { LogoutButton } from "./components/ui/logout-button";

type Page =
  | { type: "login" }
  | { type: "home" }
  | { type: "list"; countryId: string }
  | { type: "detail"; attractionId: string; countryId: string }
  | { type: "search"; query: string }; // Tipe untuk Halaman Hasil Pencarian

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>({ type: "login" });

  // Auth listener: Guard semua halaman
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user && currentPage.type !== "login") {
        setCurrentPage({ type: "login" });
      } else if (user && currentPage.type === "login") {
        setCurrentPage({ type: "home" });
      }
    });
    return unsubscribe;
  }, [currentPage.type]);

  const handleCountryClick = (countryId: string) => {
    setCurrentPage({ type: "list", countryId });
  };

  const handleAttractionClick = (attractionId: string, countryId: string) => {
    setCurrentPage({ type: "detail", attractionId, countryId });
  };
  
  // ✅ Handle Search Function
  const handleSearch = (query: string) => {
    if (query.trim()) {
      setCurrentPage({ type: "search", query });
    } else {
      setCurrentPage({ type: "home" }); 
    }
  };

  const handleBack = () => {
    if (currentPage.type === "detail") {
      setCurrentPage({ type: "list", countryId: currentPage.countryId });
    } else if (currentPage.type === "list") {
      setCurrentPage({ type: "home" });
    }
  };

  return (
    <div className="min-h-screen relative">
      
      {/* Logout Button */}
      {currentPage.type !== "login" && (
        <div className="absolute top-4 right-4 z-50">
          <LogoutButton
            onLogoutSuccess={() => setCurrentPage({ type: "login" })}
          />
        </div>
      )}

      {/* Halaman Login */}
      {currentPage.type === "login" && (
        <LoginPage
          onLoginSuccess={() => setCurrentPage({ type: "home" })} 
        />
      )}

      {/* Halaman Home */}
      {currentPage.type === "home" && (
        <HomePage
          onCountryClick={handleCountryClick}
          onAttractionClick={handleAttractionClick}
          onSearch={handleSearch} 
        />
      )}

      {/* Halaman List Atraksi */}
      {currentPage.type === "list" && (
        <AttractionsListPage
          countryName={currentPage.countryId}
          onBack={handleBack}
          onAttractionClick={handleAttractionClick}
        />
      )}

      {/* Halaman Detail Atraksi */}
      {currentPage.type === "detail" && (
        <AttractionDetailPage
          attractionId={currentPage.attractionId}
          countryId={currentPage.countryId}
          onBack={handleBack}
        />
      )}
      
      {/* ✅ Halaman Hasil Pencarian */}
      {currentPage.type === "search" && (
        <SearchResultsPage
          query={currentPage.query}
          onBack={() => setCurrentPage({ type: "home" })} 
          onAttractionClick={handleAttractionClick}
        />
      )}
    </div>
  );
}