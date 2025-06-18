import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const url = new URL(req.url)
    const pathSegments = url.pathname.split('/').filter(Boolean)
    
    // Remove 'functions/v1/stores' from path segments
    const cleanPath = pathSegments.slice(3)
    
    switch (req.method) {
      case 'GET':
        return await handleGet(supabaseClient, cleanPath, url.searchParams)
      case 'POST':
        return await handlePost(supabaseClient, req)
      case 'PUT':
        return await handlePut(supabaseClient, cleanPath, req)
      case 'DELETE':
        return await handleDelete(supabaseClient, cleanPath)
      default:
        return new Response(
          JSON.stringify({ error: 'Method not allowed' }),
          { 
            status: 405, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
    }
  } catch (error) {
    console.error('Edge function error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error.message,
        details: error.stack
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

async function handleGet(supabaseClient: any, pathSegments: string[], searchParams: URLSearchParams) {
  try {
    // GET /stores - Get all active stores
    if (pathSegments.length === 0) {
      const limit = parseInt(searchParams.get('limit') || '50')
      const offset = parseInt(searchParams.get('offset') || '0')

      const { data, error } = await supabaseClient
        .from('stores')
        .select(`
          id,
          name,
          username,
          tagline,
          description,
          logo_image,
          banner_image,
          is_active,
          theme,
          font_style,
          created_at
        `)
        .eq('is_active', true)
        .range(offset, offset + limit - 1)
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      return new Response(
        JSON.stringify({ stores: data || [] }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // GET /stores/:username - Get store by username
    if (pathSegments.length === 1) {
      const username = pathSegments[0]

      const { data, error } = await supabaseClient
        .from('stores')
        .select(`
          *,
          products!inner(
            id,
            name,
            description,
            price,
            image_url,
            images,
            slug,
            inventory_count,
            category,
            is_published,
            status
          )
        `)
        .eq('username', username)
        .eq('is_active', true)
        .eq('products.is_published', true)
        .eq('products.status', 'active')
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return new Response(
            JSON.stringify({ error: 'Store not found' }),
            { 
              status: 404, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }
        throw error
      }

      return new Response(
        JSON.stringify({ store: data }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Invalid endpoint' }),
      { 
        status: 404, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  } catch (error) {
    console.error('GET error:', error)
    throw error
  }
}

async function handlePost(supabaseClient: any, req: Request) {
  try {
    const body = await req.json()
    
    // Validate required fields
    const requiredFields = ['user_id', 'name', 'username', 'business_email', 'phone_number']
    for (const field of requiredFields) {
      if (!body[field]) {
        return new Response(
          JSON.stringify({ error: `Missing required field: ${field}` }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
    }

    // Set default values
    const storeData = {
      user_id: body.user_id,
      name: body.name,
      username: body.username.toLowerCase(),
      tagline: body.tagline || null,
      description: body.description || null,
      logo_image: body.logo_image || null,
      banner_image: body.banner_image || null,
      business_email: body.business_email,
      phone_number: body.phone_number,
      address: body.address || null,
      is_active: body.is_active !== undefined ? body.is_active : true,
      theme: body.theme || {},
      plan: body.plan || 'free',
      font_style: body.font_style || 'Poppins',
      about_description: body.about_description || null,
      mission_statement: body.mission_statement || null,
      vision_statement: body.vision_statement || null,
      founding_story: body.founding_story || null,
      social_media_links: body.social_media_links || {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabaseClient
      .from('stores')
      .insert(storeData)
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return new Response(
          JSON.stringify({ error: 'Username already taken' }),
          { 
            status: 409, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
      throw error
    }

    return new Response(
      JSON.stringify({ store: data }),
      { 
        status: 201, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  } catch (error) {
    console.error('POST error:', error)
    throw error
  }
}

async function handlePut(supabaseClient: any, pathSegments: string[], req: Request) {
  try {
    if (pathSegments.length !== 1) {
      return new Response(
        JSON.stringify({ error: 'Invalid endpoint' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const storeId = pathSegments[0]
    const body = await req.json()

    // Remove fields that shouldn't be updated directly
    const { id, user_id, created_at, ...updateData } = body
    updateData.updated_at = new Date().toISOString()

    const { data, error } = await supabaseClient
      .from('stores')
      .update(updateData)
      .eq('id', storeId)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return new Response(
          JSON.stringify({ error: 'Store not found' }),
          { 
            status: 404, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
      throw error
    }

    return new Response(
      JSON.stringify({ store: data }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  } catch (error) {
    console.error('PUT error:', error)
    throw error
  }
}

async function handleDelete(supabaseClient: any, pathSegments: string[]) {
  try {
    if (pathSegments.length !== 1) {
      return new Response(
        JSON.stringify({ error: 'Invalid endpoint' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const storeId = pathSegments[0]

    const { error } = await supabaseClient
      .from('stores')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', storeId)

    if (error) {
      throw error
    }

    return new Response(
      JSON.stringify({ message: 'Store deactivated successfully' }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  } catch (error) {
    console.error('DELETE error:', error)
    throw error
  }
}