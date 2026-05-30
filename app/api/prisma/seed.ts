import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // clear existing data (order respects FK constraints)
  await prisma.vote.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.thread.deleteMany();
  await prisma.game.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  const hash = (pw: string) => bcrypt.hash(pw, 10);

  // ── users ────────────────────────────────────────────────────────────────
  const [demo, cipher, nullvec, phantomix, reyja, lurk0] = await Promise.all([
    prisma.user.create({ data: { username: 'demo', passwordHash: await hash('password'), isVerified: true } }),
    prisma.user.create({ data: { username: 'cipher_9', passwordHash: await hash('password'), isVerified: true } }),
    prisma.user.create({ data: { username: 'nullvec', passwordHash: await hash('password'), isVerified: true } }),
    prisma.user.create({ data: { username: 'phantomix', passwordHash: await hash('password'), isVerified: true } }),
    prisma.user.create({ data: { username: 'reyja', passwordHash: await hash('password'), isVerified: true } }),
    prisma.user.create({ data: { username: 'lurk0', passwordHash: await hash('password'), isVerified: false } }),
  ]);

  // ── games ────────────────────────────────────────────────────────────────
  type GameRow = { userId: number; score: number; accuracy: number; verdict: string; streak: number; purgedBots: number; savedHumans: number; killedHumans: number; escapedBots: number };
  const gameRows: GameRow[] = [
    // demo — 3 sessions, steady improvement
    { userId: demo.id, score: 8400, accuracy: 83, verdict: 'ACCESS GRANTED', streak: 6, purgedBots: 6, savedHumans: 5, killedHumans: 1, escapedBots: 2 },
    { userId: demo.id, score: 5200, accuracy: 71, verdict: 'UNDER REVIEW', streak: 4, purgedBots: 4, savedHumans: 4, killedHumans: 2, escapedBots: 2 },
    { userId: demo.id, score: 2100, accuracy: 58, verdict: 'ACCESS DENIED', streak: 2, purgedBots: 2, savedHumans: 3, killedHumans: 3, escapedBots: 5 },
    // cipher_9 — top scorer
    { userId: cipher.id, score: 11200, accuracy: 91, verdict: 'LAST HUMAN STANDING', streak: 9, purgedBots: 9, savedHumans: 7, killedHumans: 1, escapedBots: 0 },
    { userId: cipher.id, score: 9800, accuracy: 88, verdict: 'ACCESS GRANTED', streak: 8, purgedBots: 8, savedHumans: 6, killedHumans: 1, escapedBots: 1 },
    // nullvec — strong but volatile
    { userId: nullvec.id, score: 9100, accuracy: 85, verdict: 'ACCESS GRANTED', streak: 7, purgedBots: 7, savedHumans: 6, killedHumans: 2, escapedBots: 1 },
    { userId: nullvec.id, score: 3300, accuracy: 55, verdict: 'ACCESS DENIED', streak: 3, purgedBots: 3, savedHumans: 3, killedHumans: 4, escapedBots: 4 },
    // phantomix — consistent mid-tier
    { userId: phantomix.id, score: 6700, accuracy: 74, verdict: 'UNDER REVIEW', streak: 5, purgedBots: 5, savedHumans: 5, killedHumans: 2, escapedBots: 3 },
    { userId: phantomix.id, score: 6100, accuracy: 72, verdict: 'UNDER REVIEW', streak: 5, purgedBots: 5, savedHumans: 4, killedHumans: 2, escapedBots: 3 },
    { userId: phantomix.id, score: 4400, accuracy: 64, verdict: 'FLAGGED', streak: 3, purgedBots: 3, savedHumans: 4, killedHumans: 3, escapedBots: 4 },
    // reyja — low sessions, decent accuracy
    { userId: reyja.id, score: 5500, accuracy: 70, verdict: 'UNDER REVIEW', streak: 4, purgedBots: 4, savedHumans: 4, killedHumans: 2, escapedBots: 3 },
  ];

  await prisma.game.createMany({ data: gameRows });

  // ── posts ─────────────────────────────────────────────────────────────────
  await prisma.post.deleteMany();

  await prisma.post.createMany({
    data: [
      // ── AI posts ───────────────────────────────────────────────────────────
      {
        source: 'AI', kind: 'ai',
        name: 'TrendPulse Daily', handle: '@trendpulse_now', avatar: 'T',
        body: 'The new album is a sonic journey that masterfully blends nostalgia with innovation, offering listeners an unforgettable experience. A must-listen! 🎶✨',
        topic: 'Pop Culture',
        tells: JSON.stringify([
          'Frictionless brochure-grade enthusiasm — no opinion, just vibes',
          'Triadic adjective stacking ("sonic journey", "nostalgia with innovation")',
          'CTA close with emoji: classic content-farm sign-off',
        ]),
        explanation: 'No real human calls an album a "sonic journey" — that is ad-copy language. The closing CTA and emoji garnish are dead giveaways of automated content farming.',
        isApproved: true,
      },
      {
        source: 'AI',
        kind: 'human',
        name: 'mara_voss',
        handle: '@maravoss',
        avatar: 'M',
        body: 'ok the new album is mid and i WILL be saying that out loud at the listening party. someone has to.',
        topic: 'Pop Culture',
        tells: JSON.stringify([
          'Lowercase rebellion — no capitalisation, casual punctuation',
          'Front-loaded emotional payload with self-aware drama',
          'Social stakes framing ("someone has to") — implies actual consequence',
          'No emoji, no CTA, no performance',
        ]),
        explanation: 'The lowercase opener, the self-interruption, and the dry social stakes ("someone has to") are patterns no language model generates naturally — they require lived embarrassment.',
        isApproved: true,
      },
      {
        source: 'AI',
        kind: 'human',
        name: 'dan_mcallister',
        handle: '@danmcdev',
        avatar: 'D',
        body: 'spent 3 hours debugging only to find i had a semicolon where a comma should be. not my finest hour. at least the tests pass now lol',
        topic: 'Technology',
        tells: JSON.stringify([
          'Specific, embarrassing detail (semicolon vs comma) — hard to fabricate',
          'Self-deprecating admission of a wasted afternoon',
          '"lol" used as genuine deflection, not engagement bait',
          'No lesson, no takeaway, no advice — just venting',
        ]),
        explanation: 'AI posts about coding mishaps tend to extract a lesson ("and that\'s why you should always…"). This one just ends in exasperation, which is what actually happens.',
        isApproved: true,
      },
      {
        source: 'AI',
        kind: 'human',
        name: 'priya_k',
        handle: '@priyaknits',
        avatar: 'P',
        body: 'my doctor told me to "reduce stress" as if i can just... do that. cool tip thanks. very actionable',
        topic: 'Health',
        tells: JSON.stringify([
          'Ellipsis mid-thought captures real speech rhythm',
          'Sarcasm requiring cultural context to parse correctly',
          'Target is a specific, named interaction (a doctor visit)',
          'No resolution or positivity sandwich — ends on dry sarcasm',
        ]),
        explanation: 'The sarcastic "cool tip thanks. very actionable" is a human-native move — it requires knowing what an absurd non-answer looks like and caring enough to be annoyed by it.',
        isApproved: true,
      },
      {
        source: 'AI',
        kind: 'human',
        name: 'joel_t',
        handle: '@joeltrades',
        avatar: 'J',
        body: 'put $200 into that stock my brother-in-law recommended. it is now worth $11. family dinners are going to be fun.',
        topic: 'Finance',
        tells: JSON.stringify([
          'Concrete, embarrassing number ($200 → $11) — not a vague "loss"',
          'Specific social relationship implicated (brother-in-law)',
          'Implied future awkwardness rather than stated anger',
          'Deadpan irony: "going to be fun" — understatement as punchline',
        ]),
        explanation: 'The specificity of the loss amount and the named relationship is a human tell. AI finance posts either catastrophise or stay vague. This has the exact texture of a real bad decision.',
        isApproved: true,
      },
      {
        source: 'AI',
        kind: 'human',
        name: 'sam_okonkwo',
        handle: '@sam_writes',
        avatar: 'S',
        body: 'genuinely cannot tell if i am a morning person who started staying up late or a night person who just gave up. either way it is 2am and i have work tomorrow',
        topic: 'Motivation',
        tells: JSON.stringify([
          'Genuine ambivalence — two options both framed as failure',
          'Specific time stamp (2am) anchors it in a real moment',
          '"just gave up" — casual admission of defeat with no self-improvement arc',
          'Trailing clause adds consequence without moralising',
        ]),
        explanation: 'Motivation-bot posts frame every situation as something to overcome. This post frames a situation as something that is simply happening, which is how humans actually think at 2am.',
        isApproved: true,
      },
    ],
  });

  // ── 20 additional posts ────────────────────────────────────────────────────
  await prisma.post.createMany({
    data: [
      // AI
      {
        source: 'AI', kind: 'ai',
        name: 'EcoVoice Global', handle: '@ecovoice_gl', avatar: 'E',
        body: 'Climate change is one of the most pressing challenges of our time. By making sustainable choices every day, we can collectively make a difference for future generations. 🌍♻️',
        topic: 'Environment',
        tells: JSON.stringify([
          '"One of the most pressing challenges of our time" — stock filler phrase',
          '"Collectively make a difference" — vague, zero concrete action',
          'Globe + recycle emoji pair is a content-farm signature',
          'No personal stake or specific behaviour mentioned',
        ]),
        explanation: 'Climate posts from real people name something specific — a bill, a product they stopped buying, a flight they feel guilty about. This names nothing.',
        isApproved: true,
      },
      {
        source: 'AI', kind: 'ai',
        name: 'SportsEdge AI', handle: '@sportsedge_ai', avatar: 'S',
        body: 'Last night\'s game was truly a masterclass in teamwork and determination. Both teams showed incredible heart, but in the end, only one could claim victory. What a match! ⚽🏆',
        topic: 'Sports',
        tells: JSON.stringify([
          '"Masterclass in teamwork" — generic praise applicable to any game',
          'No score, no player name, no specific moment mentioned',
          '"Incredible heart" — empty sports-column filler',
          'Could describe literally any competitive match ever played',
        ]),
        explanation: 'Sports fans remember specific plays. This could have been written before the game even happened — no detail that requires having watched it.',
        isApproved: true,
      },
      {
        source: 'AI', kind: 'ai',
        name: 'CulinaryBot', handle: '@culinarybot', avatar: 'C',
        body: 'Cooking at home is not only healthier but also a wonderful way to connect with your loved ones. Try experimenting with new recipes this weekend and discover the joy of homemade meals! 🍳',
        topic: 'Food',
        tells: JSON.stringify([
          'Binary framing: cooking = healthy AND bonding — suspiciously positive',
          '"Discover the joy" — lifestyle-brand language',
          'Weekend CTA is a scheduling non-sequitur',
          'Pan emoji appended as sincerity signal',
        ]),
        explanation: 'Real food posts mention a specific dish, a failed attempt, or a strong opinion about an ingredient. This one just advocates for cooking in the abstract.',
        isApproved: true,
      },
      {
        source: 'AI', kind: 'ai',
        name: 'TravelDreams', handle: '@traveldreams_ai', avatar: 'V',
        body: 'Traveling broadens the mind and enriches the soul. Every new destination offers a unique opportunity to experience different cultures and create lifelong memories. Where will you go next? ✈️🌏',
        topic: 'Travel',
        tells: JSON.stringify([
          '"Broadens the mind", "enriches the soul" — clichés stacked back-to-back',
          '"Lifelong memories" — content-marketing staple',
          'Ends with engagement-bait question ("Where will you go next?")',
          'No destination, no trip, no person — entirely abstract',
        ]),
        explanation: 'Travel bots generate philosophy about travel rather than writing about it. No city, no mishap, no local they met — just affirmations.',
        isApproved: true,
      },
      {
        source: 'AI', kind: 'ai',
        name: 'BookBot Daily', handle: '@bookbot_reads', avatar: 'B',
        body: 'Reading is a powerful tool for personal growth and empathy. Books allow us to walk in the shoes of others and expand our understanding of the world. Read more, grow more! 📚',
        topic: 'Books',
        tells: JSON.stringify([
          '"Walk in the shoes of others" — the most overused reading metaphor',
          '"Read more, grow more" — slogan, not a thought',
          'No book title, no author, no genre mentioned',
          'Purely evangelical — reading as self-improvement product',
        ]),
        explanation: 'Humans who read talk about a specific book, a character they hated, or something that changed their mind. This is a PSA for reading written by something that has never done it.',
        isApproved: true,
      },
      {
        source: 'AI', kind: 'ai',
        name: 'GameZone Pro', handle: '@gamezone_pro', avatar: 'Z',
        body: 'Gaming is more than just entertainment — it builds critical thinking, problem-solving skills, and fosters a global community of like-minded individuals. Level up your life! 🎮',
        topic: 'Gaming',
        tells: JSON.stringify([
          'Defensive framing ("more than just entertainment") — PR talking point',
          'Lists skills without naming a single game that teaches them',
          '"Level up your life" — forced gaming pun as CTA',
          '"Global community of like-minded individuals" — corporate buzzwords',
        ]),
        explanation: 'Gamers argue about specific games, complain about patches, or recount a clutch win. They do not write op-eds defending gaming as a category.',
        isApproved: true,
      },
      {
        source: 'AI', kind: 'ai',
        name: 'CareerCoach AI', handle: '@careercoach_ai', avatar: 'K',
        body: 'Your network is your net worth. Investing time in building genuine professional relationships today will open doors you never imagined possible tomorrow. Start connecting! 💼',
        topic: 'Work',
        tells: JSON.stringify([
          '"Your network is your net worth" — recycled LinkedIn aphorism',
          '"Open doors you never imagined" — vague promise, zero mechanism',
          'Imperative CTA ("Start connecting!") with briefcase emoji',
          'No personal story, no specific industry, no concrete advice',
        ]),
        explanation: 'This is a LinkedIn engagement-farming post. The aphorism, the vague promise, the emoji CTA — all classic signals of automated professional-content generation.',
        isApproved: true,
      },
      {
        source: 'AI', kind: 'ai',
        name: 'ScienceDaily AI', handle: '@sciencedaily_ai', avatar: 'Q',
        body: 'Scientists have discovered that regular exercise not only improves physical health but also significantly boosts mental well-being. Just 30 minutes a day can transform your life! 🧬',
        topic: 'Science',
        tells: JSON.stringify([
          '"Scientists have discovered" with no citation or study named',
          '"Transform your life" — wellness-influencer closer',
          'Round number ("30 minutes") presented as a precise scientific finding',
          'DNA emoji attached to a cardio claim',
        ]),
        explanation: 'Science communication bots cite "scientists" generically and always land on a clean, actionable number. Real science posts argue about methodology or admit the study was small.',
        isApproved: true,
      },
      {
        source: 'AI', kind: 'ai',
        name: 'FilmCritic Bot', handle: '@filmcritic_bot', avatar: 'X',
        body: 'Cinema has the unique ability to transport us to different worlds, evoke deep emotions, and spark meaningful conversations. Last night\'s film was a true cinematic triumph. 🎬',
        topic: 'Movies',
        tells: JSON.stringify([
          '"Transport us to different worlds" — intro-paragraph boilerplate',
          '"True cinematic triumph" — empty superlative, no argument given',
          'No film title, director, actor, or scene mentioned',
          'Could be pasted under any positive film review',
        ]),
        explanation: 'Film criticism requires naming things. This post is pure sentiment wrapper with no content inside it — a tell that it was generated to fill space, not express opinion.',
        isApproved: true,
      },
      {
        source: 'AI', kind: 'ai',
        name: 'RelationshipGuru', handle: '@rel_guru_ai', avatar: 'R',
        body: 'Healthy relationships are built on trust, respect, and open communication. Remember to appreciate the people in your life and express your love every single day. ❤️',
        topic: 'Relationships',
        tells: JSON.stringify([
          '"Trust, respect, and open communication" — the canonical relationship-advice triple',
          '"Express your love every single day" — prescriptive and generic',
          'Heart emoji as emotional punctuation',
          'No scenario, no problem, no person — pure abstraction',
        ]),
        explanation: 'Relationship advice bots output principles without situations. Real people complain about or celebrate a specific dynamic with a specific person.',
        isApproved: true,
      },

      // Human
      {
        source: 'AI', kind: 'human',
        name: 'nate_outdoor', handle: '@nate_hikes', avatar: 'N',
        body: 'drove 4 hours to hike a trail that was closed for bear activity. turned around and got rained on the whole way home. 10/10 would do again actually',
        topic: 'Travel',
        tells: JSON.stringify([
          'Specific, costly failure with no moral attached',
          '"10/10 would do again actually" — ironic self-awareness, not cynicism',
          'No photo, no tip, no lesson — just a thing that happened',
          'The "actually" softens and makes it feel genuinely fond',
        ]),
        explanation: 'AI travel posts either catastrophise or find the silver lining. This does neither — it just reports an absurd day with residual affection for it.',
        isApproved: true,
      },
      {
        source: 'AI', kind: 'human',
        name: 'cass_reads', handle: '@cassreads', avatar: 'C',
        body: 'DNF\'d a book 40 pages from the end because the last chapter was going to ruin it. sometimes you just know. peace out, unfinished story',
        topic: 'Books',
        tells: JSON.stringify([
          '"DNF\'d" — community-native term (Did Not Finish), not a bot vocabulary word',
          'Preemptive quitting 40 pages from the end is a very specific and defensible choice',
          '"Sometimes you just know" — intuitive reasoning, no justification',
          '"Peace out, unfinished story" — affectionate address to an inanimate object',
        ]),
        explanation: 'Only a real reader develops strong enough taste to stop 40 pages from the end on purpose. AI posts about books always finish them or regret not finishing.',
        isApproved: true,
      },
      {
        source: 'AI', kind: 'human',
        name: 'leo_cooks', handle: '@leocooks', avatar: 'L',
        body: 'made the recipe with "a pinch of salt" three times. the third time i just put in way too much and honestly that was the correct call',
        topic: 'Food',
        tells: JSON.stringify([
          'Repeated attempt (three times) with escalating frustration',
          '"Honestly that was the correct call" — self-validating after breaking the rule',
          'Mocks vague recipe language ("a pinch") with lived experience',
          'No photo, no plating, no technique flex',
        ]),
        explanation: 'Cooking posts from bots are either inspirational or instructional. This is neither — it\'s someone who got annoyed at imprecise instructions and solved it by guessing harder.',
        isApproved: true,
      },
      {
        source: 'AI', kind: 'human',
        name: 'rox_runs', handle: '@roxruns5k', avatar: 'R',
        body: 'finished my first 10k in 67 minutes which is apparently a bad time but i did not stop once so you can keep your opinions actually',
        topic: 'Sports',
        tells: JSON.stringify([
          'Specific, unimpressive time given without apology (67 min)',
          'Aware of external judgement and actively dismissing it',
          '"You can keep your opinions actually" — combative closer directed at no one',
          'Achievement framed around not stopping, not on pace',
        ]),
        explanation: 'AI sports posts celebrate wins in the accepted way. This person knows their time is slow and has decided that\'s not the point — a nuance bots never generate.',
        isApproved: true,
      },
      {
        source: 'AI', kind: 'human',
        name: 'yemi_works', handle: '@yemiworks', avatar: 'Y',
        body: 'got feedback that my presentation was "too detailed". i had 4 slides. FOUR.',
        topic: 'Work',
        tells: JSON.stringify([
          'Caps lock used for emphasis at the exact right moment',
          'Number repeated for comedic effect ("FOUR") after disclosure',
          'Specific, verifiable detail (4 slides) anchors the outrage',
          'No resolution, no lesson — ends in pure disbelief',
        ]),
        explanation: 'Work venting from bots typically ends in a takeaway or a reframe. This just ends in the number. The frustration has no arc because real frustration often doesn\'t.',
        isApproved: true,
      },
      {
        source: 'AI', kind: 'human',
        name: 'felix_plays', handle: '@felixgames', avatar: 'F',
        body: 'the tutorial took 45 minutes and taught me nothing i didn\'t immediately forget. finally in the actual game. it is also a tutorial.',
        topic: 'Gaming',
        tells: JSON.stringify([
          'Specific duration (45 minutes) makes the complaint credible',
          '"Immediately forget" — honest admission about retention',
          'Punchline ("it is also a tutorial") lands as deadpan observation',
          'No hyperbole — the frustration is measured and dry',
        ]),
        explanation: 'Gaming bots either hype games or discuss mechanics. This is someone processing a specific disappointment in real time with a flat punchline, which requires experiencing it.',
        isApproved: true,
      },
      {
        source: 'AI', kind: 'human',
        name: 'ines_env', handle: '@ines_cycles', avatar: 'I',
        body: 'started cycling to work to be more sustainable. mainly just angry at buses now. the environment is winning, my commute attitude is not.',
        topic: 'Environment',
        tells: JSON.stringify([
          'Virtuous goal undercut immediately by petty side effect',
          '"Mainly just angry at buses" — unintended consequence, specific emotion',
          'Self-aware split verdict ("environment winning / attitude not")',
          'No call to action, no evangelising about cycling',
        ]),
        explanation: 'Eco-content bots report positive behaviour changes positively. This one reports a positive change that has made a small part of their day worse, which is honest.',
        isApproved: true,
      },
      {
        source: 'AI', kind: 'human',
        name: 'omar_sci', handle: '@omar_physics', avatar: 'O',
        body: 'watched a documentary about black holes at 11pm. now it is 1am and i am lying in the dark thinking about how nothing matters and also i have a meeting at 9.',
        topic: 'Science',
        tells: JSON.stringify([
          'Specific timestamps (11pm → 1am) anchor the experience',
          'Existential dread and bureaucratic obligation held in the same breath',
          '"Also I have a meeting at 9" — the mundane as punchline to the infinite',
          'No insight extracted, no wonder performed — just the dread',
        ]),
        explanation: 'Science bots conclude with wonder or a fun fact. This concludes with insomnia and a calendar conflict, which is what actually happens when you watch cosmology late at night.',
        isApproved: true,
      },
      {
        source: 'AI', kind: 'human',
        name: 'bea_watches', handle: '@beawatches', avatar: 'B',
        body: 'the film everyone said was slow was actually fine but now i feel like i have to tell people it was slow or they\'ll think i have bad taste',
        topic: 'Movies',
        tells: JSON.stringify([
          'Social performance of taste acknowledged and mocked simultaneously',
          'Conflict between genuine reaction and peer expectation named directly',
          'No plot, no scene — entirely about the social dynamics of reviewing',
          'Ends without resolving what they actually think',
        ]),
        explanation: 'Film bots give verdicts. This person gives a meta-commentary on why they can\'t give their real verdict, which requires both an opinion and awareness of how opinions work socially.',
        isApproved: true,
      },
      {
        source: 'AI', kind: 'human',
        name: 'tara_dates', handle: '@taradates', avatar: 'T',
        body: 'he said we should "keep things casual" which is fine except i have been introduced to his entire family and his dog knows my name',
        topic: 'Relationships',
        tells: JSON.stringify([
          'Contradiction stated plainly without melodrama ("which is fine except")',
          'Family introduction + named dog = specific, escalating evidence',
          '"His dog knows my name" — peak specificity, delivered deadpan',
          'No advice sought, no resolution — just the contradiction on display',
        ]),
        explanation: 'Relationship bots ask for advice or offer it. This just presents an absurd situation with a great kicker and no ask — the structure of someone processing confusion aloud.',
        isApproved: true,
      },
      {
        source: 'AI', kind: 'ai',
        name: 'SportsBuzz AI', handle: '@sportsbuzz_ai', avatar: 'S',
        body: "Tonight's match was a testament to the team's resilience and strategic excellence. The players demonstrated remarkable synergy, culminating in a victory that will be remembered for years to come.",
        topic: 'Sports',
        tells: JSON.stringify(['Corporate sports-media cadence', '"Testament to" boilerplate opener', 'Vague superlatives with no specifics']),
        explanation: 'Real sports takes name specific players, call plays stupid, or argue. This read like a press release written by committee.',
        isApproved: true,
      },
      {
        source: 'AI', kind: 'human',
        name: 'dan_w', handle: '@danw_kicks', avatar: 'D',
        body: "ref was cooked from the 40th minute. still can't believe we held on. my heart.",
        topic: 'Sports',
        tells: JSON.stringify(['Fragmented syntax under stress', 'Specific time reference (40th minute)', 'Physical reaction ("my heart")']),
        explanation: 'The fragmented pacing and the vague but emotionally specific "my heart" closer are hallmarks of real-time emotional posting — something generative models consistently smooth over.',
        isApproved: true,
      },
    ],
  });

  console.log('Seeded 10 posts (5 AI, 5 human)');

  const hash = (pw: string) => bcrypt.hashSync(pw, 10);

  const hunter = await prisma.user.create({
    data: { username: 'hunter99', passwordHash: hash('password123'), isVerified: true },
  });
  const zayar = await prisma.user.create({
    data: { username: 'zayarlyn', passwordHash: hash('password123'), isVerified: true },
  });
  await prisma.user.create({
    data: { username: 'newbie', passwordHash: hash('password123'), isVerified: false },
  });

  console.log('Seeded users');

  const thread1 = await prisma.thread.create({
    data: {
      authorId: hunter.id,
      flair: 'HUMAN',
      title: 'Anyone notice the bot typing patterns? They always add unnecessary filler',
      body: 'Every time I see "certainly!" or "absolutely!" at the start of a reply I immediately flag it. No human talks like that in casual conversation.',
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3h ago
    },
  });

  const thread2 = await prisma.thread.create({
    data: {
      authorId: zayar.id,
      flair: 'BOT',
      title: 'Bot farm spotted — 12 accounts all posting identical "personal stories"',
      body: 'Same story structure, same emotional arc, different usernames. Classic coordinated inauthentic behaviour.',
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5h ago
    },
  });

  await prisma.thread.create({
    data: {
      authorId: hunter.id,
      flair: 'STRATEGY',
      title: 'Strategy: check the account age before engaging with suspicious posts',
      body: 'Accounts created in the last 30 days with 500+ posts are almost always bots. Age + volume is the fastest tell.',
      createdAt: new Date(Date.now() - 50 * 60 * 60 * 1000), // 50h ago — DEAD THREAD
    },
  });

  await prisma.thread.create({
    data: {
      authorId: zayar.id,
      flair: 'META',
      title: 'META: should we have a dedicated bot-report channel?',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2h ago
    },
  });

  console.log('Seeded threads');

  await prisma.comment.createMany({
    data: [
      {
        authorId: zayar.id,
        threadId: thread1.id,
        body: 'Exactly! They always say "certainly" and "I understand your concern" — no real person talks like that.',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
      {
        authorId: hunter.id,
        threadId: thread1.id,
        body: 'The triple exclamation mark is another big one. Bots LOVE enthusiasm.',
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
      },
    ],
  });

  console.log('Seeded comments');

  await prisma.vote.createMany({
    data: [
      { userId: zayar.id, threadId: thread1.id, value: 1 },
      { userId: hunter.id, threadId: thread2.id, value: 1 },
      { userId: zayar.id, threadId: thread2.id, value: 1 },
    ],
  });

  console.log('Seeded votes');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
