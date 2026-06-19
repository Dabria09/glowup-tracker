import { createClientFromRequest } from 'npm:@base44/sdk@0.8.32';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { affiliate_code, new_user_email } = await req.json();

    // Find approved affiliate
    const affiliates = await base44.entities.AffiliateApplication.filter({ 
      affiliate_code, 
      status: 'approved' 
    });

    if (!affiliates.length) {
      return Response.json({ error: 'Invalid or inactive affiliate code' }, { status: 400 });
    }

    const affiliate = affiliates[0];

    // Check if this referral already exists
    const existingReferrals = await base44.entities.Referral.filter({
      referred_email: new_user_email,
      referral_type: 'affiliate',
    });

    if (existingReferrals.length > 0) {
      return Response.json({ error: 'This user was already referred by this affiliate' }, { status: 400 });
    }

    // Create referral record
    await base44.entities.Referral.create({
      referrer_email: affiliate.user_email,
      referred_email: new_user_email,
      referral_code: affiliate_code,
      referral_type: 'affiliate',
      referred_date: new Date().toISOString(),
      commission_earned: affiliate.commission_rate,
    });

    // Update affiliate stats
    const newSignups = (affiliate.signups_driven || 0) + 1;
    const newEarnings = (affiliate.total_earned || 0) + (affiliate.commission_rate || 0);

    await base44.entities.AffiliateApplication.update(affiliate.id, {
      signups_driven: newSignups,
      total_earned: newEarnings,
    });

    // Award welcome bonus points to new user (50 points)
    try {
      const userPoints = await base44.entities.UserPoints.filter({ user_email: new_user_email });
      if (userPoints.length > 0) {
        const newTotal = (userPoints[0].total_points || 0) + 50;
        await base44.entities.UserPoints.update(userPoints[0].id, { total_points: newTotal });
        await base44.entities.PointsHistory.create({
          user_email: new_user_email,
          action: 'affiliate_welcome',
          label: 'Affiliate Welcome Bonus',
          emoji: '🎁',
          points: 50,
          total_after: newTotal,
        });
      }
    } catch (e) {
      console.error('Failed to award welcome points:', e);
    }

    return Response.json({ 
      success: true, 
      affiliate_email: affiliate.user_email,
      commission_earned: affiliate.commission_rate,
      new_signups: newSignups,
      new_earnings: newEarnings,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});