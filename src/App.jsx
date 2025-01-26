import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import Auth from './components/Auth'
import LibrarianDashboard from './pages/LibrarianDashboard'
import './App.css'

function App() {
  const [session, setSession] = useState(null)
  const [isLibrarian, setIsLibrarian] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      checkLibrarianRole(session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      checkLibrarianRole(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  const checkLibrarianRole = async (session) => {
    if (session?.user) {
      const { data: { role } } = await supabase.auth.getUser()
      setIsLibrarian(role === 'librarian')
    } else {
      setIsLibrarian(false)
    }
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Library Management System</h1>
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-center">Login or Sign Up</h2>
              <Auth />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!isLibrarian) {
    return (
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Access Denied</h1>
            <p className="text-gray-600 mb-8">You need librarian privileges to access this section.</p>
            <button
              onClick={() => supabase.auth.signOut()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    )
  }

  return <LibrarianDashboard />
}