
// C Major Pentatonic Scale notes
export const NOTE_NAMES = ['C', 'D', 'E', 'G', 'A'];

// Colors to match the UI theme for particle effects
export const NOTE_COLORS = [
  '#06b6d4', // C (cyan)
  '#22d3ee', // D
  '#a855f7', // E (purple)
  '#d946ef', // G (fuchsia)
  '#f472b6', // A
];

// Base frequency for C2
const BASE_FREQ = 65.41; 

// Function to generate frequencies for a pentatonic scale over multiple octaves
const generatePentatonicScale = (baseFreq: number, octaves: number): number[] => {
  const scale: number[] = [];
  const ratios = [1, 9/8, 5/4, 3/2, 5/3]; // Ratios for Major Pentatonic scale

  for (let i = 0; i < octaves; i++) {
    for (const ratio of ratios) {
      scale.push(baseFreq * Math.pow(2, i) * ratio);
    }
  }
  return scale;
};

// Generate 10 octaves of C Major Pentatonic (50 notes), starting from C2.
// This serves as the master list from which a slice can be taken for the active range.
export const MASTER_PENTATONIC_SCALE: number[] = generatePentatonicScale(BASE_FREQ, 10);
