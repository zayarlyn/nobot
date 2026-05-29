/* =========================================================================
   DATA — placeholder game content. Attached to window.DATA
   Each round: { topic, items: [ {kind:'human'|'ai', ...}, {...} ], tells:{...} }
   ========================================================================= */
(function () {
  const TEXT_ROUNDS = [
    {
      topic: "Pop Culture",
      items: [
        {
          kind: "human", name: "mara_voss", handle: "@maravoss", av: "M",
          body: "ok the new album is mid and i WILL be saying that out loud at the listening party. someone has to.",
          likes: "1.2K", rt: "88", reply: "204",
        },
        {
          kind: "ai", name: "TrendPulse Daily", handle: "@trendpulse_now", av: "T",
          body: "The new album is a sonic journey that masterfully blends nostalgia with innovation, offering listeners an unforgettable experience that resonates across generations. A must-listen! 🎶✨",
          likes: "47", rt: "3", reply: "1",
        },
      ],
      tells: [
        "Frictionless, brochure-grade enthusiasm — no actual opinion or risk.",
        "Triadic adjective stacking: 'nostalgia, innovation, unforgettable.'",
        "Emoji garnish + 'A must-listen!' CTA reads like ad copy, not a person.",
        "Zero typos, zero lowercase rebellion, zero specificity.",
      ],
    },
    {
      topic: "Politics",
      items: [
        {
          kind: "ai", name: "Civic Insight", handle: "@civic_insight_ai", av: "C",
          body: "It is important to consider multiple perspectives on this complex issue. Both sides raise valid points, and constructive dialogue remains essential to a healthy democracy.",
          likes: "12", rt: "2", reply: "0",
        },
        {
          kind: "human", name: "deb (tired)", handle: "@debstillhere", av: "D",
          body: "they raised the parking fines AGAIN and the bus still doesn't come. call your council member i'm begging",
          likes: "640", rt: "210", reply: "73",
        },
      ],
      tells: [
        "'It is important to consider' — hedging boilerplate with no stance.",
        "Symmetrical 'both sides' framing avoids any concrete claim.",
        "No lived detail, no local specifics, no stakes.",
        "Perfectly balanced sentence rhythm — too smooth to be angry.",
      ],
    },
    {
      topic: "News",
      items: [
        {
          kind: "human", name: "j. okafor", handle: "@jokafor_reports", av: "J",
          body: "standing outside the depot, third hour now. workers say they got the email at 6am. nobody from corporate has come down.",
          likes: "3.4K", rt: "1.1K", reply: "402",
        },
        {
          kind: "ai", name: "NewsStream", handle: "@newsstream_global", av: "N",
          body: "Breaking developments continue to unfold as the situation evolves. Stakeholders are closely monitoring events. We will provide updates as more information becomes available.",
          likes: "21", rt: "9", reply: "2",
        },
      ],
      tells: [
        "'Developments continue to unfold' — content-free placeholder phrasing.",
        "No who/where/when — just abstract 'stakeholders' and 'events.'",
        "Future-tense promise to report instead of actually reporting.",
        "Uniform clause length; no on-the-ground texture.",
      ],
    },
    {
      topic: "Sports",
      items: [
        {
          kind: "ai", name: "GameDay Bot", handle: "@gameday_metrics", av: "G",
          body: "What an incredible display of athleticism and teamwork! This game truly had it all — drama, heart, and unforgettable moments that fans will cherish for years to come. 🏆",
          likes: "33", rt: "4", reply: "0",
        },
        {
          kind: "human", name: "big rob", handle: "@robwatchesball", av: "R",
          body: "WE WERE DOWN 18 i was literally turning the tv off. i will never doubt again. never. screaming",
          likes: "5.7K", rt: "900", reply: "330",
        },
      ],
      tells: [
        "'Had it all — drama, heart, unforgettable' — generic hype template.",
        "Trophy emoji + 'cherish for years to come' = greeting-card tone.",
        "No score, no player, no moment that actually happened.",
        "Emotionally flat despite claiming to be emotional.",
      ],
    },
    {
      topic: "Pop Culture",
      items: [
        {
          kind: "human", name: "s…lena", handle: "@selena_eats", av: "S",
          body: "made the viral pasta. it was fine? not life changing. i think we've all just been hungry and lying to each other",
          likes: "2.1K", rt: "318", reply: "190",
        },
        {
          kind: "ai", name: "FoodieVibes", handle: "@foodievibes_ai", av: "F",
          body: "This viral pasta recipe is an absolute game-changer that will elevate your weeknight dinners to a whole new level! Easy, delicious, and guaranteed to impress. Try it tonight! 🍝",
          likes: "58", rt: "6", reply: "1",
        },
      ],
      tells: [
        "'Game-changer,' 'elevate,' 'whole new level' — SEO recipe-blog stock phrases.",
        "Unqualified guarantees ('guaranteed to impress').",
        "CTA close ('Try it tonight!') with emoji.",
        "No ambivalence — humans hedge, this oversells.",
      ],
    },
  ];

  const IMAGE_ROUNDS = [
    {
      topic: "Pop Culture",
      items: [
        { kind: "human", label: "CANDID PHONE PHOTO\nconcert crowd, low light", cap: "shot on phone, 2019" },
        { kind: "ai", label: "AI RENDER\ncrowd, suspiciously uniform faces", cap: "diffusion model output" },
      ],
      tells: [
        "AI: hands and fingers merge in the crowd — count them.",
        "AI: background faces are smooth, symmetric, identical lighting.",
        "Human: motion blur + sensor noise + uneven exposure.",
        "AI: text on signs dissolves into pseudo-letters.",
      ],
    },
    {
      topic: "News",
      items: [
        { kind: "ai", label: "AI RENDER\nflooded street, glossy reflections", cap: "too-perfect reflections" },
        { kind: "human", label: "PRESS PHOTO\nflooded street, debris", cap: "wire service" },
      ],
      tells: [
        "AI: water reflections are too clean and physically inconsistent.",
        "AI: repeating texture patterns in the debris.",
        "Human: messy occlusion, real depth of field.",
        "AI: over-smooth surfaces, no dirt where dirt should be.",
      ],
    },
    {
      topic: "Sports",
      items: [
        { kind: "human", label: "ACTION PHOTO\nathlete mid-jump, frozen", cap: "1/2000s shutter" },
        { kind: "ai", label: "AI RENDER\nathlete, warped limb geometry", cap: "anatomy drift" },
      ],
      tells: [
        "AI: limb proportions drift — a knee bends the wrong way.",
        "AI: jersey numbers are plausible nonsense.",
        "Human: crisp freeze of a real instant, authentic sweat/grain.",
        "AI: background crowd is a smeared gradient of 'people.'",
      ],
    },
    {
      topic: "Politics",
      items: [
        { kind: "ai", label: "AI RENDER\npodium scene, plastic skin", cap: "uncanny skin shading" },
        { kind: "human", label: "POOL PHOTO\npodium scene, harsh flash", cap: "press pool" },
      ],
      tells: [
        "AI: skin has a waxy, pore-less 'plastic' sheen.",
        "AI: microphone and flag details melt under inspection.",
        "Human: harsh on-camera flash, real shadow falloff.",
        "AI: teeth and ears render as soft approximations.",
      ],
    },
    {
      topic: "Pop Culture",
      items: [
        { kind: "human", label: "STREET STYLE\nfashion candid, real storefront", cap: "35mm grain" },
        { kind: "ai", label: "AI RENDER\nfashion, impossible garment seams", cap: "seam logic fails" },
      ],
      tells: [
        "AI: garment seams and zippers connect to nothing.",
        "AI: jewelry fuses into skin; earrings asymmetric.",
        "Human: consistent film grain across the frame.",
        "AI: reflections in windows don't match the scene.",
      ],
    },
  ];

  const ARTICLES = [
    { cat: "AI", source: "WIRED", date: "MAY 28", title: "The web is filling with text no human will ever read — and machines wrote all of it" },
    { cat: "Bots", source: "404 MEDIA", date: "MAY 27", title: "Inside the bot farms manufacturing engagement for accounts that don't exist" },
    { cat: "Misinformation", source: "THE VERGE", date: "MAY 26", title: "A fake protest photo went viral. It was never real. Neither were the people sharing it." },
    { cat: "Policy", source: "REUTERS", date: "MAY 25", title: "Regulators weigh mandatory 'synthetic content' labels as detection tools fall behind" },
    { cat: "AI", source: "MIT TECH REVIEW", date: "MAY 24", title: "Dead Internet Theory was a joke. The data is starting to agree with it." },
    { cat: "Bots", source: "BLOOMBERG", date: "MAY 23", title: "Ad networks paid out millions to traffic that was 91% non-human, audit finds" },
    { cat: "Misinformation", source: "AP", date: "MAY 22", title: "Election officials brace for a flood of AI-generated 'eyewitness' accounts" },
    { cat: "Policy", source: "FT", date: "MAY 21", title: "Platforms quietly roll back human moderation as automated filters take over" },
  ];

  // profile placeholder
  const PROFILE = {
    user: "last_human_online", av: "L", joined: "JOINED 2024",
    history: [38, 44, 41, 56, 52, 67, 61, 74, 70, 82, 78, 88],
    byTopic: [
      { topic: "News", acc: 82 },
      { topic: "Sports", acc: 74 },
      { topic: "Politics", acc: 61 },
      { topic: "Pop Culture", acc: 88 },
    ],
    log: [
      { mode: "TEXT", score: 880, acc: 88, verdict: "SURVIVOR", date: "MAY 28 · 21:14" },
      { mode: "IMAGE", score: 640, acc: 70, verdict: "FLAGGED", date: "MAY 27 · 19:02" },
      { mode: "TEXT", score: 720, acc: 80, verdict: "SURVIVOR", date: "MAY 26 · 23:51" },
      { mode: "IMAGE", score: 410, acc: 56, verdict: "ASSIMILATED", date: "MAY 24 · 18:30" },
    ],
  };

  const KEYWORDS = ["breaking", "viral", "thread", "exclusive", "leak", "trending", "exposed", "debunked", "shocking", "must-read", "insider", "rumor"];

  // leaderboard placeholder — ranked human auditors. score = NOBOT Score.
  // verdict tiers: SURVIVOR (alive) · FLAGGED (borderline) · ASSIMILATED (lost)
  const LEADERBOARD = [
    { rank: 1,  handle: "@ghost_in_the_feed", av: "G", score: 9240, acc: 96, streak: 41, audits: 1208, verdict: "SURVIVOR",    karma: 4200, posts: 89,  comments: 312 },
    { rank: 2,  handle: "@still.organic",      av: "S", score: 8810, acc: 94, streak: 38, audits: 1102, verdict: "SURVIVOR",    karma: 3800, posts: 71,  comments: 287 },
    { rank: 3,  handle: "@meatspace_only",     av: "M", score: 8455, acc: 93, streak: 33, audits: 980,  verdict: "SURVIVOR",    karma: 3450, posts: 65,  comments: 241 },
    { rank: 4,  handle: "@captcha_survivor",   av: "C", score: 7920, acc: 91, streak: 29, audits: 877,  verdict: "SURVIVOR",    karma: 2990, posts: 58,  comments: 198 },
    { rank: 5,  handle: "@404_human_found",    av: "4", score: 7610, acc: 89, streak: 27, audits: 812,  verdict: "SURVIVOR",    karma: 2710, posts: 51,  comments: 176 },
    { rank: 6,  handle: "@analog_holdout",     av: "A", score: 7120, acc: 87, streak: 24, audits: 760,  verdict: "SURVIVOR",    karma: 2380, posts: 44,  comments: 159 },
    { rank: 7,  handle: "@touch_grass_daily",  av: "T", score: 6680, acc: 84, streak: 21, audits: 701,  verdict: "FLAGGED",     karma: 1920, posts: 38,  comments: 128 },
    { rank: 8,  handle: "@last_human_online",  av: "L", score: 6240, acc: 82, streak: 19, audits: 668,  verdict: "FLAGGED", you: true, karma: 1640, posts: 31, comments: 97 },
    { rank: 9,  handle: "@signal_not_noise",   av: "S", score: 5870, acc: 79, streak: 16, audits: 612,  verdict: "FLAGGED",     karma: 1390, posts: 27,  comments: 82  },
    { rank: 10, handle: "@probably_a_person",  av: "P", score: 5410, acc: 76, streak: 14, audits: 559,  verdict: "FLAGGED",     karma: 1050, posts: 22,  comments: 64  },
    { rank: 11, handle: "@verified_carbon",    av: "V", score: 4980, acc: 72, streak: 11, audits: 503,  verdict: "FLAGGED",     karma: 780,  posts: 18,  comments: 43  },
    { rank: 12, handle: "@turing_failed_me",   av: "T", score: 4310, acc: 64, streak: 8,  audits: 441,  verdict: "ASSIMILATED", karma: 420,  posts: 11,  comments: 28  },
    { rank: 13, handle: "@i_swear_im_real",    av: "I", score: 3720, acc: 58, streak: 6,  audits: 388,  verdict: "ASSIMILATED", karma: 280,  posts: 7,   comments: 19  },
    { rank: 14, handle: "@beep_boop_no",       av: "B", score: 2940, acc: 51, streak: 4,  audits: 302,  verdict: "ASSIMILATED", karma: 90,   posts: 3,   comments: 8   },
  ];

  // TODO: fetch from backend — humansRemaining = registered users, auditorsActive = logins within 7 days
  const NETWORK = { humansRemaining: 847, auditorsActive: 213 };

  // ---- DISCUSSION board seeds — r/nobot ----
  // flair: HUMAN (sighting) · BOT (alert) · META · STRATEGY · GLITCH
  const H = 3600e3, D = 24 * H;
  const now = Date.now();
  const THREADS = [
    {
      id: "t1", author: "ghost_in_the_feed", av: "G", flair: "META", votes: 412, ts: now - 5 * H,
      title: "I scanned 1,000 posts. Here's the #1 tell nobody talks about.",
      body: "It's not the em-dashes. It's not the 'delve.' It's CADENCE. Real people front-load the emotional payload and let the sentence fall apart. Bots build to a clean, balanced closer every single time. Once you hear it you can't unhear it.",
      comments: [
        { id: "c1", author: "still.organic", av: "S", body: "The 'balanced closer' thing is so real. Every AI reply ends like it's wrapping up a TED talk.", votes: 88, ts: now - 4 * H, replies: [
          { id: "c1a", author: "ghost_in_the_feed", av: "G", body: "Right?? It's the rhetorical equivalent of landing a backflip every time. Humans trip.", votes: 41, ts: now - 3.4 * H, replies: [] },
        ] },
        { id: "c2", author: "turing_failed_me", av: "T", body: "counterpoint: i also end on a clean closer and i'm (probably) human", votes: 23, ts: now - 3 * H, replies: [] },
      ],
    },
    {
      id: "t2", author: "404_human_found", av: "4", flair: "BOT", votes: 287, ts: now - 11 * H,
      title: "Whole comment section of @nightlytechwire is synthetic. Screenshots inside.",
      body: "Forty-one replies, posted within 90 seconds of each other, all with the same three-sentence rhythm and a closing emoji. The account itself might be real but the engagement is a bot farm. We are not on the same internet anymore.",
      comments: [
        { id: "c3", author: "meatspace_only", av: "M", body: "The 90-second window is the giveaway. No human thread moves that uniformly.", votes: 54, ts: now - 9 * H, replies: [] },
      ],
    },
    {
      id: "t3", author: "captcha_survivor", av: "C", flair: "STRATEGY", votes: 198, ts: now - 1 * D,
      title: "Stop reading the words. Read the SHAPE of the paragraph first.",
      body: "Hard-mode strat: blur your eyes. Synthetic text has even margins, even sentence lengths, even paragraph blocks. Human text is jagged — a two-word sentence next to a runaway one. You can flag 60% of them before you read a single word.",
      comments: [
        { id: "c4", author: "signal_not_noise", av: "S", body: "This bumped my Hard-mode accuracy from 71 to 84. Genuinely.", votes: 33, ts: now - 20 * H, replies: [] },
        { id: "c5", author: "analog_holdout", av: "A", body: "the silhouette read is underrated. it's literally how i sort my feed now", votes: 19, ts: now - 18 * H, replies: [] },
      ],
    },
    {
      id: "t4", author: "last_human_online", av: "L", flair: "HUMAN", votes: 156, ts: now - 1.5 * D,
      title: "Found one. An actually, unmistakably human post in the wild.",
      body: "A typo in the third word. An unfinished thought. A reply to themselves correcting a fact 8 minutes later. Beautiful. Chaotic. Alive. I almost teared up. We're still here.",
      comments: [
        { id: "c6", author: "probably_a_person", av: "P", body: "the self-reply correction is the most human thing a person can do. no bot has that shame.", votes: 47, ts: now - 1.2 * D, replies: [] },
      ],
    },
    {
      id: "t5", author: "verified_carbon", av: "V", flair: "GLITCH", votes: 74, ts: now - 2 * D,
      title: "Anyone else's integrity meter flicker during the reveal animation?",
      body: "Mid-purge the meter dropped to 0 for one frame then snapped back. Cosmetic glitch or is NOBOT leaking into the audit tool itself. Asking for a paranoid friend (me).",
      comments: [],
    },
  ];

  window.DATA = { TEXT_ROUNDS, IMAGE_ROUNDS, ARTICLES, PROFILE, KEYWORDS, LEADERBOARD, NETWORK, THREADS };

  /* -----------------------------------------------------------------------
     RUN PERSISTENCE — engine writes finished runs here; meta pages read them.
     ----------------------------------------------------------------------- */
  window.DOAI = {
    KEY: "doai:runs",
    loadRuns() {
      try { return JSON.parse(localStorage.getItem(this.KEY)) || []; }
      catch (e) { return []; }
    },
    saveRun(run) {
      const runs = this.loadRuns();
      runs.unshift(run);
      try { localStorage.setItem(this.KEY, JSON.stringify(runs.slice(0, 40))); } catch (e) {}
      return runs;
    },
    bestScore() {
      return this.loadRuns().reduce((m, r) => Math.max(m, r.score || 0), 0);
    },

    /* ---- user-contributed gameplay content (text posts + images) ---- */
    SUBS_KEY: "doai:submissions",
    loadSubs() {
      try { return JSON.parse(localStorage.getItem(this.SUBS_KEY)) || []; }
      catch (e) { return []; }
    },
    saveSubs(list) {
      try { localStorage.setItem(this.SUBS_KEY, JSON.stringify(list)); } catch (e) {}
    },
    addSub(sub) {
      const list = this.loadSubs();
      sub.id = "s" + Date.now() + Math.floor(Math.random() * 1000);
      list.unshift(sub);
      this.saveSubs(list.slice(0, 60));
      return sub;
    },
    removeSub(id) {
      this.saveSubs(this.loadSubs().filter((s) => s.id !== id));
    },

    /* ---- discussion board (r/nobot) ---- */
    DISC_KEY: "doai:discuss:v1",
    loadThreads() {
      try {
        const raw = localStorage.getItem(this.DISC_KEY);
        if (raw) return JSON.parse(raw);
      } catch (e) {}
      // first visit — seed from defaults (deep clone)
      const seed = JSON.parse(JSON.stringify(window.DATA.THREADS || []));
      this.saveThreads(seed);
      return seed;
    },
    saveThreads(list) {
      try { localStorage.setItem(this.DISC_KEY, JSON.stringify(list)); } catch (e) {}
    },
  };
})();
