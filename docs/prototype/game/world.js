/* =========================================================================
   WORLD — fixed map grid + Monitor entities built from window.DATA posts.
   Attached to window.WORLD
   ========================================================================= */
;(function () {
	const COLS = 24,
		ROWS = 15,
		TILE = 40
	const W = COLS * TILE,
		H = ROWS * TILE

	// server-rack / kiosk obstacles, in tile coords {x,y,w,h}
	const RACKS = [
		{ x: 5, y: 3, w: 2, h: 3 },
		{ x: 17, y: 3, w: 2, h: 3 },
		{ x: 11, y: 6, w: 3, h: 2 },
		{ x: 5, y: 9, w: 2, h: 3 },
		{ x: 17, y: 9, w: 2, h: 3 },
		{ x: 10, y: 11, w: 2, h: 2 },
	]

	// build collision grid: 1 = solid
	function buildGrid() {
		const g = []
		for (let y = 0; y < ROWS; y++) {
			const row = []
			for (let x = 0; x < COLS; x++) {
				const border = x === 0 || y === 0 || x === COLS - 1 || y === ROWS - 1
				row.push(border ? 1 : 0)
			}
			g.push(row)
		}
		RACKS.forEach((r) => {
			for (let y = r.y; y < r.y + r.h; y++) for (let x = r.x; x < r.x + r.w; x++) g[y][x] = 1
		})
		return g
	}

	// flatten the text rounds into a flat monitor pool (human + ai), keeping tells
	const DEFAULT_POOL = []
	;(window.DATA.TEXT_ROUNDS || []).forEach((r) => {
		r.items.forEach((it) => {
			DEFAULT_POOL.push({
				name: it.name,
				handle: it.handle,
				av: it.av,
				body: it.body,
				likes: it.likes,
				rt: it.rt,
				reply: it.reply,
				topic: r.topic,
				kind: it.kind,
				tells: r.tells,
			})
		})
	})

	// merge user-contributed submissions in front of the defaults (fresh each call)
	function buildPool() {
		const subs = (window.DOAI ? window.DOAI.loadSubs() : []).map((s) => ({
			name: s.name,
			handle: s.handle,
			av: s.av,
			body: s.body,
			img: s.img || null,
			likes: s.likes,
			rt: s.rt,
			reply: s.reply,
			topic: s.topic,
			kind: s.kind,
			tells: s.tells,
			custom: true,
		}))
		return { subs, defaults: DEFAULT_POOL }
	}

	// fixed placement tiles (kept clear of racks)
	const SPOTS = [
		[3, 2],
		[12, 2],
		[21, 2],
		[9, 4],
		[15, 4],
		[2, 8],
		[22, 8],
		[12, 9],
		[4, 13],
		[20, 13],
	]

	const PLAYER_SPAWN = { tx: 12, ty: 13 }

	window.WORLD = { COLS, ROWS, TILE, W, H, RACKS, buildGrid, DEFAULT_POOL, buildPool, SPOTS, PLAYER_SPAWN }
})()
