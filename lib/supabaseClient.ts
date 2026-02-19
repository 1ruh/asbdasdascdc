import { createClient } from '@supabase/supabase-js';

// Credentials hardcoded to ensure valid URL is passed to createClient
export const supabaseUrl = 'https://gyhubtxciignetkefmri.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5aHVidHhjaWlnbmV0a2VmbXJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1MTU0NDUsImV4cCI6MjA4NzA5MTQ0NX0.337no5Igmo3ib2oWOqVtyfw1rZWIdg0fq2M0EOsM2ag';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);