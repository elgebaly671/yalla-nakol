import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../App'
import axios from 'axios'
import { FaCopy } from "react-icons/fa";
import { CiCircleChevLeft } from "react-icons/ci";
import toast, { Toaster } from 'react-hot-toast'
import Select from 'react-select'
import io from 'socket.io-client'

const socket = io.connect("http://localhost:3000")
const Session = () => {
    const { backendUrl, userId } = useContext(AppContext)
    axios.defaults.withCredentials = true;
    const [session, setSession] = useState(null)
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [isOwner, setIsOwner] = useState(false)
    const [inSession, setInSession] = useState(false)
    const [showAddItem, setShowAddItem] = useState(false)
    const [items, setItems] = useState([])
    const [selectedOptions, setSelectedOptions] = useState([])
    const listOfUsers = users.map((user) => ({
        value: user.userId,
        label: user.userName
    }))
    const sessionId = window.location.href.split('/').pop()
    const JoinRoom = () => {
        socket.emit('join_room', sessionId);
    }
    const checkInSession = async () => {
        try {
            const { data } = await axios.post(`${backendUrl}/api/sessions/check-in-session`, {
                userId,
                sessionId
            })
            console.log(data)
            if (data.inSession) {
                //   toast.success("You are already in this session")
                setInSession(true)
            }
        } catch (error) {
            toast.error("Failed to check in session")
        }
    }
    const handleJoinSession = async (e) => {
        try {
            e.preventDefault()
            console.log(e.target.userName.value)
            const { data } = await axios.post(`${backendUrl}/api/sessions/join-session`, {
                userId,
                sessionId,
                userName: e.target.userName.value
            })
            if (data.success) {
                toast.success("You joined the session successfully")
                socket.emit("Joined_Session", { sessionId })
                JoinRoom();
                setInSession(true)
            }
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
    const fetchSessionItems = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/sessions/get-session-items`, {
                params: { sessionId }
            })
            setItems(data.items)
        } catch (error) {
            toast.error("Failed to fetch session items")
        }
    }
    const fetchSessionUsers = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/sessions/get-session-users`, {
                params: { sessionId }
            })
            setUsers(data.users)
        } catch (error) {
            toast.error("Failed to fetch session users")
        }
    }
    const handleLeaveSession = async () => {
        try {
            const { data } = await axios.post(`${backendUrl}/api/sessions/leave-session`, {
                userId,
                sessionId
            })
            console.log("data:", data)

            if (data.success) {
                toast.success("You left the session successfully")
                JoinRoom();
                socket.emit("leave_session", { sessionId })
                setInSession(false)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }
    const handleSelectChange = (selectedOption) => {
        setSelectedOptions(selectedOption)
    }
    useEffect(() => {
        checkInSession()
        fetchSession()
        fetchSessionItems()
        fetchSessionUsers()
        JoinRoom()
        socket.on("recieve_join", (data) => {
            fetchSessionUsers()
        })
        socket.on('recieve_leave', (data) => {
            fetchSessionUsers()
        })
        return () => {
            socket.off("recieve_join")
            socket.off("recieve_leave")
        }
    }, [])
    if (loading) {
        return <div>Loading...</div>
    }
    if (!session) {
        return <div>Session not found</div>
    }
    if (!inSession) {
        return (
            <div className='flex flex-col items-center gap-2 justify-center h-screen'>
                <p>You are not in this session</p>
                <form onSubmit={(e) => handleJoinSession(e)} className='flex items-center flex-col'>
                    <input type="text" name='userName' placeholder='Enter your username' className='border border-slate-300 rounded-lg py-2 px-4 mb-2 text-center' required />
                    <button type='submit' className='border border-slate-700 rounded-lg py-2 px-4'>Join Session</button>
                </form>

                <button onClick={() => window.location.href = "/"} className='flex items-center gap-2 cursor-pointer text-slate-500 rounded-lg py-2 px-4'>
                    <CiCircleChevLeft className='w-6 h-6' /> Or Back to Home
                </button>
            </div>
        )
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
            <div className='flex justify-between'>
                <div className='flex items-center gap-3'>
                    <h1 className='text-3xl font-semibold'>{session.title}</h1>
                    <span className={`px-2 py-1 rounded-full ${colorOptions(session.status)}`}>
                        {session.status}
                    </span>
                </div>
                <button
                    onClick={handleLeaveSession}
                    className='sm:block md:hidden lg:hidden bg-none text-red-500 border border-red-500 rounded-lg px-4 py-2 cursor-pointer'>
                    Leave
                </button>
            </div>

            <p>Share this session with your friends: <span className='text-slate-600'>{window.location.href}</span> <button onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success("Session link copied to clipboard") }}
                className='bg-none text-slate-600 px-4 py-2 rounded-lg border border-slate-600 hover:bg-slate-600 hover:text-white transition-colors duration-200 cursor-pointer'
            ><FaCopy className='w-3 h-3' /></button></p>
            {isOwner && (
                <div className='flex items-center gap-2'>
                    you are the owner
                </div>
            )}
            {users && users.length > 0 ? (
                <div className='flex items-center gap-2'>
                    <p>Users:</p>
                    <ul>
                        {users.map((user) => (
                            <li key={user.userId}>{user.userName}</li>
                        ))}
                    </ul>
                </div>
            ) : (
                <div className='flex flex-col items-center gap-2 justify-center h-[20vh]'>
                    <p>No users in this session</p>
                </div>
            )}
            {items && items.length > 0 ? (
                <div className='flex items-center gap-2'>
                    <p>Items:</p>
                    <ul>
                        {items.map((item) => (
                            <li key={item.id}>{item.itemName} - {item.itemPrice}</li>
                        ))}
                    </ul>
                </div>
            ) : (
                <div className='flex flex-col items-center gap-2 justify-center h-[20vh]'>
                    <p>No items in this session</p>
                    <button
                        onClick={() => setShowAddItem(!showAddItem)}
                        className='bg-none text-slate-600 px-4 py-2 rounded-lg border border-slate-600 hover:bg-slate-600 hover:text-white transition-colors duration-200 cursor-pointer'>Add Items</button>
                </div>
            )}

            {showAddItem && (
                <div>
                    <form action="" onSubmit={(e) => handleAddItem(e)} className='flex items-center justify-center flex-col gap-2'>
                        <input type="text" placeholder='Enter Item name' name='itemName' className='border border-slate-400 px-4 py-2 focus:border-slate-600 focus:outline-none placeholder:text-slate-500 rounded-lg' />
                        <input type="number" placeholder='Enter Item price' name='itemPrice' className='border border-slate-400 px-4 py-2 focus:border-slate-600 focus:outline-none placeholder:text-slate-500 rounded-lg' />
                        <input type="number" placeholder='Enter Item quantity' name='itemQuantity' className='border border-slate-400 px-4 py-2 focus:border-slate-600 focus:outline-none placeholder:text-slate-500 rounded-lg' />
                        <Select
                            className='w-100'
                            options={listOfUsers}
                            value={selectedOptions}
                            onChange={handleSelectChange}
                            isMulti={true}
                            placeholder='Select Contributors' />
                        <button type="submit" className='bg-slate-600 text-white px-4 py-2 rounded-lg border border-slate-600 hover:bg-slate-600 hover:text-white transition-colors duration-200 cursor-pointer'>Add Item</button>
                    </form>
                </div>
            )}
            <Toaster position="top-center" reverseOrder={false} />
        </div>
    )
}

export default Session