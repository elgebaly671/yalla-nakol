import React, { useContext, useEffect, useState } from 'react';
import { CiCirclePlus } from "react-icons/ci";
import { ImEnter } from "react-icons/im";
import {
    FaCopy, FaFolderOpen, FaHamburger, FaReceipt,
    FaPizzaSlice, FaCoffee, FaWallet, FaUtensils
} from "react-icons/fa";
import toast, { Toaster } from 'react-hot-toast';
import { AppContext } from '../App';
import SessionForm from '../components/SessionForm';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase-client';

const Home = () => {
    // Removed backendUrl as it is no longer needed for Supabase
    const { userId, setUserId } = useContext(AppContext);
    const [sessions, setSessions] = useState([]);
    const [showForm1, setShowForm] = useState(false);
    const navigate = useNavigate();

    // 1. REFACTORED: Create Session directly in Supabase
    const handleCreateSession = async (e) => {
        e.preventDefault();
        try {
            const { error } = await supabase
                .from('sessions')
                .insert([
                    {
                        createdBy: userId,
                        title: e.target.title.value,
                        userName: e.target.userName.value,
                        status: 'active',
                        totalExpenses: 0
                    }
                ]);

            if (error) throw error;

            toast.success("Session created successfully");
            setShowForm(false);
            fetchSessions(); // Refresh the table
        } catch (error) {
            console.error("Error creating session:", error.message);
            toast.error("Failed to create session");
        }
    }

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

    // 3. REFACTORED: Fetch Sessions (Fixed the data mapping)
    const fetchSessions = async () => {
        try {
            const { data, error } = await supabase
                .from('sessions')
                .select('*')
                .eq('createdBy', userId)
                .order('createdAt', { ascending: false });
                
            if (error) {
                toast.error(error.message);
                return;
            }
            
            // Supabase returns the array directly inside 'data', not 'data.sessions'
            setSessions(data || []);
        } catch (error) {
            toast.error("Failed to fetch sessions");
        }
    };

    const colorOptions = (status) => {
        switch (status?.toLowerCase()) {
            case "active":
                return "text-green-700 bg-green-100 border border-green-200";
            case "inactive":
                return "text-red-700 bg-red-100 border border-red-200";
            default:
                return "text-slate-700 bg-slate-100 border border-slate-200";
        }
    }

    const formatDate = (isoString) => {
        if (!isoString) return "N/A";
        const date = new Date(isoString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    }

    useEffect(() => {
        if (!userId) {
            checkUserId();
        } else {
            fetchSessions();
        }
    }, [userId]);

    return (
        <div className='min-h-screen bg-[#F8F7F3] font-sans pb-12 relative overflow-hidden'>

            {/* Custom Animation Styles */}
            <style>
                {`
                    @keyframes float {
                        0% { transform: translateY(0px) rotate(0deg); }
                        50% { transform: translateY(-20px) rotate(10deg); }
                        100% { transform: translateY(0px) rotate(0deg); }
                    }
                    .animate-float-fast { animation: float 5s ease-in-out infinite; }
                    .animate-float-normal { animation: float 7s ease-in-out infinite 1s; }
                    .animate-float-slow { animation: float 9s ease-in-out infinite 2s; }
                `}
            </style>

            {/* Floating Background Objects */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                <FaHamburger className="absolute top-20 left-[10%] text-[#8B5E3C]/10 text-6xl animate-float-slow" />
                <FaReceipt className="absolute top-40 right-[15%] text-[#8B5E3C]/10 text-7xl animate-float-normal" />
                <FaPizzaSlice className="absolute top-[40%] left-[5%] text-[#8B5E3C]/10 text-8xl animate-float-fast" />
                <FaWallet className="absolute bottom-[30%] right-[10%] text-[#8B5E3C]/10 text-6xl animate-float-slow" />
                <FaCoffee className="absolute bottom-20 left-[20%] text-[#8B5E3C]/10 text-5xl animate-float-normal" />
                <FaUtensils className="absolute top-[60%] right-[5%] text-[#8B5E3C]/10 text-7xl animate-float-fast" />
            </div>

            {/* Navbar Area */}
            <nav className="relative z-10 max-w-5xl mx-auto px-4 py-6 mb-2">
                <div className="text-xl font-black text-slate-800 tracking-tight">
                    Yalla-Nakol
                </div>
            </nav>

            <div className='max-w-5xl mx-auto px-4 space-y-8 relative z-10'>

                {/* Deep Navy Hero Banner */}
                <div className="bg-slate-900 rounded-[2rem] p-8 md:p-10 shadow-xl relative overflow-hidden border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-[100px] opacity-10 translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-72 h-72 bg-green-500 rounded-full blur-[80px] opacity-10 -translate-x-1/2 translate-y-1/2 pointer-events-none"></div>

                    <div className="relative z-10">
                        <h1 className='font-black text-4xl text-white tracking-tight'>Dashboard</h1>
                        <p className='mt-2 text-slate-300 font-medium text-lg flex items-center gap-2'>
                            Welcome back to Yalla-Nakol <span className='text-2xl animate-wave origin-bottom-right'>👋</span>
                        </p>
                    </div>

                    {/* User ID Pill */}
                    {userId && (
                        <div className="relative z-10 flex items-center gap-3 bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10 shadow-inner w-full md:w-auto">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Your Device ID</span>
                                <span className="text-sm font-mono text-white truncate w-48 sm:w-auto">{userId}</span>
                            </div>
                            <button
                                onClick={() => { navigator.clipboard.writeText(userId); toast.success("ID Copied!"); }}
                                className="p-2.5 text-slate-300 hover:text-white hover:bg-white/20 rounded-xl transition-colors"
                                title="Copy ID"
                            >
                                <FaCopy />
                            </button>
                        </div>
                    )}
                </div>

                {/* Main Content Card */}
                <div className='bg-white/95 backdrop-blur-md rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden'>

                    {/* Card Header */}
                    <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 sm:p-8 border-b border-slate-100 gap-4 bg-white/50'>
                        <h2 className='font-bold text-2xl text-slate-800'>Your Sessions</h2>
                        <button
                            onClick={() => setShowForm(true)}
                            className='flex items-center gap-2 bg-slate-900 text-white px-5 py-3 rounded-xl font-bold hover:bg-slate-800 hover:shadow-lg hover:shadow-slate-900/20 hover:-translate-y-0.5 transition-all duration-200 w-full sm:w-auto justify-center'
                        >
                            <CiCirclePlus size={20} className="stroke-1" /> New Session
                        </button>
                    </div>

                    {/* Table Area */}
                    <div className='overflow-x-auto'>
                        <table className='w-full text-left whitespace-nowrap'>
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100">
                                    <th className='px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider'>Title</th>
                                    <th className='px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider'>Total Expenses</th>
                                    <th className='px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider'>Status</th>
                                    <th className='px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider'>Created</th>
                                    <th className='px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right'>Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {sessions.length > 0 ? (
                                    sessions.map((session) => (
                                        <tr key={session.id} className='hover:bg-slate-50/80 transition-colors group'>
                                            <td className='px-8 py-6 font-bold text-slate-800'>{session.title}</td>
                                            <td className='px-8 py-6 font-medium text-slate-600'>
                                                {session.totalExpenses > 0 ? `£${session.totalExpenses}` : '—'}
                                            </td>
                                            <td className='px-8 py-6'>
                                                <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${colorOptions(session.status)}`}>
                                                    {session.status}
                                                </span>
                                            </td>
                                            <td className='px-8 py-6 text-sm text-slate-500 font-medium'>
                                                {formatDate(session.createdAt)}
                                            </td>
                                            <td className='px-8 py-6 text-right'>
                                                <button
                                                    title='Enter Session'
                                                    className='inline-flex items-center gap-2 bg-green-50 text-green-600 border border-green-100 hover:bg-green-500 hover:text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-200'
                                                    onClick={() => navigate(`/session/${session.id}`)}
                                                >
                                                    Open <ImEnter />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-20 text-center">
                                            <div className="flex flex-col items-center justify-center text-slate-400">
                                                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-5 border border-slate-100 shadow-inner">
                                                    <FaFolderOpen size={32} className="text-slate-300" />
                                                </div>
                                                <p className="font-bold text-slate-600 text-lg">No sessions found</p>
                                                <p className="text-sm mt-1 text-slate-500">Create a new session to start splitting bills.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <Toaster position="bottom-right" reverseOrder={false} />

            {/* Modal Update */}
            <SessionForm isVisible={showForm1} onClose={() => setShowForm(false)}>
                <div className="p-4">
                    <h3 className="text-2xl font-black text-slate-800 mb-6 text-center tracking-tight">Start a New Gathering</h3>
                    <form onSubmit={handleCreateSession} className='flex flex-col gap-5 w-full'>
                        <div>
                            <label className="block text-sm font-bold text-slate-600 mb-2 ml-1">Session Title</label>
                            <input type="text" name="title" placeholder='e.g., Friday Dinner' className='w-full border border-slate-200 rounded-xl px-4 py-3.5 focus:ring-4 focus:ring-slate-500/10 focus:border-slate-500 outline-none transition-all shadow-sm font-medium' required />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-600 mb-2 ml-1">Your Name</label>
                            <input type="text" name="userName" placeholder='e.g., Ahmed' className='w-full border border-slate-200 rounded-xl px-4 py-3.5 focus:ring-4 focus:ring-slate-500/10 focus:border-slate-500 outline-none transition-all shadow-sm font-medium' required />
                        </div>
                        <button type="submit" className='mt-4 bg-green-500 text-white px-4 py-4 rounded-xl w-full font-bold text-lg hover:bg-green-600 hover:shadow-lg hover:shadow-green-500/20 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer'>
                            Create Session
                        </button>
                    </form>
                </div>
            </SessionForm>
        </div>
    )
}

export default Home;