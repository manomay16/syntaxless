"use client"

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/lib/supabase/database.types"

// Create a single supabase client for the entire client-side application
export const createClient = () => {
  // Get environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  // Validate environment variables
  if (!supabaseUrl || !supabaseKey) {
    const error = 'Missing Supabase environment variables. Please check your .env.local file.'
    console.error(error, {
      url: !!supabaseUrl,
      key: !!supabaseKey,
      urlValue: supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : 'missing',
    })
    throw new Error(error)
  }

  // Validate URL format
  try {
    const url = new URL(supabaseUrl)
    if (!url.hostname.includes('supabase.co')) {
      console.warn('Supabase URL does not appear to be a valid Supabase URL:', supabaseUrl)
    }
  } catch (e) {
    console.error('Invalid Supabase URL format:', supabaseUrl)
    throw new Error('Invalid Supabase URL format. URL must be a valid https:// URL.')
  }

  try {
    // createClientComponentClient automatically reads from NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
    // We just need to ensure they're set (which we validated above)
    const client = createClientComponentClient<Database>({
      options: {
        global: {
          fetch: (url, options) => {
            // Create a more robust fetch with timeout
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 seconds
            
            return fetch(url, {
              ...options,
              signal: controller.signal,
            }).finally(() => {
              clearTimeout(timeoutId)
            }).catch((error) => {
              // Provide more helpful error messages
              if (error.name === 'AbortError') {
                throw new Error('Connection timeout. Please check your internet connection and Supabase project status.')
              }
              if (error.message?.includes('fetch') || error.message?.includes('Failed to fetch')) {
                throw new Error(`Failed to connect to Supabase. Please verify:\n1. Your Supabase URL is correct: ${supabaseUrl}\n2. Your Supabase project is active (not paused)\n3. Your internet connection is working\n4. Check browser console for CORS errors`)
              }
              throw error
            })
          }
        }
      }
    })
    
    return client
  } catch (error) {
    console.error('Error creating Supabase client:', error)
    throw error
  }
}
