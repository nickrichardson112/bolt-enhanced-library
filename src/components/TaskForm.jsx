import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function TaskForm({ onTaskCreated, userId }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([
          { 
            title, 
            description,
            user_id: userId
          }
        ])
        .select()

      if (error) throw error
      
      setTitle('')
      setDescription('')
      onTaskCreated(data[0])
    } catch (error) {
      console.error('Error creating task:', error)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          rows="3"
        />
      </div>
      <button
        type="submit"
        className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        Create Task
      </button>
    </form>
  )
}