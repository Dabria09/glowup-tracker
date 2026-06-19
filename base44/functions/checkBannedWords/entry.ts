import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Get the content to check from the request
    const { content } = await req.json();
    
    if (!content || typeof content !== 'string') {
      return Response.json({ error: 'Content is required' }, { status: 400 });
    }

    // Fetch all active banned words
    const bannedWords = await base44.entities.BannedWord.filter({ is_active: true });
    
    if (bannedWords.length === 0) {
      return Response.json({ 
        blocked: false, 
        replaced: false, 
        flagged: false,
        matchedWords: [],
        message: 'No banned words configured'
      });
    }

    const contentLower = content.toLowerCase();
    const matchedWords = [];
    
    // Check each banned word using word boundary matching
    for (const bw of bannedWords) {
      const wordLower = bw.word.toLowerCase().trim();
      if (!wordLower) continue;
      
      // Create regex with word boundaries for multi-character words
      // For single characters or very short words, use simple includes
      let found = false;
      if (wordLower.length <= 2) {
        // For very short words, check if surrounded by non-letters or at start/end
        const escaped = wordLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp('(^|[^a-z0-9])' + escaped + '([^a-z0-9]|$)', 'i');
        found = regex.test(contentLower);
      } else {
        // For longer words/phrases, use word boundaries
        const escaped = wordLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp('\\b' + escaped + '\\b', 'i');
        found = regex.test(contentLower);
      }
      
      if (found) {
        matchedWords.push({
          word: bw.word,
          category: bw.category,
          auto_flag: bw.auto_flag,
        });
      }
    }

    // If no matches, allow the post
    if (matchedWords.length === 0) {
      return Response.json({ 
        blocked: false, 
        replaced: false, 
        flagged: false,
        matchedWords: []
      });
    }

    // For now, all matches trigger a block (auto_flag field is not being used for replace/flag distinction)
    // The BannedWord entity stores auto_flag but the UI doesn't differentiate between block/replace/flag yet
    // Default behavior: block the post entirely
    const action = 'block';
    
    // Build response based on action
    const response = {
      blocked: action === 'block',
      replaced: action === 'replace',
      flagged: action === 'flag',
      matchedWords: matchedWords.map(m => ({
        word: m.word,
        category: m.category,
      })),
      message: action === 'block' 
        ? 'Your message contains inappropriate language. Please remove the flagged words and try again.'
        : action === 'replace'
        ? 'Some words in your message have been replaced.'
        : 'Your message has been flagged for admin review.',
    };

    return Response.json(response);
  } catch (error) {
    console.error('Banned word check failed:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});