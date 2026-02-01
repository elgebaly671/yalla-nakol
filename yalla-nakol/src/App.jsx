import { createContext, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import { Toaster } from 'react-hot-toast'
export const AppContext = createContext();
function App() {
  const [count, setCount] = useState(0)
  
  const backendUrl = "http://localhost:3000";
  return (
    <BrowserRouter>
      <AppContext.Provider value={{ backendUrl }}>
        <Routes>
          <Route path='/' element={<Home />}></Route>
        </Routes>
      </AppContext.Provider>
    </BrowserRouter>
  )
}

export default App
