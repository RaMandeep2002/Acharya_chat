export interface ChatMessage {
  id: string;
  role: "user" | "ai";
  content: string;
  timestamp: Date;
}

export interface HistoryItem {
  id: string;
  date: Date;
  question: string;
  preview: string;
  fullPrediction: string;
}

export interface CreditPackage {
  id: string;
  credits: number;
  price: number;
  originalPrice?: number;
  label?: string;
  bestValue?: boolean;
}

export interface UserProfile {
  name: string;
  email: string;
  dob: string;
  timeOfBirth: string;
  birthPlace: string;
  credits: number;
  avatarUrl?: string;
}

export const mockUser: UserProfile = {
  name: "Aria Starweaver",
  email: "aria@celestial.com",
  dob: "1995-03-21",
  timeOfBirth: "04:30",
  birthPlace: "Mumbai, India",
  credits: 3,
};

export const mockMessages: ChatMessage[] = [
  {
    id: "1",
    role: "ai",
    content: "✨ Welcome, Aria! I am your celestial guide. The stars have been awaiting your arrival. Share your question and let the cosmos reveal its wisdom to you.",
    timestamp: new Date(Date.now() - 300000),
  },
  {
    id: "2",
    role: "user",
    content: "What does my birth chart say about my career path this year?",
    timestamp: new Date(Date.now() - 240000),
  },
  {
    id: "3",
    role: "ai",
    content: "🔮 Based on your Aries Sun and the current transit of Jupiter through your 10th house of career, 2026 is a year of remarkable professional expansion.\n\n♈ **Aries Rising Influence:** Your natural leadership qualities will be amplified. Expect opportunities in management or entrepreneurial ventures.\n\n🪐 **Jupiter Transit:** From March to August, Jupiter blesses your career sector. This is the time to pitch bold ideas, seek promotions, or launch new projects.\n\n🔢 **Numerology (Life Path 3):** Your creative expression number aligns with communication-based careers. Writing, teaching, or media could open unexpected doors.\n\n⭐ **Dasha Period:** You're currently in a Venus Mahadasha, suggesting financial growth through artistic or relationship-oriented work.\n\nThe cosmos advises: Be bold in your professional choices this spring. The stars are aligning in your favor.",
    timestamp: new Date(Date.now() - 180000),
  },
];

export const mockHistory: HistoryItem[] = [
  {
    id: "h1",
    date: new Date(2026, 2, 28),
    question: "What does my birth chart say about my career path this year?",
    preview: "Jupiter in your 10th house brings remarkable professional expansion...",
    fullPrediction: "Based on your Aries Sun and the current transit of Jupiter through your 10th house of career, 2026 is a year of remarkable professional expansion. Your natural leadership qualities will be amplified. Expect opportunities in management or entrepreneurial ventures.",
  },
  {
    id: "h2",
    date: new Date(2026, 2, 25),
    question: "Will I find love this year?",
    preview: "Venus entering your 7th house suggests a significant romantic encounter...",
    fullPrediction: "Venus entering your 7th house suggests a significant romantic encounter is on the horizon. The alignment of Mars and Venus in May creates a powerful conjunction for matters of the heart.",
  },
  {
    id: "h3",
    date: new Date(2026, 2, 20),
    question: "What are my lucky numbers for this month?",
    preview: "Your numerological chart reveals powerful numbers: 3, 7, 12, 21...",
    fullPrediction: "Your numerological chart reveals powerful numbers for March 2026: 3, 7, 12, 21, and 33. The number 7 is especially potent this month as it aligns with your life path number.",
  },
  {
    id: "h4",
    date: new Date(2026, 2, 15),
    question: "Should I invest in real estate?",
    preview: "Saturn in your 4th house indicates a favorable period for property...",
    fullPrediction: "Saturn in your 4th house indicates a favorable period for property investments. However, Mercury retrograde in April suggests waiting until May before signing any major contracts.",
  },
  {
    id: "h5",
    date: new Date(2026, 2, 10),
    question: "What does my health look like this year?",
    preview: "The Sun's transit through your 6th house brings focus to wellness...",
    fullPrediction: "The Sun's transit through your 6th house brings focus to wellness and daily routines. This is an excellent period to start new health regimens. Pay attention to your digestive system during Mars retrograde.",
  },
];

export const creditPackages: CreditPackage[] = [
  { id: "p1", credits: 10, price: 4.99 },
  { id: "p2", credits: 25, price: 9.99, originalPrice: 12.49, label: "20% OFF" },
  { id: "p3", credits: 50, price: 17.99, originalPrice: 24.99, label: "Best Value", bestValue: true },
  { id: "p4", credits: 100, price: 29.99, originalPrice: 49.99, label: "40% OFF" },
];

export const zodiacSymbols = ["♈","♉","♊","♋","♌","♍","♎","♏","♐","♑","♒","♓"];

export const mockAIResponses = [
  "🔮 The celestial alignments reveal fascinating insights about your query. The current planetary positions suggest a period of transformation and growth. Trust in the cosmic flow and remain open to unexpected opportunities that may arise in the coming weeks.",
  "✨ The stars speak clearly on this matter. Your numerological vibrations are strong — the number 7 resonates deeply with your current life phase. This is a time for introspection and spiritual growth. The universe is guiding you toward your true path.",
  "⭐ According to the cosmic tapestry, your planetary dasha period is entering an auspicious phase. The alignment of Venus and Jupiter in your chart suggests positive developments in relationships and finances. Embrace the changes coming your way.",
  "🌙 The lunar nodes in your chart indicate a karmic turning point. Your past life connections are influencing present circumstances. The cosmos advises patience and mindfulness. Great revelations await those who trust the celestial timing.",
];
