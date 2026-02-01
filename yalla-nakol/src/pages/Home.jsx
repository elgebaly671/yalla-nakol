import React, { useContext, useEffect, useState } from 'react'
import { FaPlusCircle } from "react-icons/fa";
import axios from 'axios'
import { CiCirclePlus } from "react-icons/ci";
import toast, { Toaster } from 'react-hot-toast';
import { AppContext } from '../App';

const Home = () => {
  axios.defaults.withCredentials = true;
  const { backendUrl } = useContext(AppContext)
  const [userId, setUserId] = useState(null)
  const [sessions, setSessions] = useState([])
  const handleStartNewSession = async () => {
    try {
      const { data } = await axios.post(`${backendUrl}/api/sessions/create-session`)
    } catch (error) {

    }
  }
  const checkUserId = async () => {
    if (!window.localStorage.getItem('yallaID')) {
      try {
        const { data } = await axios.post(`${backendUrl}/api/user/create-user`);
        window.localStorage.setItem('yallaID', data.userId)
        setUserId(data.userId)
        toast.success("User created successfully")
      } catch (error) {
        toast.error("Failed to create user")
      }
    } else {
      setUserId(window.localStorage.getItem('yallaID'))
    }
  }
  const fetchSessions = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/sessions/get-sessions`, {
        params: {
          userId
        }
      })
      setSessions(data)
    } catch (error) {
      toast.error("Failed to fetch sessions")
    }
  }
  useEffect(() => {
    checkUserId();
  }, [userId]); // Empty dependency array = runs only once on mount
  return (
    <div className='min-h-screen bg-slate-100'>
      <div className='p-20'>
        <h1 className='font-semibold text-6xl'>Home</h1>
        <p className='mt-2 text-slate-600 items-center'>Welcome to Yalla Nakol <span className='text-2xl'>👋</span></p>
        {userId && <p>your ID is {userId}</p>}
      </div>
      <div className='flex justify-center'>
        <div className='pt-10  px-20 bg-slate-200  rounded-t-3xl w-[80%]'>
          <div className='flex items-center justify-between pb-5'>
            <h1 className='font-semibold text-2xl'>Previous Sessions</h1>
            <button
              onClick={() => {
                handleStartNewSession();
              }}
              className='flex items-center gap-2 bg-none text-slate-600 px-4 py-2 rounded-lg border border-slate-600 hover:bg-slate-800 hover:text-white transition-colors duration-200 cursor-pointer'>
              Start New Session <CiCirclePlus />
            </button>
          </div>
        </div>
      </div>
      <Toaster position="top-center" reverseOrder={false} />
    </div>
  )
}

export default Home