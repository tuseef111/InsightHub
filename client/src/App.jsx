import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import PublicLayout from './layouts/PublicLayout'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Collections from './pages/Collections'
import Resources from './pages/Resources'
// import Profile from './pages/Profile'
// import BlogDetail from './pages/BlogDetail'
// import Library from './pages/Library'
// import Stats from './pages/Stats'
import Login from './pages/Login'
import Register from './pages/Register'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/home" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/collections" element={<Collections />} />
            <Route path="/resources" element={<Resources />} />
            {/* <Route path="/library" element={<Library />} /> */}
            {/* <Route path="/profile" element={<Profile />} /> */}
            {/* <Route path="/stats" element={<Stats />} /> */}
            {/* <Route path="/blog/:id" element={<BlogDetail />} /> */}
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
