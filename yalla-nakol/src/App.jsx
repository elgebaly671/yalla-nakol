import { createContext, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Session from './pages/Session'
import { Toaster } from 'react-hot-toast'
export const AppContext = createContext();
function App() {
  const [count, setCount] = useState(0)

  const backendUrl = "http://localhost:3000";
  const [userId, setUserId] = useState(() => localStorage.getItem('yallaID'));
  return (
    <BrowserRouter>
      <AppContext.Provider value={{ backendUrl, userId, setUserId }}>
        <Routes>
          <Route path='/' element={<Home />}></Route>
          <Route path='/session/:sessionId' element={<Session />}></Route>
        </Routes>
      </AppContext.Provider>
    </BrowserRouter>
  )
}

export default App
