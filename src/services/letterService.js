import { supabase } from './supabaseClient.js';

export async function fetchLetters(providerFilterValue = '') {
  console.log('[letterService] Fetching letters from Supabase.');

  if (!supabase) {
    throw new Error('Supabase frontend credentials are missing.');
  }

  let lettersQuery = supabase
    .from('letters')
    .select('*')
    .order('created_at', { ascending: false });

  if (providerFilterValue.trim()) {
    console.log('[letterService] Applying provider filter:', providerFilterValue);
    lettersQuery = lettersQuery.ilike('provider', `%${providerFilterValue.trim()}%`);
  }

  const { data: letters, error } = await lettersQuery;

  if (error) {
    console.error('[letterService] Supabase fetch failed:', error);
    throw new Error('Failed to load letters.');
  }

  return letters || [];
}
