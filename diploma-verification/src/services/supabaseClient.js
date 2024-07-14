import { createClient } from '@supabase/supabase-js';
// require('dotenv').config()

const supabaseUrl = 'https://ftxlkvwzadoxypjinonp.supabase.co';
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY
export const supabase = createClient(supabaseUrl, supabaseKey);

