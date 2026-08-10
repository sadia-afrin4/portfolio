/* ==========================================================================
   Sadia Afrin — portfolio
   Every module degrades safely: if JavaScript never runs, the page is still
   complete and readable. Every animation is gated on prefers-reduced-motion.
   ========================================================================== */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var token = function (n) { return getComputedStyle(document.documentElement).getPropertyValue(n).trim(); };

  /* Run fn once the element first scrolls into view. */
  function onView(el, fn, ratio) {
    if (!el) return;
    if (!('IntersectionObserver' in window)) { fn(el); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { fn(e.target); io.unobserve(e.target); }
      });
    }, { threshold: ratio || 0.2 });
    io.observe(el);
  }

  /* ---------------------------------------------------------------- theme */
  (function theme() {
    var root = document.documentElement;
    var btns = $$('[data-theme-toggle]');
    var stored = null;
    try { stored = localStorage.getItem('sa-theme'); } catch (e) {}
    if (stored === 'dark' || stored === 'light') root.setAttribute('data-theme', stored);

    function sync() {
      var dark = root.getAttribute('data-theme') === 'dark';
      btns.forEach(function (b) {
        b.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
      });
    }
    btns.forEach(function (b) {
      b.addEventListener('click', function () {
        var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        root.setAttribute('data-theme', next);
        try { localStorage.setItem('sa-theme', next); } catch (e) {}
        sync();
      });
    });
    sync();
  })();

  /* ------------------------------------------------- power-on: the name */
  (function name() {
    var el = $('#name');
    if (!el) return;
    var text = el.getAttribute('data-text') || el.textContent;
    el.textContent = '';

    var frag = document.createDocumentFragment(), chars = [];
    for (var i = 0; i < text.length; i++) {
      var c = text.charAt(i), s = document.createElement('span');
      if (c === ' ') { s.className = 'sp'; s.setAttribute('aria-hidden', 'true'); }
      else { s.className = 'ch'; s.textContent = c; chars.push(s); }
      frag.appendChild(s);
    }
    var sr = document.createElement('span');
    sr.className = 'vh';
    sr.textContent = text;
    el.appendChild(frag);
    el.appendChild(sr);
    el.setAttribute('aria-label', text);

    if (reduce) { chars.forEach(function (c) { c.classList.add('lit'); }); return; }
    chars.forEach(function (c, i) { setTimeout(function () { c.classList.add('lit'); }, 120 + i * 46); });
  })();

  /* -------------------------------------------------------- scroll reveal */
  (function reveal() {
    var items = $$('.rv');
    if (!('IntersectionObserver' in window) || reduce) {
      items.forEach(function (n) { n.classList.add('on'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('on'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach(function (n) { io.observe(n); });
  })();

  /* ------------------------------------------------------------- counters */
  (function counters() {
    $$('[data-count]').forEach(function (el) {
      onView(el, function () {
        var target = parseFloat(el.getAttribute('data-count'));
        var dec = parseInt(el.getAttribute('data-dec'), 10) || 0;
        if (reduce) { el.textContent = target.toFixed(dec); return; }
        var t0 = null, dur = 1100;
        (function step(ts) {
          if (t0 === null) t0 = ts;
          var p = Math.min(1, (ts - t0) / dur);
          el.textContent = (target * (1 - Math.pow(1 - p, 3))).toFixed(dec);
          if (p < 1) requestAnimationFrame(step);
        })(performance.now());
      }, 0.5);
    });
  })();

  /* ------------------------------------------- bar fills (charts + IELTS) */
  (function fills() {
    $$('[data-pct]').forEach(function (el, i) {
      onView(el.closest('.rows, .bands, .chart') || el, function () {
        setTimeout(function () { el.style.width = el.getAttribute('data-pct') + '%'; }, reduce ? 0 : (i % 6) * 90);
      }, 0.3);
    });
  })();

  /* ----------------------------------- nav spy, scroll progress, rail scan */
  (function spy() {
    var links = $$('.pin, .topbar-links a');
    /* derive the tracked sections from the nav itself, so this works unchanged
       on both the portfolio and the lab page (cross-page links are ignored) */
    var ids = [];
    links.forEach(function (a) {
      var h = a.getAttribute('href') || '';
      if (h.charAt(0) === '#' && h.length > 1 && ids.indexOf(h.slice(1)) < 0) ids.push(h.slice(1));
    });
    var bus = $('#bus');
    var bar = $('#progress');
    var sections = ids.map(function (id) { return document.getElementById(id); }).filter(Boolean);

    function mark(id) {
      links.forEach(function (a) {
        if (a.getAttribute('href') === '#' + id) a.setAttribute('aria-current', 'true');
        else a.removeAttribute('aria-current');
      });
    }
    function scan() {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      var pct = (p * 100).toFixed(1) + '%';
      if (bus) bus.style.setProperty('--scan', pct);
      if (bar) bar.style.setProperty('--p', pct);
    }

    if (sections.length && 'IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) mark(e.target.id); });
      }, { rootMargin: '-45% 0px -50% 0px' });
      sections.forEach(function (s) { io.observe(s); });
    }

    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () { scan(); ticking = false; });
    }, { passive: true });
    scan();
  })();

  /* ------------------------------------------------------------ band seams */
  (function draws() {
    /* each section's top rule inks itself in as the band is reached */
    $$('.block').forEach(function (b) {
      onView(b, function () { b.classList.add('on'); }, 0.03);
    });
  })();

  /* ------------------------------------------------------- pointer probe */
  (function probe() {
    var hero = $('.hero');
    if (!hero || reduce || !window.matchMedia('(hover:hover)').matches) return;
    hero.addEventListener('pointermove', function (e) {
      var r = hero.getBoundingClientRect();
      hero.style.setProperty('--px', (((e.clientX - r.left) / r.width) * 100).toFixed(1) + '%');
      hero.style.setProperty('--py', (((e.clientY - r.top) / r.height) * 100).toFixed(1) + '%');
      hero.classList.add('probe');
    });
    hero.addEventListener('pointerleave', function () { hero.classList.remove('probe'); });
  })();

  /* ------------------------------------------------------------ card tilt */
  (function tilt() {
    if (reduce || !window.matchMedia('(hover:hover)').matches) return;
    $$('[data-tilt]').forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        var rx = (((e.clientY - r.top) / r.height) - 0.5) * -3.2;
        var ry = (((e.clientX - r.left) / r.width) - 0.5) * 3.2;
        card.style.transform = 'perspective(900px) rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg) translateY(-3px)';
      });
      card.addEventListener('pointerleave', function () { card.style.transform = ''; });
    });
  })();

  /* ------------------------------------------ boot — power-on self test */
  (function boot() {
    var el = $('.boot');
    if (!el) return;
    if (reduce) { el.remove(); return; }

    var log = $('.boot-log', el);
    var lines = ['Power-on self test', 'Clock tree — locked', 'Metal stack — routed', 'Design rules — clean', 'Ready'];
    var i = 0;
    var t = setInterval(function () {
      if (log) log.textContent = lines[i];
      if (++i >= lines.length) clearInterval(t);
    }, 300);

    function clear() { clearInterval(t); if (el.parentNode) el.remove(); }
    el.addEventListener('animationend', function (e) { if (e.target === el) clear(); });
    /* belt and braces: the overlay must never outlive its own animation */
    setTimeout(clear, 3000);
  })();

  /* ------------------------------------------------------- rotating role */
  (function roles() {
    var el = $('#hero-role');
    if (!el || reduce) return;
    var list = (el.getAttribute('data-roles') || '').split('|').filter(Boolean);
    if (list.length < 2) return;
    var i = 0;
    setInterval(function () {
      el.classList.add('swap');
      setTimeout(function () {
        i = (i + 1) % list.length;
        el.textContent = list[i];
        el.classList.remove('swap');
      }, 300);
    }, 3400);
  })();

  /* ------------------------------------------------------- back to top */
  (function toTop() {
    var b = $('#to-top');
    if (!b) return;
    b.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    });
    var tick = false;
    window.addEventListener('scroll', function () {
      if (tick) return;
      tick = true;
      requestAnimationFrame(function () {
        b.classList.toggle('on', window.scrollY > 620);
        tick = false;
      });
    }, { passive: true });
  })();

  /* --------------------------------------------------------- GPA dials */
  (function gpa() {
    $$('.gpa').forEach(function (g) {
      onView(g, function () { g.classList.add('on'); }, 0.4);
    });
  })();

  /* -------------------------------------------------- publication filter */
  (function filters() {
    var pubs = $$('#pubs .pub');
    var btns = $$('.fbtn[data-filter]');
    var count = $('#fcount');
    if (!pubs.length || !btns.length) return;

    function apply(mode) {
      var shown = 0;
      pubs.forEach(function (p) {
        var rank = parseInt(p.getAttribute('data-rank'), 10);
        var ok = mode === 'all' || (mode === 'lead' ? rank <= 2 : p.getAttribute('data-year') === mode);
        if (ok) shown++;
        if (reduce) { p.classList.toggle('hide', !ok); return; }
        p.classList.add('fade');
        setTimeout(function () {
          p.classList.toggle('hide', !ok);
          if (ok) requestAnimationFrame(function () { p.classList.remove('fade'); });
        }, 180);
      });
      if (count) count.textContent = shown + ' of ' + pubs.length + ' shown';
      btns.forEach(function (b) {
        b.setAttribute('aria-pressed', b.getAttribute('data-filter') === mode ? 'true' : 'false');
      });
    }
    btns.forEach(function (b) {
      b.addEventListener('click', function () { apply(b.getAttribute('data-filter')); });
    });
  })();

  /* ------------------------------------------------ ambient routing canvas */
  (function routes() {
    var cv = $('#routes');
    if (!cv) return;
    var ctx = cv.getContext && cv.getContext('2d');
    if (!ctx) return;
    var host = cv.parentNode;
    var W = 0, H = 0, dpr = 1, nets = [];

    /* Manhattan + 45-degree routes on a coarse grid, the way a router lays metal */
    function build() {
      var G = 26;
      nets = [];
      var lanes = Math.max(6, Math.min(16, Math.round(H / 62)));
      for (var i = 0; i < lanes; i++) {
        var y = Math.round((H * (i + 0.5)) / lanes / G) * G;
        var x = Math.round((W * (0.18 + Math.random() * 0.3)) / G) * G;
        var pts = [{ x: -G * 2, y: y }, { x: x, y: y }];
        var segs = 2 + Math.floor(Math.random() * 3);
        for (var s = 0; s < segs; s++) {
          var last = pts[pts.length - 1];
          var dir = Math.random();
          var step = G * (2 + Math.floor(Math.random() * 5));
          var dy = (Math.random() < 0.5 ? -1 : 1) * G * (1 + Math.floor(Math.random() * 3));
          if (dir < 0.42) pts.push({ x: last.x + step, y: last.y });
          else if (dir < 0.72) pts.push({ x: last.x, y: Math.min(H - G, Math.max(G, last.y + dy)) });
          else {
            var d = Math.min(Math.abs(dy), step);
            pts.push({ x: last.x + d, y: Math.min(H - G, Math.max(G, last.y + (dy < 0 ? -d : d))) });
          }
        }
        pts.push({ x: W + G * 2, y: pts[pts.length - 1].y });

        var total = 0, lens = [];
        for (var k = 1; k < pts.length; k++) {
          var L = Math.hypot(pts[k].x - pts[k - 1].x, pts[k].y - pts[k - 1].y);
          lens.push(L); total += L;
        }
        nets.push({
          pts: pts, lens: lens, total: total,
          t: Math.random(),
          speed: 0.035 + Math.random() * 0.05,
          blue: Math.random() > 0.62
        });
      }
    }

    function at(net, t) {
      var d = t * net.total, i = 0;
      while (i < net.lens.length && d > net.lens[i]) { d -= net.lens[i]; i++; }
      if (i >= net.lens.length) { var l = net.pts[net.pts.length - 1]; return { x: l.x, y: l.y }; }
      var a = net.pts[i], b = net.pts[i + 1], r = net.lens[i] ? d / net.lens[i] : 0;
      return { x: a.x + (b.x - a.x) * r, y: a.y + (b.y - a.y) * r };
    }

    function size() {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      W = host.clientWidth; H = host.clientHeight;
      if (!W || !H) return;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      cv.style.width = W + 'px'; cv.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
    }

    function draw() {
      var traceC = token('--trace') || '#E8DCE2';
      var resistC = token('--resist') || '#BE3468';
      var m1C = token('--m1') || '#2E6389';
      ctx.clearRect(0, 0, W, H);

      ctx.lineWidth = 1; ctx.strokeStyle = traceC; ctx.lineJoin = 'round';
      nets.forEach(function (n) {
        ctx.beginPath();
        ctx.moveTo(n.pts[0].x, n.pts[0].y);
        for (var i = 1; i < n.pts.length; i++) ctx.lineTo(n.pts[i].x, n.pts[i].y);
        ctx.stroke();
      });

      ctx.fillStyle = traceC;
      nets.forEach(function (n) {
        for (var i = 1; i < n.pts.length - 1; i++) ctx.fillRect(n.pts[i].x - 2.5, n.pts[i].y - 2.5, 5, 5);
      });

      if (reduce) return;

      nets.forEach(function (n) {
        var col = n.blue ? m1C : resistC;
        var head = at(n, n.t), tail = at(n, Math.max(0, n.t - 0.09));
        var g = ctx.createLinearGradient(tail.x, tail.y, head.x, head.y);
        g.addColorStop(0, 'transparent');
        g.addColorStop(1, col);
        ctx.strokeStyle = g; ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(tail.x, tail.y);
        var d0 = Math.max(0, n.t - 0.09) * n.total, d1 = n.t * n.total, acc = 0;
        for (var i = 0; i < n.lens.length; i++) {
          acc += n.lens[i];
          if (acc > d0 && acc < d1) ctx.lineTo(n.pts[i + 1].x, n.pts[i + 1].y);
        }
        ctx.lineTo(head.x, head.y);
        ctx.stroke();
        ctx.fillStyle = col;
        ctx.beginPath(); ctx.arc(head.x, head.y, 2.2, 0, Math.PI * 2); ctx.fill();
      });
    }

    var last = 0;
    function loop(ts) {
      var dt = last ? Math.min(0.05, (ts - last) / 1000) : 0;
      last = ts;
      nets.forEach(function (n) { n.t += n.speed * dt; if (n.t > 1.05) n.t = -0.05; });
      draw();
      requestAnimationFrame(loop);
    }

    size();
    if (reduce) draw();
    else requestAnimationFrame(loop);

    var rt;
    window.addEventListener('resize', function () {
      clearTimeout(rt);
      rt = setTimeout(function () { size(); if (reduce) draw(); }, 180);
    });
  })();

  /* ============================ DIGITAL LOGIC LAB ======================== */

  /* ------------------------------------------------------- CMOS inverter */
  (function inverter() {
    var svg = $('#inv-svg');
    if (!svg) return;

    var pmos = $('#pmos'), nmos = $('#nmos');
    var wIn = $('#w-in'), wOut = $('#w-out'), nIn = $('#n-in'), nOut = $('#n-out'), pulse = $('#pulse');
    var lvlA = $('#lvl-a'), lvlY = $('#lvl-y');
    var tt0 = $('#tt0'), tt1 = $('#tt1');
    var btn = $('#inv-toggle'), autoBtn = $('#inv-auto');
    var cv = $('#wave'), ctx = cv && cv.getContext ? cv.getContext('2d') : null;

    var A = 0, auto = !reduce, timer = 0, sampler = 0;
    var HIST = 150, hist = [];
    for (var i = 0; i < HIST; i++) hist.push({ a: 0, y: 1 });

    function setDev(g, on) {
      $$('.dev', g).forEach(function (p) { p.classList.toggle('on', on); p.classList.toggle('off', !on); });
      var gate = $('.gate', g); if (gate) gate.classList.toggle('hot', on);
      var bub = $('.bub', g); if (bub) bub.classList.toggle('hot', on);
    }

    function render() {
      var Y = A ? 0 : 1;
      setDev(pmos, !A);
      setDev(nmos, !!A);
      wIn.classList.toggle('w-hi', !!A);
      nIn.classList.toggle('hi', !!A);
      wOut.classList.toggle('w-hi', !!Y);
      nOut.classList.toggle('hi', !!Y);
      lvlA.textContent = String(A); lvlY.textContent = String(Y);
      lvlA.classList.toggle('hi', !!A); lvlY.classList.toggle('hi', !!Y);
      tt0.classList.toggle('act', !A); tt1.classList.toggle('act', !!A);
    }

    /* a charge packet crosses from gate to output on every transition */
    function fire() {
      if (reduce || !pulse) return;
      var t0 = null, dur = 460, from = A ? 210 : 90;
      pulse.setAttribute('opacity', '1');
      (function step(ts) {
        if (t0 === null) t0 = ts;
        var p = Math.min(1, (ts - t0) / dur), x, y;
        if (p < 0.45) { var q = p / 0.45; x = 26 + (110 - 26) * q; y = 150 + (from - 150) * q; }
        else { var r = (p - 0.45) / 0.55; x = 170; y = from + (150 - from) * r; }
        pulse.setAttribute('cx', x.toFixed(1));
        pulse.setAttribute('cy', y.toFixed(1));
        pulse.setAttribute('opacity', String(1 - p * 0.85));
        if (p < 1) requestAnimationFrame(step); else pulse.setAttribute('opacity', '0');
      })(performance.now());
    }

    function toggle() { A = A ? 0 : 1; render(); fire(); }

    var cw = 0, chh = 0;
    function drawWave() {
      if (!ctx) return;
      var dpr = Math.min(2, window.devicePixelRatio || 1);
      var W = cv.clientWidth, H = 88;
      if (!W) return;
      /* resizing the backing store clears it — only do it when it actually changed */
      if (cw !== W || chh !== dpr) { cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); cw = W; chh = dpr; }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      var pad = 28, rowH = 30, gapY = 10;
      var trace = token('--trace') || '#E8DCE2';
      var resist = token('--resist') || '#BE3468';
      var graph = token('--graphite') || '#6C6066';
      ctx.font = '500 10px ' + (token('--mono') || 'monospace');
      ctx.textBaseline = 'middle';

      [['A', 0, graph], ['Y', 1, resist]].forEach(function (row) {
        var idx = row[1], col = row[2];
        var top = 6 + idx * (rowH + gapY), bot = top + rowH;

        ctx.fillStyle = graph;
        ctx.fillText(row[0], 6, (top + bot) / 2);

        ctx.strokeStyle = trace; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(pad, bot + 0.5); ctx.lineTo(W, bot + 0.5); ctx.stroke();

        ctx.strokeStyle = col; ctx.lineWidth = 1.8; ctx.lineJoin = 'miter';
        ctx.beginPath();
        var step = (W - pad) / (HIST - 1), prev = null;
        for (var i = 0; i < HIST; i++) {
          var v = idx === 0 ? hist[i].a : hist[i].y;
          var x = pad + i * step, y = v ? top + 3 : bot - 3;
          if (prev === null) ctx.moveTo(x, y);
          else { ctx.lineTo(x, prev); ctx.lineTo(x, y); }
          prev = y;
        }
        ctx.stroke();
      });
    }

    function sample() {
      hist.push({ a: A, y: A ? 0 : 1 });
      if (hist.length > HIST) hist.shift();
      if (!document.hidden) drawWave();
    }

    btn.addEventListener('click', function () {
      if (auto) { auto = false; autoBtn.setAttribute('aria-pressed', 'false'); clearInterval(timer); }
      toggle();
    });
    autoBtn.addEventListener('click', function () {
      auto = !auto;
      autoBtn.setAttribute('aria-pressed', auto ? 'true' : 'false');
      clearInterval(timer);
      if (auto && !reduce) timer = setInterval(toggle, 1500);
    });

    render();
    if (reduce) {
      auto = false;
      autoBtn.setAttribute('aria-pressed', 'false');
      hist = [];
      for (var j = 0; j < HIST; j++) { var a = Math.floor(j / 25) % 2; hist.push({ a: a, y: a ? 0 : 1 }); }
      drawWave();
    } else {
      sampler = setInterval(sample, 60);
      timer = setInterval(toggle, 1500);
    }

    var wt;
    window.addEventListener('resize', function () { clearTimeout(wt); wt = setTimeout(drawWave, 160); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(drawWave);
  })();

  /* ---------------------------------------------------------- gate bench */
  (function gates() {
    if (!$('#g-body')) return;

    var SHAPES = {
      AND:  { body: 'M34 12 H62 A26 26 0 0 1 62 64 H34 Z',                     tip: 88, bub: false, xor: false },
      OR:   { body: 'M30 12 Q62 12 90 38 Q62 64 30 64 Q44 38 30 12 Z',         tip: 90, bub: false, xor: false },
      NAND: { body: 'M34 12 H62 A26 26 0 0 1 62 64 H34 Z',                     tip: 88, bub: true,  xor: false },
      NOR:  { body: 'M30 12 Q62 12 90 38 Q62 64 30 64 Q44 38 30 12 Z',         tip: 90, bub: true,  xor: false },
      XOR:  { body: 'M30 12 Q62 12 90 38 Q62 64 30 64 Q44 38 30 12 Z',         tip: 90, bub: false, xor: true  },
      XNOR: { body: 'M30 12 Q62 12 90 38 Q62 64 30 64 Q44 38 30 12 Z',         tip: 90, bub: true,  xor: true  }
    };
    var OPS = {
      AND:  function (a, b) { return a & b; },
      OR:   function (a, b) { return a | b; },
      NAND: function (a, b) { return a & b ? 0 : 1; },
      NOR:  function (a, b) { return a | b ? 0 : 1; },
      XOR:  function (a, b) { return a ^ b; },
      XNOR: function (a, b) { return a ^ b ? 0 : 1; }
    };

    var body = $('#g-body'), bub = $('#g-bub'), xarc = $('#g-xor'), wy = $('#gw-y');
    var wa = $('#gw-a'), wb = $('#gw-b');
    var la = $('#gl-a'), lb = $('#gl-b'), ly = $('#gl-y');
    var tA = $('#tgl-a'), tB = $('#tgl-b');
    var vA = $('#g-va'), vB = $('#g-vb'), vY = $('#g-vy');
    var rows = $$('#g-tt tbody tr');
    var expr = $('#g-expr');

    var gate = 'NAND', A = 0, B = 0;

    function shape() {
      var s = SHAPES[gate];
      body.setAttribute('d', s.body);
      xarc.setAttribute('d', s.xor ? 'M22 12 Q36 38 22 64' : '');
      bub.setAttribute('cx', String(s.tip + 6));
      bub.style.display = s.bub ? '' : 'none';
      wy.setAttribute('d', 'M' + (s.tip + (s.bub ? 11 : 0)) + ' 38 H196');
    }

    function render() {
      var Y = OPS[gate](A, B);
      wa.classList.toggle('hi', !!A); la.classList.toggle('hi', !!A);
      wb.classList.toggle('hi', !!B); lb.classList.toggle('hi', !!B);
      wy.classList.toggle('hi', !!Y); ly.classList.toggle('hi', !!Y);
      tA.setAttribute('aria-pressed', A ? 'true' : 'false');
      tB.setAttribute('aria-pressed', B ? 'true' : 'false');
      vA.textContent = String(A); vB.textContent = String(B); vY.textContent = String(Y);
      expr.textContent = 'Y = ' + gate + '(A, B)  →  ' + A + ' ' + gate + ' ' + B + ' = ' + Y;

      rows.forEach(function (tr, i) {
        var a = (i >> 1) & 1, b = i & 1;
        tr.cells[2].textContent = String(OPS[gate](a, b));
        tr.classList.toggle('act', a === A && b === B);
      });
    }

    $$('.gbtn').forEach(function (b) {
      b.addEventListener('click', function () {
        gate = b.getAttribute('data-gate');
        $$('.gbtn').forEach(function (o) {
          o.setAttribute('aria-pressed', o.getAttribute('data-gate') === gate ? 'true' : 'false');
        });
        shape(); render();
      });
    });
    tA.addEventListener('click', function () { A = A ? 0 : 1; render(); });
    tB.addEventListener('click', function () { B = B ? 0 : 1; render(); });

    shape(); render();
  })();

  /* --------------------------------------- 4-bit counter + seven-segment */
  (function counter() {
    if (!$('#seg-a')) return;

    /* segments a b c d e f g, indexed 0..15 for hexadecimal 0-F */
    var MAP = ['abcdef', 'bc', 'abdeg', 'abcdg', 'bcfg', 'acdfg', 'acdefg', 'abc',
               'abcdefg', 'abcdfg', 'abcefg', 'cdefg', 'adef', 'bcdeg', 'adefg', 'aefg'];
    var segs = {};
    'abcdefg'.split('').forEach(function (k) { segs[k] = $('#seg-' + k); });
    /* scoped to this bench — the adder uses .bit too */
    var bits = $$('#counter .bits .bit');
    var hexOut = $('#cnt-hex'), decOut = $('#cnt-dec');
    var playBtn = $('#cnt-play'), stepBtn = $('#cnt-step'), zeroBtn = $('#cnt-zero');

    var n = 0, running = !reduce, timer = 0;

    function render() {
      var lit = MAP[n];
      Object.keys(segs).forEach(function (k) {
        if (segs[k]) segs[k].classList.toggle('on', lit.indexOf(k) > -1);
      });
      bits.forEach(function (el, i) {
        var v = (n >> (3 - i)) & 1;
        el.classList.toggle('hi', !!v);
        var b = el.querySelector('b');
        if (b) b.textContent = String(v);
      });
      if (hexOut) hexOut.textContent = n.toString(16).toUpperCase();
      if (decOut) decOut.textContent = String(n);
    }
    function tick() { n = (n + 1) & 15; render(); }
    function start() { clearInterval(timer); if (running && !reduce) timer = setInterval(tick, 850); }

    playBtn.addEventListener('click', function () {
      running = !running;
      playBtn.setAttribute('aria-pressed', running ? 'true' : 'false');
      playBtn.textContent = running ? 'Pause' : 'Run';
      start();
    });
    stepBtn.addEventListener('click', function () {
      if (running) { running = false; playBtn.setAttribute('aria-pressed', 'false'); playBtn.textContent = 'Run'; clearInterval(timer); }
      tick();
    });
    zeroBtn.addEventListener('click', function () { n = 0; render(); });

    if (reduce) { running = false; playBtn.setAttribute('aria-pressed', 'false'); playBtn.textContent = 'Run'; }
    render();
    start();
  })();

  /* -------------------------------------------- MOSFET I–V characteristics */
  (function mosfet() {
    var cv = $('#iv');
    if (!cv) return;
    var ctx = cv.getContext && cv.getContext('2d');
    if (!ctx) return;

    var sg = $('#vgs'), sd = $('#vds');
    var outG = $('#vgs-v'), outD = $('#vds-v'), outI = $('#id-v'), outR = $('#iv-region');
    var VTH = 1.0, K = 0.42;          /* illustrative n-channel square-law device */
    var VMAX = 5, IMAX = K * (VMAX - VTH) * (VMAX - VTH);

    function drain(vgs, vds) {
      if (vgs <= VTH) return 0;
      var ov = vgs - VTH;
      return vds < ov ? K * (2 * ov * vds - vds * vds) : K * ov * ov;
    }
    function region(vgs, vds) {
      if (vgs <= VTH) return 'Cut-off';
      return vds < (vgs - VTH) ? 'Triode' : 'Saturation';
    }

    var cw = 0, ch = 0;
    function draw() {
      var dpr = Math.min(2, window.devicePixelRatio || 1);
      var W = cv.clientWidth, H = 210;
      if (!W) return;
      if (cw !== W || ch !== dpr) { cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); cw = W; ch = dpr; }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      var L = 38, Rr = 10, T = 12, B = 26;
      var pw = W - L - Rr, phh = H - T - B;
      var X = function (v) { return L + (v / VMAX) * pw; };
      var Y = function (i) { return T + phh - (i / IMAX) * phh; };

      var trace = token('--trace') || '#E8DCE2';
      var trace2 = token('--trace-2') || '#F2E9ED';
      var resist = token('--resist') || '#BE3468';
      var graph = token('--graphite') || '#6C6066';
      ctx.font = '500 9px ' + (token('--mono') || 'monospace');

      /* grid */
      ctx.strokeStyle = trace2; ctx.lineWidth = 1;
      for (var g = 1; g <= 5; g++) {
        ctx.beginPath(); ctx.moveTo(X(g), T); ctx.lineTo(X(g), T + phh); ctx.stroke();
      }
      for (var q = 1; q <= 4; q++) {
        var yy = T + phh - (q / 4) * phh;
        ctx.beginPath(); ctx.moveTo(L, yy); ctx.lineTo(L + pw, yy); ctx.stroke();
      }

      /* axes */
      ctx.strokeStyle = trace; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(L, T); ctx.lineTo(L, T + phh); ctx.lineTo(L + pw, T + phh); ctx.stroke();
      ctx.fillStyle = graph;
      ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      for (var t = 0; t <= 5; t++) ctx.fillText(String(t), X(t), T + phh + 6);
      ctx.fillText('Vds (V)', L + pw / 2, T + phh + 16);
      ctx.save();
      ctx.translate(10, T + phh / 2); ctx.rotate(-Math.PI / 2);
      ctx.fillText('Id (mA)', 0, 0);
      ctx.restore();

      var live = parseFloat(sg.value);

      /* the family, then the selected curve on top */
      function curve(vgs, active) {
        ctx.beginPath();
        for (var v = 0; v <= VMAX + 0.001; v += 0.05) {
          var x = X(v), y = Y(drain(vgs, v));
          if (v === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = active ? resist : trace;
        ctx.lineWidth = active ? 2.2 : 1.2;
        ctx.stroke();
        if (!active) {
          ctx.fillStyle = graph;
          ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
          ctx.fillText(vgs.toFixed(1) + 'V', X(VMAX) - 26, Y(drain(vgs, VMAX)) - 7);
        }
      }
      [1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].forEach(function (v) { if (Math.abs(v - live) > 0.24) curve(v, false); });
      curve(live, true);

      /* the locus Vds = Vgs − Vth, where triode gives way to saturation */
      ctx.setLineDash([3, 3]); ctx.strokeStyle = graph; ctx.lineWidth = 1;
      ctx.beginPath();
      for (var s = 0; s <= VMAX - VTH; s += 0.05) {
        var xx = X(s), yy2 = Y(K * s * s);
        if (s === 0) ctx.moveTo(xx, yy2); else ctx.lineTo(xx, yy2);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      /* operating point */
      var vd = parseFloat(sd.value), idv = drain(live, vd);
      ctx.fillStyle = resist;
      ctx.beginPath(); ctx.arc(X(vd), Y(idv), 4.5, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = resist; ctx.lineWidth = 1; ctx.setLineDash([2, 3]);
      ctx.beginPath(); ctx.moveTo(X(vd), Y(idv)); ctx.lineTo(X(vd), T + phh); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(X(vd), Y(idv)); ctx.lineTo(L, Y(idv)); ctx.stroke();
      ctx.setLineDash([]);
    }

    function sync() {
      var vg = parseFloat(sg.value), vd = parseFloat(sd.value);
      outG.textContent = vg.toFixed(1);
      outD.textContent = vd.toFixed(1);
      outI.textContent = drain(vg, vd).toFixed(2);
      outR.textContent = region(vg, vd);
      draw();
    }
    sg.addEventListener('input', sync);
    sd.addEventListener('input', sync);
    var rt;
    window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(draw, 160); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(draw);
    sync();
  })();

  /* ------------------------------------- Karnaugh map with a real minimiser */
  (function kmap() {
    var grid = $('#kmap');
    if (!grid) return;
    var out = $('#kexpr');
    var cells = $$('.kcell', grid);
    var ones = [];

    /* Quine–McCluskey: combine adjacent implicants until nothing merges,
       then cover the minterms with essential primes plus a greedy remainder. */
    function minimise(list) {
      if (!list.length) return '0';
      if (list.length === 16) return '1';
      var current = list.map(function (m) { return { bits: m, mask: 0 }; });
      var primes = [];
      while (current.length) {
        var next = [], used = [];
        for (var i = 0; i < current.length; i++) used[i] = false;
        for (var a = 0; a < current.length; a++) {
          for (var b = a + 1; b < current.length; b++) {
            if (current[a].mask !== current[b].mask) continue;
            var diff = current[a].bits ^ current[b].bits;
            if (!diff || (diff & (diff - 1))) continue;      /* must differ in exactly one bit */
            used[a] = used[b] = true;
            var nb = current[a].bits & ~diff, nm = current[a].mask | diff;
            if (!next.some(function (x) { return x.bits === nb && x.mask === nm; })) next.push({ bits: nb, mask: nm });
          }
        }
        for (var k = 0; k < current.length; k++) {
          if (!used[k] && !primes.some(function (p) { return p.bits === current[k].bits && p.mask === current[k].mask; })) primes.push(current[k]);
        }
        current = next;
      }

      var covers = function (p, m) { return (m & ~p.mask) === p.bits; };
      var chosen = [];
      list.forEach(function (m) {
        var c = primes.filter(function (p) { return covers(p, m); });
        if (c.length === 1 && chosen.indexOf(c[0]) < 0) chosen.push(c[0]);
      });
      var left = list.filter(function (m) { return !chosen.some(function (p) { return covers(p, m); }); });
      while (left.length) {
        var best = null, bestN = 0;
        primes.forEach(function (p) {
          if (chosen.indexOf(p) >= 0) return;
          var n = left.filter(function (m) { return covers(p, m); }).length;
          if (n > bestN) { bestN = n; best = p; }
        });
        if (!best) break;
        chosen.push(best);
        left = left.filter(function (m) { return !covers(best, m); });
      }
      return chosen.map(term).join(' + ');
    }

    function term(p) {
      var names = ['A', 'B', 'C', 'D'], s = '';
      for (var i = 0; i < 4; i++) {
        var bit = 3 - i;
        if (p.mask & (1 << bit)) continue;
        s += names[i] + ((p.bits & (1 << bit)) ? '' : '′');
      }
      return s || '1';
    }

    function render() {
      ones = cells.filter(function (c) { return c.classList.contains('one'); })
                  .map(function (c) { return parseInt(c.getAttribute('data-m'), 10); })
                  .sort(function (x, y) { return x - y; });
      out.innerHTML = 'F = <b></b>';
      out.querySelector('b').textContent = minimise(ones);
    }

    cells.forEach(function (c) {
      c.addEventListener('click', function () {
        var on = c.classList.toggle('one');
        c.textContent = on ? '1' : '0';
        c.setAttribute('aria-pressed', on ? 'true' : 'false');
        render();
      });
    });
    var clr = $('#kmap-clear');
    if (clr) clr.addEventListener('click', function () {
      cells.forEach(function (c) { c.classList.remove('one'); c.textContent = '0'; c.setAttribute('aria-pressed', 'false'); });
      render();
    });
    render();
  })();

  /* --------------------------------------------- 4-bit ripple-carry adder */
  (function adder() {
    var host = $('#adder');
    if (!host) return;
    var aBits = $$('[data-a]', host), bBits = $$('[data-b]', host);
    var sumCells = $$('[data-s]', host), carryCells = $$('[data-c]', host);
    var eq = $('#ad-eq'), aOut = $('#ad-a'), bOut = $('#ad-b');

    function val(list, attr) {
      var n = 0;
      list.forEach(function (el) {
        if (el.classList.contains('hi')) n |= (1 << parseInt(el.getAttribute(attr), 10));
      });
      return n;
    }
    function render() {
      var A = val(aBits, 'data-a'), B = val(bBits, 'data-b');
      var carry = 0, sum = 0, carries = [];
      for (var i = 0; i < 4; i++) {
        var a = (A >> i) & 1, b = (B >> i) & 1;
        carries[i] = carry;                       /* carry into stage i */
        var s = a ^ b ^ carry;
        carry = (a & b) | (carry & (a ^ b));
        sum |= s << i;
      }
      sumCells.forEach(function (el) {
        var i = parseInt(el.getAttribute('data-s'), 10);
        var v = (sum >> i) & 1;
        el.classList.toggle('hi', !!v);
        el.querySelector('b').textContent = String(v);
      });
      carryCells.forEach(function (el) {
        var i = parseInt(el.getAttribute('data-c'), 10);
        var v = i === 4 ? carry : carries[i];
        el.classList.toggle('hi', !!v);
        el.textContent = String(v);
      });
      aOut.textContent = String(A);
      bOut.textContent = String(B);
      eq.textContent = A + ' + ' + B + ' = ' + (A + B) + (carry ? '  (carry out)' : '');
    }
    aBits.concat(bBits).forEach(function (el) {
      el.addEventListener('click', function () {
        var on = el.classList.toggle('hi');
        el.querySelector('b').textContent = on ? '1' : '0';
        el.setAttribute('aria-pressed', on ? 'true' : 'false');
        render();
      });
    });
    render();
  })();

  /* --------------------------------------------------------- D flip-flop */
  (function dff() {
    var cv = $('#dff-wave');
    if (!cv) return;
    var ctx = cv.getContext && cv.getContext('2d');
    if (!ctx) return;

    var dBtn = $('#dff-d'), runBtn = $('#dff-run'), pulseBtn = $('#dff-pulse');
    var qOut = $('#dff-q'), qbOut = $('#dff-qb'), dOut = $('#dff-dv');
    var wD = $('#dff-wd'), wQ = $('#dff-wq'), wC = $('#dff-wc');

    var D = 0, Q = 0, CLK = 0, running = !reduce, timer = 0, sampler = 0;
    var HIST = 160, hist = [];
    for (var i = 0; i < HIST; i++) hist.push({ c: 0, d: 0, q: 0 });

    function paint() {
      dOut.textContent = String(D);
      qOut.textContent = String(Q);
      qbOut.textContent = String(Q ? 0 : 1);
      dOut.classList.toggle('hi', !!D);
      qOut.classList.toggle('hi', !!Q);
      qbOut.classList.toggle('hi', !Q);
      dBtn.setAttribute('aria-pressed', D ? 'true' : 'false');
      if (wD) wD.classList.toggle('hi', !!D);
      if (wQ) wQ.classList.toggle('hi', !!Q);
      if (wC) wC.classList.toggle('hi', !!CLK);
    }
    function edge() { CLK = 1; Q = D; paint(); setTimeout(function () { CLK = 0; paint(); }, 240); }

    var cw = 0, chh = 0;
    function draw() {
      var dpr = Math.min(2, window.devicePixelRatio || 1);
      var W = cv.clientWidth, H = 118;
      if (!W) return;
      if (cw !== W || chh !== dpr) { cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); cw = W; chh = dpr; }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      var pad = 30, rowH = 26, gapY = 8;
      var trace = token('--trace') || '#E8DCE2';
      var resist = token('--resist') || '#BE3468';
      var graph = token('--graphite') || '#6C6066';
      var m1 = token('--m1') || '#2E6389';
      ctx.font = '500 10px ' + (token('--mono') || 'monospace');
      ctx.textBaseline = 'middle';

      [['CLK', 'c', m1], ['D', 'd', graph], ['Q', 'q', resist]].forEach(function (row, idx) {
        var key = row[1], col = row[2];
        var top = 6 + idx * (rowH + gapY), bot = top + rowH;
        ctx.fillStyle = graph;
        ctx.textAlign = 'left';
        ctx.fillText(row[0], 2, (top + bot) / 2);
        ctx.strokeStyle = trace; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(pad, bot + 0.5); ctx.lineTo(W, bot + 0.5); ctx.stroke();
        ctx.strokeStyle = col; ctx.lineWidth = 1.8; ctx.lineJoin = 'miter';
        ctx.beginPath();
        var step = (W - pad) / (HIST - 1), prev = null;
        for (var i = 0; i < HIST; i++) {
          var x = pad + i * step, y = hist[i][key] ? top + 3 : bot - 3;
          if (prev === null) ctx.moveTo(x, y); else { ctx.lineTo(x, prev); ctx.lineTo(x, y); }
          prev = y;
        }
        ctx.stroke();
      });
    }

    function sample() {
      hist.push({ c: CLK, d: D, q: Q });
      if (hist.length > HIST) hist.shift();
      if (!document.hidden) draw();
    }
    function start() { clearInterval(timer); if (running && !reduce) timer = setInterval(edge, 1300); }

    dBtn.addEventListener('click', function () { D = D ? 0 : 1; paint(); });
    pulseBtn.addEventListener('click', function () {
      if (running) { running = false; runBtn.setAttribute('aria-pressed', 'false'); runBtn.textContent = 'Run clock'; clearInterval(timer); }
      edge();
    });
    runBtn.addEventListener('click', function () {
      running = !running;
      runBtn.setAttribute('aria-pressed', running ? 'true' : 'false');
      runBtn.textContent = running ? 'Pause clock' : 'Run clock';
      start();
    });

    paint();
    if (reduce) {
      running = false;
      runBtn.setAttribute('aria-pressed', 'false');
      runBtn.textContent = 'Run clock';
      /* a static but truthful trace: Q takes D's value at each rising edge */
      hist = [];
      var qHold = 0, prevC = 0;
      for (var j = 0; j < HIST; j++) {
        var c = Math.floor(j / 10) % 2, d = Math.floor(j / 34) % 2;
        if (c && !prevC) qHold = d;
        prevC = c;
        hist.push({ c: c, d: d, q: qHold });
      }
      draw();
    } else {
      sampler = setInterval(sample, 60);
      start();
    }
    var rt;
    window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(draw, 160); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(draw);
  })();

})();
