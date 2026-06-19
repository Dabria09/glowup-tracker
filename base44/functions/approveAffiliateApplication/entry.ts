import { createClientFromRequest } from 'npm:@base44/sdk@0.8.32';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user is admin
    const userData = await base44.entities.User.filter({ email: user.email });
    if (!userData[0] || userData[0].role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { application_id, status, commission_rate, rejection_reason } = await req.json();

    // Get application
    const applications = await base44.entities.AffiliateApplication.filter({ id: application_id });
    if (!applications.length) {
      return Response.json({ error: 'Application not found' }, { status: 404 });
    }

    const app = applications[0];

    // Update application
    const updateData = {
      status,
      approved_by: status === 'approved' ? user.email : undefined,
      approved_date: status === 'approved' ? new Date().toISOString() : undefined,
      rejected_by: status === 'rejected' ? user.email : undefined,
      rejected_date: status === 'rejected' ? new Date().toISOString() : undefined,
      rejection_reason: status === 'rejected' ? rejection_reason : undefined,
      commission_rate: status === 'approved' ? (parseFloat(commission_rate) || 0) : undefined,
    };

    await base44.entities.AffiliateApplication.update(application_id, updateData);

    // If approved, send notification email (optional - would need email integration)
    // For now, just return success

    return Response.json({ 
      success: true, 
      message: `Application ${status}`,
      affiliate_code: app.affiliate_code,
      commission_rate: status === 'approved' ? commission_rate : null,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});