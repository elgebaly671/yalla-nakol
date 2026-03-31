import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../App'
import axios from 'axios'
import { FaCopy, FaCheck, FaTimes, FaPlus, FaUsers, FaShoppingCart, FaTrash } from "react-icons/fa";
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
    const [waitingAccept, setWaitingAccept] = useState(false);
    const [queue, setQueue] = useState([])
    const [itemContributors, setItemContributors] = useState({})
    const listOfUsers = users.map((user) => ({
        value: user.userId,
        label: user.userName
    }))
    const sessionId = window.location.href.split('/').pop()
    const JoinRoom = () => {
        socket.emit('join_room', sessionId);
    }
    const checkWaitingAccept = async () => {
        try {
            const { data } = await axios.post(`${backendUrl}/api/sessions/check-waiting-accept`, {
                userId,
                sessionId
            })
            console.log(data)
            if (data.waitingAccept) {
                //   toast.success("You are already in this session")
                setWaitingAccept(true)
            }
        } catch (error) {
            toast.error("Failed to check waiting accept")
        }
    }
    const getSessionQueue = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/sessions/get-session-queue`, {
                params: {
                    sessionId
                }
            })
            console.log(data)
            if (data.success) {
                setQueue(data.queue)
            }
        } catch (error) {
            toast.error("Failed to get session queue")
        }
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
            if (data.session.createdBy === userId) {
                getSessionQueue()
            }
        } catch (error) {
            toast.error("Failed to fetch session")
            console.log(error)
        } finally {
            setLoading(false)
        }
    }
    const fetchSessionItems = async () => {
        try {
            console.log("fetching items")
            const { data } = await axios.get(`${backendUrl}/api/sessions/get-session-items`, {
                params: { sessionId }
            })
            console.log(data)
            if (data.success) {
                setItems(data.items)
                fetchItemContributors(data.items)
            }
        } catch (error) {
            toast.error(error.message)
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
    const fetchItemContributors = async (itemsList) => {
        try {
            const contributorsMap = {}
            for (const item of itemsList) {
                const { data } = await axios.get(`${backendUrl}/api/sessions/get-item-contributors/${item.id}`)
                if (data.success) {
                    contributorsMap[item.id] = data.users
                }
            }
            setItemContributors(contributorsMap)
        } catch (error) {
            toast.error(error.message)
        }
    }
    const handleRequestJoin = async (e) => {
        try {
            e.preventDefault()
            console.log(userId, sessionId, e.target.userName.value)
            const { data } = await axios.post(`${backendUrl}/api/sessions/request-join`, {
                userId,
                sessionId,
                userName: e.target.userName.value
            })
            console.log(data)
            if (data.success) {
                toast.success("You requested to join the session successfully")
                JoinRoom();
                socket.emit("request_join", { sessionId })
                setWaitingAccept(true);
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }
    const handleAddItem = async (e) => {
        try {
            e.preventDefault()
            const sharedWith = selectedOptions.map((option) => option.value)
            const { data } = await axios.post(`${backendUrl}/api/sessions/add-item`, {
                userId,
                sessionId,
                name: e.target.itemName.value,
                price: e.target.itemPrice.value,
                quantity: e.target.itemQuantity.value,
                sharedWith
            })
            if (data.success) {
                toast.success("Item added successfully")
                setSelectedOptions([])
                fetchSessionItems()
                setShowAddItem(false)
                socket.emit('added_item', { sessionId })
            }
        } catch (error) {
            toast.error(error.message)
        }
    }
    const handleDeleteItem = async (itemId) => {
        try {
            const { data } = await axios.post(`${backendUrl}/api/sessions/delete-item`, {
                itemId
            })
            if (data.success) {
                toast.success("Item deleted successfully")
                fetchSessionItems()
                socket.emit('deleted_item', { sessionId })
            }
        } catch (error) {
            toast.error(error.message)
        }
    }
    const handleAcceptRequest = async (userId) => {
        try {
            const { data } = await axios.post(`${backendUrl}/api/sessions/accept-request`, {
                userId,
                sessionId
            })
            console.log(data)
            if (data.success) {
                toast.success("You accepted the request successfully")
                JoinRoom();
                socket.emit("accept_request", { sessionId })
                fetchSessionUsers()
                setQueue(queue.filter((user) => user.userId !== userId))
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }
    console.log(items)
    useEffect(() => {
        checkInSession()
        checkWaitingAccept()
        fetchSession()
        fetchSessionItems()
        fetchSessionUsers()
        JoinRoom()
        socket.on("recieve_join", (data) => {
            fetchSessionUsers()
        })
        socket.on("recieve_request", (data) => {
            getSessionQueue()
        })
        socket.on("recieve_accept", (data) => {
            setWaitingAccept(false)
            checkInSession()
        })
        socket.on('recieve_leave', (data) => {
            fetchSessionUsers()
        })
        socket.on('recieve_item', (data) => {
            fetchSessionItems()
        })  
        socket.on('recieve_delete_item', (data) => {
            fetchSessionItems()
        })
        return () => {
            socket.off("recieve_join")
            socket.off("recieve_leave")
            socket.off("recieve_item")
            socket.off("recieve_delete_item")
        }
    }, [])
 if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-slate-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-700"></div>
            </div>
        )
    }

    if (!session) {
        return (
            <div className="flex justify-center items-center h-screen bg-slate-50 text-slate-600 text-lg">
                Session not found
            </div>
        )
    }

    if (waitingAccept) {
        return (
            <div className='flex flex-col items-center gap-4 justify-center h-screen bg-slate-50'>
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center max-w-md">
                    <div className="animate-pulse bg-blue-100 text-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FaUsers className="w-8 h-8" />
                    </div>
                    <h2 className="text-xl font-semibold text-slate-800 mb-2">Request Sent</h2>
                    <p className="text-slate-500">Waiting for the session owner to accept your request...</p>
                </div>
            </div>
        )
    }

    if (!inSession) {
        return (
            <div className='flex flex-col items-center justify-center h-screen bg-slate-50 p-4'>
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 w-full max-w-md text-center">
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Join Session</h2>
                    <p className="text-slate-500 mb-6">You need to request access to view this session.</p>
                    
                    <form onSubmit={(e) => handleRequestJoin(e)} className='flex flex-col gap-4'>
                        <input 
                            type="text" 
                            name='userName' 
                            placeholder='Enter your username' 
                            className='w-full border border-slate-200 rounded-lg py-3 px-4 focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all outline-none' 
                            required 
                        />
                        <button type='submit' className='w-full bg-slate-800 text-white rounded-lg py-3 px-4 font-medium hover:bg-slate-700 transition-colors duration-200'>
                            Request to Join
                        </button>
                    </form>

                    <button onClick={() => window.location.href = "/"} className='mt-6 flex items-center justify-center gap-2 w-full text-slate-500 hover:text-slate-800 transition-colors'>
                        <CiCircleChevLeft className='w-5 h-5' /> Back to Home
                    </button>
                </div>
            </div>
        )
    }

    const colorOptions = (status) => {
        switch (status) {
            case "active": return "text-green-700 bg-green-100 border border-green-200";
            case "inactive": return "text-red-700 bg-red-100 border border-red-200";
            default: return "text-gray-700 bg-gray-100 border border-gray-200";
        }
    }

    return (
        <div className='min-h-screen bg-slate-50 pb-12'>
            <div className='max-w-5xl mx-auto px-4 py-8 space-y-6'>
                
                {/* Header Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className='flex flex-col gap-2'>
                        <div className="flex items-center gap-3">
                            <h1 className='text-3xl font-bold text-slate-800'>{session.title}</h1>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${colorOptions(session.status)}`}>
                                {session.status}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                            <span className="truncate max-w-[200px] sm:max-w-md">{window.location.href}</span>
                            <button onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success("Copied to clipboard") }}
                                className='p-1.5 hover:bg-slate-100 rounded-md transition-colors text-slate-600 hover:text-slate-900'>
                                <FaCopy />
                            </button>
                        </div>
                        {isOwner && (
                            <div>
                                <p className='bg-green-100 text-green-800 w-fit px-3 py-1 rounded-full text-sm font-medium'>You are the host of the session</p>
                            </div>
                        )}
                    </div>
                    
                    <button onClick={handleLeaveSession} className='text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg px-5 py-2.5 font-medium transition-colors w-full md:w-auto'>
                        Leave Session
                    </button>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Left Column: Users & Queue */}
                    <div className="space-y-6 lg:col-span-1">
                        
                        {/* Owner Queue Panel */}
                        {isOwner && queue && queue.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                    <span className="bg-yellow-100 text-yellow-700 p-1.5 rounded-md"><FaUsers /></span>
                                    Pending Requests ({queue.length})
                                </h3>
                                
                                <div className="space-y-3 mb-4 max-h-48 overflow-y-auto pr-2">
                                    {queue.map((user) => (
                                        <div key={user.userId} className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
                                            <span className="font-medium text-slate-700">{user.userName}</span>
                                            <div className="flex gap-2">
                                                <button onClick={() => handleAcceptRequest(user.userId)} className="p-1.5 bg-green-100 text-green-700 hover:bg-green-200 rounded-md transition-colors"><FaCheck size={14} /></button>
                                                <button onClick={() => handleRejectRequest(user.userId)} className="p-1.5 bg-red-100 text-red-700 hover:bg-red-200 rounded-md transition-colors"><FaTimes size={14}/></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {/* <div className="flex gap-2 text-sm pt-3 border-t border-slate-100">
                                    <button onClick={handleAcceptAllRequests} className="flex-1 py-2 text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors font-medium">Accept All</button>
                                    <button onClick={handleRejectAllRequests} className="flex-1 py-2 text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors font-medium">Reject All</button>
                                </div> */}
                            </div>
                        )}

                        {/* Active Users Panel */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                Users ({users.length})
                            </h3>
                            {users && users.length > 0 ? (
                                <div className='flex flex-wrap gap-2'>
                                    {users.map((user) => (
                                        <div key={user.userId} className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full text-sm font-medium border border-slate-200 flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                            {user.userName}{user.userId === session.createdBy ? " (Host)" : ""}{user.userId === userId ? " (You)" : ""}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-slate-500 text-sm text-center py-4 italic">No users in this session</p>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Items */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                    <FaShoppingCart className="text-slate-400"/> Session Items
                                </h3>
                                {!showAddItem && (
                                    <button 
                                        onClick={() => setShowAddItem(true)} 
                                        className='flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-lg font-medium hover:bg-slate-700 transition-colors'>
                                        <FaPlus size={12} /> Add Item
                                    </button>
                                )}
                            </div>

                            {/* Add Item Form */}
                            {showAddItem && (
                                <div className="mb-8 p-5 bg-slate-50 border border-slate-200 rounded-xl">
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="font-semibold text-slate-700">New Item</h4>
                                        <button onClick={() => setShowAddItem(false)} className="text-slate-400 hover:text-slate-600"><FaTimes /></button>
                                    </div>
                                    <form onSubmit={(e) => handleAddItem(e)} className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                                        <input type="text" placeholder='Item Name' name='itemName' className='col-span-1 sm:col-span-2 border border-slate-300 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none' required />
                                        <input type="number" step="0.01" placeholder='Price' name='itemPrice' className='border border-slate-300 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none' required />
                                        <input type="number" placeholder='Quantity' name='itemQuantity' className='border border-slate-300 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none' required />
                                        
                                        <div className="col-span-1 sm:col-span-2">
                                            <Select
                                                className='react-select-container'
                                                classNamePrefix='react-select'
                                                options={listOfUsers}
                                                value={selectedOptions}
                                                onChange={handleSelectChange}
                                                isMulti={true}
                                                placeholder='Select who shares this...' 
                                            />
                                        </div>
                                        
                                        <button type="submit" className='col-span-1 sm:col-span-2 bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors'>
                                            Save Item
                                        </button>
                                    </form>
                                </div>
                            )}

                            {/* Items List */}
                            {items && items.length > 0 ? (
                                <div className='space-y-4'>
                                    {items.map((item) => (
                                        <div key={item.id} className="border border-slate-200 rounded-xl p-4 hover:border-slate-300 transition-colors">
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <h4 className="text-lg font-bold text-slate-800">{item.name}</h4>
                                                    <p className="text-sm text-slate-500">Qty: {item.quantity}</p>
                                                </div>
                                                <div className="text-lg font-semibold text-slate-700">
                                                    £{item.price}
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-center">
                                            {/* Contributors list for the item */}
                                            {itemContributors[item.id] && itemContributors[item.id].length > 0 && (
                                                <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap gap-2 items-center">
                                                    <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Shared by:</span>
                                                    {itemContributors[item.id].map((user) => (
                                                        <span key={user.userId} className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-medium">
                                                            {user.userName}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                            <button className='text-red-500 bg-red-200 p-2 rounded-lg cursor-pointer hover:bg-red-300 transition-colors'
                                            onClick={() => handleDeleteItem(item.id)}
                                            ><FaTrash/></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                !showAddItem && (
                                    <div className='flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50'>
                                        <FaShoppingCart className="text-slate-300 w-12 h-12 mb-3" />
                                        <p className="text-slate-500 text-center">No items added yet. Start adding items to split the bill!</p>
                                    </div>
                                )
                            )}
                        </div>
                    </div>

                </div>
            </div>
            <Toaster position="bottom-right" reverseOrder={false} />
        </div>
    )
}

export default Session