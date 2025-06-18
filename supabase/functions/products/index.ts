import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
}

interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: string
          store_id: string
          name: string
          description: string | null
          price: number
          image_url: string | null
          status: string
          created_at: string | null
          updated_at: string | null
          payment_method: string | null
          user_id: string | null
          is_published: boolean | null
          images: string[] | null
          slug: string
          inventory_count: number | null
          product_type: string
          category: string | null
        }
        Insert: {
          id?: string
          store_id: string
          name: string
          description?: string | null
          price?: number
          image_url?: string | null
          status?: string
          created_at?: string | null
          updated_at?: string | null
          payment_method?: string | null
          user_id?: string | null
          is_published?: boolean | null
          images?: string[] | null
          slug: string
          inventory_count?: number | null
          product_type?: string
          category?: string | null
        }
        Update: {
          id?: string
          store_id?: string
          name?: string
          description?: string | null
          price?: number
          image_url?: string | null
          status?: string
          created_at?: string | null
          updated_at?: string | null
          payment_method?: string | null
          user_id?: string | null
          is_published?: boolean | null
          images?: string[] | null
          slug?: string
          inventory_count?: number | null
          product_type?: string
          category?: string | null
        }
      }
      stores: {
        Row: {
          id: string
          user_id: string
          name: string
          username: string
          tagline: string | null
          description: string | null
          logo_image: string | null
          banner_image: string | null
          business_email: string
          phone_number: string
          address: string | null
          is_active: boolean | null
          theme: any | null
          created_at: string | null
          updated_at: string | null
          plan: string
          font_style: string | null
          about_description: string | null
          mission_statement: string | null
          vision_statement: string | null
          founding_story: string | null
          social_media_links: any | null
        }
      }
      product_variants: {
        Row: {
          id: string
          product_id: string
          price: number
          inventory_count: number
          sku: string | null
          image_url: string | null
          options: any | null
          created_at: string
          updated_at: string
        }
      }
    }
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient<Database>(
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
    
    // Remove 'functions/v1/products' from path segments
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
    // GET /products - Get all products with filters
    if (pathSegments.length === 0) {
      const storeId = searchParams.get('store_id')
      const category = searchParams.get('category')
      const status = searchParams.get('status') || 'active'
      const isPublished = searchParams.get('is_published')
      const limit = parseInt(searchParams.get('limit') || '50')
      const offset = parseInt(searchParams.get('offset') || '0')

      let query = supabaseClient
        .from('products')
        .select(`
          *,
          stores!inner(
            id,
            name,
            username,
            logo_image,
            is_active
          ),
          product_variants(
            id,
            price,
            inventory_count,
            sku,
            image_url,
            options
          )
        `)
        .eq('status', status)
        .range(offset, offset + limit - 1)
        .order('created_at', { ascending: false })

      if (storeId) {
        query = query.eq('store_id', storeId)
      }

      if (category) {
        query = query.eq('category', category)
      }

      if (isPublished !== null) {
        query = query.eq('is_published', isPublished === 'true')
      }

      const { data, error } = await query

      if (error) {
        throw error
      }

      return new Response(
        JSON.stringify({ products: data || [] }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // GET /products/:id - Get single product
    if (pathSegments.length === 1) {
      const productId = pathSegments[0]

      const { data, error } = await supabaseClient
        .from('products')
        .select(`
          *,
          stores!inner(
            id,
            name,
            username,
            logo_image,
            tagline,
            description,
            business_email,
            phone_number,
            is_active,
            theme,
            font_style
          ),
          product_variants(
            id,
            price,
            inventory_count,
            sku,
            image_url,
            options
          )
        `)
        .eq('id', productId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return new Response(
            JSON.stringify({ error: 'Product not found' }),
            { 
              status: 404, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }
        throw error
      }

      return new Response(
        JSON.stringify({ product: data }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // GET /products/store/:storeUsername - Get products by store username
    if (pathSegments.length === 2 && pathSegments[0] === 'store') {
      const storeUsername = pathSegments[1]

      const { data, error } = await supabaseClient
        .from('products')
        .select(`
          *,
          stores!inner(
            id,
            name,
            username,
            logo_image,
            tagline,
            description,
            business_email,
            phone_number,
            is_active,
            theme,
            font_style
          ),
          product_variants(
            id,
            price,
            inventory_count,
            sku,
            image_url,
            options
          )
        `)
        .eq('stores.username', storeUsername)
        .eq('is_published', true)
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      return new Response(
        JSON.stringify({ 
          products: data || [],
          store: data?.[0]?.stores || null
        }),
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
    const requiredFields = ['store_id', 'name', 'slug']
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
    const productData = {
      store_id: body.store_id,
      name: body.name,
      description: body.description || null,
      price: body.price || 0,
      image_url: body.image_url || null,
      status: body.status || 'active',
      payment_method: body.payment_method || null,
      user_id: body.user_id || null,
      is_published: body.is_published !== undefined ? body.is_published : true,
      images: body.images || [],
      slug: body.slug,
      inventory_count: body.inventory_count || 0,
      product_type: body.product_type || 'simple',
      category: body.category || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabaseClient
      .from('products')
      .insert(productData)
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return new Response(
          JSON.stringify({ error: 'Product with this slug already exists in the store' }),
          { 
            status: 409, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
      throw error
    }

    return new Response(
      JSON.stringify({ product: data }),
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

    const productId = pathSegments[0]
    const body = await req.json()

    // Remove fields that shouldn't be updated directly
    const { id, created_at, ...updateData } = body
    updateData.updated_at = new Date().toISOString()

    const { data, error } = await supabaseClient
      .from('products')
      .update(updateData)
      .eq('id', productId)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return new Response(
          JSON.stringify({ error: 'Product not found' }),
          { 
            status: 404, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
      throw error
    }

    return new Response(
      JSON.stringify({ product: data }),
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

    const productId = pathSegments[0]

    const { error } = await supabaseClient
      .from('products')
      .delete()
      .eq('id', productId)

    if (error) {
      throw error
    }

    return new Response(
      JSON.stringify({ message: 'Product deleted successfully' }),
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