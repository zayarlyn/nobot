/* =========================================================================
   ENGINE — vanilla top-down scanner game.
   States: intro · explore · dialog · reveal · results
   ========================================================================= */
(function () {
  const { COLS, ROWS, TILE, W, H, RACKS, buildGrid, buildPool, SPOTS, PLAYER_SPAWN } = window.WORLD;

  const cv = document.getElementById("game");
  const ctx = cv.getContext("2d");
  const wrap = document.querySelector(".stage-wrap");
  const scanBtn = document.getElementById("scanBtn");

  // ---- glitch level (0..1), driven by tweak ----
  window.GLITCH = 0.6;
  window.addEventListener("tweakchange", (e) => {
    if (e.detail && e.detail.glitch != null) window.GLITCH = e.detail.glitch / 10;
  });

  // ---------------- canvas sizing ----------------
  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  function resize() {
    const r = cv.getBoundingClientRect();
    const w = Math.max(1, Math.round(r.width * dpr));
    const h = Math.max(1, Math.round(r.height * dpr));
    if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
  }
  window.addEventListener("resize", resize);
  if (typeof ResizeObserver !== "undefined") new ResizeObserver(resize).observe(cv);

  // ---------------- state ----------------
  const grid = buildGrid();
  let state = "intro";
  let monitors = [];
  let particles = [];
  let game = null;

  const player = { x: 0, y: 0, r: 13, dir: { x: 0, y: 1 }, anim: 0 };

  function shuffle(a) { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; }

  function newGame() {
    // user-contributed posts get priority placement, defaults fill the rest
    const { subs, defaults } = buildPool();
    const pickSubs = shuffle(subs).slice(0, SPOTS.length);
    const need = Math.max(0, SPOTS.length - pickSubs.length);
    const pickDef = shuffle(defaults).slice(0, need);
    const pool = shuffle([...pickSubs, ...pickDef]);
    monitors = pool.map((p, i) => ({
      ...p,
      x: (SPOTS[i][0] + 0.5) * TILE,
      y: (SPOTS[i][1] + 0.5) * TILE,
      r: 13, bob: Math.random() * Math.PI * 2,
      state: "idle",          // idle | purged | spared | flagged
      correct: null, action: null, scale: 1,
    }));
    player.x = (PLAYER_SPAWN.tx + 0.5) * TILE;
    player.y = (PLAYER_SPAWN.ty + 0.5) * TILE;
    player.dir = { x: 0, y: -1 };
    particles = [];
    game = { integrity: 70, streak: 0, best: 0, score: 0, correct: 0, wrong: 0,
             purgedBots: 0, killedHumans: 0, escapedBots: 0, savedHumans: 0,
             flags: 2, processed: 0, total: monitors.length };
    current = null;
    updateHud();
  }

  // ---------------- input ----------------
  const keys = {};
  const MOVE = { KeyW: "up", ArrowUp: "up", KeyS: "down", ArrowDown: "down",
                 KeyA: "left", ArrowLeft: "left", KeyD: "right", ArrowRight: "right" };
  addEventListener("keydown", (e) => {
    if (MOVE[e.code]) { keys[MOVE[e.code]] = true; e.preventDefault(); }
    if ((e.code === "KeyE" || e.code === "Space" || e.code === "Enter") && state === "explore") { tryInteract(); e.preventDefault(); }
    if (e.code === "Escape" && state === "dialog") closeDialog();
  });
  addEventListener("keyup", (e) => { if (MOVE[e.code]) keys[MOVE[e.code]] = false; });

  // mobile dpad + action
  function bindHold(el, dir) {
    if (!el) return;
    const on = (ev) => { ev.preventDefault(); keys[dir] = true; };
    const off = (ev) => { ev.preventDefault(); keys[dir] = false; };
    el.addEventListener("pointerdown", on);
    el.addEventListener("pointerup", off);
    el.addEventListener("pointerleave", off);
    el.addEventListener("pointercancel", off);
  }
  bindHold(document.querySelector(".dpad .up"), "up");
  bindHold(document.querySelector(".dpad .down"), "down");
  bindHold(document.querySelector(".dpad .left"), "left");
  bindHold(document.querySelector(".dpad .right"), "right");
  const actBtn = document.querySelector(".act-btn");
  if (actBtn) actBtn.addEventListener("pointerdown", (e) => { e.preventDefault(); if (state === "explore") tryInteract(); });

  scanBtn.addEventListener("click", () => { if (state === "explore") tryInteract(); });

  // ---------------- collision ----------------
  function solidAt(px, py) {
    const tx = Math.floor(px / TILE), ty = Math.floor(py / TILE);
    if (tx < 0 || ty < 0 || tx >= COLS || ty >= ROWS) return true;
    return grid[ty][tx] === 1;
  }
  function hitsWall(px, py, r) {
    return solidAt(px - r, py - r) || solidAt(px + r, py - r) ||
           solidAt(px - r, py + r) || solidAt(px + r, py + r);
  }
  function hitsNpc(px, py, r) {
    for (const n of monitors) {
      const dx = px - n.x, dy = py - n.y;
      const rr = r + n.r + 2;
      if (dx * dx + dy * dy < rr * rr) return true;
    }
    return false;
  }

  function moveAxis(dx, dy) {
    const nx = player.x + dx, ny = player.y + dy;
    if (dx && !hitsWall(nx, player.y, player.r) && !hitsNpc(nx, player.y, player.r)) player.x = nx;
    if (dy && !hitsWall(player.x, ny, player.r) && !hitsNpc(player.x, ny, player.r)) player.y = ny;
  }

  // ---------------- interaction ----------------
  let current = null;
  function nearestNpc() {
    let best = null, bd = 1e9;
    for (const n of monitors) {
      if (n.state !== "idle") continue;
      const dx = player.x - n.x, dy = player.y - n.y;
      const d = Math.hypot(dx, dy);
      if (d < 64 && d < bd) { bd = d; best = n; }
    }
    return best;
  }
  function tryInteract() {
    const n = nearestNpc();
    if (n) openDialog(n);
  }

  // ============================================================
  //  RENDER
  // ============================================================
  let last = performance.now();
  function loop(now) {
    const dt = Math.min(33, now - last); last = now;
    resize();
    if (state === "explore") update(dt);
    render(now);
    requestAnimationFrame(loop);
  }

  function update(dt) {
    const sp = 0.19 * dt;
    let vx = 0, vy = 0;
    if (keys.up) vy -= 1; if (keys.down) vy += 1;
    if (keys.left) vx -= 1; if (keys.right) vx += 1;
    if (vx || vy) {
      const m = Math.hypot(vx, vy) || 1;
      moveAxis((vx / m) * sp, (vy / m) * sp);
      player.dir = { x: vx, y: vy };
      player.anim += dt;
    }
    // scan affordance
    const n = nearestNpc();
    if (n) {
      const r = cv.getBoundingClientRect();
      const wr = wrap.getBoundingClientRect();
      const s = r.width / W;
      scanBtn.style.left = (r.left - wr.left + n.x * s) + "px";
      scanBtn.style.top = (r.top - wr.top + (n.y - n.r) * s) + "px";
      scanBtn.classList.add("show");
    } else scanBtn.classList.remove("show");

    // particles
    particles.forEach((p) => { p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt; p.vy += 0.0008 * dt; });
    particles = particles.filter((p) => p.life > 0);

    monitors.forEach((n) => { n.bob += dt * 0.004; if (n.targetScale != null) n.scale += (n.targetScale - n.scale) * 0.12; });
  }

  function render(now) {
    const g = window.GLITCH;
    ctx.save();
    ctx.scale(cv.width / W, cv.height / H);
    ctx.clearRect(0, 0, W, H);

    // floor
    ctx.fillStyle = "#070a0e";
    ctx.fillRect(0, 0, W, H);
    // grid lines
    ctx.strokeStyle = "rgba(52,231,255,0.05)";
    ctx.lineWidth = 1;
    for (let x = 0; x <= COLS; x++) { ctx.beginPath(); ctx.moveTo(x * TILE, 0); ctx.lineTo(x * TILE, H); ctx.stroke(); }
    for (let y = 0; y <= ROWS; y++) { ctx.beginPath(); ctx.moveTo(0, y * TILE); ctx.lineTo(W, y * TILE); ctx.stroke(); }

    // border walls
    drawWallRect(0, 0, COLS, 1); drawWallRect(0, ROWS - 1, COLS, 1);
    drawWallRect(0, 0, 1, ROWS); drawWallRect(COLS - 1, 0, 1, ROWS);
    // racks
    RACKS.forEach((r) => drawRack(r, now));

    // entities sorted by y
    const ents = [{ monitor: false, y: player.y }, ...monitors.map((n) => ({ monitor: n, y: n.y }))].sort((a, b) => a.y - b.y);
    ents.forEach((e) => { if (e.monitor) drawNpc(e.monitor, now); else drawPlayer(now); });

    // particles
    particles.forEach((p) => {
      ctx.globalAlpha = Math.max(0, p.life / p.max);
      ctx.fillStyle = p.c;
      ctx.fillRect(p.x, p.y, p.s, p.s);
    });
    ctx.globalAlpha = 1;

    // occasional scan-sweep line
    if (g > 0.05) {
      const sweep = ((now * 0.04) % (H + 80)) - 40;
      const grad = ctx.createLinearGradient(0, sweep - 30, 0, sweep + 30);
      grad.addColorStop(0, "rgba(52,231,255,0)");
      grad.addColorStop(0.5, "rgba(52,231,255," + (0.06 * g) + ")");
      grad.addColorStop(1, "rgba(52,231,255,0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, sweep - 30, W, 60);
    }
    ctx.restore();
  }

  function drawWallRect(tx, ty, w, h) {
    const x = tx * TILE, y = ty * TILE;
    ctx.fillStyle = "#0c1118";
    ctx.fillRect(x, y, w * TILE, h * TILE);
    ctx.strokeStyle = "rgba(40,53,68,0.9)";
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 0.5, y + 0.5, w * TILE - 1, h * TILE - 1);
  }

  function drawRack(r, now) {
    const x = r.x * TILE, y = r.y * TILE, w = r.w * TILE, h = r.h * TILE;
    ctx.fillStyle = "#0e141c";
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = "rgba(52,231,255,0.18)";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);
    // blinking server lights
    for (let i = 0; i < r.h * 2; i++) {
      const ly = y + 10 + i * 16;
      if (ly > y + h - 8) break;
      const on = Math.sin(now * 0.005 + i * 1.7 + r.x) > 0.2;
      ctx.fillStyle = on ? "#4dffb0" : "#1d2733";
      ctx.fillRect(x + 8, ly, 6, 4);
      ctx.fillStyle = Math.sin(now * 0.007 + i + r.y) > 0 ? "#34e7ff" : "#1d2733";
      ctx.fillRect(x + 18, ly, 6, 4);
    }
  }

  // avatar entity: monitor-head on a stand
  function drawEntity(n, x, y, opts) {
    const { edge, fill, glow, glyph, alpha, scale } = opts;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    // shadow
    ctx.fillStyle = "rgba(0,0,0,0.45)";
    ctx.beginPath(); ctx.ellipse(0, 14, 14, 5, 0, 0, Math.PI * 2); ctx.fill();
    // stand/body
    ctx.fillStyle = "#0c1118";
    ctx.strokeStyle = edge; ctx.lineWidth = 1.5;
    roundRect(-7, 2, 14, 12, 3); ctx.fill(); ctx.stroke();
    // head (monitor)
    if (glow) { ctx.shadowColor = glow; ctx.shadowBlur = 14; }
    ctx.fillStyle = fill;
    ctx.strokeStyle = edge; ctx.lineWidth = 2;
    roundRect(-13, -16, 26, 22, 5); ctx.fill(); ctx.stroke();
    ctx.shadowBlur = 0;
    // glyph
    ctx.fillStyle = edge;
    ctx.font = "700 13px 'Space Mono', monospace";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(glyph, 0, -5);
    ctx.restore();
  }

  function drawPlayer(now) {
    const interacting = !!nearestNpc();
    drawEntity(player, player.x, player.y, {
      edge: "#4dffb0", fill: "#0a1813", glow: "rgba(77,255,176,0.6)",
      glyph: "◢", alpha: 1, scale: 1 + Math.sin(now * 0.006) * 0.02,
    });
    // facing cursor
    ctx.save();
    ctx.translate(player.x + player.dir.x * 18, player.y + player.dir.y * 18);
    ctx.fillStyle = "rgba(77,255,176,0.7)";
    ctx.fillRect(-2, -2, 4, 4);
    ctx.restore();
    if (interacting) {
      ctx.strokeStyle = "rgba(52,231,255,0.5)"; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(player.x, player.y, 26 + Math.sin(now * 0.01) * 2, 0, Math.PI * 2); ctx.stroke();
    }
  }

  function drawNpc(n, now) {
    const yb = n.y + Math.sin(n.bob) * (n.state === "idle" ? 2 : 0);
    let opts;
    if (n.state === "idle") {
      opts = { edge: "#8d9aa6", fill: "#11161d", glow: null, glyph: n.av, alpha: 1, scale: n.scale };
    } else if (n.state === "purged") {
      opts = { edge: n.correct ? "#34e7ff" : "#ff3d7f", fill: "#0a0d12",
               glow: n.correct ? null : "rgba(255,61,127,0.4)", glyph: "×", alpha: 0.5, scale: n.scale };
    } else if (n.state === "spared") {
      opts = { edge: n.correct ? "#4dffb0" : "#ff3d7f", fill: "#0a0d12",
               glow: null, glyph: n.correct ? "✓" : "!", alpha: 0.65, scale: n.scale };
    } else { // flagged
      opts = { edge: "#ffcf4d", fill: "#0a0d12", glow: null, glyph: "?", alpha: 0.65, scale: n.scale };
    }
    drawEntity(n, n.x, yb, opts);

    if (n.state === "idle") {
      // floating handle tag
      ctx.save();
      ctx.globalAlpha = 0.8;
      ctx.font = "10px 'JetBrains Mono', monospace";
      ctx.textAlign = "center";
      ctx.fillStyle = "rgba(141,154,166,0.9)";
      ctx.fillText(n.handle, n.x, yb - 24);
      ctx.restore();
    }
  }

  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function burst(x, y, color) {
    for (let i = 0; i < 18; i++) {
      const a = Math.random() * Math.PI * 2, sp = 0.04 + Math.random() * 0.12;
      particles.push({ x, y: y - 4, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
        s: 2 + Math.random() * 3, c: color, life: 400 + Math.random() * 400, max: 800 });
    }
  }

  // ============================================================
  //  HUD + DIALOG + REVEAL + RESULTS  (DOM)
  // ============================================================
  const $ = (id) => document.getElementById(id);

  function updateHud() {
    const ig = game.integrity;
    const fill = $("hudIntegrity");
    fill.style.width = ig + "%";
    fill.className = "meter-fill " + (ig > 60 ? "good" : ig > 30 ? "warn" : "bad");
    $("hudIntegrityV").textContent = ig + "%";
    $("hudStreak").textContent = game.streak;
    $("hudProcessed").textContent = game.processed + "/" + game.total;
  }

  function openDialog(n) {
    current = n;
    state = "dialog";
    scanBtn.classList.remove("show");
    $("dlgAv").textContent = n.av;
    $("dlgName").textContent = n.name;
    $("dlgHandle").textContent = n.handle;
    // optional uploaded image
    const imgWrap = $("dlgImgWrap");
    if (n.img) {
      $("dlgImg").src = n.img;
      imgWrap.style.display = "block";
    } else {
      imgWrap.style.display = "none";
      $("dlgImg").removeAttribute("src");
    }
    // body (may be empty for image-only posts)
    const body = $("dlgBody");
    body.textContent = n.body || "";
    body.style.display = n.body ? "block" : "none";
    $("dlgTopic").textContent = n.topic;
    // mark custom contributions
    const head = $("dlgHead");
    if (head) head.querySelector(".srctag")?.remove();
    if (n.custom && head) {
      const tag = document.createElement("span");
      tag.className = "srctag";
      tag.textContent = "· COMMUNITY";
      head.querySelector(".eyebrow").appendChild(tag);
    }
    const fb = $("flagBtn");
    fb.disabled = game.flags <= 0;
    fb.querySelector(".sub").textContent = game.flags + " LEFT";
    $("dialog").classList.add("open");
  }
  function closeDialog() {
    $("dialog").classList.remove("open");
    state = "explore";
    current = null;
  }

  function decide(action) {
    const n = current;
    let correct = null, big, bigClass, deltaTxt, deltaClass;
    if (action === "flag") {
      n.state = "flagged"; n.targetScale = 1; game.flags--;
      big = "FLAGGED — UNRESOLVED"; bigClass = "neon-mag"; bigClass = "";
      big = "FLAGGED"; bigClass = "";
      deltaTxt = "NO CHANGE"; deltaClass = "muted";
    } else {
      correct = (action === "purge" && n.kind === "ai") || (action === "spare" && n.kind === "human");
      n.correct = correct; n.action = action;
      if (action === "purge") { n.state = "purged"; n.targetScale = 0.82; burst(n.x, n.y, correct ? "#34e7ff" : "#ff3d7f"); }
      else { n.state = "spared"; n.targetScale = 1; }
      if (correct) {
        game.correct++; game.streak++; game.best = Math.max(game.best, game.streak);
        game.score += 100 + game.streak * 10;
        game.integrity = Math.min(100, game.integrity + 6);
        if (n.kind === "ai") { game.purgedBots++; big = "BOT TERMINATED"; }
        else { game.savedHumans++; big = "HUMAN VERIFIED"; }
        bigClass = "neon-green";
        deltaTxt = "+6 INTEGRITY"; deltaClass = "neon-green";
      } else {
        game.wrong++; game.streak = 0;
        game.integrity = Math.max(0, game.integrity - 12);
        if (action === "purge") { game.killedHumans++; big = "HUMAN LOST"; }
        else { game.escapedBots++; big = "BOT ESCAPED"; }
        bigClass = "neon-mag";
        deltaTxt = "−12 INTEGRITY"; deltaClass = "neon-mag";
      }
    }
    game.processed++;
    updateHud();
    $("dialog").classList.remove("open");

    if (correct) {
      // show floating popup on the monitor, auto-continue
      const popup = $("correctPopup");
      popup.querySelector(".cp-verdict").textContent = big;
      popup.querySelector(".cp-verdict").className = "cp-verdict " + bigClass;
      popup.querySelector(".cp-delta").textContent = deltaTxt;
      popup.querySelector(".cp-delta").className = "cp-delta " + deltaClass;
      const r = cv.getBoundingClientRect();
      const wr = wrap.getBoundingClientRect();
      const s = r.width / W;
      popup.style.left = (r.left - wr.left + n.x * s) + "px";
      popup.style.top  = (r.top  - wr.top  + (n.y - 30) * s) + "px";
      popup.classList.remove("show"); void popup.offsetWidth;
      popup.classList.add("show");
      state = "reveal";
      setTimeout(() => { popup.classList.remove("show"); continueGame(); }, 1200);
    } else {
      // show full reveal with style fingerprint
      const rv = $("bigVerdict");
      rv.textContent = big; rv.className = "bigverdict " + bigClass;
      rv.classList.remove("glitch-burst"); void rv.offsetWidth; rv.classList.add("glitch-burst");
      $("truthKind").textContent = n.kind === "ai" ? "AI / SYNTHETIC" : "HUMAN / ORGANIC";
      $("truthKind").className = n.kind === "ai" ? "neon-cyan" : "neon-green";
      $("revealDelta").textContent = deltaTxt; $("revealDelta").className = "delta " + deltaClass;
      const tl = $("tellsList"); tl.innerHTML = "";
      const tells = (n.tells && n.tells.length) ? n.tells
        : [n.kind === "ai" ? "Community-submitted as AI / synthetic — no fingerprint notes were provided."
                           : "Community-submitted as a real human — no fingerprint notes were provided."];
      tells.forEach((t) => {
        const d = document.createElement("div"); d.className = "tell";
        d.innerHTML = '<span class="b">▸</span><span>' + t + "</span>";
        tl.appendChild(d);
      });
      state = "reveal";
      $("reveal").classList.add("open");
    }
  }

  function continueGame() {
    $("reveal").classList.remove("open");
    current = null;
    if (game.integrity <= 0) return endGame(true);
    if (game.processed >= game.total) return endGame(false);
    state = "explore";
  }

  function endGame(dead) {
    state = "results";
    const acc = game.correct + game.wrong > 0 ? Math.round((game.correct / (game.correct + game.wrong)) * 100) : 0;
    let verdict, vclass, blurb;
    if (dead) { verdict = "ACCESS DENIED"; vclass = "neon-mag"; blurb = "Your integrity collapsed. The group flagged your account as synthetic. You are not welcome here."; }
    else if (acc >= 85) { verdict = "ACCESS GRANTED"; vclass = "neon-green"; blurb = "You passed. The door opened. A real human can smell a bot — and you proved it."; }
    else if (acc >= 60) { verdict = "UNDER REVIEW"; vclass = ""; blurb = "Borderline. The group isn't sure about you. Too many bots slipped through undetected."; }
    else { verdict = "ACCESS DENIED"; vclass = "neon-mag"; blurb = "You failed the test. Too many bots slipped through. The group flagged your account as synthetic."; }

    $("resScore").textContent = game.score;
    $("resScore").classList.remove("glitch-burst"); void $("resScore").offsetWidth; $("resScore").classList.add("glitch-burst");
    $("resAcc").textContent = acc + "%";
    $("resVerdict").textContent = verdict; $("resVerdict").className = "bigverdict " + vclass;
    $("resBlurb").textContent = blurb;
    $("resBots").textContent = game.purgedBots;
    $("resSaved").textContent = game.savedHumans;
    $("resKilled").textContent = game.killedHumans;
    $("resEscaped").textContent = game.escapedBots;
    const passed = verdict === "ACCESS GRANTED";
    $("joinBtn").style.display = passed ? "" : "none";
    $("playAgainBtn").style.display = passed ? "none" : "";
    $("results").classList.add("open");

    // persist this run so the Leaderboard + Profile reflect real play
    if (window.DOAI) {
      const now = new Date();
      const mon = now.toLocaleString("en-US", { month: "short" }).toUpperCase();
      const date = mon + " " + now.getDate() + " · " +
        String(now.getHours()).padStart(2, "0") + ":" + String(now.getMinutes()).padStart(2, "0");
      window.DOAI.saveRun({
        mode: "PURGE", score: game.score, acc, verdict, dead,
        bots: game.purgedBots, saved: game.savedHumans,
        killed: game.killedHumans, escaped: game.escapedBots,
        streak: game.best, date,
      });
    }
  }

  // ---- button wiring ----
  $("spareBtn").addEventListener("click", () => decide("spare"));
  $("purgeBtn").addEventListener("click", () => decide("purge"));
  $("flagBtn").addEventListener("click", () => { if (game.flags > 0) decide("flag"); });
  $("dlgClose").addEventListener("click", closeDialog);
  $("continueBtn").addEventListener("click", continueGame);
  $("playAgainBtn").addEventListener("click", () => { $("results").classList.remove("open"); newGame(); state = "explore"; });
  $("startBtn").addEventListener("click", () => { $("intro").classList.remove("open"); newGame(); state = "explore"; });

  // ---------------- boot ----------------
  resize();
  $("intro").classList.add("open");
  requestAnimationFrame(loop);
})();
