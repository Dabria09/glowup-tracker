import { createClientFromRequest } from 'npm:@base44/sdk@0.8.32';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify admin
    if (user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { application_id, action, commission_rate, rejection_reason } = await req.json();

    const apps = await base44.entities.AffiliateApplication.filter({ id: application_id });
    if (!apps.length) {
      return Response.json({ error: 'Application not found' }, { status: 404 });
    }

    const app = apps[0];

    if (action === 'approve') {
      await base44.entities.AffiliateApplication.update(application_id, {
        status: 'approved',
        approved_by: user.email,
        approved_date: new Date().toISOString(),
        commission_rate: commission_rate || 0,
      });
    } else if (action === 'reject') {
      await base44.entities.AffiliateApplication.update(application_id, {
        status: 'rejected',
        rejected_by: user.email,
        rejected_date: new Date().toISOString(),
        rejection_reason: rejection_reason || '',
      });
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});