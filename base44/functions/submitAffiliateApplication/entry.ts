import { createClientFromRequest } from 'npm:@base44/sdk@0.8.32';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      full_name, 
      social_platforms, 
      total_followers, 
      primary_platform, 
      promotion_plan, 
      previous_campaigns,
      agrees_to_disclosure
    } = await req.json();

    // Check if user already has an application
    const existing = await base44.entities.AffiliateApplication.filter({ 
      user_email: user.email 
    });

    if (existing.length > 0) {
      return Response.json({ 
        error: 'You already have an application pending',
        status: existing[0].status,
        application: existing[0]
      }, { status: 400 });
    }

    // Generate unique affiliate code
    const base = user.email.split('@')[0].toUpperCase().slice(0, 4);
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    const affiliate_code = `GGU-${base}-${random}`;

    // Create application
    const application = await base44.entities.AffiliateApplication.create({
      user_email: user.email,
      full_name,
      social_platforms: JSON.stringify(social_platforms),
      total_followers: parseInt(total_followers) || 0,
      primary_platform,
      promotion_plan,
      previous_campaigns: previous_campaigns || '',
      status: 'pending',
      affiliate_code,
      submitted_date: new Date().toISOString(),
      disclosure_agreed: agrees_to_disclosure || false,
    });

    return Response.json({ 
      success: true, 
      application: {
        id: application.id,
        affiliate_code,
        status: 'pending',
        submitted_date: application.submitted_date,
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});