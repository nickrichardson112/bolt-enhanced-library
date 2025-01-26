/*
  # Online Library System Schema

  1. New Tables
    - `books`
      - `id` (uuid, primary key)
      - `title` (text)
      - `isbn` (text, unique)
      - `publication_year` (integer)
      - `description` (text)
      - `cover_image_url` (text)
      - `available_copies` (integer)
      - `total_copies` (integer)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `authors`
      - `id` (uuid, primary key)
      - `name` (text)
      - `biography` (text)
      - `created_at` (timestamptz)
    
    - `book_authors`
      - `book_id` (uuid, foreign key)
      - `author_id` (uuid, foreign key)
    
    - `categories`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `description` (text)
    
    - `book_categories`
      - `book_id` (uuid, foreign key)
      - `category_id` (uuid, foreign key)
    
    - `loans`
      - `id` (uuid, primary key)
      - `book_id` (uuid, foreign key)
      - `user_id` (uuid, foreign key)
      - `borrowed_date` (timestamptz)
      - `due_date` (timestamptz)
      - `returned_date` (timestamptz)
      - `status` (text)

  2. Security
    - Enable RLS on all tables
    - Public read access for books, authors, and categories
    - Authenticated users can borrow books
    - Only users with librarian role can manage books and authors
*/

-- Create tables
CREATE TABLE IF NOT EXISTS books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  isbn text UNIQUE,
  publication_year integer,
  description text,
  cover_image_url text,
  available_copies integer NOT NULL DEFAULT 0,
  total_copies integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS authors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  biography text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS book_authors (
  book_id uuid REFERENCES books ON DELETE CASCADE,
  author_id uuid REFERENCES authors ON DELETE CASCADE,
  PRIMARY KEY (book_id, author_id)
);

CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS book_categories (
  book_id uuid REFERENCES books ON DELETE CASCADE,
  category_id uuid REFERENCES categories ON DELETE CASCADE,
  PRIMARY KEY (book_id, category_id)
);

CREATE TABLE IF NOT EXISTS loans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id uuid REFERENCES books NOT NULL,
  user_id uuid REFERENCES auth.users NOT NULL,
  borrowed_date timestamptz DEFAULT now(),
  due_date timestamptz NOT NULL,
  returned_date timestamptz,
  status text NOT NULL DEFAULT 'borrowed' CHECK (status IN ('borrowed', 'returned', 'overdue')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;

-- Policies for books
CREATE POLICY "Books are viewable by everyone" ON books
  FOR SELECT USING (true);

CREATE POLICY "Librarians can manage books" ON books
  FOR ALL USING (auth.jwt() ->> 'role' = 'librarian');

-- Policies for authors
CREATE POLICY "Authors are viewable by everyone" ON authors
  FOR SELECT USING (true);

CREATE POLICY "Librarians can manage authors" ON authors
  FOR ALL USING (auth.jwt() ->> 'role' = 'librarian');

-- Policies for categories
CREATE POLICY "Categories are viewable by everyone" ON categories
  FOR SELECT USING (true);

CREATE POLICY "Librarians can manage categories" ON categories
  FOR ALL USING (auth.jwt() ->> 'role' = 'librarian');

-- Policies for book_authors and book_categories
CREATE POLICY "Book relationships are viewable by everyone" ON book_authors
  FOR SELECT USING (true);

CREATE POLICY "Librarians can manage book relationships" ON book_authors
  FOR ALL USING (auth.jwt() ->> 'role' = 'librarian');

CREATE POLICY "Book category relationships are viewable by everyone" ON book_categories
  FOR SELECT USING (true);

CREATE POLICY "Librarians can manage book category relationships" ON book_categories
  FOR ALL USING (auth.jwt() ->> 'role' = 'librarian');

-- Policies for loans
CREATE POLICY "Users can view their own loans" ON loans
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create loans" ON loans
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    status = 'borrowed' AND
    (SELECT available_copies FROM books WHERE id = book_id) > 0
  );

CREATE POLICY "Users can update their own returned books" ON loans
  FOR UPDATE USING (
    auth.uid() = user_id AND
    status = 'borrowed'
  );

-- Functions and Triggers
CREATE OR REPLACE FUNCTION update_book_copies() RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE books 
    SET available_copies = available_copies - 1
    WHERE id = NEW.book_id;
  ELSIF TG_OP = 'UPDATE' AND NEW.status = 'returned' AND OLD.status = 'borrowed' THEN
    UPDATE books 
    SET available_copies = available_copies + 1
    WHERE id = NEW.book_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_book_copies_trigger
AFTER INSERT OR UPDATE ON loans
FOR EACH ROW
EXECUTE FUNCTION update_book_copies();