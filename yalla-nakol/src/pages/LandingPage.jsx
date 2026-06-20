import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    FaUsers, FaCalculator, FaShieldAlt, FaBolt, 
    FaHamburger, FaReceipt, FaPizzaSlice, FaCoffee, FaWallet, FaUtensils 
} from 'react-icons/fa';

const LandingPage = () => {
    const navigate = useNavigate();

    const features = [
        {
            icon: <FaUsers className="w-6 h-6 text-slate-700" />,
            title: "Seamless Collaboration",
            description: "Create a session, share the invite link, and let your friends join in real-time. No more passing a single phone around the table."
        },
        {
            icon: <FaCalculator className="w-6 h-6 text-slate-700" />,
            title: "Fair Itemized Splitting",
            description: "Did someone order a massive steak while you just had a salad? Add items and select exactly who is sharing what to keep things fair."
        },
        {
            icon: <FaBolt className="w-6 h-6 text-slate-700" />,
            title: "Instant Math",
            description: "With a single click, calculate the final session total. Everyone gets a personalized, itemized receipt showing exactly what they owe."
        },
        {
            icon: <FaShieldAlt className="w-6 h-6 text-slate-700" />,
            title: "Host Controls",
            description: "Keep your session secure. As a host, you have full authority to accept or reject join requests from the waiting queue."
        }
    ];

    return (
        // 1. Removed pb-20, added flex flex-col to create a column layout
        <div className="min-h-screen bg-[#F3E4C9]/50 font-sans flex flex-col overflow-hidden relative">
            
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
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <FaHamburger className="absolute top-20 left-[10%] text-[#8B5E3C]/30 text-6xl animate-float-slow" />
                <FaReceipt className="absolute top-40 right-[15%] text-[#8B5E3C]/30 text-7xl animate-float-normal" />
                <FaPizzaSlice className="absolute top-[40%] left-[5%] text-[#8B5E3C]/30 text-8xl animate-float-fast" />
                <FaWallet className="absolute bottom-[30%] right-[10%] text-[#8B5E3C]/30 text-6xl animate-float-slow" />
                <FaCoffee className="absolute bottom-20 left-[20%] text-[#8B5E3C]/30 text-5xl animate-float-normal" />
                <FaUtensils className="absolute top-[60%] right-[5%] text-[#8B5E3C]/30 text-7xl animate-float-fast" />
            </div>

            {/* Navbar - Changed fixed to relative to avoid layout snapping issues at the top */}
            <nav className="fixed z-90 w-full mx-auto px-4 py-6 mb-4 backdrop-blur-lg bg-[#D3D4C0]/20">
                <div className="text-2xl font-black text-slate-800 tracking-tight">
                    Yalla-Nakol
                </div>
            </nav>

            {/* 2. Added flex-grow so this section takes up all available empty space, and moved pb-20 here */}
            <main className="relative z-10 w-full max-w-5xl mx-auto px-4 space-y-12 flex-grow pb-20 pt-20">
                
                {/* Hero Section */}
                <div className="bg-gradient-to-br from-slate-700 to-slate-900 rounded-3xl p-8 md:p-16 flex flex-col items-center text-center shadow-lg relative overflow-hidden border border-slate-800">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-[100px] opacity-10 translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-72 h-72 bg-green-500 rounded-full blur-[80px] opacity-10 -translate-x-1/2 translate-y-1/2 pointer-events-none"></div>
                    
                    <div className="relative z-10 max-w-3xl space-y-6">
                        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-tight">
                            Welcome to Yalla-Nakol
                        </h1>
                        
                        <p className="text-xl md:text-2xl text-slate-300 font-medium max-w-2xl mx-auto leading-relaxed">
                            Where you handle the gathering and we handle the bill.
                        </p>
                        
                        <div className="pt-8">
                            <button 
                                onClick={() => navigate('/home')} 
                                className="bg-green-500 hover:bg-green-600 text-white px-10 py-4 rounded-xl font-bold text-xl transition-all duration-200 transform hover:-translate-y-1 hover:shadow-lg hover:shadow-green-500/20 cursor-pointer"
                            >
                                Get Started
                            </button>
                        </div>
                    </div>
                </div>

                {/* Features Section */}
                <div className="pt-8">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-black text-slate-800 backdrop-blur-sm inline-block px-4 py-2 rounded-xl">
                            Everything you need for a stress-free outing
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                        {features.map((feature, index) => (
                            <div 
                                key={index} 
                                className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 border border-slate-200 hover:shadow-md hover:border-slate-300 hover:-translate-y-1 transition-all duration-300"
                            >
                                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center shadow-sm border border-slate-200 mb-6">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 mb-3">
                                    {feature.title}
                                </h3>
                                <p className="text-slate-600 font-medium leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

           
        </div>
    );
};

export default LandingPage;