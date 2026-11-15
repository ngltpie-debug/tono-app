import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://hnjdbmtmiilplidukvcs.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_ILsj3rECFRqJSNoqChUbvA_I-mWD...' // Copy đoạn API key ở mục API Keys lúc nãy dán vào đây

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)