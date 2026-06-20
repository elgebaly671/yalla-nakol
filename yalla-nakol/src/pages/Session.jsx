import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../App'
import { FaCopy, FaCheckCircle, FaTimes, FaPlus, FaUsers, FaShoppingCart, FaTrash, FaCalculator } from "react-icons/fa";
import { CiCircleChevLeft } from "react-icons/ci";
import toast, { Toaster } from 'react-hot-toast'
import Select from 'react-select'
import { useNavigate } from 'react-router-dom';
import PopUp from '../components/PopUp';
import { supabase } from '../supabase-client'; // Import Supabase Client

const Session = () => {
    const { userId } = useContext(AppContext)
    const [session, setSession] = useState(null)
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [isOwner, setIsOwner] = useState(false)
    const [inSession, setInSession] = useState(false)
    const [showAddItem, setShowAddItem] = useState(false)
    const [showLeaveSession, setShowLeave] = useState(false)
    const [items, setItems] = useState([])
    const [selectedOptions, setSelectedOptions] = useState([])
    const [waitingAccept, setWaitingAccept] = useState(false);
    const [queue, setQueue] = useState([])
    const [itemContributors, setItemContributors] = useState({})
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
    // Receipt States
    const [receipts, setReceipts] = useState(null);
    const [sessionTotal, setSessionTotal] = useState(0);
    const [showReceiptModal, setShowReceiptModal] = useState(false);
    const [isCalculating, setIsCalculating] = useState(false);

    const navigate = useNavigate();
    const sessionId = window.location.href.split('/').pop();

    const listOfUsers = users.map((user) => ({
        value: user.userId,
        label: user.userName
    }))

    // 1. Unified Access Check (Checks both tables)
    const checkUserAccess = async () => {
        try {
            // First, check if they are already an active member
            const { data: activeData } = await supabase
                .from('insession')
                .select('*')
                .eq('sessionId', sessionId)
                .eq('userId', userId)
                .single();

            if (activeData) {
                setInSession(true);
                setWaitingAccept(false);
                return; // Stop here if they are already in
            }

            // If not active, check if they are in the waiting list
            const { data: pendingData } = await supabase
                .from('requestjoin')
                .select('*')
                .eq('sessionId', sessionId)
                .eq('userId', userId)
                .single();

            if (pendingData) {
                setWaitingAccept(true);
            }
        } catch (error) {
            // It's normal to hit errors here if no rows are found, so we fail silently
            console.error("Access check:", error.message);
        }
    }

    const fetchSession = async () => {
        try {
            const { data, error } = await supabase
                .from('sessions')
                .select('*')
                .eq('id', sessionId)
                .single();

            if (error) throw error;
            setSession(data);
            setIsOwner(data.createdBy === userId);

            if (data.createdBy === userId) {
                getSessionQueue();
            }
        } catch (error) {
            toast.error("Failed to fetch session");
        } finally {
            setLoading(false);
        }
    }

    const fetchSessionItems = async () => {
        try {
            const { data: itemsData, error: itemsError } = await supabase
                .from('items')
                .select('*')
                .eq('sessionId', sessionId);

            if (itemsError) throw itemsError;
            setItems(itemsData || []);
            fetchItemContributors(itemsData || []);
        } catch (error) {
            toast.error(error.message);
        }
    }

    const fetchItemContributors = async (itemsList) => {
        try {
            if (itemsList.length === 0) return;
            const itemIds = itemsList.map(i => i.id);

            const { data, error } = await supabase
                .from('itemsharing')
                .select('*')
                .in('itemId', itemIds);

            if (error) throw error;

            const contributorsMap = {};
            data.forEach(contributor => {
                if (!contributorsMap[contributor.itemId]) {
                    contributorsMap[contributor.itemId] = [];
                }
                contributorsMap[contributor.itemId].push(contributor);
            });

            setItemContributors(contributorsMap);
        } catch (error) {
            toast.error(error.message);
        }
    }

    const fetchSessionUsers = async () => {
        try {
            const { data, error } = await supabase
                .from('insession')
                .select('*')
                .eq('sessionId', sessionId)

            if (error) throw error;
            setUsers(data || []);
        } catch (error) {
            toast.error("Failed to fetch session users");
        }
    }

    const getSessionQueue = async () => {
        try {
            const { data, error } = await supabase
                .from('requestjoin')
                .select('*')
                .eq('sessionId', sessionId);

            if (error) throw error;
            setQueue(data || []);
        } catch (error) {
            toast.error("Failed to get session queue");
        }
    }

    const handleRequestJoin = async (e) => {
        e.preventDefault();
        try {
            const { error } = await supabase
                .from('requestjoin')
                .insert([{
                    id: crypto.randomUUID(),
                    sessionId,
                    userId,
                    userName: e.target.userName.value,
                }]);

            if (error) throw error;

            toast.success("Request sent successfully");
            setWaitingAccept(true);
        } catch (error) {
            toast.error(error.message);
        }
    }

    // Note: We now pass the userName as well so we can copy it over
    const handleAcceptRequest = async (targetUserId, targetUserName) => {
        try {
            // Step 1: Insert them into the active session_users table
            const { error: insertError } = await supabase
                .from('insession')
                .insert([{
                    sessionId,
                    userId: targetUserId,
                    userName: targetUserName
                }]);

            if (insertError) throw insertError;

            // Step 2: Delete their request from the queue
            const { error: deleteError } = await supabase
                .from('requestjoin')
                .delete()
                .eq('sessionId', sessionId)
                .eq('userId', targetUserId);

            if (deleteError) throw deleteError;

            toast.success("Accepted request successfully");
        } catch (error) {
            toast.error(error.message);
        }
    }

    const handleOwnerRejoin = async (e) => {
        e.preventDefault();
        try {
            const { error } = await supabase
                .from('insession')
                .upsert([{
                    sessionId,
                    userId,
                    userName: e.target.userName.value,
                }], { onConflict: 'sessionId,userId' });

            if (error) throw error;
            toast.success("Rejoined successfully");
            setInSession(true);
            fetchSessionUsers();
        } catch (error) {
            toast.error(error.message);
        }
    }

    const handleLeaveSession = async () => {
        try {
            const { error } = await supabase
                .from('insession')
                .delete()
                .eq('sessionId', sessionId)
                .eq('userId', userId);

            if (error) throw error;

            toast.success("You left the session");
            setInSession(false);
            setShowLeave(false);
        } catch (error) {
            toast.error(error.message);
        }
    }

    const handleAddItem = async (e) => {
        e.preventDefault();
        try {
            // 1. Insert Item
            const { data: newItem, error: itemError } = await supabase
                .from('items')
                .insert([{
                    sessionId,
                    userId,
                    name: e.target.itemName.value,
                    price: parseFloat(e.target.itemPrice.value),
                    quantity: parseInt(e.target.itemQuantity.value)
                }])
                .select()
                .single();

            if (itemError) throw itemError;

            // 2. Insert Contributors
            if (selectedOptions.length > 0) {
                const contributorInserts = selectedOptions.map(option => ({
                    sessionId,
                    itemId: newItem.id,
                    userId: option.value,
                    userName: option.label
                }));

                const { error: contribError } = await supabase
                    .from('itemsharing')
                    .insert(contributorInserts);

                if (contribError) throw contribError;
            }
            fetchSessionItems()
            toast.success("Item added successfully");
            setSelectedOptions([]);
            setShowAddItem(false);
        } catch (error) {
            toast.error(error.message);
        }
    }

    const handleDeleteItem = async (itemId) => {
        try {
            const { error } = await supabase
                .from('items')
                .delete()
                .eq('id', itemId);
            if (error) throw error;
            toast.success("Item deleted");
            fetchSessionItems()
        } catch (error) {
            toast.error(error.message);
        }
    }

    const handleSelectChange = (selectedOption) => {
        setSelectedOptions(selectedOption)
    }

    // 2. Client-Side Receipt Calculation (Serverless Math)
    const handleCalculateTotal = () => {
        setIsCalculating(true);
        let total = 0;
        const userTotals = {};

        // Initialize user objects
        users.forEach(u => {
            userTotals[u.userId] = { userId: u.userId, userName: u.userName, totalOwed: 0, itemizedBreakdown: [] };
        });

        // Calculate Splits
        items.forEach(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;

            const contributors = itemContributors[item.id] || [];
            if (contributors.length > 0) {
                const splitAmount = itemTotal / contributors.length;

                contributors.forEach(c => {
                    if (!userTotals[c.userId]) {
                        userTotals[c.userId] = { userId: c.userId, userName: c.userName, totalOwed: 0, itemizedBreakdown: [] };
                    }
                    userTotals[c.userId].totalOwed += splitAmount;
                    userTotals[c.userId].itemizedBreakdown.push({
                        itemName: item.name,
                        splitShare: splitAmount.toFixed(2)
                    });
                });
            }
        });

        // Format for state display
        const receiptsArray = Object.values(userTotals)
            .map(r => ({ ...r, totalOwed: r.totalOwed.toFixed(2) }))
            .filter(r => r.totalOwed > 0); // Only show users who owe money

        setSessionTotal(total.toFixed(2));
        setReceipts(receiptsArray);
        setShowReceiptModal(true);
        setIsCalculating(false);
    }

  // 3. Supabase Realtime Subscriptions (Replaces Socket.io)
    useEffect(() => {
        checkUserAccess();
        fetchSession();
        fetchSessionItems();
        fetchSessionUsers();

        // 1. FIX: Add a random ID to the channel name to prevent React Strict Mode race conditions
        const channelName = `session_${sessionId}_${Math.random().toString(36).substring(7)}`;
        const channel = supabase.channel(channelName);

        channel
            .on('postgres_changes', { event: '*', schema: 'public', table: 'items', filter: `sessionId=eq.${sessionId}` }, (payload) => {
                console.log("⚡ ITEMS CHANGED:", payload);
                fetchSessionItems();
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'itemsharing', filter: `sessionId=eq.${sessionId}` }, (payload) => {
                console.log("⚡ ITEM SHARING CHANGED:", payload);
                fetchSessionItems(); 
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'insession', filter: `sessionId=eq.${sessionId}` }, (payload) => {
                console.log("⚡ USERS IN SESSION CHANGED:", payload);
                fetchSessionUsers();
                checkUserAccess();
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'requestjoin', filter: `sessionId=eq.${sessionId}` }, (payload) => {
                console.log("⚡ WAITLIST CHANGED:", payload);
                getSessionQueue();
                checkUserAccess();
            })
            .subscribe((status, err) => {
                // 2. FIX: Force Supabase to report its connection status
                console.log(`📡 Realtime Status: ${status}`);
                if (err) console.error("Realtime Error:", err);
            });

        return () => {
            console.log("🧹 Cleaning up Supabase channel...");
            supabase.removeChannel(channel);
        };
    }, [sessionId, userId]);


    const colorOptions = (status) => {
        switch (status) {
            case "active": return "text-green-700 bg-green-100 border border-green-200";
            case "inactive": return "text-red-700 bg-red-100 border border-red-200";
            default: return "text-gray-700 bg-gray-100 border border-gray-200";
        }
    }

    // === ALL RENDER RETURNS REMAIN EXACTLY THE SAME AS YOUR UI ===

    if (loading) return (
        <div className="flex justify-center items-center h-screen bg-slate-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-700"></div>
        </div>
    )

    if (!session) return (
        <div className="flex justify-center items-center h-screen bg-slate-50 text-slate-600 text-lg">
            Session not found
        </div>
    )

    if (waitingAccept) return (
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

    if (!inSession && isOwner) return (
        <div className='flex flex-col items-center justify-center h-screen bg-slate-50 p-4'>
            <button onClick={() => navigate('/home')} className='group flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-slate-800 transition-colors w-fit'>
                <CiCircleChevLeft className='w-6 h-6 group-hover:-translate-x-1 transition-transform' /> Back to Home
            </button>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 w-full max-w-md text-center">
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Rejoin Your Session</h2>
                <p className="text-slate-500 mb-6">You left this session. Enter your name to rejoin.</p>
                <form onSubmit={handleOwnerRejoin} className='flex flex-col gap-4'>
                    <input type="text" name='userName' placeholder='Enter your username' className='w-full border border-slate-200 rounded-lg py-3 px-4 focus:ring-2 focus:ring-slate-500 outline-none' required />
                    <button type='submit' className='w-full bg-slate-800 text-white rounded-lg py-3 px-4 font-medium hover:bg-slate-700 transition-colors'>Rejoin Session</button>
                </form>
            </div>
        </div>
    )

    if (!inSession && !isOwner) return (
        <div className='flex flex-col items-center justify-center h-screen bg-slate-50 p-4'>
            <button onClick={() => navigate('/home')} className='group flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-slate-800 transition-colors w-fit'>
                <CiCircleChevLeft className='w-6 h-6 group-hover:-translate-x-1 transition-transform' /> Back to Home
            </button>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 w-full max-w-md text-center">
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Join Session</h2>
                <p className="text-slate-500 mb-6">You need to request access to view this session.</p>
                <form onSubmit={handleRequestJoin} className='flex flex-col gap-4'>
                    <input type="text" name='userName' placeholder='Enter your username' className='w-full border border-slate-200 rounded-lg py-3 px-4 focus:ring-2 focus:ring-slate-500 outline-none' required />
                    <button type='submit' className='w-full bg-slate-800 text-white rounded-lg py-3 px-4 font-medium hover:bg-slate-700 transition-colors'>Request to Join</button>
                </form>
            </div>
        </div>
    )

    return (
        <div className='min-h-screen bg-[#F3E4C9]/20 pb-12 font-sans'>
            <div className='max-w-7xl mx-auto px-4 py-8 space-y-8'>
                <button onClick={() => navigate('/home')} className='group flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-slate-800 transition-colors w-fit'>
                    <CiCircleChevLeft className='w-6 h-6 group-hover:-translate-x-1 transition-transform' /> Back to Home
                </button>

                {/* Header Card */}
                <div className="bg-[#0A2947] rounded-3xl shadow-sm border border-slate-100 p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-green-50 rounded-full blur-3xl -z-10 opacity-60 translate-x-1/2 -translate-y-1/2"></div>
                    <div className='flex flex-col gap-3'>
                        <div className="flex items-center gap-4">
                            <h1 className='text-4xl font-bold text-slate-300 tracking-tight'>{session.title}</h1>
                            <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${colorOptions(session.status)}`}>{session.status}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-200 w-fit px-3 py-1.5 rounded-lg border border-slate-100">
                            <span className="truncate max-w-[200px] sm:max-w-md font-mono text-xs">{window.location.href}</span>
                            <button onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success("Copied to clipboard") }} className='p-1.5 hover:bg-white hover:shadow-sm rounded-md transition-all text-slate-400 hover:text-slate-700'>
                                <FaCopy />
                            </button>
                        </div>
                        {isOwner && <p className='text-green-600 flex items-center gap-1.5 text-sm font-medium mt-1'><FaCheckCircle /> You are the host</p>}
                    </div>

                    <button onClick={() => setShowLeave(true)} className='text-red-400 cursor-pointer bg-red-400/20 hover:bg-red-200 border border-red-300 rounded-xl px-6 py-3 font-semibold transition-all hover:shadow-sm w-full md:w-auto'>
                        Leave Session
                    </button>
                </div>

                {showLeaveSession && (
                    <PopUp title='Leave Session' message='Are you sure you want to leave the session? You can always request to rejoin later.' onConfirm={handleLeaveSession} onCancel={() => setShowLeave(false)} />
                )}

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column: Users & Queue */}
                    <div className="space-y-6 lg:col-span-4">
                        {isOwner && queue.length > 0 && (
                            <div className="bg-white rounded-3xl shadow-sm border border-amber-200 p-6 mb-6">
                                <h3 className="text-xl font-bold text-amber-600 mb-4 flex items-center gap-2"><FaUsers /> Waitlist ({queue.length})</h3>
                                <div className='flex flex-col gap-3'>
                                    {queue.map(req => (
                                        <div key={req.userId} className="flex justify-between items-center bg-amber-50 p-3 rounded-xl border border-amber-100">
                                            <span className="font-semibold text-slate-700">{req.userName}</span>
                                            <button onClick={() => handleAcceptRequest(req.userId, req.userName)} className="bg-green-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-green-600">Accept</button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="bg-slate-100 rounded-3xl shadow-sm border border-slate-100 p-6 sticky top-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-slate-800">Users</h3>
                                <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2.5 py-1 rounded-lg">{users.length}</span>
                            </div>

                            {users && users.length > 0 ? (
                                <div className='flex flex-col gap-3'>
                                    {users.map((user) => (
                                        <div key={user.userId} className="group flex bg-white items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-100 to-green-200 text-green-700 flex items-center justify-center font-bold shadow-sm border border-green-200/50">
                                                {user.userName.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-slate-700 leading-tight">{user.userName}</span>
                                                <div className="flex gap-2 mt-0.5">
                                                    {user.userId === session.createdBy && <span className="text-[10px] text-green-600 font-bold uppercase tracking-wider">Host</span>}
                                                    {user.userId === userId && <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">You</span>}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-slate-400 text-sm text-center py-8">No users in this session yet.</p>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Items */}
                    <div className="lg:col-span-8 space-y-6">
                        <div className="bg-slate-100 rounded-3xl shadow-sm border border-slate-100 p-8">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                                <div>
                                    <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-3 mb-1">
                                        <div className="p-2 bg-blue-50 text-blue-500 rounded-xl"><FaShoppingCart size={18} /></div>
                                        Session Items
                                    </h3>
                                    <p className="text-sm text-slate-500 font-medium">Add everything here, including tax and delivery.</p>
                                </div>

                                <div className="flex gap-3 w-full sm:w-auto">
                                    {!showAddItem && (
                                        <button onClick={() => setShowAddItem(true)} className='flex-1 sm:flex-none flex items-center justify-center gap-2 bg-slate-800 text-white px-5 py-3 rounded-xl font-bold hover:bg-slate-700 hover:shadow-md hover:-translate-y-0.5 transition-all'>
                                            <FaPlus size={14} /> Add Item
                                        </button>
                                    )}
                                </div>
                            </div>

                            <button onClick={handleCalculateTotal} disabled={items.length === 0 || isCalculating} className={`w-full flex items-center justify-center gap-2 mb-8 bg-green-500 text-white px-6 py-4 rounded-2xl font-bold text-lg hover:bg-green-600 transition-all ${(items.length === 0 || isCalculating) ? 'opacity-50 cursor-not-allowed' : 'transform hover:-translate-y-0.5 hover:shadow-lg hover:shadow-green-500/20'}`}>
                                <FaCalculator size={18} />
                                {isCalculating ? 'Calculating...' : 'Calculate Final Split'}
                            </button>

                            {/* Add Item Form */}
                            {showAddItem && (
                                <div className="mb-8 p-6 bg-slate-50 border border-slate-100 rounded-3xl shadow-inner">
                                    <div className="flex justify-between items-center mb-6">
                                        <h4 className="text-lg font-bold text-slate-800">New Item</h4>
                                        <button onClick={() => setShowAddItem(false)} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full transition-colors"><FaTimes /></button>
                                    </div>
                                    <form onSubmit={handleAddItem} className='grid grid-cols-1 sm:grid-cols-2 gap-5'>
                                        <input type="text" placeholder='Item Name' name='itemName' className='col-span-1 sm:col-span-2 border border-slate-200 px-4 py-3 rounded-xl focus:ring-4 focus:ring-slate-500/10 focus:border-slate-500 outline-none transition-all shadow-sm' required />
                                        <input type="number" step="0.01" placeholder='Price (£)' name='itemPrice' className='border border-slate-200 px-4 py-3 rounded-xl focus:ring-4 focus:ring-slate-500/10 focus:border-slate-500 outline-none transition-all shadow-sm' required />
                                        <input type="number" placeholder='Quantity' name='itemQuantity' className='border border-slate-200 px-4 py-3 rounded-xl focus:ring-4 focus:ring-slate-500/10 focus:border-slate-500 outline-none transition-all shadow-sm' required />

                                        <div className="col-span-1 sm:col-span-2 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <label className="text-sm font-semibold text-slate-600">Who is splitting this?</label>
                                                <button type="button" className='text-xs font-bold bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-300 transition-colors' onClick={() => setSelectedOptions(listOfUsers)}>Select All</button>
                                            </div>
                                            <Select
                                                classNamePrefix='react-select'
                                                options={listOfUsers}
                                                value={selectedOptions}
                                                onChange={handleSelectChange}
                                                isMulti={true}
                                                placeholder='Select friends...'
                                                styles={{ control: (base) => ({ ...base, borderRadius: '0.75rem', padding: '0.25rem', borderColor: '#e2e8f0' }) }}
                                            />
                                        </div>

                                        {selectedOptions.length > 0 && (
                                            <div className='col-span-1 sm:col-span-2 flex flex-wrap gap-2'>
                                                {selectedOptions.map((option) => (
                                                    <div key={option.value} className='flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full border border-blue-100 shadow-sm'>
                                                        <p className='text-xs font-bold tracking-wide'>{option.label}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <button type="submit" className='col-span-1 sm:col-span-2 mt-2 bg-slate-800 text-white py-3.5 rounded-xl font-bold text-lg hover:bg-slate-700 transition-all'>Save Item</button>
                                    </form>
                                </div>
                            )}

                            {/* Items List */}
                            {items && items.length > 0 ? (
                                <div className='space-y-4'>
                                    {items.map((item) => (
                                        <div key={item.id} className="group relative flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-1">
                                                    <h4 className="text-xl font-bold text-slate-800">{item.name}</h4>
                                                    <span className="text-sm font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">Qty: {item.quantity}</span>
                                                </div>

                                                {itemContributors[item.id] && itemContributors[item.id].length > 0 && (
                                                    <div className="mt-3 flex flex-wrap gap-2 items-center">
                                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mr-1">Shared By</span>
                                                        {itemContributors[item.id].map((user) => (
                                                            <span key={user.userId} className="bg-blue-50/80 text-blue-600 border border-blue-100 px-2.5 py-1 rounded-full text-xs font-semibold">{user.userName}</span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex items-center justify-between w-full sm:w-auto gap-6 sm:pl-6 sm:border-l border-slate-100">
                                                <div className="text-2xl font-black text-slate-800 tracking-tight">£{item.price * item.quantity}</div>
                                                <button onClick={() => handleDeleteItem(item.id)} className='p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all cursor-pointer'><FaTrash size={16} /></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                !showAddItem && (
                                    <div className='flex flex-col items-center justify-center py-16 px-4 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50'>
                                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 mb-4">
                                            <FaShoppingCart className="text-slate-300 w-8 h-8" />
                                        </div>
                                        <p className="text-slate-500 font-medium text-center">Your table is empty.<br />Start adding items to split the bill!</p>
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Final Receipt Modal */}
            {showReceiptModal && receipts && (
                <div className='fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4' onClick={() => setShowReceiptModal(false)}>
                    <div className='relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh]' onClick={e => e.stopPropagation()}>
                        <div className='p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-2xl'>
                            <div>
                                <h2 className='text-2xl font-bold text-slate-800'>Final Receipt</h2>
                                <p className='text-slate-500 mt-1'>Total Session Cost: <span className='font-bold text-green-600 text-lg'>£{sessionTotal}</span></p>
                            </div>
                            <button onClick={() => setShowReceiptModal(false)} className='p-2 hover:bg-slate-200 rounded-full transition-colors'><FaTimes className='text-slate-500 w-5 h-5' /></button>
                        </div>

                        <div className='p-6 overflow-y-auto space-y-4 flex-1 bg-slate-50/50'>
                            {receipts.map(receipt => (
                                <div key={receipt.userId} className='bg-white border border-slate-200 rounded-xl p-5 shadow-sm'>
                                    <div className='flex justify-between items-center mb-4 pb-4 border-b border-slate-100'>
                                        <div className='flex items-center gap-3'>
                                            <div className='w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg'>{receipt.userName.charAt(0).toUpperCase()}</div>
                                            <h3 className='font-bold text-xl text-slate-800'>{receipt.userName}</h3>
                                        </div>
                                        <div className='bg-green-100 text-green-800 px-4 py-2 rounded-lg font-bold text-lg border border-green-200'>Owes: £{receipt.totalOwed}</div>
                                    </div>
                                    <div className='space-y-2'>
                                        <p className='text-xs font-bold text-slate-400 uppercase tracking-wider mb-2'>Item Breakdown</p>
                                        <ul className='space-y-2 text-sm text-slate-600'>
                                            {receipt.itemizedBreakdown.map((item, idx) => (
                                                <li key={idx} className='flex justify-between items-center p-2 rounded hover:bg-slate-50 transition-colors'>
                                                    <div className='flex items-center gap-2'><div className='w-1.5 h-1.5 rounded-full bg-slate-300'></div><span>{item.itemName}</span></div>
                                                    <span className='font-medium text-slate-700'>£{item.splitShare}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className='p-6 border-t border-slate-100 flex justify-end gap-3 bg-white rounded-b-2xl'>
                            <button onClick={() => setShowReceiptModal(false)} className='px-6 py-2.5 bg-slate-800 text-white rounded-lg hover:bg-slate-700 font-medium transition-colors w-full sm:w-auto'>Close Receipt</button>
                        </div>
                    </div>
                </div>
            )}
            <Toaster position="top-center" reverseOrder={false} />
        </div>
    )
}

export default Session