import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('airtable');
    const { action, baseId, tableId, offset } = await req.json();

    const headers = { Authorization: `Bearer ${accessToken}` };

    if (action === 'listBases') {
      const res = await fetch('https://api.airtable.com/v0/meta/bases', { headers });
      const data = await res.json();
      return Response.json(data);
    }

    if (action === 'listTables') {
      const res = await fetch(`https://api.airtable.com/v0/meta/bases/${baseId}/tables`, { headers });
      const data = await res.json();
      return Response.json(data);
    }

    if (action === 'fetchRecords') {
      const url = new URL(`https://api.airtable.com/v0/${baseId}/${tableId}`);
      url.searchParams.set('pageSize', '100');
      if (offset) url.searchParams.set('offset', offset);
      const res = await fetch(url.toString(), { headers });
      const data = await res.json();
      return Response.json(data);
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});