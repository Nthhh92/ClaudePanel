// The little robot as a reusable sprite (same pixels as robot.js), for the
// welcome tour, the goodbye and the transitions.

function rand(a, b) { return a + Math.random() * (b - a); }

// Runs step(t) with t from 0 to 1 over ms, then done()
function tween(ms, step, done) {
  var start = Date.now();
  (function frame() {
    var t = Math.min(1, (Date.now() - start) / ms);
    step(t);
    if (t < 1) requestAnimationFrame(frame);
    else if (done) done();
  })();
}

// k times bigger than the panel's robot
function Robot(parent, k) {
  var r = { k: k || 1, mood: "open" };
  r.el = document.createElement("div");
  r.el.className = "bot";
  r.el.innerHTML =
    '<svg width="' + 55 * r.k + '" height="' + 40 * r.k + '" viewBox="0 0 22 16" shape-rendering="crispEdges">' +
    '<rect x="3" y="2" width="16" height="10" fill="#d97757"></rect>' +
    '<rect x="0" y="6" width="3" height="3" fill="#d97757"></rect>' +
    '<rect x="19" y="6" width="3" height="3" fill="#d97757"></rect>' +
    '<rect x="7" y="5" width="2" height="3" fill="#1d1d1f"></rect>' +
    '<rect x="14" y="5" width="2" height="3" fill="#1d1d1f"></rect>' +
    '<rect x="4" y="12" width="2" height="4" fill="#d97757"></rect>' +
    '<rect x="7" y="12" width="2" height="4" fill="#d97757"></rect>' +
    '<rect x="13" y="12" width="2" height="4" fill="#d97757"></rect>' +
    '<rect x="16" y="12" width="2" height="4" fill="#d97757"></rect>' +
    '<rect x="7" y="9" width="1" height="2" fill="#5ac8fa" style="display:none"></rect>' +
    '<rect x="7" y="5" width="1" height="1" fill="#1d1d1f" style="display:none"></rect>' +
    '<rect x="8" y="4" width="1" height="1" fill="#1d1d1f" style="display:none"></rect>' +
    '<rect x="14" y="4" width="1" height="1" fill="#1d1d1f" style="display:none"></rect>' +
    '<rect x="15" y="5" width="1" height="1" fill="#1d1d1f" style="display:none"></rect>' +
    '</svg>';
  parent.appendChild(r.el);
  var px = r.el.getElementsByTagName("rect");
  var arm = [px[1], px[2]], eye = [px[3], px[4]], leg = [px[5], px[6], px[7], px[8]];
  var brows = [px[10], px[11], px[12], px[13]]; // slanted up toward the middle when sad
  r.tear = px[9];

  function set(el, y, h) { el.setAttribute("y", y); if (h) el.setAttribute("height", h); }

  // "open", "closed", or "sad": low, half-shut eyes looking down
  r.eyes = function (m) {
    for (var j = 0; j < 4; j++) brows[j].style.display = m === "sad" ? "" : "none";
    for (var i = 0; i < 2; i++) {
      if (m === "closed") set(eye[i], 7, 1);
      else if (m === "sad") set(eye[i], 7, 2);
      else set(eye[i], 5, 3);
    }
  };
  // 0 standing, 1/2 walking steps
  r.legs = function (phase) {
    var ys = phase === 1 ? [11, 12, 11, 12] : phase === 2 ? [12, 11, 12, 11] : [12, 12, 12, 12];
    for (var i = 0; i < 4; i++) set(leg[i], ys[i]);
  };
  // "down", "up", or "droop"
  r.arms = function (pos) {
    var y = pos === "up" ? 3 : pos === "droop" ? 9 : 6;
    set(arm[0], y); set(arm[1], y);
  };
  r.face = function (dir) { r.el.firstChild.style.transform = dir < 0 ? "scaleX(-1)" : ""; };
  r.scale = function (sx, sy) { r.el.style.transform = "scale(" + sx + "," + (sy === undefined ? sx : sy) + ")"; };

  // Blinks on its own, unless it is sad
  (function blink() {
    if (r.mood !== "sad") {
      r.eyes("closed");
      setTimeout(function () { r.eyes(r.mood); }, 130);
    }
    setTimeout(blink, rand(2000, 4500));
  })();

  // Pop in, like in the panel
  r.pop = function (done) {
    tween(380, function (t) {
      r.scale(t < 0.7 ? t / 0.7 * 1.15 : 1.15 - (t - 0.7) / 0.3 * 0.15);
    }, function () { r.scale(1); if (done) done(); });
  };
  // Jump with arms up, land with a squash
  r.hop = function (h, done) {
    var y0 = parseFloat(r.el.style.top) || 0;
    r.arms("up");
    tween(420, function (t) { r.el.style.top = (y0 - Math.sin(t * Math.PI) * h) + "px"; }, function () {
      r.el.style.top = y0 + "px";
      r.arms("down");
      tween(200, function (t) { var q = Math.sin(t * Math.PI); r.scale(1 + 0.16 * q, 1 - 0.18 * q); },
        function () { r.scale(1); if (done) done(); });
    });
  };
  return r;
}

// Big robot centered on a .stage
function stageBot(id) {
  var b = Robot(document.getElementById(id), 2);
  b.el.style.left = (420 / 2 - 55) + "px";
  b.el.style.top = "16px";
  return b;
}

// A robot walking along a progress bar, keeping up with the fill
function walker(roadId) {
  var b = Robot(document.getElementById(roadId), 1), k = 0;
  b.el.style.left = "-27px";
  b.el.style.top = "-40px";
  b.el.style.transition = "left .38s linear";
  b.timer = setInterval(function () { b.legs(k++ % 2 + 1); }, 110);
  b.to = function (pct) { b.el.style.left = Math.round(pct * 420 - 27) + "px"; };
  b.stop = function () { clearInterval(b.timer); b.legs(0); };
  return b;
}

// The robot pops up in the middle, spins and zooms until the window is all
// orange; then midway() runs (swap screens behind it) and the orange fades out.
function warp(midway) {
  var w = document.getElementById("warp");
  w.innerHTML = "";
  w.style.display = "block";
  w.style.opacity = 1;
  w.style.backgroundColor = "rgba(245,245,247,0)";
  var b = Robot(w, 2);
  b.el.style.left = (window.innerWidth / 2 - 55) + "px";
  b.el.style.top = (window.innerHeight / 2 - 40) + "px";
  b.scale(0);
  tween(320, function (t) { w.style.backgroundColor = "rgba(245,245,247," + t + ")"; }, function () {
    b.pop(function () {
      b.arms("up");
      tween(1150, function (t) {
        var e = t * t * t;
        b.el.style.transform = "rotate(" + Math.round(1080 * e) + "deg) scale(" + (1 + 70 * e * e) + ")";
      }, function () {
        w.style.backgroundColor = "#d97757";
        b.el.style.display = "none";
        if (midway) midway();
        tween(420, function (t) { w.style.opacity = 1 - t; }, function () { w.style.display = "none"; });
      });
    });
  });
}
