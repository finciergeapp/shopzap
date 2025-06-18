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
    
    // Remove 'functions/v1/orders' from path segments
    const cleanPath = pathSegments.slice(3)
    
    switch (req.method) {
      case 'GET':
        return await handleGet(supabaseClient, cleanPath, url.searchParams)
      case 'POST':
        return await handlePost(supabaseClient, req)
      case 'PUT':
        return await handlePut(supabaseClient, cleanPath, req)
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
    // GET /orders - Get orders with filters
    if (pathSegments.length === 0) {
      const storeId = searchParams.get('store_id')
      const status = searchParams.get('status')
      const limit = parseInt(searchParams.get('limit') || '50')
      const offset = parseInt(searchParams.get('offset') || '0')

      let query = supabaseClient
        .from('orders')
        .select(`
          *,
          stores!inner(
            id,
            name,
            username
          ),
          order_items(
            id,
            product_id,
            quantity,
            price_at_purchase,
            products(
              id,
              name,
              image_url,
              slug
            )
          )
        `)
        .range(offset, offset + limit - 1)
        .order('created_at', { ascending: false })

      if (storeId) {
        query = query.eq('store_id', storeId)
      }

      if (status) {
        query = query.eq('status', status)
      }

      const { data, error } = await query

      if (error) {
        throw error
      }

      return new Response(
        JSON.stringify({ orders: data || [] }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // GET /orders/:id - Get single order
    if (pathSegments.length === 1) {
      const orderId = pathSegments[0]

      const { data, error } = await supabaseClient
        .from('orders')
        .select(`
          *,
          stores!inner(
            id,
            name,
            username,
            business_email,
            phone_number
          ),
          order_items(
            id,
            product_id,
            quantity,
            price_at_purchase,
            product_variant_id,
            products(
              id,
              name,
              description,
              image_url,
              slug
            ),
            product_variants(
              id,
              sku,
              options
            )
          )
        `)
        .eq('id', orderId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return new Response(
            JSON.stringify({ error: 'Order not found' }),
            { 
              status: 404, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }
        throw error
      }

      return new Response(
        JSON.stringify({ order: data }),
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
    const requiredFields = ['store_id', 'buyer_name', 'total_price', 'order_items']
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

    if (!Array.isArray(body.order_items) || body.order_items.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Order must contain at least one item' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Start a transaction by creating the order first
    const orderData = {
      store_id: body.store_id,
      buyer_name: body.buyer_name,
      buyer_email: body.buyer_email || null,
      buyer_phone: body.buyer_phone || null,
      buyer_address: body.buyer_address || null,
      total_price: body.total_price,
      status: body.status || 'pending',
      payment_status: body.payment_status || 'pending',
      payment_method: body.payment_method || 'cod',
      payment_gateway: body.payment_gateway || null,
      notes: body.notes || null,
      order_notes: body.order_notes || null,
      special_instructions: body.special_instructions || null,
      preferred_delivery_time: body.preferred_delivery_time || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data: order, error: orderError } = await supabaseClient
      .from('orders')
      .insert(orderData)
      .select()
      .single()

    if (orderError) {
      throw orderError
    }

    // Create order items
    const orderItems = body.order_items.map((item: any) => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity || 1,
      price_at_purchase: item.price_at_purchase,
      product_variant_id: item.product_variant_id || null
    }))

    const { data: items, error: itemsError } = await supabaseClient
      .from('order_items')
      .insert(orderItems)
      .select(`
        *,
        products(
          id,
          name,
          image_url,
          slug
        )
      `)

    if (itemsError) {
      // If order items creation fails, we should clean up the order
      await supabaseClient.from('orders').delete().eq('id', order.id)
      throw itemsError
    }

    // Create order status history entry
    await supabaseClient
      .from('order_status_history')
      .insert({
        order_id: order.id,
        status: order.status,
        notes: 'Order created',
        created_at: new Date().toISOString()
      })

    return new Response(
      JSON.stringify({ 
        order: { 
          ...order, 
          order_items: items 
        } 
      }),
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

    const orderId = pathSegments[0]
    const body = await req.json()

    // Get current order to track status changes
    const { data: currentOrder, error: fetchError } = await supabaseClient
      .from('orders')
      .select('status')
      .eq('id', orderId)
      .single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return new Response(
          JSON.stringify({ error: 'Order not found' }),
          { 
            status: 404, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
      throw fetchError
    }

    // Remove fields that shouldn't be updated directly
    const { id, created_at, ...updateData } = body
    updateData.updated_at = new Date().toISOString()

    const { data, error } = await supabaseClient
      .from('orders')
      .update(updateData)
      .eq('id', orderId)
      .select()
      .single()

    if (error) {
      throw error
    }

    // If status changed, create a status history entry
    if (updateData.status && updateData.status !== currentOrder.status) {
      await supabaseClient
        .from('order_status_history')
        .insert({
          order_id: orderId,
          status: updateData.status,
          notes: body.status_notes || `Status changed to ${updateData.status}`,
          created_at: new Date().toISOString()
        })
    }

    return new Response(
      JSON.stringify({ order: data }),
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