import { createClient } from '@supabase/supabase-js';

// Your Supabase Project Credentials
const supabaseUrl = 'https://zsjmudkesxrlrhtugdon.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpzam11ZGtlc3hybHJodHVnZG9uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg0MjU0MjAsImV4cCI6MjEwNDAwMTQyMH0.qKYKtffiu7wnt0WudTS39uvsH26KgtR4aGU52NsCCdM';

// Create the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
