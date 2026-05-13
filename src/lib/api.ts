export const API_BASE_URL = import.meta.env.VITE_API_URL;
export const MEDIA_BASE_URL = API_BASE_URL.replace(/\/api\/v1$/, "");

export const resolveMediaUrl = (url?: string | null) => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${MEDIA_BASE_URL}${url}`;
};

type ApiOptions = RequestInit & { token?: string | null };

export const apiFetch = async <T>(path: string, options: ApiOptions = {}): Promise<T> => {
  const headers = new Headers(options.headers || {});
  const hasFormBody = options.body instanceof FormData;
  if (!headers.has("Content-Type") && !hasFormBody) {
    headers.set("Content-Type", "application/json");
  }

  let body = options.body;
  if (
    body != null &&
    typeof body === "object" &&
    !hasFormBody &&
    !(body instanceof Blob) &&
    !(body instanceof ArrayBuffer) &&
    !(body instanceof URLSearchParams) &&
    !(body instanceof ReadableStream)
  ) {
    body = JSON.stringify(body);
  }
  
  // Get token from options or localStorage
  let token = options.token;
  if (!token) {
    const cached = localStorage.getItem("najah_auth");
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        token = parsed.token;
      } catch {
        // Ignore parsing errors
      }
    }
  }
  
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    body,
    headers
  });

  const data = await response.json();
  if (!response.ok) {
    const message = data?.message || "Request failed";
    throw new Error(message);
  }
  return data as T;
};

export type DictionaryWordPart = {
  arabic: string;
  meaning: string;
};

export type DictionaryWord = {
  _id?: string;
  id?: string;
  letter: string;
  course: string;
  verb?: DictionaryWordPart;
  noun?: DictionaryWordPart;
  adjective?: DictionaryWordPart;
  createdAt?: string;
  updatedAt?: string;
};

export type DictionaryLetter = {
  _id?: string;
  id?: string;
  letter: string;
  course: string;
  createdAt?: string;
  updatedAt?: string;
};

export type DictionaryFavoriteItem = {
  _id?: string;
  id?: string;
  word: DictionaryWord | string;
  addedAt?: string;
};

export type UserDictionaryFavorites = {
  _id?: string;
  id?: string;
  user?: string;
  favorites: DictionaryFavoriteItem[];
};

export const fetchCourseDictionaryLetters = (courseId: string) =>
  apiFetch<{ data: { letters: DictionaryLetter[] } }>(`/courses/${courseId}/dictionary/letters`);

export const fetchCourseDictionaryLetterWords = (courseId: string, letter: string) =>
  apiFetch<{ data: { words: DictionaryWord[]; count?: number } }>(
    `/courses/${courseId}/dictionary/letters/${encodeURIComponent(letter)}/words`,
  );

export const fetchCourseDictionaryMyFavorites = (courseId: string) =>
  apiFetch<{ data: { favorites: UserDictionaryFavorites } }>(
    `/courses/${courseId}/dictionary/my-favorites`,
  );

export const addDictionaryFavorite = (wordId: string) =>
  apiFetch<{ data: { favorites: UserDictionaryFavorites } }>(`/dictionary/favorites/${wordId}`, {
    method: "POST",
  });

export const removeDictionaryFavorite = (wordId: string) =>
  apiFetch<{ data: { favorites: UserDictionaryFavorites } }>(`/dictionary/favorites/${wordId}`, {
    method: "DELETE",
  });
