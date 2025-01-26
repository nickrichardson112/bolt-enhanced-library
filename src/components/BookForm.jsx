import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function BookForm({ onBookAdded }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    isbn: '',
    publication_year: new Date().getFullYear(),
    description: '',
    cover_image_url: '',
    total_copies: 1,
    available_copies: 1,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('books')
        .insert([formData])
        .select();

      if (error) throw error;
      
      setFormData({
        title: '',
        isbn: '',
        publication_year: new Date().getFullYear(),
        description: '',
        cover_image_url: '',
        total_copies: 1,
        available_copies: 1,
      });
      
      onBookAdded(data[0]);
    } catch (error) {
      console.error('Error adding book:', error);
      alert('Error adding book. Make sure you have librarian privileges.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('copies') ? parseInt(value) : value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Title</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">ISBN</label>
        <input
          type="text"
          name="isbn"
          value={formData.isbn}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Publication Year</label>
        <input
          type="number"
          name="publication_year"
          value={formData.publication_year}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows="3"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Cover Image URL</label>
        <input
          type="url"
          name="cover_image_url"
          value={formData.cover_image_url}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Total Copies</label>
          <input
            type="number"
            name="total_copies"
            value={formData.total_copies}
            onChange={handleChange}
            min="1"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Available Copies</label>
          <input
            type="number"
            name="available_copies"
            value={formData.available_copies}
            onChange={handleChange}
            min="0"
            max={formData.total_copies}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
      >
        {loading ? 'Adding Book...' : 'Add Book'}
      </button>
    </form>
  );
}