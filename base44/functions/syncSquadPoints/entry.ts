import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    // Get the user email from the PointsHistory record that triggered this
    const userEmail = body.data?.user_email;
    if (!userEmail) {
      return Response.json({ message: 'No user_email in payload, skipping.' });
    }

    // Find which squad this user belongs to
    const memberships = await base44.asServiceRole.entities.SquadMember.filter({ user_email: userEmail });
    if (!memberships || memberships.length === 0) {
      return Response.json({ message: 'User is not in any squad.' });
    }

    // For each squad the user belongs to, recalculate total points from all members
    for (const membership of memberships) {
      const squadId = membership.squad_id;

      // Get all members of this squad
      const allMembers = await base44.asServiceRole.entities.SquadMember.filter({ squad_id: squadId });
      const memberEmails = allMembers.map(m => m.user_email);

      // Sum all PointsHistory for these members
      let totalPoints = 0;
      for (const email of memberEmails) {
        const history = await base44.asServiceRole.entities.PointsHistory.filter({ user_email: email });
        const memberTotal = history.reduce((sum, p) => sum + (p.points || 0), 0);
        totalPoints += memberTotal;
      }

      // Update the squad's total points
      await base44.asServiceRole.entities.GlowSquad.update(squadId, { squad_points: totalPoints });
    }

    return Response.json({ success: true, message: `Squad points synced for ${userEmail}` });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});