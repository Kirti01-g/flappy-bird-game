const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const stage = document.getElementById('gameStage');
    const scoreEl = document.getElementById('score');
    const highScoreEl = document.getElementById('highScore');
    const actionBtn = document.getElementById('actionBtn');
    const overlay = document.getElementById('overlay');
    const overlayTitle = document.getElementById('overlayTitle');
    const overlayText = document.getElementById('overlayText');
    const overlayMeta = document.getElementById('overlayMeta');

    let dpr = 1;
    let w = 0;
    let h = 0;
    let state = 'idle';
    let score = 0;
    let highScore = 0;
    let lastTime = 0;
    let pipes = [];
    let clouds = [];
    let gameOverAt = 0;

    const bird = {
      x: 0,
      y: 0,
      vy: 0,
      r: 18,
      baseY: 0,
      rot: 0
    };

    function clamp(v, min, max) {
      return Math.max(min, Math.min(max, v));
    }

    function rand(min, max) {
      return Math.random() * (max - min) + min;
    }

    function cfg() {
      return {
        groundH: Math.max(64, h * 0.11),
        birdR: clamp(w * 0.025, 15, 21),
        birdX: w * 0.28,
        gravity: clamp(h * 2.18, 1180, 1680),
        flap: -clamp(h * 0.76, 390, 540),
        pipeWidth: clamp(w * 0.11, 62, 94),
        gap: clamp(h * 0.25, 152, 212),
        speed: clamp(w * 0.34, 190, 320),
        spacing: clamp(w * 0.48, 220, 350)
      };
    }

    function loadHighScore() {
      try {
        highScore = parseInt(localStorage.getItem('flappy-pop-high-score') || '0', 10) || 0;
      } catch (e) {
        highScore = 0;
      }
      highScoreEl.textContent = highScore;
    }

    function saveHighScore() {
      try {
        localStorage.setItem('flappy-pop-high-score', String(highScore));
      } catch (e) {}
    }

    function setOverlay(show, title, text, meta) {
      overlay.classList.toggle('hidden', !show);
      if (title !== undefined) overlayTitle.textContent = title;
      if (text !== undefined) overlayText.textContent = text;
      if (meta !== undefined) overlayMeta.textContent = meta;
    }

    function updateScoreUI() {
      scoreEl.textContent = score;
      highScoreEl.textContent = highScore;
    }

    function initClouds() {
      clouds = Array.from({ length: 7 }, () => ({
        x: rand(-w * 0.2, w * 1.1),
        y: rand(36, h * 0.5),
        scale: rand(0.7, 1.45),
        speed: rand(10, 24)
      }));
    }

    function resizeCanvas() {
      const rect = stage.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = Math.max(1, rect.width);
      h = Math.max(1, rect.height);
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = false;

      const c = cfg();
      bird.x = c.birdX;
      bird.r = c.birdR;

      if (!clouds.length) initClouds();
      if (state === 'idle') {
        bird.baseY = h * 0.45;
        bird.y = bird.baseY;
        bird.vy = 0;
      } else {
        bird.y = clamp(bird.y, bird.r + 8, h - c.groundH - bird.r - 8);
      }
    }

    function resetRound() {
      const c = cfg();
      score = 0;
      pipes = [];
      bird.r = c.birdR;
      bird.x = c.birdX;
      bird.baseY = h * 0.45;
      bird.y = bird.baseY;
      bird.vy = 0;
      bird.rot = 0;
      spawnPipe(true);
      updateScoreUI();
    }

    function setIdle() {
      state = 'idle';
      actionBtn.textContent = 'Start Game';
      setOverlay(true, 'Flappy Pop', 'Tap, click, or press space to flap through the pipes.', 'Beat your high score!');
    }

    function startGame() {
      resetRound();
      state = 'running';
      actionBtn.textContent = 'Restart';
      setOverlay(false);
    }

    function endGame() {
      state = 'gameover';
      gameOverAt = performance.now();
      if (score > highScore) {
        highScore = score;
        saveHighScore();
        updateScoreUI();
        setOverlay(true, 'New High Score!', `You scored ${score}.`, 'Tap the canvas or hit Play Again.');
      } else {
        setOverlay(true, 'Game Over', `You scored ${score}.`, `High score: ${highScore}`);
      }
      actionBtn.textContent = 'Play Again';
    }

    function spawnPipe(initial = false) {
      const c = cfg();
      const margin = 72;
      const minTop = margin;
      const maxTop = Math.max(minTop + 1, h - c.groundH - c.gap - margin);
      pipes.push({
        x: initial ? w + c.pipeWidth + 90 : w + c.pipeWidth,
        top: rand(minTop, maxTop),
        gap: c.gap,
        width: c.pipeWidth,
        scored: false
      });
    }

    function flap() {
      bird.vy = cfg().flap;
      bird.rot = -0.7;
    }

    function handleInput() {
      if (state === 'running') {
        flap();
      } else if (state === 'idle') {
        startGame();
        flap();
      } else if (state === 'gameover' && performance.now() - gameOverAt > 250) {
        startGame();
        flap();
      }
    }

    function update(dt, t) {
      const c = cfg();

      for (const cloud of clouds) {
        cloud.x -= cloud.speed * dt;
        if (cloud.x < -140) {
          cloud.x = w + rand(20, 140);
          cloud.y = rand(36, h * 0.52);
          cloud.scale = rand(0.7, 1.45);
          cloud.speed = rand(10, 24);
        }
      }

      if (state === 'idle') {
        bird.baseY = h * 0.45;
        bird.y = bird.baseY + Math.sin(t * 0.004) * 10;
        bird.rot = Math.sin(t * 0.0055) * 0.06;
        return;
      }

      if (state !== 'running') return;

      if (!pipes.length || pipes[pipes.length - 1].x < w - c.spacing) {
        spawnPipe();
      }

      bird.vy += c.gravity * dt;
      bird.y += bird.vy * dt;
      bird.rot = clamp(bird.vy / 700, -0.85, 1.15);

      for (let i = pipes.length - 1; i >= 0; i--) {
        const p = pipes[i];
        p.x -= c.speed * dt;

        if (!p.scored && p.x + p.width < bird.x - bird.r) {
          p.scored = true;
          score += 1;
          if (score > highScore) {
            highScore = score;
            saveHighScore();
          }
          updateScoreUI();
        }

        const inPipeX = bird.x + bird.r > p.x && bird.x - bird.r < p.x + p.width;
        const hitsTop = bird.y - bird.r < p.top;
        const hitsBottom = bird.y + bird.r > p.top + p.gap;

        if (inPipeX && (hitsTop || hitsBottom)) {
          endGame();
          return;
        }

        if (p.x + p.width < -30) {
          pipes.splice(i, 1);
        }
      }

      if (bird.y - bird.r <= 0) {
        bird.y = bird.r;
        endGame();
        return;
      }

      if (bird.y + bird.r >= h - c.groundH) {
        bird.y = h - c.groundH - bird.r;
        endGame();
      }
    }

    function drawRoundedRect(x, y, width, height, r, fill, stroke) {
      const radius = Math.min(r, width * 0.5, height * 0.5);
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + width - radius, y);
      ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
      ctx.lineTo(x + width, y + height - radius);
      ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
      ctx.lineTo(x + radius, y + height);
      ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      if (fill) ctx.fill();
      if (stroke) ctx.stroke();
    }

    function drawCloud(x, y, s, alpha = 1) {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(s, s);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = 'rgba(255,255,255,.92)';
      ctx.beginPath();
      ctx.arc(-18, 6, 18, 0, Math.PI * 2);
      ctx.arc(4, -2, 24, 0, Math.PI * 2);
      ctx.arc(28, 8, 16, 0, Math.PI * 2);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    function drawBackground(t) {
      const c = cfg();

      const sky = ctx.createLinearGradient(0, 0, 0, h);
      sky.addColorStop(0, '#5cc8ff');
      sky.addColorStop(0.6, '#8ae6ff');
      sky.addColorStop(1, '#dff9ff');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, w, h);

      ctx.fillStyle = 'rgba(255,241,158,.88)';
      ctx.beginPath();
      ctx.arc(w * 0.82, h * 0.16, clamp(w * 0.055, 34, 58), 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = 'rgba(255,255,255,.18)';
      ctx.beginPath();
      ctx.arc(w * 0.82, h * 0.16, clamp(w * 0.078, 48, 78), 0, Math.PI * 2);
      ctx.fill();

      const bgOffset = (t * 0.018) % 240;
      ctx.fillStyle = 'rgba(59,194,83,.18)';
      for (let i = -1; i < Math.ceil(w / 240) + 1; i++) {
        const x = i * 240 - bgOffset;
        ctx.fillRect(x + 36, h - c.groundH - 110, 46, 110);
        ctx.fillRect(x + 24, h - c.groundH - 122, 70, 18);
        ctx.fillRect(x + 158, h - c.groundH - 150, 54, 150);
        ctx.fillRect(x + 145, h - c.groundH - 164, 80, 20);
      }

      ctx.fillStyle = 'rgba(70,181,90,.22)';
      ctx.beginPath();
      ctx.moveTo(0, h - c.groundH - 30);
      for (let x = 0; x <= w + 40; x += 80) {
        ctx.quadraticCurveTo(x + 40, h - c.groundH - 78 - ((x / 80) % 2) * 16, x + 80, h - c.groundH - 26);
      }
      ctx.lineTo(w, h - c.groundH);
      ctx.lineTo(0, h - c.groundH);
      ctx.closePath();
      ctx.fill();

      for (const cloud of clouds) {
        drawCloud(cloud.x, cloud.y, cloud.scale, 0.95);
      }
    }

    function drawPipeSegment(x, y, width, height) {
      if (height <= 0) return;
      ctx.fillStyle = '#3fda57';
      ctx.fillRect(x, y, width, height);
      ctx.fillStyle = 'rgba(255,255,255,.28)';
      ctx.fillRect(x + 8, y + 6, Math.max(8, width * 0.18), Math.max(0, height - 12));
      ctx.fillStyle = '#20933a';
      ctx.fillRect(x + width - 12, y + 4, 10, Math.max(0, height - 8));
      ctx.strokeStyle = '#165126';
      ctx.lineWidth = 4;
      ctx.strokeRect(x + 2, y + 2, width - 4, height - 4);
    }

    function drawPipe(pipe) {
      const c = cfg();
      const capH = 18;
      const capW = pipe.width + 20;
      const capX = pipe.x - 10;

      drawPipeSegment(pipe.x, 0, pipe.width, pipe.top);
      ctx.fillStyle = '#59ee72';
      ctx.fillRect(capX, pipe.top - capH, capW, capH);
      ctx.fillStyle = 'rgba(255,255,255,.25)';
      ctx.fillRect(capX + 8, pipe.top - capH + 4, capW - 16, 5);
      ctx.strokeStyle = '#165126';
      ctx.lineWidth = 4;
      ctx.strokeRect(capX + 2, pipe.top - capH + 2, capW - 4, capH - 4);

      const bottomY = pipe.top + pipe.gap;
      const bottomH = h - c.groundH - bottomY;
      drawPipeSegment(pipe.x, bottomY, pipe.width, bottomH);
      ctx.fillStyle = '#59ee72';
      ctx.fillRect(capX, bottomY, capW, capH);
      ctx.fillStyle = 'rgba(255,255,255,.25)';
      ctx.fillRect(capX + 8, bottomY + 4, capW - 16, 5);
      ctx.strokeStyle = '#165126';
      ctx.lineWidth = 4;
      ctx.strokeRect(capX + 2, bottomY + 2, capW - 4, capH - 4);
    }

    function drawGround(t) {
      const c = cfg();
      const y = h - c.groundH;

      ctx.fillStyle = '#55d74a';
      ctx.fillRect(0, y, w, 22);

      ctx.fillStyle = '#32b640';
      ctx.fillRect(0, y + 20, w, c.groundH - 20);

      ctx.fillStyle = '#269537';
      for (let x = 0; x < w + 32; x += 32) {
        const offset = ((x / 32) + Math.floor(t * 0.012)) % 2 === 0 ? 0 : 10;
        ctx.fillRect(x, y + 28 + offset, 18, 14);
      }

      ctx.fillStyle = '#84ef73';
      for (let x = 0; x < w + 24; x += 24) {
        ctx.fillRect(x, y + 4, 16, 6);
      }

      ctx.strokeStyle = '#155024';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(0, y + 2);
      ctx.lineTo(w, y + 2);
      ctx.stroke();
    }

    function drawBird() {
      ctx.save();
      ctx.translate(bird.x, bird.y);
      ctx.rotate(bird.rot);

      ctx.fillStyle = 'rgba(17,58,85,.18)';
      ctx.beginPath();
      ctx.ellipse(-2, bird.r + 9, bird.r * 1.02, bird.r * 0.35, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffd44d';
      ctx.strokeStyle = '#165126';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.ellipse(0, 0, bird.r * 1.08, bird.r * 0.92, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ff9645';
      ctx.beginPath();
      ctx.ellipse(-4, 3, bird.r * 0.52, bird.r * 0.34, -0.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(bird.r * 0.35, -bird.r * 0.2, bird.r * 0.3, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#113a55';
      ctx.beginPath();
      ctx.arc(bird.r * 0.43, -bird.r * 0.18, bird.r * 0.12, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ff8e38';
      ctx.beginPath();
      ctx.moveTo(bird.r * 0.92, 0);
      ctx.lineTo(bird.r * 1.48, -bird.r * 0.12);
      ctx.lineTo(bird.r * 0.92, bird.r * 0.2);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    }

    function drawCenterScore() {
      if (state !== 'running') return;
      ctx.save();
      ctx.font = `700 ${clamp(w * 0.09, 36, 68)}px Fredoka`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillStyle = 'rgba(255,255,255,.96)';
      ctx.strokeStyle = 'rgba(17,58,85,.18)';
      ctx.lineWidth = 8;
      ctx.strokeText(String(score), w * 0.5, 20);
      ctx.fillText(String(score), w * 0.5, 20);
      ctx.restore();
    }

    function render(t) {
      ctx.clearRect(0, 0, w, h);
      drawBackground(t);
      for (const pipe of pipes) drawPipe(pipe);
      drawGround(t);
      drawBird();
      drawCenterScore();
    }

    function loop(ts) {
      if (!lastTime) lastTime = ts;
      const dt = Math.min((ts - lastTime) / 1000, 0.032);
      lastTime = ts;
      update(dt, ts);
      render(ts);
      requestAnimationFrame(loop);
    }

    stage.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      handleInput();
    });

    actionBtn.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
    });

    actionBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      startGame();
    });

    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        e.preventDefault();
        handleInput();
      }
    });

    const ro = new ResizeObserver(() => resizeCanvas());
    ro.observe(stage);

    loadHighScore();
    resizeCanvas();
    setIdle();
    updateScoreUI();
    requestAnimationFrame(loop);
