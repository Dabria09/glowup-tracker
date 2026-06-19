import { createClientFromRequest } from 'npm:@base44/sdk@0.8.32';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if already a Pioneer member
    const existingMembers = await base44.entities.PioneerMember.filter({ user_email: user.email });
    if (existingMembers.length > 0) {
      return Response.json({ 
        eligible: false, 
        reason: 'already_member',
        tier: existingMembers[0].tier,
        pioneer_number: existingMembers[0].pioneer_number
      });
    }

    // Get user's signup order
    const allUsers = await base44.entities.User.list('created_date', 1000);
    const userIndex = allUsers.findIndex(u => u.email === user.email);
    
    if (userIndex === -1) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    const pioneerNumber = userIndex + 1;
    
    // Determine tier based on signup order
    let tier = '';
    if (pioneerNumber <= 100) tier = 'founding';
    else if (pioneerNumber <= 500) tier = 'pioneer';
    else if (pioneerNumber <= 1000) tier = 'early_adopter';
    else {
      return Response.json({ 
        eligible: false, 
        reason: 'not_in_first_1000',
        pioneer_number: pioneerNumber
      });
    }

    // Check onboarding complete
    const profiles = await base44.entities.UserProfile.filter({ user_email: user.email });
    if (!profiles[0] || !profiles[0].onboarding_complete) {
      return Response.json({ 
        eligible: false, 
        reason: 'onboarding_incomplete',
        pioneer_number: pioneerNumber
      });
    }

    // Check for at least 1 DailyCheckIn within 14 days of signup
    const signupDate = new Date(allUsers[userIndex].created_date);
    const fourteenDaysLater = new Date(signupDate);
    fourteenDaysLater.setDate(fourteenDaysLater.getDate() + 14);
    
    const checkins = await base44.entities.DailyCheckIn.filter({ user_email: user.email });
    const hasEarlyCheckin = checkins.some(c => {
      const checkinDate = new Date(c.created_date);
      return checkinDate <= fourteenDaysLater;
    });

    if (!hasEarlyCheckin) {
      return Response.json({ 
        eligible: false, 
        reason: 'no_early_checkin',
        pioneer_number: pioneerNumber,
        message: 'Complete a Daily Check-in within 14 days of signup to qualify'
      });
    }

    // All criteria met - grant Pioneer status
    const tierLabels = {
      founding: 'Founding Pioneer',
      pioneer: 'Pioneer',
      early_adopter: 'Early Adopter'
    };

    await base44.entities.PioneerMember.create({
      user_email: user.email,
      pioneer_number: pioneerNumber,
      tier: tier,
      granted_date: new Date().toISOString(),
      badge_earned: `${tier}_pioneer_badge`,
    });

    // Update user profile with glow_era and badge
    await base44.entities.UserProfile.update(profiles[0].id, {
      glow_era: tierLabels[tier],
      owned_store_items: JSON.stringify([
        ...(JSON.parse(profiles[0].owned_store_items || '[]')),
        `${tier}_pioneer_badge`
      ]),
    });

    return Response.json({ 
      eligible: true, 
      tier: tier,
      tier_label: tierLabels[tier],
      pioneer_number: pioneerNumber,
      badge: `${tier}_pioneer_badge`
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});