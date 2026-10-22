import AsyncStorage from '@react-native-async-storage/async-storage';

export type StoredBookInfo = {
  id?: string;
  title: string;
  author?: string;
  cover?: string;
  year?: number | string | null;
  addedAt?: string;
};

export type State = {
  saved: string[];
  reading: string[];
  finished: string[];
  progress: Record<string, number>;
  goal: number;
  bookDetails?: Record<string, StoredBookInfo>;
};

const KEY = 'bookgarden_state_v1';

export const emptyState: State = {
  saved: [],
  reading: [],
  finished: [],
  progress: {},
  goal: 12,
  bookDetails: {},
};

export async function loadState(): Promise<State> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return emptyState;
    const parsed = JSON.parse(raw);
    return {
      ...emptyState,
      ...parsed,
      bookDetails: parsed.bookDetails || {},
    };
  } catch {
    return emptyState;
  }
}

export async function saveState(s: State): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(s));
}

export function saveBookMetadata(state: State, book: StoredBookInfo): State {
  const currentDetails = state.bookDetails || {};
  return {
    ...state,
    bookDetails: {
      ...currentDetails,
      [book.title]: {
        ...currentDetails[book.title],
        ...book,
        addedAt: currentDetails[book.title]?.addedAt || new Date().toISOString(),
      },
    },
  };
}
