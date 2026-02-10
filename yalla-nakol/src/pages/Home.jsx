import React, { useContext, useEffect, useState } from 'react'
import { FaPlusCircle } from "react-icons/fa";
import axios from 'axios'
import { CiCirclePlus } from "react-icons/ci";
import toast, { Toaster } from 'react-hot-toast';
import { AppContext } from '../App';

const Home = () => {
  axios.defaults.withCredentials = true;
  const { backendUrl, userId, setUserId } = useContext(AppContext)
  const [sessions, setSessions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  console.log(userId);
  console.log(sessions);
  const handleCreateSession = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(`${backendUrl}/api/sessions/create-session`, {
        userId,
        title: e.target.title.value
      })
      toast.success("Session created successfully")
      setShowForm(false);
      fetchSessions();
    } catch (error) {
      toast.error("Failed to create session")
    }
  }
  const checkUserId = async () => {
    if (!userId) {
      try {
        const { data } = await axios.post(`${backendUrl}/api/user/create-user`);
        localStorage.setItem('yallaID', data.userId);
        setUserId(data.userId);
        toast.success("User created successfully");
      } catch (error) {
        toast.error("Failed to create user");
      }
    }
  };

  const fetchSessions = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/sessions/get-sessions`, {
        params: { userId }
      });
      setSessions(data.sessions || []);
    } catch (error) {
      toast.error("Failed to fetch sessions");
    }
  };
  const colorOptions = (status) => {
    switch (status) {
      case "active":
        return "text-green-700 bg-green-500/20";
      case "inactive":
        return "text-red-700 bg-red-500/20";
      default:
        return "text-gray-700 bg-gray-500/20";
    }
  }
  useEffect(() => {
    if (!userId) {
      checkUserId();
    } else {
      fetchSessions();
    }
  }, [userId]);
  return (
    <div className='min-h-screen bg-slate-100'>
      <div className='p-20'>
        <h1 className='font-semibold text-6xl'>Home</h1>
        <p className='mt-2 text-slate-600 items-center'>Welcome to Yalla Nakol <span className='text-2xl'>👋</span></p>
        {userId && <p>your ID is {userId}</p>}
      </div>
      <div className='flex justify-center'>
        <div className='pt-10  px-20 bg-slate-200  rounded-t-3xl w-[85%] '>
          <div className='flex items-center justify-between pb-5'>
            <h1 className='font-semibold text-2xl'>Previous Sessions</h1>
            <button
              onClick={() => {
                setShowForm(!showForm);
              }}
              className='flex items-center gap-2 bg-none text-slate-600 px-4 py-2 rounded-lg border border-slate-600 hover:bg-slate-800 hover:text-white transition-colors duration-200 cursor-pointer'>
              Start New Session <CiCirclePlus />
            </button>
          </div>
          {showForm && (
            <form onSubmit={handleCreateSession} className='flex items-center gap-2 justify-center mb-4'>
              <input type="text" name="title" id="" placeholder='Session Title' className='border border-slate-600 rounded-lg px-4 py-2' />
              <button type="submit" className='bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-600 transition-colors duration-200 cursor-pointer'>Create</button>
            </form>
          )}
          <div className='overflow-x-scroll'>
            <table className='min text-center table-auto w-full'>
            <thead >
              <tr>
                <th >Title</th>
                <th>Total Expenses</th>
                <th>Status</th>
                <th>Created At</th>
                <th>Updated At</th>
              </tr>
            </thead>
            <tbody>
              {sessions.length > 0 ? sessions.map((session) => (
                <tr key={session.id} className='bg-slate-300/75 mb-20'>
                  <td className='p-2'>{session.title}</td>
                  <td className='p-2'>{session.totalExpenses}</td>
                  <td className= {`px-2`}><span className={`px-2 py-1 rounded-2xl ${colorOptions(session.status)}`}>{session.status}</span></td>
                  <td className='p-2'>{session.createdAt}</td>
                  <td className='p-2'>{session.updatedAt}</td>
                </tr>
              )) : <tr>
                <td colSpan={5}>No sessions found</td>
              </tr>}
            </tbody>
          </table>
          </div>
        </div>
      </div>
      <Toaster position="top-center" reverseOrder={false} />
    </div>
  )
}

export default Home