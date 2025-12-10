import 'react-native-url-polyfill/auto'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

// ASENDA NENDE VÄÄRTUSED OMA PROJEKTI OMAdeGA!
// VÕTMED LEIAD: Supabase Dashboard -> Settings -> API
const supabaseUrl = 'https://xmuctbmgastvyclkmarb.supabase.co' 
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhtdWN0Ym1nYXN0dnljbGttYXJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxODQ4NzQsImV4cCI6MjA3ODc2MDg3NH0.O0Hz0Dbr4UOHBLGCgoDuySwHzWKi_dJKu7v3CABA5Qw'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})