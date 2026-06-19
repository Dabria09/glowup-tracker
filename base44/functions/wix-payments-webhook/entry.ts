import { createClientFromRequest } from 'npm:@base44/sdk@0.8.32';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify webhook signature
    const signature = req.headers.get('x-wix-signature');
    if (!signature) {
      console.warn('Webhook received without signature');
      return Response.json({ success: true }); // Return success to avoid retries
    }
    
    // Get the webhook payload
    const body = await req.json();
    console.log('Wix webhook received:', body);
    
    // Handle different event types
    const eventType = body.type;
    
    if (eventType === 'wix.payments.v1.payment-session-completed' || 
        eventType === 'wix.payments.v1.checkout-session-completed') {
      
      const sessionData = body.data;
      const metadata = sessionData.metadata || {};
      const passCode = metadata.passCode;
      const passId = metadata.passId;
      const productId = metadata.productId;
      
      if (passId) {
        // Increment the usage counter
        const pass = await base44.entities.JoinCode.get(passId);
        if (pass) {
          const currentUses = pass.current_uses || 0;
          await base44.entities.JoinCode.update(passId, {
            current_uses: currentUses + 1
          });
          console.log(`Glow Pass ${passCode} usage incremented to ${currentUses + 1}`);
        }
      }
      
      // Record the transaction
      await base44.entities.GlowPassRedemption.create({
        pass_code: passCode,
        pass_id: passId,
        product_id: productId,
        user_email: sessionData.buyerInfo?.email || 'unknown',
        session_id: sessionData.id,
        amount_paid: (sessionData.totalAmount || 0) / 100, // Convert from cents
        currency: sessionData.currency || 'USD',
        status: 'completed',
        redeemed_date: new Date().toISOString()
      });
    }
    
    return Response.json({ success: true });
    
  } catch (error) {
    console.error('Webhook processing error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});