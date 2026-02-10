import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../App'
import axios from 'axios'
import { FaCopy } from "react-icons/fa";
import toast, { Toaster } from 'react-hot-toast'

const Session = () => {
    const { backendUrl, userId } = useContext(AppContext)
    axios.defaults.withCredentials = true;
    const [session, setSession] = useState(null)
    const [loading, setLoading] = useState(true)
    const [isOwner, setIsOwner] = useState(false)
    const [inSession, setInSession] = useState(false)
    const sessionId = window.location.href.split('/').pop()
    const checkInSession = async () => {
        try {
            const { data } = await axios.post(`${backendUrl}/api/sessions/check-in-session`, {
                userId,
                sessionId
            })
            if (data.inSession) {
                toast.success("You are already in this session")
                setInSession(true)
            }
        } catch (error) {
            toast.error("Failed to check in session")
        }
    }
    const handleJoinSession = async () => {
        try {
            const { data } = await axios.post(`${backendUrl}/api/sessions/join-session`, {
                userId,
                sessionId
            })
            toast.success("You joined the session successfully")
            setInSession(true)
        } catch (error) {
            toast.error("Failed to join session")
        }
    }
    const fetchSession = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/sessions/get-session`, {
                params: { sessionId }
            })
            setSession(data.session)
            setIsOwner(data.session.createdBy === userId)
        } catch (error) {
            toast.error("Failed to fetch session")
        } finally {
            setLoading(false)
        }
    }
    useEffect(() => {
        checkInSession()
        fetchSession()
    }, [])
    if (loading) {
        return <div>Loading...</div>
    }
    if (!session) {
        return <div>Session not found</div>
    }
    if (!inSession) {
        return <div className='flex flex-col items-center gap-2 justify-center h-screen'>
            <p>You are not in this session</p>
            <button onClick={handleJoinSession} className='bg-none text-slate-600 px-4 py-2 rounded-lg border border-slate-600 hover:bg-slate-600 hover:text-white transition-colors duration-200 cursor-pointer'>Join Session</button>
        </div>
    }
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
    return (
        <div className='p-4 '>
            <div className='flex items-center gap-3'>
                <h1 className='text-3xl font-semibold'>{session.title}</h1>
                <span className={`px-2 py-1 rounded-full ${colorOptions(session.status)}`}>
                    {session.status}
                </span>
            </div>
            <p>Share this session with your friends: <span className='text-slate-600'>{window.location.href}</span> <button onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success("Session link copied to clipboard") }}
                className='bg-none text-slate-600 px-4 py-2 rounded-lg border border-slate-600 hover:bg-slate-600 hover:text-white transition-colors duration-200 cursor-pointer'
            ><FaCopy className='w-3 h-3' /></button></p>
            {isOwner && (
                <div className='flex items-center gap-2'>
                    you are the owner
                </div>
            )}
            <Toaster position="top-center" reverseOrder={false} />
        </div>
    )
}

export default Session