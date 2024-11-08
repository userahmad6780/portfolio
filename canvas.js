function randomInRange(min, max) {
  return min + (max - min) * Math.random();
}

var LinkedParticles = function (ctx) {
  var that = this;

  that.ctx = ctx;

  that.points = [];

  that.force_point_enabled = false;
  that.currentCursorPosition = {
    x: 0,
    y: 0,
  };

  // Background settings
  that.transparent_background = false;
  that.background_color = "#011936";

  // Points settings
  that.points_count = 110;
  that.point_color = "#BBE0EB";
  that.point_size = 1.5;

  // Motion settings
  that.velocity_ratio = 1;
  that.velocity_decay = 0.8;
  that.gravity = 0;
  that.bounce = 1;

  // Lines settings
  that.line_width = 0.2;
  that.line_distance = 110;
  that.lines_color = "#BBE0EB";
  that.lines_gradient_enabled = false;
  that.lines_gradient_start_color = "#ffa700";
  that.lines_gradient_middle_color = "#f00f0f";
  that.lines_gradient_end_color = "#ff00ff";

  that.ctx.lineCap = "round";

  that.init = function () {
    // initialize points positions
    that.points = [];
    for (var i = 0; i < that.points_count; i++) {
      that.points[i] = {
        mass: 50,
        x: randomInRange(5, that.ctx.canvas.width - 5),
        y: randomInRange(5, that.ctx.canvas.height - 5),
        vx: randomInRange(-1, 1),
        vy: randomInRange(-1, 1),
        ax: 0,
        ay: 0,
      };
    }
  };

  that.update = function () {
    // apply force point if enabled
    that.forcePoint();

    // update position with velocity and gravity for every points
    for (var i = 0; i < that.points.length; i++) {
      var pt = that.points[i];
      pt.ax *= 0.1;
      pt.vx += pt.ax * that.velocity_ratio * that.velocity_decay;
      pt.x += pt.vx;

      pt.ay *= 0.1;
      pt.vy +=
        (pt.ay + that.gravity) * that.velocity_ratio * that.velocity_decay;
      pt.y += pt.vy;

      // Collide using canvas box
      if (pt.x > that.ctx.canvas.width - that.point_size) {
        pt.x = that.ctx.canvas.width - that.point_size;
        pt.vx = -pt.vx * that.bounce;
      }
      if (pt.x < that.point_size) {
        pt.x = that.point_size;
        pt.vx = -pt.vx * that.bounce;
      }

      // Ensure the y position works with an "infinite" height approach
      if (pt.y > that.ctx.canvas.height - that.point_size) {
        pt.y = that.ctx.canvas.height - that.point_size;
        pt.vy = -pt.vy * that.bounce;
      }

      if (pt.y < that.point_size) {
        pt.y = that.point_size;
        pt.vy = -pt.vy * that.bounce;
      }
    }
  };

  that.draw = function () {
    // clear and redraw the canvas for every frame
    that.ctx.clearRect(0, 0, that.ctx.canvas.width, that.ctx.canvas.height);
    if (!that.transparent_background) {
      that.ctx.fillStyle = that.background_color;
      that.ctx.fillRect(0, 0, that.ctx.canvas.width, that.ctx.canvas.height);
    }

    that.ctx.lineWidth = that.line_width;
    for (var i = 0; i < that.points.length; i++) {
      var pt = that.points[i];

      // draw lines between points
      for (var j = that.points.length - 1; j > i; j--) {
        if (i === j) continue;

        var pt2 = that.points[j];

        if (
          Math.abs(pt2.x - pt.x) <= that.line_distance &&
          Math.abs(pt2.y - pt.y) <= that.line_distance
        ) {
          if (that.lines_gradient_enabled) {
            var gradient = ctx.createLinearGradient(pt.x, pt.y, pt2.x, pt2.y);
            gradient.addColorStop(0, that.lines_gradient_start_color);
            gradient.addColorStop(0.5, that.lines_gradient_middle_color);
            gradient.addColorStop(1, that.lines_gradient_end_color);
            that.ctx.strokeStyle = gradient;
          } else {
            that.ctx.strokeStyle = that.lines_color;
          }
          that.ctx.beginPath();
          that.ctx.moveTo(pt.x, pt.y);
          that.ctx.lineTo(pt2.x, pt2.y);
          that.ctx.stroke();
          that.ctx.closePath();
        }
      }
    }

    // draw points
    for (i = 0; i < that.points.length; i++) {
      pt = that.points[i];
      that.ctx.fillStyle = that.point_color;
      that.ctx.beginPath();
      that.ctx.arc(pt.x, pt.y, that.point_size, 0, 2 * Math.PI);
      that.ctx.fill();
      that.ctx.closePath();
    }
  };

  that.forcePoint = function () {
    if (!that.force_point_enabled) return;

    for (var i = 0; i < that.points.length; i++) {
      var pt = that.points[i];

      var dx = that.currentCursorPosition.x - pt.x;
      var dy = that.currentCursorPosition.x - pt.y;
      var d = Math.hypot(dx, dy);
      var ang = Math.atan2(dy, dx);

      if (d < 100) {
        pt.ax = 0.5 * d * Math.cos(ang);
        pt.ay = 0.5 * d * Math.sin(ang);
      }
    }
  };

  // Attach events
  that.onresize = function () {
    // Set the canvas width to match the window width
    that.ctx.canvas.width = window.innerWidth;

    // Dynamically set the height of the canvas to match the document body height
    that.ctx.canvas.height = document.body.scrollHeight;
  };

  window.addEventListener("resize", that.onresize, false);

  that.ctx.canvas.addEventListener("mousemove", function (e) {
    that.currentCursorPosition.x = e.x;
    that.currentCursorPosition.y = e.y;
  });

  // initialize canvas size
  that.onresize();

  // initialize points
  that.init();
};

document.addEventListener("DOMContentLoaded", function (event) {
  var canvas = document.getElementById("lines-demo");
  var ctx = canvas.getContext("2d");

  ctx.scale(2, 2);

  var initial = performance.now();
  var fps = 60;

  var lp = new LinkedParticles(ctx);
  var gui = new dat.GUI();

  gui.remember(lp);

  var generalFolder = gui.addFolder("General");
  var ctrl = generalFolder.add(lp, "points_count", 0, 2000);
  ctrl.onFinishChange(function () {
    lp.init();
  });
  generalFolder.add(lp, "point_size", 0, 50).step(0.25);
  generalFolder.add(lp, "line_distance", 0, 300).step(5);
  generalFolder.add(lp, "line_width", 0, 20).step(0.1);
  generalFolder.open();

  var motionFolder = gui.addFolder("Motion");
  motionFolder.add(lp, "force_point_enabled");
  motionFolder.add(lp, "velocity_ratio", 1, 10);
  motionFolder.add(lp, "velocity_decay", 0, 1).step(0.1);
  motionFolder.add(lp, "gravity", 0, 5).step(0.1);
  motionFolder.add(lp, "bounce", 0, 1).step(0.1);

  var colorsFolder = gui.addFolder("Colors");
  colorsFolder.add(lp, "transparent_background");
  colorsFolder.addColor(lp, "background_color");
  colorsFolder.addColor(lp, "point_color");
  colorsFolder.addColor(lp, "lines_color");
  colorsFolder.add(lp, "lines_gradient_enabled");
  colorsFolder.addColor(lp, "lines_gradient_start_color");
  colorsFolder.addColor(lp, "lines_gradient_middle_color");
  colorsFolder.addColor(lp, "lines_gradient_end_color");

  function loop(nextTime) {
    lp.update();
    lp.draw();
    requestAnimationFrame(loop);
  }

  // start animation
  requestAnimationFrame(loop);
});
