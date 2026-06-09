import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
const supabaseServiceRole = import.meta.env.VITE_SUPABASE_SERVICE_ROLE as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRole, {
  auth: { autoRefreshToken: false, persistSession: false },
});

export async function uploadFileToSupabase(file: File, bucket: string, path: string): Promise<string> {
  const ext = file.name.split('.').pop() || 'jpg';
  const fullPath = `${path}-${Date.now()}.${ext}`;
  const { error } = await supabase.storage
    .from(bucket)
    .upload(fullPath, file, { upsert: true, contentType: file.type });
  if (error) throw new Error(error.message);
  const { data } = supabase.storage.from(bucket).getPublicUrl(fullPath);
  return data.publicUrl;
}
