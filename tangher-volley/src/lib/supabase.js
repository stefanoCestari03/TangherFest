import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL      = 'https://bgjnqyuverysofajhifw.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_xO0srUmhjUs6kqzN8VNcYg_kgCVbtiZ'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
