export interface Book {
  id: string;
  title: string;
  isbn: string;
  publication_year: number;
  description: string;
  cover_image_url: string;
  available_copies: number;
  total_copies: number;
  created_at: string;
  updated_at: string;
}

export interface Author {
  id: string;
  name: string;
  biography: string;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

export interface BookAuthor {
  book_id: string;
  author_id: string;
}

export interface BookCategory {
  book_id: string;
  category_id: string;
}