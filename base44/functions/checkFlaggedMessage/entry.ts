import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Get the message data from the automation payload
    const { data, event } = await req.json();
    
    if (!data || !data.content) {
      return Response.json({ skipped: true, reason: 'No message content' });
    }

    // High-risk keyword combinations (immediate alert)
    const HIGH_RISK_COMBOS = [
      ['secret', 'alone'],
      ['secret', 'come over'],
      ['don\'t tell', 'alone'],
      ['don\'t tell', 'come over'],
      ['don\'t tell', 'meet'],
      ['alone', 'come over'],
      ['alone', 'meet'],
      ['come over', 'pick up'],
    ];

    // Fetch active chat safety keywords from database
    const keywords = await base44.entities.ChatSafetyKeyword.filter({ is_active: true });
    
    // Build severity map from database
    const KEYWORD_SEVERITY = {};
    keywords.forEach(kw => {
      KEYWORD_SEVERITY[kw.keyword.toLowerCase()] = kw.severity || 1;
    });

    const contentLower = data.content.toLowerCase();
    
    // Check for high-risk combinations
    let hasHighRiskCombo = false;
    for (const combo of HIGH_RISK_COMBOS) {
      if (combo.every(kw => contentLower.includes(kw))) {
        hasHighRiskCombo = true;
        break;
      }
    }

    // Calculate risk score
    let riskScore = 0;
    const foundKeywords = [];
    for (const [keyword, severity] of Object.entries(KEYWORD_SEVERITY)) {
      if (contentLower.includes(keyword)) {
        riskScore += severity;
        foundKeywords.push({ keyword, severity });
      }
    }

    // Determine alert level
    let alertLevel = 'none';
    if (hasHighRiskCombo) {
      alertLevel = 'urgent'; // High-risk combination detected
    } else if (riskScore >= 3) {
      alertLevel = 'high'; // Multiple keywords or high-severity single keyword
    } else if (riskScore >= 1) {
      alertLevel = 'medium'; // Lower severity keywords
    }

    // Only send alerts for medium+ risk
    if (alertLevel === 'none') {
      return Response.json({ 
        flagged: false, 
        riskScore, 
        alertLevel,
        foundKeywords 
      });
    }

    // Get all admin users
    const allUsers = await base44.asServiceRole.entities.User.list();
    const admins = allUsers.filter(u => u.role === 'admin');

    if (admins.length === 0) {
      return Response.json({ 
        flagged: true, 
        alertLevel, 
        warning: 'No admins found to notify',
        riskScore,
        foundKeywords 
      });
    }

    // Create urgent notification for admins
    const alertEmoji = alertLevel === 'urgent' ? '🚨 URGENT' : alertLevel === 'high' ? '⚠️ HIGH RISK' : '📋 Flagged';
    const conversationId = data.conversation_id || 'unknown';
    
    for (const admin of admins) {
      await base44.entities.Notification.create({
        recipient_email: admin.email,
        type: 'moderation_alert',
        actor_email: data.sender_email || 'system',
        actor_username: 'GGU Safety System',
        message: `${alertEmoji}: Flagged message detected in conversation ${conversationId}. Keywords: ${foundKeywords.map(k => k.keyword).join(', ')}. Risk Score: ${riskScore}.`,
        link: '/admin',
        priority: alertLevel === 'urgent' ? 'urgent' : alertLevel === 'high' ? 'high' : 'medium',
        metadata: JSON.stringify({
          conversation_id: conversationId,
          sender_email: data.sender_email,
          receiver_email: data.receiver_email,
          riskScore,
          alertLevel,
          foundKeywords,
          hasHighRiskCombo,
          message_content: data.content,
        }),
      });
    }

    // Log the alert
    await base44.entities.AdminLogs.create({
      action_type: 'other',
      performed_by: 'system',
      target_email: `${data.sender_email} → ${data.receiver_email}`,
      details: `Real-time safety alert: ${alertLevel} risk (score: ${riskScore}). Keywords: ${foundKeywords.map(k => k.keyword).join(', ')}`,
      metadata: JSON.stringify({
        conversation_id: conversationId,
        alertLevel,
        riskScore,
        foundKeywords,
        hasHighRiskCombo,
      }),
    });

    return Response.json({ 
      flagged: true, 
      alertLevel, 
      riskScore, 
      foundKeywords,
      hasHighRiskCombo,
      adminsNotified: admins.length,
    });
  } catch (error) {
    console.error('Flagged message check failed:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});