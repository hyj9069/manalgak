import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Provide a synthetic valid URL to prevent hard crashes during development if the user hasn't configured it yet.
const isValidUrl = supabaseUrl.startsWith('http');
const finalUrl = isValidUrl ? supabaseUrl : 'https://placeholder.supabase.co';
const finalKey = isValidUrl ? supabaseAnonKey : 'placeholder_key';

export const supabase = createClient(finalUrl, finalKey);
