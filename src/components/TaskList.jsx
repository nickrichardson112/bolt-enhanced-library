import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function TaskList({ userId }) {
  const [tasks, setTasks] = useState([])
  const [editingTask, setEditingTask] = useState(null)

  useEffect(() => {
    fetchTasks()
  }, [userId])

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setTasks(data)
    } catch (error) {
      console.error('Error fetching tasks:', error)
    }
  }

  const updateTask = async (id, updates) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ ...updates, user_id: userId })
        .eq('id', id)

      if (error) throw error
      
      setEditingTask(null)
      fetchTasks()
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  const deleteTask = async (id) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)

      if (error) throw error
      fetchTasks()
    } catch (error) {
      console.error('Error deleting task:', error)
    }
  }

  return (
    <div className="space-y-4">
      {tasks.map(task => (
        <div key={task.id} className="bg-white shadow rounded-lg p-4">
          {editingTask === task.id ? (
            <div className="space-y-2">
              <input
                type="text"
                value={task.title}
                onChange={(e) => setTasks(tasks.map(t => 
                  t.id === task.id ? { ...t, title: e.target.value } : t
                ))}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              <textarea
                value={task.description}
                onChange={(e) => setTasks(tasks.map(t => 
                  t.id === task.id ? { ...t, description: e.target.value } : t
                ))}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                rows="2"
              />
              <div className="space-x-2">
                <button
                  onClick={() => updateTask(task.id, {
                    title: task.title,
                    description: task.description
                  })}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingTask(null)}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <h3 className="text-lg font-medium">{task.title}</h3>
              <p className="text-gray-500 mt-1">{task.description}</p>
              <div className="mt-4 space-x-2">
                <button
                  onClick={() => setEditingTask(task.id)}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  )
}