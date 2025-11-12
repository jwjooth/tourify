import { getCountries } from '../../data/api.ts'
import { Country } from '../../data/mockData.ts'
import { useState, useEffect } from 'react'
import { ImageWithFallback } from "../figma/ImageWithFallback.tsx";

interface CountryCardProps {
  country: Country;
  onClick?: () => void;
}

export function CountryCard({ country, onClick }: CountryCardProps) {
  return (
    <div
      onClick={onClick}
      className="group relative flex-shrink-0 w-64 h-80 rounded-2xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
    >
      <ImageWithFallback
        src={country.imageUrl}
        alt={country.name}
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
        <h3 className="mb-1">{country.name}</h3>
        <p className="text-white/80 text-sm">5 Destinasi</p>
      </div>
    </div>
  );
}
