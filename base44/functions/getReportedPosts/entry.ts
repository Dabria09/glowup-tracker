import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin or moderator in any community
    const userCommunities = await base44.entities.CommunityMember.filter({ 
      user_email: user.email,
      role: ['admin', 'moderator']
    });

    if (userCommunities.length === 0 && user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin or Moderator access required' }, { status: 403 });
    }

    // Get all community IDs where user is admin/moderator
    const communityIds = userCommunities.map(m => m.community_id);

    // Fetch all posts from those communities
    let allPosts = [];
    for (const commId of communityIds) {
      const posts = await base44.entities.CommunityPost.filter({ community_id: commId }, '-created_date');
      allPosts = [...allPosts, ...posts];
    }

    // If platform admin, get all posts
    if (user.role === 'admin') {
      allPosts = await base44.entities.CommunityPost.filter({}, '-created_date');
    }

    // Get community info for each post
    const postsWithCommunity = await Promise.all(
      allPosts.map(async (post) => {
        const community = await base44.entities.Community.get(post.community_id);
        return {
          ...post,
          community_name: community?.name || 'Unknown',
          community_type: community?.type || 'unknown',
        };
      })
    );

    return Response.json({ posts: postsWithCommunity });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});