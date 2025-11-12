// src/utils/formatters.ts

/**
 * Mengubah angka menjadi format mata uang Rupiah (IDR).
 * Jika harga 0, akan mengembalikan "Gratis".
 */
export const formatPrice = (price: number): string => {
  if (price === 0) return "Gratis";
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(price);
};