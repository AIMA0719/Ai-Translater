export interface TranslationData {
  key: string;
  Korean: string;
  English: string;
  Arabic: string;
  Chinese_Simplified: string;
  Chinese_Traditional: string;
  French: string;
  German: string;
  Hindi: string;
  Indonesian: string;
  Italian: string;
  Japanese: string;
  Malay: string;
  Persian: string;
  Polish: string;
  Portuguese: string;
  Russian: string;
  Spanish: string;
  Thai: string;
  Turkish: string;
  Ukrainian: string;
  Vietnamese: string;
  [key: string]: string; // Index signature for dynamic access if needed
}

export interface TranslationState {
  isLoading: boolean;
  error: string | null;
  data: TranslationData[] | null;
}

export const LANGUAGE_KEYS = [
  "English",
  "Arabic",
  "Chinese_Simplified",
  "Chinese_Traditional",
  "French",
  "German",
  "Hindi",
  "Indonesian",
  "Italian",
  "Japanese",
  "Korean",
  "Malay",
  "Persian",
  "Polish",
  "Portuguese",
  "Russian",
  "Spanish",
  "Thai",
  "Turkish",
  "Ukrainian",
  "Vietnamese"
] as const;