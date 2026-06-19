import { createClientFromRequest } from 'npm:@base44/sdk@0.8.32';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Get request body
    const body = await req.json();
    const { passCode, productId, quantity = 1 } = body;
    
    if (!passCode || !productId) {
      return Response.json({ error: 'Pass code and product ID required' }, { status: 400 });
    }
    
    // Validate the Glow Pass code
    const passes = await base44.entities.JoinCode.filter({ 
      code: passCode,
      code_type: 'promo'
    });
    
    if (!passes || passes.length === 0) {
      return Response.json({ error: 'Invalid Glow Pass code' }, { status: 404 });
    }
    
    const pass = passes[0];
    
    // Check if pass is active
    if (!pass.is_active) {
      return Response.json({ error: 'This Glow Pass has been disabled' }, { status: 403 });
    }
    
    // Check expiration
    if (pass.valid_until && new Date(pass.valid_until) < new Date()) {
      return Response.json({ error: 'This Glow Pass has expired' }, { status: 403 });
    }
    
    // Check usage limit
    if (pass.max_uses > 0 && pass.current_uses >= pass.max_uses) {
      return Response.json({ error: 'This Glow Pass has reached its usage limit' }, { status: 403 });
    }
    
    // Get product details from GlowProduct entity
    const products = await base44.entities.GlowProduct.filter({ id: productId, is_active: true });
    if (!products || products.length === 0) {
      return Response.json({ error: 'Product not found' }, { status: 404 });
    }
    
    const product = products[0];
    
    // Calculate discount
    let discountAmount = 0;
    let discountType = 'fixed';
    
    if (pass.discount_type === 'percentage') {
      discountAmount = pass.discount_value || 0;
      discountType = 'percentage';
    } else if (pass.discount_type === 'fixed') {
      discountAmount = pass.discount_value || 0;
      discountType = 'fixed';
    }
    
    // Calculate final price
    const originalPrice = product.price || 0;
    let finalPrice = originalPrice;
    
    if (discountType === 'percentage') {
      finalPrice = originalPrice * (1 - (discountAmount / 100));
    } else if (discountType === 'fixed') {
      finalPrice = Math.max(0, originalPrice - discountAmount);
    }
    
    // Get app base URL from Origin header
    const origin = req.headers.get('Origin') || 'https://base44.app';
    const baseUrl = origin.replace(/\/$/, '');
    
    // Prepare line items for Wix Payments
    const lineItems = [{
      name: product.name,
      description: product.description || '',
      quantity: quantity,
      unitAmount: Math.round(finalPrice * 100), // Wix uses cents
      productExternalId: product.id
    }];
    
    // If discount is applied, add as separate line item
    if (discountAmount > 0) {
      const discountAmountCents = discountType === 'percentage' 
        ? Math.round((originalPrice * (discountAmount / 100)) * 100 * quantity)
        : Math.round(discountAmount * 100 * quantity);
      
      if (discountAmountCents > 0) {
        lineItems.push({
          name: `Glow Pass Discount (${passCode})`,
          description: `${discountType === 'percentage' ? discountAmount + '%' : '$' + discountAmount} off`,
          quantity: 1,
          unitAmount: -discountAmountCents,
          productExternalId: 'discount'
        });
      }
    }
    
    // Create checkout session with Wix Payments
    const apiKey = Deno.env.get('WIX_PAYMENTS_API_KEY');
    const siteId = Deno.env.get('WIX_PAYMENTS_SITE_ID');
    
    if (!apiKey || !siteId) {
      return Response.json({ error: 'Payment configuration missing' }, { status: 500 });
    }
    
    const wixApiUrl = 'https://www.wixapis.com/payments-checkout/v1/sessions';
    const response = await fetch(wixApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': apiKey,
        'wix-site-id': siteId
      },
      body: JSON.stringify({
        lineItems: lineItems,
        currency: 'USD',
        successUrl: `${baseUrl}/GlowPassSuccess?passCode=${passCode}&productId=${productId}`,
        cancelUrl: `${baseUrl}/GlowPassRedeem?cancelled=true`,
        metadata: {
          passCode: passCode,
          productId: productId,
          passId: pass.id,
          discountType: discountType,
          discountValue: String(discountAmount),
          originalPrice: String(originalPrice),
          finalPrice: String(finalPrice)
        }
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Wix Payments error:', errorData);
      return Response.json({ error: 'Failed to create checkout session', details: errorData }, { status: 500 });
    }
    
    const checkoutData = await response.json();
    
    return Response.json({
      success: true,
      checkoutUrl: checkoutData.redirectUrl,
      sessionId: checkoutData.id,
      passCode: passCode,
      productId: productId,
      originalPrice: originalPrice,
      finalPrice: finalPrice,
      discountApplied: discountAmount > 0
    });
    
  } catch (error) {
    console.error('Checkout error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});