export type Book = {
  id: string;
  title: string;
  author: string;
  year: number | null;
  cover: string;
};

export const API_BASE = 'https://bookgarden-inspired-preview.vercel.app/api/books';

export const CURATED_CATEGORIES = [
  { key: 'bestsellers', label: 'Bestsellers', query: 'bestsellers' },
  { key: 'classics', label: 'Classics', query: 'classic literature' },
  { key: 'philosophy', label: 'Philosophy', query: 'philosophy' },
  { key: 'nature', label: 'Nature & Botany', query: 'nature ecology plants' },
  { key: 'science', label: 'Science', query: 'science discovery' },
  { key: 'fiction', label: 'Fiction', query: 'award winning fiction' },
];

export const FALLBACK_BOOKS: Book[] = [
  {
    id: '/works/OL82563W',
    title: 'The Secret Garden',
    author: 'Frances Hodgson Burnett',
    year: 1911,
    cover: 'https://covers.openlibrary.org/b/id/8225261-M.jpg',
  },
  {
    id: '/works/OL27479W',
    title: 'Walden',
    author: 'Henry David Thoreau',
    year: 1854,
    cover: 'https://covers.openlibrary.org/b/id/8315102-M.jpg',
  },
  {
    id: '/works/OL45804W',
    title: 'Silent Spring',
    author: 'Rachel Carson',
    year: 1962,
    cover: 'https://covers.openlibrary.org/b/id/8447816-M.jpg',
  },
  {
    id: '/works/OL262758W',
    title: 'Braiding Sweetgrass',
    author: 'Robin Wall Kimmerer',
    year: 2013,
    cover: 'https://covers.openlibrary.org/b/id/10528246-M.jpg',
  },
  {
    id: '/works/OL2163351W',
    title: 'The Hidden Life of Trees',
    author: 'Peter Wohlleben',
    year: 2015,
    cover: 'https://covers.openlibrary.org/b/id/8448834-M.jpg',
  },
  {
    id: '/works/OL42975424W',
    title: 'Can We Be Strangers Again?',
    author: 'Shrijeet Shandilya',
    year: 2024,
    cover: 'https://covers.openlibrary.org/b/id/15073759-M.jpg',
  },
];

export async function searchBooks(q: string): Promise<Book[]> {
  const query = q.trim() || 'bestsellers';
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(`${API_BASE}?q=${encodeURIComponent(query)}`, {
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) {
      throw new Error(`Status ${res.status}`);
    }
    const data = await res.json();
    if (Array.isArray(data.books) && data.books.length > 0) {
      return data.books;
    }
    return FALLBACK_BOOKS.filter(b =>
      b.title.toLowerCase().includes(query.toLowerCase()) ||
      b.author.toLowerCase().includes(query.toLowerCase())
    );
  } catch {
    // If offline or network error, return matching curated books
    const filtered = FALLBACK_BOOKS.filter(b =>
      b.title.toLowerCase().includes(query.toLowerCase()) ||
      b.author.toLowerCase().includes(query.toLowerCase())
    );
    return filtered.length > 0 ? filtered : FALLBACK_BOOKS;
  }
}

export const palettes = [
  '#2a4231',
  '#4a3a2a',
  '#253b47',
  '#533e2d',
  '#3d3049',
  '#2a433d',
];
