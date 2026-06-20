import { createContext, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Session from './pages/Session'
import toast, { Toaster } from 'react-hot-toast'
import LandingPage from './pages/LandingPage'
export const AppContext = createContext();
function App() {
  const [count, setCount] = useState(0)

  const backendUrl = "http://localhost:3000";
  const [userId, setUserId] = useState(() => localStorage.getItem('yallaID'));
    // 2. REFACTORED: Generate Device ID locally instead of pinging a server
    const checkUserId = () => {
        if (!userId) {
            try {
                let existingId = localStorage.getItem('yallaID');
                if (!existingId) {
                    // Generates a standard, secure UUID directly in the browser
                    existingId = crypto.randomUUID(); 
                    localStorage.setItem('yallaID', existingId);
                }
                setUserId(existingId);
            } catch (error) {
                toast.error("Failed to assign Device ID");
            }
        }
    };
    checkUserId()
  return (
    <BrowserRouter>
      <AppContext.Provider value={{ backendUrl, userId, setUserId }}>
        <Routes>
          <Route path='/' element={<LandingPage />}></Route>
          <Route path='/session/:sessionId' element={<Session />}></Route>
          <Route path='/home' element={<Home/>}></Route>
        </Routes>
      </AppContext.Provider>
    </BrowserRouter>
  )
}

export default App
