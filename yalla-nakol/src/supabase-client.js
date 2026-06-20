import { createClient } from '@supabase/supabase-js'
// import dotenv from 'dotenv'

// dotenv.config();

export const supabase = createClient(import.meta.env.VITE_SB_URL,
    import.meta.env.VITE_SB_API_KEY
)