import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import BookDetail from '@/components/BookDetail';
import { ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

const BOOKS = [
  { id: 'becoming',    title: 'Becoming',                         author: 'Michelle Obama',   genre: 'Memoir',    chapters: 24, featured: true,  desc: "In her memoir, former First Lady Michelle Obama invites readers into her world, chronicling the experiences that have shaped her — from her childhood on the South Side of Chicago to her years as an executive balancing the demands of motherhood and work." },
  { id: 'eyes',        title: 'Their Eyes Were Watching God',      author: 'Zora Neale Hurston', genre: 'Fiction',  chapters: 20, featured: false, desc: "A timeless story of self-discovery and independence, following Janie Crawford as she navigates love, loss, and identity in the American South." },
  { id: 'alchemist',   title: 'The Alchemist',                    author: 'Paulo Coelho',     genre: 'Fiction',   chapters: 18, featured: false, desc: "A magical story about following your dreams. Santiago, a shepherd boy, journeys from Spain to the Egyptian desert in search of a treasure buried near the Pyramids." },
  { id: 'educated',    title: 'Educated',                         author: 'Tara Westover',    genre: 'Memoir',    chapters: 38, featured: false, desc: "A memoir about a young girl who, kept out of school, leaves her survivalist family and goes on to earn a PhD from Cambridge University." },
  { id: 'apologizing', title: 'Girl, Stop Apologizing',            author: 'Rachel Hollis',    genre: 'Self-Help', chapters: 22, featured: false, desc: "A shame-free plan for embracing and achieving your goals. Rachel Hollis encourages women to stop making excuses and start owning their dreams." },
  { id: 'little_fires',title: 'Little Fires Everywhere',          author: 'Celeste Ng',       genre: 'Fiction',   chapters: 26, featured: false, desc: "In Shaker Heights, a placid, progressive suburb of Cleveland, everything is meticulously planned — except for the secrets people keep." },
  { id: 'badass',      title: 'You Are a Badass',                 author: 'Jen Sincero',      genre: 'Self-Help', chapters: 27, featured: false, desc: "A refreshingly entertaining guide to changing your life and stopping the self-sabotage. Packed with exercises, advice, and true stories." },
  { id: 'malala',      title: 'I Am Malala',                      author: 'Malala Yousafzai', genre: 'Memoir',    chapters: 21, featured: false, desc: "The true story of a girl who stood up for education and was shot by the Taliban — and survived to tell the world her story." },
];

const GENRES = ['All', 'Memoir', 'Fiction', 'Self-Help'];
const THIS_MONTH = 'becoming';
const VOTE_NOMINEES = [
  { id: 'dont_settle', title: "Don't Settle for Safe", author: 'Sarah Jakes Roberts' },
  { id: 'my_brilliant', title: 'My Brilliant Friend',  author: 'Elena Ferrante' },
  { id: 'braiding',    title: 'Braiding Sweetgrass',   author: 'Robin Wall Kimmerer' },
  { id: 'untamed',     title: 'Untamed',                author: 'Glennon Doyle' },
];

export default function BookClub({ user }) {
  const [genre, setGenre] = useState('All');
  const [selectedBook, setSelectedBook] = useState(null);
  const [votes, setVotes] = useState({});
  const [myVote, setMyVote] = useState(null);
  const [discussions, setDiscussions] = useState({});

  useEffect(() => {
    const month = new Date().toISOString().slice(0, 7);
    Promise.all([
      base44.entities.BookClubVote.filter({ vote_month: month }),
      base44.entities.BookClubDiscussion.list(),
    ]).then(([voteList, discList]) => {
      // tally votes
      const tally = {};
      VOTE_NOMINEES.forEach(n => { tally[n.id] = 0; });
      voteList.forEach(v => {
        const nom = VOTE_NOMINEES.find(n => n.title === v.book_title);
        if (nom) tally[nom.id] = (tally[nom.id] || 0) + 1;
      });
      setVotes(tally);
      const mine = voteList.find(v => v.user_email === user.email);
      if (mine) setMyVote(VOTE_NOMINEES.find(n => n.title === mine.book_title)?.id || null);
      // comment counts per book
      const counts = {};
      discList.forEach(d => { counts[d.book_id] = (counts[d.book_id] || 0) + 1; });
      setDiscussions(counts);
    });
  }, [user.email]);

  const castVote = async (nom) => {
    if (myVote) return;
    const month = new Date().toISOString().slice(0, 7);
    await base44.entities.BookClubVote.create({ user_email: user.email, book_title: nom.title, book_author: nom.author, vote_month: month });
    setVotes(prev => ({ ...prev, [nom.id]: (prev[nom.id] || 0) + 1 }));
    setMyVote(nom.id);
    toast.success(`Voted for "${nom.title}"! 🗳️`);
  };

  if (selectedBook) {
    return <BookDetail book={selectedBook} user={user} onBack={() => setSelectedBook(null)} />;
  }

  const filtered = genre === 'All' ? BOOKS : BOOKS.filter(b => b.genre === genre);
  const thisMonth = BOOKS.find(b => b.id === THIS_MONTH);
  const totalVotes = Object.values(votes).reduce((s, v) => s + v, 0);

  return (
    <div className="px-4 pb-4">
      {/* This Month's Pick */}
      <div className="rounded-2xl p-4 mb-5 cursor-pointer" onClick={() => setSelectedBook(thisMonth)}
        style={{ background: 'linear-gradient(135deg, rgba(109,40,217,0.5), rgba(139,10,120,0.4))', border: '1px solid rgba(168,85,247,0.4)' }}>
        <p className="text-xs font-bold text-yellow-400 mb-2">⭐ This Month's Book Club Pick</p>
        <div className="flex items-center gap-3">
          <div className="w-14 h-18 rounded-xl flex items-center justify-center text-3xl flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)', padding: '10px 12px' }}>📖</div>
          <div className="flex-1">
            <h3 className="font-bold text-white text-lg leading-tight">{thisMonth.title}</h3>
            <p className="text-purple-300 text-sm mb-1.5">by {thisMonth.author}</p>
            <p className="text-xs text-gray-400 line-clamp-2">{thisMonth.desc}</p>
          </div>
          <ChevronRight size={18} className="text-gray-500 flex-shrink-0" />
        </div>
        <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
          <span>💬 {discussions[thisMonth.id] || 0} comments</span>
          <span>📖 Join the discussion</span>
        </div>
      </div>

      {/* Vote for Next Book */}
      <div className="rounded-2xl p-4 mb-5" style={{ background: 'rgba(50,15,80,0.7)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <p className="font-bold text-white mb-1 flex items-center gap-2">🗳️ Vote: Next Month's Book</p>
        <p className="text-xs text-gray-400 mb-3">{myVote ? 'You voted! Results below.' : 'Tap to vote for next month\'s pick — one vote per member.'}</p>
        <div className="space-y-2">
          {VOTE_NOMINEES.map(nom => {
            const count = votes[nom.id] || 0;
            const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
            const isMyVote = myVote === nom.id;
            return (
              <button key={nom.id} onClick={() => castVote(nom)} disabled={!!myVote}
                className="w-full text-left rounded-xl p-3 transition"
                style={{ background: isMyVote ? 'rgba(168,85,247,0.3)' : 'rgba(255,255,255,0.05)', border: `1px solid ${isMyVote ? 'rgba(168,85,247,0.6)' : 'rgba(255,255,255,0.08)'}` }}>
                <div className="flex items-center justify-between mb-1">
                  <div>
                    <p className="text-sm font-semibold text-white">{nom.title} {isMyVote && '✓'}</p>
                    <p className="text-xs text-gray-400">by {nom.author}</p>
                  </div>
                  {myVote && <span className="text-xs font-bold text-purple-400">{pct}%</span>}
                </div>
                {myVote && (
                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #a855f7, #ec4899)' }} />
                  </div>
                )}
              </button>
            );
          })}
        </div>
        {totalVotes > 0 && <p className="text-xs text-gray-500 mt-2 text-center">{totalVotes} vote{totalVotes !== 1 ? 's' : ''} so far</p>}
      </div>

      {/* Genre Filter */}
      <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1 mb-3">
        {GENRES.map(g => (
          <button key={g} onClick={() => setGenre(g)}
            className="flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition whitespace-nowrap"
            style={genre === g
              ? { background: 'rgba(168,85,247,0.4)', border: '1px solid rgba(168,85,247,0.6)', color: '#fff' }
              : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#9ca3af' }}>
            {g}
          </button>
        ))}
      </div>

      {/* Book List */}
      <div className="space-y-3">
        {filtered.map(book => (
          <button key={book.id} onClick={() => setSelectedBook(book)}
            className="w-full flex items-center gap-3 px-4 py-4 rounded-2xl text-left transition hover:opacity-90"
            style={{ background: 'rgba(50,15,80,0.6)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="w-11 h-14 rounded-xl flex items-center justify-center flex-shrink-0 text-2xl"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}>📖</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="font-bold text-sm text-white leading-snug">{book.title}</p>
                {book.featured && <span className="text-yellow-400 text-xs">⭐</span>}
              </div>
              <p className="text-xs text-purple-300 mb-1">by {book.author}</p>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: 'rgba(168,85,247,0.25)', color: '#c084fc' }}>{book.genre}</span>
                <span className="text-xs text-gray-500">💬 {discussions[book.id] || 0}</span>
              </div>
              <p className="text-xs text-gray-400 mt-1 line-clamp-2">{book.desc}</p>
            </div>
            <ChevronRight size={16} className="text-gray-500 flex-shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
}