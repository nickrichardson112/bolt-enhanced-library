import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import BookForm from '../components/BookForm';
import CategoryForm from '../components/CategoryForm';

export default function LibrarianDashboard() {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeTab, setActiveTab] = useState('books');

  useEffect(() => {
    fetchBooks();
    fetchCategories();
  }, []);

  const fetchBooks = async () => {
    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBooks(data);
    } catch (error) {
      console.error('Error fetching books:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleBookAdded = (newBook) => {
    setBooks(prev => [newBook, ...prev]);
  };

  const handleCategoryAdded = (newCategory) => {
    setCategories(prev => [...prev, newCategory].sort((a, b) => a.name.localeCompare(b.name)));
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Librarian Dashboard</h1>
          
          <div className="mb-8">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('books')}
                  className={`${
                    activeTab === 'books'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  Manage Books
                </button>
                <button
                  onClick={() => setActiveTab('categories')}
                  className={`${
                    activeTab === 'categories'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  Manage Categories
                </button>
              </nav>
            </div>
          </div>

          {activeTab === 'books' ? (
            <div>
              <div className="bg-white shadow rounded-lg p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">Add New Book</h2>
                <BookForm onBookAdded={handleBookAdded} />
              </div>

              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Book List</h2>
                <div className="space-y-4">
                  {books.map(book => (
                    <div key={book.id} className="border-b border-gray-200 pb-4">
                      <div className="flex items-start">
                        {book.cover_image_url && (
                          <img
                            src={book.cover_image_url}
                            alt={book.title}
                            className="w-24 h-32 object-cover rounded-md mr-4"
                          />
                        )}
                        <div>
                          <h3 className="text-lg font-medium">{book.title}</h3>
                          <p className="text-sm text-gray-500">ISBN: {book.isbn}</p>
                          <p className="text-sm text-gray-500">Year: {book.publication_year}</p>
                          <p className="text-sm text-gray-500">
                            Copies: {book.available_copies} / {book.total_copies}
                          </p>
                          {book.description && (
                            <p className="text-sm text-gray-600 mt-2">{book.description}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div className="bg-white shadow rounded-lg p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">Add New Category</h2>
                <CategoryForm onCategoryAdded={handleCategoryAdded} />
              </div>

              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Category List</h2>
                <div className="space-y-4">
                  {categories.map(category => (
                    <div key={category.id} className="border-b border-gray-200 pb-4">
                      <h3 className="text-lg font-medium">{category.name}</h3>
                      {category.description && (
                        <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}