// Nielsen DMA code to name mapping (partial). Fallback to numeric code if not found.
export const dmaNames: Record<number, string> = {
  501: 'New York',
  514: 'Buffalo',
  516: 'Rochester, NY',
  517: 'Syracuse',
  518: 'Binghamton',
  519: 'Elmira (Corning)',
  520: 'Utica',
  521: 'Burlington/Plattsburgh',
  522: 'Albany-Schenectady-Troy',
  577: 'Wilkes Barre-Scranton',
  600: 'Corpus Christi',
  604: 'Columbia/Jefferson City',
  605: 'Topeka',
  606: 'Wichita-Hutchinson',
  609: 'Chicago',
  610: 'Peoria-Bloomington',
  611: 'Rockford',
  612: 'Davenport-Rock Island-Moline',
  613: 'Quincy-Hannibal-Keokuk',
  633: 'Odessa-Midland',
  807: 'San Francisco-Oakland-San Jose',
};

export function getDmaName(code: number | string | null | undefined): string {
  if (code == null || code === '') return '';
  const n = typeof code === 'string' ? Number(code) : code;
  if (!Number.isFinite(n)) return String(code);
  return dmaNames[n] ?? String(n);
}
