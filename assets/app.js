/* =========================================================
   生日星空屏保 · 动画逻辑
   纯原生 JavaScript，无第三方依赖。
   ========================================================= */
(function () {
  'use strict';

  /* ---------- 读取配置（URL 参数可覆盖标题，便于分享定制链接） ---------- */
  var CFG = window.BIRTHDAY_CONFIG || {};
  var params = new URLSearchParams(location.search);
  var titleA = params.get('name') || (CFG.title && CFG.title[0]) || '小王子';
  var titleB = params.get('wish') || (CFG.title && CFG.title[1]) || '生日快乐';
  var IMAGE = CFG.image || 'assets/sky.jpg';
  var starDensity = CFG.starDensity || 9200;
  var fireflyDensity = CFG.fireflyDensity || 24000;
  var enableSparks = CFG.enableSparks !== false;
  var showMusic = CFG.showMusic !== false;
  var AR = 2389 / 1024;

  var R = function (a, b) { return a + Math.random() * (b - a); };
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };

  document.getElementById('line1').textContent = titleA;
  document.getElementById('line2').textContent = titleB;
  document.title = titleA + ' · ' + titleB;
  if (!showMusic) document.getElementById('btnMusic').style.display = 'none';

  /* ---------- 画面 ---------- */
  var frame = document.getElementById('frame');
  var photo = document.getElementById('photo');
  document.getElementById('blur').style.backgroundImage = 'url("' + IMAGE + '")';
  photo.style.backgroundImage = 'url("' + IMAGE + '")';

  var cv = document.getElementById('fx'), ctx = cv.getContext('2d');
  var W = 0, H = 0, DPR = 1, FR = { x: 0, y: 0, w: 0, h: 0 };
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* 前景草叶 */
  (function makeGrass() {
    var NS = 'http://www.w3.org/2000/svg';
    var svg = document.getElementById('grassSvg');
    var defs = document.createElementNS(NS, 'defs');
    var g = document.createElementNS(NS, 'linearGradient');
    g.id = 'bladeG'; g.setAttribute('x1', '0'); g.setAttribute('y1', '1');
    g.setAttribute('x2', '0'); g.setAttribute('y2', '0');
    [['0%', '#0a2106'], ['55%', '#23520f'], ['100%', '#4e8020']].forEach(function (item) {
      var s = document.createElementNS(NS, 'stop');
      s.setAttribute('offset', item[0]); s.setAttribute('stop-color', item[1]);
      g.appendChild(s);
    });
    defs.appendChild(g); svg.appendChild(defs);
    for (var i = 0; i < 58; i++) {
      var x = 3 + i * 17.3 + R(-5, 5), w = R(3, 8), h = R(34, 112), bend = R(-26, 26);
      var p = document.createElementNS(NS, 'path');
      p.setAttribute('d', 'M ' + x + ' 220 Q ' + (x + bend * .45) + ' ' + (220 - h * .6) + ' ' +
        (x + bend) + ' ' + (220 - h) + ' Q ' + (x + bend + w * .7) + ' ' + (220 - h * .55) + ' ' +
        (x + w) + ' 220 Z');
      p.setAttribute('fill', 'url(#bladeG)');
      p.setAttribute('opacity', R(.35, .82).toFixed(2));
      p.setAttribute('class', 'blade');
      p.style.setProperty('--d', R(3.4, 7.2).toFixed(2) + 's');
      p.style.setProperty('--delay', (-R(0, 7)).toFixed(2) + 's');
      svg.appendChild(p);
    }
  })();

  /* ---------- 粒子 ---------- */
  var stars = [], fireflies = [], stardust = [], meteors = [], sparks = [], ripples = [], wishes = [];
  var elapsed = 0, nextMeteor = 2200, nextWish = 6000, last = 0;

  function initParticles() {
    var area = W * H, i, n;
    stars = [];
    n = clamp(Math.round(area / starDensity), 60, 190);
    for (i = 0; i < n; i++) stars.push({
      x: R(0, W), y: R(0, H * .72), r: R(.45, 1.7), a: R(.18, .72),
      ph: R(0, 6.28), sp: R(.6, 2), warm: Math.random() < .32
    });
    fireflies = [];
    n = clamp(Math.round(area / fireflyDensity), 18, 48);
    for (i = 0; i < n; i++) fireflies.push(newFly(true));
    stardust = [];
    n = clamp(Math.round(area / 34000), 12, 30);
    for (i = 0; i < n; i++) stardust.push(newDust(true));
    meteors = []; sparks = []; ripples = []; wishes = [];
  }
  function newFly(anywhere) {
    return {
      x: R(FR.x - FR.w * .05, FR.x + FR.w * 1.05),
      y: anywhere ? R(FR.y + FR.h * .45, FR.y + FR.h * 1.02) : FR.y + FR.h * R(.92, 1.05),
      vy: R(-.5, -.16), vx: R(-.16, .16), r: R(.8, 2.6),
      ph: R(0, 6.28), sp: R(.9, 2.1), a: R(.35, .9)
    };
  }
  function newDust(anywhere) {
    return {
      x: R(0, W), y: anywhere ? R(-20, H) : -R(10, 80),
      vy: R(.12, .42), r: R(.7, 2.2), ph: R(0, 6.28), sw: R(.15, .6), a: R(.2, .7)
    };
  }
  function spawnMeteor() {
    meteors.push({
      x: R(FR.x + FR.w * .5, FR.x + FR.w * 1.02), y: R(FR.y + FR.h * .02, FR.y + FR.h * .4),
      vx: R(-6.2, -3.6), vy: R(1.4, 2.9), len: R(90, 210), life: 0, max: R(62, 105)
    });
  }
  function spawnWish() {
    wishes.push({
      x: R(FR.x + FR.w * .55, FR.x + FR.w * .95),
      y: R(FR.y + FR.h * .08, FR.y + FR.h * .48),
      life: 0, max: 150, r: R(7, 14)
    });
  }
  function burst(x, y, n) {
    ripples.push({ x: x, y: y, r: 4, life: 1 });
    for (var i = 0; i < n; i++) {
      var a = R(0, 6.28), s = R(1.1, 4.4);
      sparks.push({
        x: x, y: y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - .55,
        life: 1, decay: R(.009, .02), size: R(1.6, 5),
        rot: R(0, 6.28), vr: R(-.06, .06), warm: Math.random() < .55
      });
    }
  }
  function drawSpark(x, y, r, rot, color, alpha, blur) {
    ctx.save();
    ctx.translate(x, y); ctx.rotate(rot); ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    if (blur) { ctx.shadowColor = color; ctx.shadowBlur = blur; }
    ctx.beginPath();
    ctx.moveTo(0, -r);
    ctx.quadraticCurveTo(r * .14, -r * .14, r, 0);
    ctx.quadraticCurveTo(r * .14, r * .14, 0, r);
    ctx.quadraticCurveTo(-r * .14, r * .14, -r, 0);
    ctx.quadraticCurveTo(-r * .14, -r * .14, 0, -r);
    ctx.fill(); ctx.restore();
  }

  function frameLoop(t) {
    var dt = clamp((t - last) / 16.667, .2, 3); last = t; elapsed += dt * 16.667;
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';

    /* 呼吸的星星 */
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i], tw = .55 + .45 * Math.sin(elapsed / 1000 * s.sp + s.ph), a = s.a * tw;
      ctx.globalAlpha = a; ctx.fillStyle = s.warm ? '#ffe9b0' : '#ffffff';
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 6.283); ctx.fill();
      if (s.r > 1.35 && tw > .7) drawSpark(s.x, s.y, s.r * 3.2, 0, s.warm ? '#ffe7a8' : '#eaf7ff', a * .55, 0);
    }

    /* 飘落星尘 */
    for (i = 0; i < stardust.length; i++) {
      var d = stardust[i];
      d.y += d.vy * dt; d.ph += .012 * dt; d.x += Math.sin(d.ph) * d.sw * dt;
      if (d.y > H + 20) Object.assign(d, newDust(false));
      drawSpark(d.x, d.y, d.r * 1.5, d.ph, '#ffe9b0', d.a * (.5 + .5 * Math.sin(d.ph * 1.7)), 5);
    }

    /* 萤火虫 */
    for (i = 0; i < fireflies.length; i++) {
      var f = fireflies[i];
      f.y += f.vy * dt; f.ph += .02 * dt; f.x += Math.sin(f.ph) * .35 * dt + f.vx * dt;
      if (f.y < FR.y + FR.h * .28 || f.x < FR.x - 40 || f.x > FR.x + FR.w + 40) fireflies[i] = newFly(false);
      ctx.globalAlpha = f.a * (.35 + .65 * Math.pow(Math.max(0, Math.sin(f.ph * .9)), 2));
      ctx.fillStyle = '#ffe08a'; ctx.shadowColor = '#ffcf6c'; ctx.shadowBlur = f.r * 6;
      ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, 6.283); ctx.fill(); ctx.shadowBlur = 0;
    }

    /* 人物附近的小光点 */
    var cx = FR.x + FR.w * .72, cy = FR.y + FR.h * .68;
    for (i = 0; i < 3; i++) {
      var ang = elapsed / 1000 * .32 + i * 2.09;
      drawSpark(cx + Math.cos(ang) * FR.w * .045, cy + Math.sin(ang * 1.3) * FR.h * .045,
        4.5 + Math.sin(ang * 2) * 1.5, ang, '#ffe9a0', .55, 12);
    }

    /* 流星 */
    if (!reduced && elapsed > nextMeteor) { spawnMeteor(); nextMeteor = elapsed + R(4200, 9500); }
    for (i = meteors.length - 1; i >= 0; i--) {
      var m = meteors[i];
      m.life += dt; m.x += m.vx * dt; m.y += m.vy * dt;
      if (m.life > m.max || m.x < -200) { meteors.splice(i, 1); continue; }
      var fade = Math.sin(Math.PI * clamp(m.life / m.max, 0, 1));
      var sp = Math.hypot(m.vx, m.vy);
      var tx = m.x - m.vx / sp * m.len, ty = m.y - m.vy / sp * m.len;
      var gr = ctx.createLinearGradient(m.x, m.y, tx, ty);
      gr.addColorStop(0, 'rgba(255,252,225,' + (fade * .95) + ')');
      gr.addColorStop(.25, 'rgba(255,228,160,' + (fade * .4) + ')');
      gr.addColorStop(1, 'rgba(255,220,150,0)');
      ctx.globalAlpha = 1; ctx.strokeStyle = gr; ctx.lineWidth = 2.1; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(m.x, m.y); ctx.lineTo(tx, ty); ctx.stroke();
      drawSpark(m.x, m.y, 6, elapsed / 900, '#fffbe8', fade, 14);
    }

    /* 许愿星 */
    if (!reduced && elapsed > nextWish) { spawnWish(); nextWish = elapsed + R(11000, 19000); }
    for (i = wishes.length - 1; i >= 0; i--) {
      var w = wishes[i]; w.life += dt;
      if (w.life > w.max) { wishes.splice(i, 1); continue; }
      var p = w.life / w.max, sc = .3 + Math.sin(p * Math.PI) * 1.5, al = Math.sin(p * Math.PI) * .8;
      drawSpark(w.x, w.y, w.r * sc, p * 1.2, '#fff0bb', al, 18);
    }

    /* 触摸迸发 */
    for (i = sparks.length - 1; i >= 0; i--) {
      var k = sparks[i];
      k.life -= k.decay * dt; k.x += k.vx * dt; k.y += k.vy * dt;
      k.vy += .028 * dt; k.vx *= .99; k.rot += k.vr * dt;
      if (k.life <= 0) { sparks.splice(i, 1); continue; }
      drawSpark(k.x, k.y, k.size * (.4 + k.life * .6), k.rot, k.warm ? '#ffdc8c' : '#ffffff', Math.pow(k.life, 1.4), 10);
    }
    ctx.shadowBlur = 0;
    for (i = ripples.length - 1; i >= 0; i--) {
      var rp = ripples[i]; rp.life -= .018 * dt; rp.r += 2.6 * dt;
      if (rp.life <= 0) { ripples.splice(i, 1); continue; }
      ctx.globalAlpha = rp.life * .5; ctx.strokeStyle = '#ffe6a8'; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.arc(rp.x, rp.y, rp.r, 0, 6.283); ctx.stroke();
    }
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
    requestAnimationFrame(frameLoop);
  }

  function resize() {
    W = innerWidth; H = innerHeight; DPR = Math.min(devicePixelRatio || 1, 2);
    cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
    cv.style.width = W + 'px'; cv.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    var w = W, h = w / AR;
    if (h > H) { h = H; w = h * AR; }
    FR = { x: (W - w) / 2, y: (H - h) / 2, w: w, h: h };
    frame.style.left = FR.x + 'px'; frame.style.top = FR.y + 'px';
    frame.style.width = FR.w + 'px'; frame.style.height = FR.h + 'px';
    initParticles();
  }
  addEventListener('resize', resize, { passive: true });
  addEventListener('orientationchange', function () { setTimeout(resize, 250); }, { passive: true });
  resize();
  requestAnimationFrame(function (t) { last = t; frameLoop(t); });

  var img = new Image();
  img.onload = function () { document.body.classList.add('ready'); };
  img.onerror = function () { document.body.classList.add('ready'); };
  img.src = IMAGE;
  setTimeout(function () { document.body.classList.add('ready'); }, 1200);

  /* ---------- 交互 ---------- */
  var pressed = false, lastBurst = 0;
  addEventListener('pointerdown', function (e) {
    if (e.target.closest('#ui')) return;
    pressed = true;
    if (enableSparks) burst(e.clientX, e.clientY, 18);
    wakeUI(); keepAwake();
  }, { passive: true });
  addEventListener('pointermove', function (e) {
    var dx = (e.clientX / W - .5), dy = (e.clientY / H - .5);
    document.getElementById('parallax').style.setProperty('--px', (-dx * 10).toFixed(1) + 'px');
    document.getElementById('parallax').style.setProperty('--py', (-dy * 10).toFixed(1) + 'px');
    if (pressed && enableSparks && performance.now() - lastBurst > 70) {
      burst(e.clientX, e.clientY, 5); lastBurst = performance.now();
    }
  }, { passive: true });
  addEventListener('pointerup', function () { pressed = false; }, { passive: true });
  addEventListener('pointercancel', function () { pressed = false; }, { passive: true });

  var ui = document.getElementById('ui'), uiTimer;
  function wakeUI() {
    ui.classList.remove('dim');
    clearTimeout(uiTimer);
    uiTimer = setTimeout(function () { ui.classList.add('dim'); }, 5000);
  }
  wakeUI();

  var toast = document.getElementById('toast'), toastTimer;
  function showToast(msg) {
    toast.textContent = msg; toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('show'); }, 4200);
  }
  document.getElementById('btnFull').addEventListener('click', function (e) {
    e.stopPropagation();
    var el = document.documentElement;
    var req = el.requestFullscreen || el.webkitRequestFullscreen;
    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
      if (req) { try { req.call(el).catch(function () {}); } catch (err) {} }
      else showToast('iPad 请用 Safari 打开，点地址栏「AA」选「隐藏工具栏」，或「添加到主屏幕」全屏播放');
    } else if (document.exitFullscreen) document.exitFullscreen();
  });

  /* ---------- 八音盒生日歌 ---------- */
  var actx = null, master = null, musicOn = false, musicTimer = null;
  var NOTES = [
    [392,.5],[392,.5],[440,1],[392,1],[523,1],[494,2],
    [392,.5],[392,.5],[440,1],[392,1],[587,1],[523,2],
    [392,.5],[392,.5],[784,1],[659,1],[523,1],[494,1],[440,1.5],
    [698,.5],[698,.5],[659,1],[523,1],[587,1],[523,2]
  ];
  function note(freq, at, dur) {
    if (!actx) return;
    var g = actx.createGain();
    g.gain.setValueAtTime(.0001, at);
    g.gain.exponentialRampToValueAtTime(.16, at + .015);
    g.gain.exponentialRampToValueAtTime(.0001, at + Math.max(.5, dur * .62));
    g.connect(master);
    [[1,1],[2,.22],[3,.07]].forEach(function (pair) {
      var o = actx.createOscillator(), og = actx.createGain();
      o.type = 'sine'; o.frequency.value = freq * pair[0]; og.gain.value = pair[1];
      o.connect(og); og.connect(g); o.start(at); o.stop(at + Math.max(.6, dur * .7));
    });
  }
  function playRound() {
    if (!musicOn || !actx) return;
    var base = actx.currentTime + .12, t = base;
    NOTES.forEach(function (n) { note(n[0], t, n[1] * .42); t += n[1] * .42; });
    musicTimer = setTimeout(playRound, (t - base + 2.2) * 1000);
  }
  document.getElementById('btnMusic').addEventListener('click', function (e) {
    e.stopPropagation();
    var btn = e.currentTarget;
    musicOn = !musicOn;
    btn.classList.toggle('on', musicOn);
    btn.textContent = musicOn ? '音乐 开' : '音乐 关';
    if (musicOn) {
      if (!actx) {
        var AC = window.AudioContext || window.webkitAudioContext;
        actx = new AC();
        master = actx.createGain(); master.gain.value = .5;
        var delay = actx.createDelay(1), fb = actx.createGain(), wet = actx.createGain();
        delay.delayTime.value = .24; fb.gain.value = .24; wet.gain.value = .22;
        master.connect(delay); delay.connect(fb); fb.connect(delay);
        delay.connect(wet); wet.connect(actx.destination); master.connect(actx.destination);
      }
      actx.resume(); playRound();
    } else { clearTimeout(musicTimer); if (actx) actx.suspend(); }
    wakeUI();
  });

  /* ---------- 屏幕常亮 ---------- */
  var wakeLock = null;
  function keepAwake() {
    try {
      if ('wakeLock' in navigator && document.visibilityState === 'visible' && !wakeLock) {
        navigator.wakeLock.request('screen').then(function (lock) {
          wakeLock = lock;
          lock.addEventListener('release', function () { wakeLock = null; });
        }).catch(function () {});
      }
    } catch (err) {}
  }
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible') keepAwake();
  });
})();
