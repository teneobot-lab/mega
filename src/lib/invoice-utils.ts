export function terbilang(n: number): string {
  if (n < 0) return "Minus " + terbilang(-n);
  if (n === 0) return "Nol";
  
  const units = ["", "Satu", "Dua", "Tiga", "Empat", "Lima", "Enam", "Tujuh", "Delapan", "Sembilan", "Sepuluh", "Sebelas"];
  let res = "";
  
  if (n < 12) {
    res = units[n];
  } else if (n < 20) {
    res = terbilang(n - 10) + " Belas";
  } else if (n < 100) {
    res = terbilang(Math.floor(n / 10)) + " Puluh " + terbilang(n % 10);
  } else if (n < 200) {
    res = "Seratus " + terbilang(n - 100);
  } else if (n < 1000) {
    res = terbilang(Math.floor(n / 100)) + " Ratus " + terbilang(n % 100);
  } else if (n < 2000) {
    res = "Seribu " + terbilang(n - 1000);
  } else if (n < 1000000) {
    res = terbilang(Math.floor(n / 1000)) + " Ribu " + terbilang(n % 1000);
  } else if (n < 1000000000) {
    res = terbilang(Math.floor(n / 1000000)) + " Juta " + terbilang(n % 1000000);
  } else if (n < 1000000000000) {
    res = terbilang(Math.floor(n / 1000000000)) + " Miliar " + terbilang(n % 1000000000);
  } else {
    res = terbilang(Math.floor(n / 1000000000000)) + " Triliun " + terbilang(n % 1000000000000);
  }
  
  return res.replace(/\s+/g, " ").trim() + " Rupiah";
}
