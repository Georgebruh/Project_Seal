import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { amount, description, successUrl, cancelUrl } = await req.json()

    // Grab the secret key from the environment
    const PAYMONGO_SECRET_KEY = Deno.env.get('PAYMONGO_SECRET_KEY')
    
    if (!PAYMONGO_SECRET_KEY) {
      throw new Error("PayMongo Secret Key is missing from environment variables.")
    }

    const base64Key = btoa(`${PAYMONGO_SECRET_KEY}:`)
    const amountInCentavos = Math.round(amount * 100)

    const response = await fetch('https://api.paymongo.com/v1/checkout_sessions', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        authorization: `Basic ${base64Key}`
      },
      body: JSON.stringify({
        data: {
          attributes: {
            send_email_receipt: false,
            show_description: true,
            show_line_items: true,
            line_items: [
              {
                currency: 'PHP',
                amount: amountInCentavos,
                description: description,
                name: 'Project Seal Escrow Deposit',
                quantity: 1
              }
            ],
            payment_method_types: ['card', 'gcash', 'paymaya'],
            success_url: successUrl,
            cancel_url: cancelUrl,
            description: description
          }
        }
      })
    })

    const data = await response.json()
    
    if (data.errors) {
      throw new Error(data.errors.detail)
    }

    return new Response(
      JSON.stringify({ checkoutUrl: data.data.attributes.checkout_url }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})