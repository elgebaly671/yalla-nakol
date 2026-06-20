import React from 'react'
import { TbXboxX } from "react-icons/tb";
const SessionForm = ({ isVisible, onClose, children }) => {
    const hanldeClose = (e) => {
        if (e.target.id == "ModelContainer") {
            onClose();
        }
    }
    if (!isVisible) return null;
    return (
        <div
            id='ModelContainer'
            className='fixed inset-0 z-90 bg-black/20 backdrop-blur-sm flex justify-center items-center'
            onClick={hanldeClose}>
            <div className='bg-white w-[400px] p-4 rounded-xl'>
                <div className='flex items-center justify-between'>
                    <h1 className='text-2xl font-bold'>Create new session</h1>
                    <button className='text-xl text-black/20 hover:text-red-500 transition-all cursor-pointer'
                        onClick={onClose}>X</button>
                </div>
                <div className='mt-5'>
                    {children}
                </div>

            </div>
        </div>
    )
}

export default SessionForm