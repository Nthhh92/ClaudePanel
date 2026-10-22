// Little Claude robot living on the home page: pops up, hops between the
// cards, walks, dances, naps. It can be grabbed and thrown with the mouse.
(function () {
  var SIZE_W = 55, SIZE_H = 40;
  var home = document.getElementById("home");

  var el = document.createElement("div");
  el.id = "bot";
  el.innerHTML =
    '<div id="botSprite"><svg width="55" height="40" viewBox="0 0 22 16" shape-rendering="crispEdges">' +
    '<rect x="3" y="2" width="16" height="10" fill="#d97757"></rect>' +
    '<rect x="0" y="6" width="3" height="3" fill="#d97757" id="botArmL"></rect>' +
    '<rect x="19" y="6" width="3" height="3" fill="#d97757" id="botArmR"></rect>' +
    '<rect x="7" y="5" width="2" height="3" fill="#1d1d1f" id="botEyeL"></rect>' +
    '<rect x="14" y="5" width="2" height="3" fill="#1d1d1f" id="botEyeR"></rect>' +
    '<rect x="4" y="12" width="2" height="4" fill="#d97757" id="botLeg1"></rect>' +
    '<rect x="7" y="12" width="2" height="4" fill="#d97757" id="botLeg2"></rect>' +
    '<rect x="13" y="12" width="2" height="4" fill="#d97757" id="botLeg3"></rect>' +
    '<rect x="16" y="12" width="2" height="4" fill="#d97757" id="botLeg4"></rect>' +
    '</svg></div>';
  home.appendChild(el);

  function $(id) { return document.getElementById(id); }
  var sprite = $("botSprite");

  var bot = { x: 0, y: 0, dir: 1, plat: null, visible: false, sleeping: false, dragging: false, acts: 0 };
  var animToken = 0, nextTimer = null;

  function rand(a, b) { return a + Math.random() * (b - a); }
  function pick(list) { return list[Math.floor(Math.random() * list.length)]; }
  function homeVisible() { return home.style.display !== "none"; }
  function viewW() { return document.documentElement.clientWidth; }
  function viewH() { return document.documentElement.clientHeight; }

  // Surfaces the robot can stand on: the cards, the greeting, the floor.
  function platforms() {
    var list = [], cards = document.querySelectorAll(".card");
    for (var i = 0; i < cards.length; i++) {
      var r = cards[i].getBoundingClientRect();
      list.push({ name: "card" + i, l: r.left + 22, r: r.right - 22, y: r.top });
    }
    var g = ($("greetText") || $("greet")).getBoundingClientRect();
    list.push({ name: "greet", l: g.left + 20, r: g.right - 20, y: g.top + 4 });
    list.push({ name: "floor", l: 30, r: viewW() - 30, y: viewH() - 4, floor: true });
    return list;
  }

  function place() {
    el.style.left = Math.round(bot.x - SIZE_W / 2) + "px";
    el.style.top = Math.round(bot.y - SIZE_H) + "px";
  }

  function setScale(sx, sy) {
    el.style.transform = "scale(" + sx + "," + sy + ")";
  }

  function face(dir) {
    bot.dir = dir;
    sprite.style.transform = dir < 0 ? "scaleX(-1)" : "";
  }

  function eyes(open) {
    var h = open ? 3 : 1, y = open ? 5 : 7;
    $("botEyeL").setAttribute("height", h); $("botEyeL").setAttribute("y", y);
    $("botEyeR").setAttribute("height", h); $("botEyeR").setAttribute("y", y);
  }

  function legs(phase) { // 0 = standing, 1/2 = walking steps, 3 = dangling
    var ys = phase === 1 ? [11, 12, 11, 12] : phase === 2 ? [12, 11, 12, 11] : [12, 12, 12, 12];
    var hs = phase === 3 ? [5, 4, 5, 4] : [4, 4, 4, 4];
    for (var i = 0; i < 4; i++) {
      $("botLeg" + (i + 1)).setAttribute("y", ys[i]);
      $("botLeg" + (i + 1)).setAttribute("height", hs[i]);
    }
  }

  function arms(up) {
    $("botArmL").setAttribute("y", up ? 3 : 6);
    $("botArmR").setAttribute("y", up ? 3 : 6);
  }

  // Runs step(t) with t from 0 to 1 over ms, then done(). A newer animation
  // (or grabbing the robot) cancels the running one.
  function animate(ms, step, done) {
    var token = ++animToken, start = new Date().getTime();
    function frame() {
      if (token !== animToken) return;
      var t = Math.min(1, (new Date().getTime() - start) / ms);
      step(t);
      if (t < 1) requestAnimationFrame(frame);
      else if (done) done();
    }
    requestAnimationFrame(frame);
  }

  function squash(done) {
    animate(220, function (t) {
      var k = Math.sin(t * Math.PI);
      setScale(1 + 0.18 * k, 1 - 0.2 * k);
    }, function () { setScale(1, 1); if (done) done(); });
  }

  /* ---------- Actions ---------- */

  function appear(done) {
    var ps = platforms(), p = pick(ps);
    bot.plat = p;
    bot.x = rand(p.l, p.r);
    bot.y = p.y;
    face(Math.random() < 0.5 ? 1 : -1);
    eyes(true); legs(0); arms(false);
    place();
    el.style.display = "block";
    bot.visible = true;
    animate(380, function (t) {
      var s = t < 0.7 ? t / 0.7 * 1.15 : 1.15 - (t - 0.7) / 0.3 * 0.15;
      setScale(s, s);
    }, function () {
      setScale(1, 1);
      if (done) done();
    });
  }

  function vanish(done) {
    animate(300, function (t) { setScale(1 - t, 1 - t); }, function () {
      el.style.display = "none";
      bot.visible = false;
      setScale(1, 1);
      if (done) done();
    });
  }

  function hop(done) {
    var ps = platforms(), choices = [];
    for (var i = 0; i < ps.length; i++) if (!bot.plat || ps[i].name !== bot.plat.name) choices.push(ps[i]);
    var p = pick(choices);
    var x0 = bot.x, y0 = bot.y, x1 = rand(p.l, p.r), y1 = p.y;
    var peak = Math.min(y0, y1) - rand(45, 80);
    face(x1 >= x0 ? 1 : -1);
    // crouch, jump on a parabola through the peak, land with a squash
    animate(160, function (t) { setScale(1 + 0.12 * t, 1 - 0.18 * t); }, function () {
      setScale(1, 1);
      arms(true);
      var ms = 420 + Math.abs(x1 - x0) * 0.9;
      animate(ms, function (t) {
        bot.x = x0 + (x1 - x0) * t;
        // quadratic Bezier y: start -> peak -> end
        bot.y = (1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * (2 * peak - (y0 + y1) / 2) + t * t * y1;
        setScale(0.92, 1.1);
        place();
      }, function () {
        bot.plat = p;
        arms(false);
        squash(done);
      });
    });
  }

  function walk(done) {
    var p = bot.plat, dx = rand(25, 90) * (Math.random() < 0.5 ? -1 : 1);
    var x0 = bot.x, x1 = Math.max(p.l, Math.min(p.r, x0 + dx));
    if (Math.abs(x1 - x0) < 8) { done(); return; }
    face(x1 > x0 ? 1 : -1);
    animate(Math.abs(x1 - x0) * 22, function (t) {
      bot.x = x0 + (x1 - x0) * t;
      legs(Math.floor(t * Math.abs(x1 - x0) / 6) % 2 + 1);
      place();
    }, function () { legs(0); done(); });
  }

  function look(done) {
    face(-bot.dir);
    setTimeout(function () { face(-bot.dir); setTimeout(done, 500); }, 700);
  }

  function nap(done) {
    bot.sleeping = true;
    eyes(false);
    setTimeout(function () {
      bot.sleeping = false;
      eyes(true);
      done();
    }, 3800);
  }

  function dance(done) {
    var n = 0;
    (function step() {
      if (n++ >= 6) { arms(false); legs(0); done(); return; }
      arms(n % 2 === 0); legs(n % 2 + 1); face(-bot.dir);
      setTimeout(step, 220);
    })();
  }

  /* ---------- Life loop ---------- */

  function schedule(ms) {
    clearTimeout(nextTimer);
    nextTimer = setTimeout(next, ms);
  }

  function next() {
    if (bot.dragging || !homeVisible()) { schedule(1500); return; }
    var after = function () { schedule(rand(1500, 4500)); };
    if (!bot.visible) {
      if (Math.random() < 0.85) { bot.acts = 0; appear(after); } else schedule(rand(1500, 3000));
      return;
    }
    var r = Math.random();
    bot.acts++;
    if (bot.acts < 8 && r >= 0.85) r = Math.random() * 0.85; // stay a while before leaving
    if (r < 0.36) hop(after);
    else if (r < 0.58) walk(after);
    else if (r < 0.70) look(after);
    else if (r < 0.78) dance(after);
    else if (r < 0.85) nap(after);
    else vanish(function () { schedule(rand(2000, 4500)); });
  }

  // Blink every few seconds
  (function blink() {
    if (!bot.sleeping && !bot.dragging) {
      eyes(false);
      setTimeout(function () { if (!bot.sleeping) eyes(true); }, 130);
    }
    setTimeout(blink, rand(2200, 5000));
  })();

  /* ---------- Drag & throw ---------- */

  var grab = null, wiggle = null;

  el.onmousedown = function (e) {
    e = e || window.event;
    animToken++; // stop current animation
    clearTimeout(nextTimer);
    bot.dragging = true;
    bot.sleeping = false;
    grab = { dx: bot.x - e.clientX, dy: bot.y - e.clientY, sx: e.clientX, sy: e.clientY, moved: false,
      lastX: e.clientX, lastY: e.clientY, vx: 0, vy: 0 };
    setScale(1, 1);
    eyes(true);
    arms(true);
    if (el.setCapture) el.setCapture();
    return false;
  };

  document.onmousemove = function (e) {
    if (!grab) return;
    e = e || window.event;
    if (!grab.moved && Math.abs(e.clientX - grab.sx) + Math.abs(e.clientY - grab.sy) > 4) {
      grab.moved = true;
      var k = 0;
      wiggle = setInterval(function () { legs(k++ % 2 ? 3 : 0); }, 140);
    }
    if (!grab.moved) return;
    grab.vx = e.clientX - grab.lastX; grab.vy = e.clientY - grab.lastY;
    grab.lastX = e.clientX; grab.lastY = e.clientY;
    bot.x = Math.max(SIZE_W / 2, Math.min(viewW() - SIZE_W / 2, e.clientX + grab.dx));
    bot.y = Math.max(SIZE_H, Math.min(viewH() - 4, e.clientY + grab.dy));
    face(grab.vx < 0 ? -1 : grab.vx > 0 ? 1 : bot.dir);
    place();
  };

  document.onmouseup = function () {
    if (!grab) return;
    if (el.releaseCapture) el.releaseCapture();
    clearInterval(wiggle);
    legs(0);
    var g = grab;
    grab = null;
    if (!g.moved) { poke(); return; }
    fall(g.vx, g.vy);
  };

  // Click without dragging: a little jump
  function poke() {
    arms(false);
    var y0 = bot.y;
    animate(420, function (t) {
      bot.y = y0 - Math.sin(t * Math.PI) * 26;
      place();
    }, function () {
      bot.y = y0; place();
      bot.dragging = false;
      squash(function () { schedule(rand(1500, 3500)); });
    });
  }

  // Released in the air: falls (keeping a bit of the throw) onto whatever is below.
  function fall(vx, vy) {
    var ps = platforms();
    vx = Math.max(-12, Math.min(12, vx)); vy = Math.max(-10, Math.min(10, vy));
    var token = ++animToken;
    function frame() {
      if (token !== animToken) return;
      var prevY = bot.y;
      vy += 0.9; vx *= 0.98;
      bot.x += vx; bot.y += vy;
      if (bot.x < SIZE_W / 2 || bot.x > viewW() - SIZE_W / 2) {
        vx = -vx * 0.6;
        bot.x = Math.max(SIZE_W / 2, Math.min(viewW() - SIZE_W / 2, bot.x));
      }
      // landing: crossed a platform top while going down
      if (vy > 0) {
        for (var i = 0; i < ps.length; i++) {
          var p = ps[i];
          if (bot.x >= p.l - 14 && bot.x <= p.r + 14 && prevY <= p.y && bot.y >= p.y) {
            bot.y = p.y; bot.plat = p; place();
                  land();
            return;
          }
        }
      }
      if (bot.y > viewH() - 4) { // safety net: never fall through the floor
        bot.y = viewH() - 4; bot.plat = ps[ps.length - 1]; place();
        land();
        return;
      }
      place();
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  function land() {
    arms(false);
    squash(function () {
      bot.dragging = false;
      schedule(rand(1800, 4000));
    });
  }

  schedule(rand(900, 1800));
})();
