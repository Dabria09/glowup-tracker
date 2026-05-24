import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import BookDetail from '@/components/BookDetail';
import { ChevronRight, BookOpen, MessageCircle, Trophy } from 'lucide-react';
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
const THIS_MONTH_ID = 'becoming';
const CLUB_TABS = ['This Month', 'All Books', 'Vote'];
const DEFAULT_BOOK_ID = 'becoming';

const READING_SCHEDULE = [
  { week: 1, range: 'Chapters 1–6',   theme: 'Roots & Identity',    prompt: 'How did Michelle\'s upbringing shape who she became? What from your own roots shapes you?' },
  { week: 2, range: 'Chapters 7–12',  theme: 'Ambition & Doubt',    prompt: 'She faced the question "Am I enough?" — when have you felt that way, and how did you push through?' },
  { week: 3, range: 'Chapters 13–18', theme: 'Love & Partnership',  prompt: 'How does her relationship with Barack challenge and strengthen her? What do you look for in a partner?' },
  { week: 4, range: 'Chapters 19–24', theme: 'Power & Purpose',     prompt: 'What does "Becoming" mean to you? How are you still in the process of becoming?' },
];

export default function BookClub({ user }) {
  const [clubTab, setClubTab] = useState('This Month');
  const [genre, setGenre] = useState('All');
  const [selectedBook, setSelectedBook] = useState(null);
  const [discussions, setDiscussions] = useState({});
  const [myProgress, setMyProgress] = useState(null);
  const [activeWeek, setActiveWeek] = useState(0);
  const [thisMonthId, setThisMonthId] = useState(DEFAULT_BOOK_ID);
  const [settingsRecord, setSettingsRecord] = useState(null);
  const [showBookPicker, setShowBookPicker] = useState(false);

  // Nominations state
  const [nominations, setNominations] = useState([]);
  const [myNomination, setMyNomination] = useState(null);
  const [nomTitle, setNomTitle] = useState('');
  const [nomAuthor, setNomAuthor] = useState('');
  const [submittingNom, setSubmittingNom] = useState(false);

  // Final votes state
  const [votes, setVotes] = useState({});
  const [myVote, setMyVote] = useState(null);

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    const month = new Date().toISOString().slice(0, 7);
    Promise.all([
      base44.entities.BookClubVote.filter({ vote_month: month }),
      base44.entities.BookClubDiscussion.list(),
      base44.entities.BookClubSettings.filter({ month }),
      base44.entities.BookClubNomination.filter({ vote_month: month }),
    ]).then(async ([voteList, discList, settingsList, nomList]) => {
      if (settingsList.length) {
        setSettingsRecord(settingsList[0]);
        setThisMonthId(settingsList[0].current_book_id);
        const progList = await base44.entities.BookClubProgress.filter({ user_email: user.email, book_id: settingsList[0].current_book_id });
        if (progList.length) setMyProgress(progList[0]);
      } else {
        const progList = await base44.entities.BookClubProgress.filter({ user_email: user.email, book_id: DEFAULT_BOOK_ID });
        if (progList.length) setMyProgress(progList[0]);
      }

      // Nominations
      setNominations(nomList);
      const myNom = nomList.find(n => n.user_email === user.email);
      if (myNom) setMyNomination(myNom);

      // Final votes (keyed by book_title)
      const tally = {};
      voteList.forEach(v => { tally[v.book_title] = (tally[v.book_title] || 0) + 1; });
      setVotes(tally);
      const mine = voteList.find(v => v.user_email === user.email);
      if (mine) setMyVote(mine.book_title);

      const counts = {};
      discList.forEach(d => { counts[d.book_id] = (counts[d.book_id] || 0) + 1; });
      setDiscussions(counts);
    });

    const dayOfMonth = new Date().getDate();
    setActiveWeek(Math.min(3, Math.floor((dayOfMonth - 1) / 7)));
  }, [user.email]);

  const changeThisMonthBook = async (bookId) => {
    const month = new Date().toISOString().slice(0, 7);
    if (settingsRecord) {
      const updated = await base44.entities.BookClubSettings.update(settingsRecord.id, { current_book_id: bookId });
      setSettingsRecord(updated);
    } else {
      const created = await base44.entities.BookClubSettings.create({ current_book_id: bookId, month });
      setSettingsRecord(created);
    }
    setThisMonthId(bookId);
    setMyProgress(null);
    setShowBookPicker(false);
    toast.success(`This month's book updated! 📚`);
  };

  const submitNomination = async () => {
    if (!nomTitle.trim() || myNomination) return;
    setSubmittingNom(true);
    const month = new Date().toISOString().slice(0, 7);
    const created = await base44.entities.BookClubNomination.create({
      user_email: user.email,
      book_title: nomTitle.trim(),
      book_author: nomAuthor.trim() || 'Unknown',
      vote_month: month,
    });
    setMyNomination(created);
    setNominations(prev => [...prev, created]);
    setNomTitle('');
    setNomAuthor('');
    setSubmittingNom(false);
    toast.success('Nomination submitted! 📚');
  };

  const castVote = async (bookTitle, bookAuthor) => {
    if (myVote) return;
    const month = new Date().toISOString().slice(0, 7);
    await base44.entities.BookClubVote.create({ user_email: user.email, book_title: bookTitle, book_author: bookAuthor, vote_month: month });
    setVotes(prev => ({ ...prev, [bookTitle]: (prev[bookTitle] || 0) + 1 }));
    setMyVote(bookTitle);
    toast.success(`Voted for "${bookTitle}"! 🗳️`);
  };

  if (selectedBook) {
    return <BookDetail book={selectedBook} user={user} onBack={() => setSelectedBook(null)} />;
  }

  const thisMonth = BOOKS.find(b => b.id === thisMonthId) || BOOKS[0];
  const currentChapter = myProgress?.current_chapter || 0;
  const pct = Math.round((currentChapter / thisMonth.chapters) * 100);
  const filtered = genre === 'All' ? BOOKS : BOOKS.filter(b => b.genre === genre);
  const totalComments = discussions[THIS_MONTH_ID] || 0;

  // Derive top 5 from nominations tally
  const nomTally = {};
  nominations.forEach(n => {
    const key = n.book_title.toLowerCase();
    if (!nomTally[key]) nomTally[key] = { title: n.book_title, author: n.book_author, count: 0 };
    nomTally[key].count += 1;
  });
  const top5 = Object.values(nomTally).sort((a, b) => b.count - a.count).slice(0, 5);
  const totalVotes = Object.values(votes).reduce((s, v) => s + v, 0);

  return (
    <div className="px-4 pb-4">
      {/* Club Sub-tabs */}
      <div className="flex gap-2 mb-5 overflow-x-auto scrollbar-none">
        {CLUB_TABS.map(tab => (
          <button key={tab} onClick={() => setClubTab(tab)}
            className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition"
            style={clubTab === tab
              ? { background: 'rgba(168,85,247,0.4)', border: '1px solid rgba(168,85,247,0.6)', color: '#fff' }
              : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#9ca3af' }}>
            {tab === 'This Month' ? '📅' : tab === 'All Books' ? '📚' : '🗳️'} {tab}
          </button>
        ))}
      </div>

      {/* ── THIS MONTH ── */}
      {clubTab === 'This Month' && (
        <div className="space-y-4">
          {/* Admin: Change Book */}
          {isAdmin && (
            <div className="flex justify-end mb-2">
              <button onClick={() => setShowBookPicker(!showBookPicker)}
                className="text-xs px-3 py-1.5 rounded-full font-semibold transition"
                style={{ background: 'rgba(234,179,8,0.2)', border: '1px solid rgba(234,179,8,0.4)', color: '#fde047' }}>
                🛠️ Admin: Change This Month's Book
              </button>
            </div>
          )}

          {/* Book Picker for Admin */}
          {isAdmin && showBookPicker && (
            <div className="rounded-2xl p-4 mb-3" style={{ background: 'rgba(30,10,50,0.9)', border: '1px solid rgba(234,179,8,0.4)' }}>
              <p className="text-xs font-bold text-yellow-400 mb-3">Select This Month's Book</p>
              <div className="space-y-2">
                {BOOKS.map(b => (
                  <button key={b.id} onClick={() => changeThisMonthBook(b.id)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition"
                    style={{ background: b.id === thisMonthId ? 'rgba(168,85,247,0.3)' : 'rgba(255,255,255,0.05)', border: `1px solid ${b.id === thisMonthId ? 'rgba(168,85,247,0.6)' : 'rgba(255,255,255,0.08)'}` }}>
                    <span className="text-xl">📖</span>
                    <div>
                      <p className="text-sm font-semibold text-white">{b.title} {b.id === thisMonthId ? '✓' : ''}</p>
                      <p className="text-xs text-gray-400">by {b.author} · {b.genre}</p>
                    </div>
                  </button>
                ))}
              </div>
              <button onClick={() => setShowBookPicker(false)} className="w-full mt-3 py-2 rounded-xl text-sm text-gray-400" style={{ background: 'rgba(255,255,255,0.05)' }}>Cancel</button>
            </div>
          )}

          {/* Hero Book Card */}
          <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(109,40,217,0.6), rgba(139,10,120,0.5))', border: '1px solid rgba(168,85,247,0.4)' }}>
            <div className="px-4 pt-4 pb-2">
              <div className="flex items-center gap-1.5 mb-3">
                <span className="text-yellow-400 text-xs font-bold tracking-wide">⭐ MAY 2026 — BOOK CLUB PICK</span>
              </div>
              <div className="flex gap-4">
                <div className="w-20 h-24 rounded-xl flex items-center justify-center text-4xl flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #6d28d9, #a855f7)', boxShadow: '0 8px 24px rgba(168,85,247,0.4)' }}>📖</div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-white leading-tight">{thisMonth.title}</h2>
                  <p className="text-purple-300 text-sm mb-2">by {thisMonth.author}</p>
                  <div className="flex gap-1.5">
                    <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: 'rgba(168,85,247,0.3)', color: '#c084fc' }}>{thisMonth.genre}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: 'rgba(234,179,8,0.2)', color: '#fde047' }}>👑 Glow Woman</span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed mt-3">{thisMonth.desc}</p>
            </div>
            <div className="flex divide-x divide-white/10 border-t border-white/10">
              <div className="flex-1 flex flex-col items-center py-3 gap-0.5">
                <span className="text-white font-bold text-lg">{totalComments}</span>
                <span className="text-gray-400 text-xs flex items-center gap-1"><MessageCircle size={10} /> Posts</span>
              </div>
              <div className="flex-1 flex flex-col items-center py-3 gap-0.5">
                <span className="text-white font-bold text-lg">{thisMonth.chapters}</span>
                <span className="text-gray-400 text-xs flex items-center gap-1"><BookOpen size={10} /> Chapters</span>
              </div>
              <div className="flex-1 flex flex-col items-center py-3 gap-0.5">
                <span className="text-white font-bold text-lg">{pct}%</span>
                <span className="text-gray-400 text-xs flex items-center gap-1"><Trophy size={10} /> My Progress</span>
              </div>
            </div>
          </div>

          {/* My Progress */}
          <div className="rounded-2xl p-4" style={{ background: 'rgba(50,15,80,0.6)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="flex items-center justify-between mb-2">
              <p className="font-bold text-white text-sm">🏆 My Reading Progress</p>
              <span className="text-xs text-gray-400">Ch. {currentChapter} / {thisMonth.chapters}</span>
            </div>
            <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden mb-3">
              <div className="h-full rounded-full" style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #a855f7, #ec4899)', transition: 'width 0.5s ease' }} />
            </div>
            <button onClick={() => setSelectedBook(thisMonth)}
              className="w-full py-2.5 rounded-xl text-sm font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}>
              {currentChapter === 0 ? 'Start Reading & Tracking 📖' : 'Continue Reading 📖'}
            </button>
          </div>

          {/* Monthly Reading Schedule */}
          <div className="rounded-2xl p-4" style={{ background: 'rgba(50,15,80,0.6)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="font-bold text-white mb-1 flex items-center gap-2">📅 Monthly Reading Schedule</p>
            <p className="text-xs text-gray-400 mb-3">Read along with the club — one section per week</p>
            <div className="space-y-2">
              {READING_SCHEDULE.map((week, i) => {
                const isCurrent = i === activeWeek;
                const isPast = i < activeWeek;
                return (
                  <div key={i} className="rounded-xl p-3"
                    style={{ background: isCurrent ? 'rgba(168,85,247,0.2)' : 'rgba(255,255,255,0.03)', border: `1px solid ${isCurrent ? 'rgba(168,85,247,0.5)' : 'rgba(255,255,255,0.07)'}` }}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: isCurrent ? 'rgba(168,85,247,0.5)' : 'rgba(255,255,255,0.08)', color: isCurrent ? '#fff' : '#6b7280' }}>
                          Week {i + 1}
                        </span>
                        {isCurrent && <span className="text-xs text-purple-400 font-semibold">← This Week</span>}
                        {isPast && <span className="text-xs text-green-400">✓ Done</span>}
                      </div>
                      <span className="text-xs text-gray-400">{week.range}</span>
                    </div>
                    <p className="text-xs font-semibold mb-1" style={{ color: isCurrent ? '#c084fc' : '#6b7280' }}>{week.theme}</p>
                    <p className="text-xs text-gray-400 leading-relaxed italic">"{week.prompt}"</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Discussion Prompt CTA */}
          <div className="rounded-2xl p-4" style={{ background: 'rgba(109,40,217,0.25)', border: '1px solid rgba(168,85,247,0.3)' }}>
            <p className="font-bold text-white mb-1">💬 This Week's Discussion Prompt</p>
            <p className="text-sm text-gray-300 leading-relaxed italic mb-3">"{READING_SCHEDULE[activeWeek]?.prompt}"</p>
            <button onClick={() => setSelectedBook(thisMonth)}
              className="w-full py-2.5 rounded-xl text-sm font-bold text-white"
              style={{ background: 'rgba(168,85,247,0.4)', border: '1px solid rgba(168,85,247,0.5)' }}>
              Join the Discussion 💜
            </button>
          </div>
        </div>
      )}

      {/* ── ALL BOOKS ── */}
      {clubTab === 'All Books' && (
        <div>
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
          <div className="space-y-3">
            {filtered.map(book => (
              <button key={book.id} onClick={() => setSelectedBook(book)}
                className="w-full flex items-center gap-3 px-4 py-4 rounded-2xl text-left transition hover:opacity-90"
                style={{ background: 'rgba(50,15,80,0.6)', border: book.id === THIS_MONTH_ID ? '1px solid rgba(168,85,247,0.5)' : '1px solid rgba(255,255,255,0.08)' }}>
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
                    {book.id === THIS_MONTH_ID && <span className="text-xs text-yellow-400 font-semibold">📅 This Month</span>}
                  </div>
                  <p className="text-xs text-gray-400 mt-1 line-clamp-2">{book.desc}</p>
                </div>
                <ChevronRight size={16} className="text-gray-500 flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── VOTE ── */}
      {clubTab === 'Vote' && (
        <div className="space-y-4">

          {/* Step 1: Nominate */}
          <div className="rounded-2xl p-4" style={{ background: 'rgba(50,15,80,0.7)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="font-bold text-white mb-1 flex items-center gap-2">📝 Step 1: Nominate a Book</p>
            <p className="text-xs text-gray-400 mb-3">Suggest a book for next month — the top 5 most-nominated become the finalists for voting.</p>
            {myNomination ? (
              <div className="rounded-xl p-3 flex items-center gap-3" style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)' }}>
                <span className="text-green-400 text-lg">✅</span>
                <div>
                  <p className="text-sm font-bold text-white">{myNomination.book_title}</p>
                  <p className="text-xs text-gray-400">by {myNomination.book_author} — your nomination is in!</p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <input
                  value={nomTitle}
                  onChange={e => setNomTitle(e.target.value)}
                  placeholder="Book title *"
                  className="w-full px-4 py-2.5 rounded-xl text-sm text-white outline-none"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
                />
                <input
                  value={nomAuthor}
                  onChange={e => setNomAuthor(e.target.value)}
                  placeholder="Author name (optional)"
                  className="w-full px-4 py-2.5 rounded-xl text-sm text-white outline-none"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
                />
                <button
                  onClick={submitNomination}
                  disabled={!nomTitle.trim() || submittingNom}
                  className="w-full py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-40"
                  style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}>
                  {submittingNom ? 'Submitting...' : 'Submit Nomination 📚'}
                </button>
              </div>
            )}
            <p className="text-xs text-gray-500 mt-2 text-center">{nominations.length} nomination{nominations.length !== 1 ? 's' : ''} submitted this month</p>
          </div>

          {/* Current Standings */}
          <div className="rounded-2xl p-4" style={{ background: 'rgba(50,15,80,0.7)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="font-bold text-white mb-1 flex items-center gap-2">📊 Current Nomination Standings</p>
            <p className="text-xs text-gray-400 mb-3">{nominations.length} total nomination{nominations.length !== 1 ? 's' : ''} this month — top 5 become the finalists</p>

            {/* My Nomination Highlight */}
            {myNomination && (
              <div className="rounded-xl p-3 mb-3 flex items-center gap-3" style={{ background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.4)' }}>
                <span className="text-lg">🙋</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-purple-300">Your Nomination</p>
                  <p className="text-sm font-bold text-white">{myNomination.book_title}</p>
                  <p className="text-xs text-gray-400">by {myNomination.book_author}</p>
                </div>
                {(() => {
                  const key = myNomination.book_title.toLowerCase();
                  const count = nomTally[key]?.count || 0;
                  return <span className="text-sm font-bold text-purple-300">{count} vote{count !== 1 ? 's' : ''}</span>;
                })()}
              </div>
            )}

            {/* Top 5 Leaderboard */}
            {nominations.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-4">No nominations yet — be the first!</p>
            ) : (
              <div className="space-y-2">
                {Object.values(nomTally).sort((a, b) => b.count - a.count).slice(0, 5).map((nom, i) => {
                  const maxCount = Math.max(...Object.values(nomTally).map(n => n.count));
                  const pct = maxCount > 0 ? Math.round((nom.count / maxCount) * 100) : 0;
                  const isMyNom = myNomination?.book_title.toLowerCase() === nom.title.toLowerCase();
                  const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];
                  return (
                    <div key={i} className="rounded-xl p-3" style={{ background: isMyNom ? 'rgba(168,85,247,0.15)' : 'rgba(255,255,255,0.04)', border: `1px solid ${isMyNom ? 'rgba(168,85,247,0.3)' : 'rgba(255,255,255,0.07)'}` }}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <span className="text-sm flex-shrink-0">{medals[i]}</span>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-white truncate">{nom.title} {isMyNom ? '✦' : ''}</p>
                            <p className="text-xs text-gray-400">by {nom.author}</p>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-purple-300 ml-2 flex-shrink-0">{nom.count} nom{nom.count !== 1 ? 's' : ''}</span>
                      </div>
                      <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: isMyNom ? 'linear-gradient(90deg, #a855f7, #ec4899)' : 'rgba(168,85,247,0.5)' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Step 2: Vote on Top 5 */}
          <div className="rounded-2xl p-4" style={{ background: 'rgba(50,15,80,0.7)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="font-bold text-white mb-1 flex items-center gap-2">🗳️ Step 2: Vote on the Top {top5.length > 0 ? Math.min(top5.length, 5) : 5}</p>
            <p className="text-xs text-gray-400 mb-3">
              {myVote ? '✅ Your vote is in! Results are live.' : top5.length === 0 ? 'No nominations yet — be the first to nominate above!' : 'Vote for your favorite from the most-nominated books.'}
            </p>
            {top5.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-4xl mb-2">📚</p>
                <p className="text-sm text-gray-400">Nominations will appear here once submitted.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {top5.map((nom, i) => {
                  const count = votes[nom.title] || 0;
                  const votePct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
                  const isMyVote = myVote === nom.title;
                  const isWinning = myVote && count > 0 && count === Math.max(...top5.map(n => votes[n.title] || 0));
                  return (
                    <button key={i} onClick={() => castVote(nom.title, nom.author)} disabled={!!myVote}
                      className="w-full text-left rounded-xl p-4 transition"
                      style={{ background: isMyVote ? 'rgba(168,85,247,0.3)' : 'rgba(255,255,255,0.05)', border: `2px solid ${isMyVote ? 'rgba(168,85,247,0.7)' : 'rgba(255,255,255,0.08)'}` }}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-white">{nom.title} {isMyVote && '✓'} {isWinning ? '🏆' : ''}</p>
                          <p className="text-xs text-gray-400">by {nom.author} · {nom.count} nomination{nom.count !== 1 ? 's' : ''}</p>
                        </div>
                        {myVote && <span className="text-sm font-bold text-purple-300 ml-2">{votePct}%</span>}
                      </div>
                      {myVote && (
                        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${votePct}%`, background: 'linear-gradient(90deg, #a855f7, #ec4899)' }} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
            {totalVotes > 0 && <p className="text-xs text-gray-500 mt-3 text-center">{totalVotes} vote{totalVotes !== 1 ? 's' : ''} cast so far</p>}
          </div>

        </div>
      )}
    </div>
  );
}