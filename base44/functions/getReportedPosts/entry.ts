import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admins can view reported content
    if (user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Fetch all pending/reviewed reports
    const reports = await base44.entities.ContentReport.filter({}, '-created_date');

    // Enrich with content details
    const enrichedReports = await Promise.all(
      reports.map(async (report) => {
        let content = null;
        try {
          if (report.content_type === 'shoutout') {
            content = await base44.entities.ShoutOut.get(report.reported_content_id);
          } else if (report.content_type === 'community_post') {
            content = await base44.entities.CommunityPost.get(report.reported_content_id);
          }
        } catch (e) {
          // Content may have been deleted - that's ok, show snapshot
        }
        
        return {
          ...report,
          content: content || null,
          content_text: content?.content || content?.message || report.content_snapshot || 'Content unavailable',
        };
      })
    );

    return Response.json({ reports: enrichedReports });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});