/* =========================================================
   QUIZ DA VIDA DO MOIZE — script.js
   JavaScript puro, sem bibliotecas.
   Para mudar perguntas/mensagens, edite as constantes no topo.
========================================================= */

(function () {
  "use strict";

  /* ---------------------------------------------------------
     CONFIGURAÇÃO — perguntas, respostas e mensagens
     `correct` é o índice (começando em 0) da alternativa certa.
  --------------------------------------------------------- */
  const QUESTIONS = [
    {
      text: "Que dia começamos a namorar? 💗",
      options: ["01/05/2026", "15/04/2026", "07/05/2026", "12/05/2026"],
      correct: 0, // 01/05/2026
      wrong: "ERROU KKKKKKK 😭 pensa melhor, vida do moize...",
    },
    {
      text: "Shim ou sim? 🤨",
      options: ["Sim", "Shim"],
      correct: 1, // Shim
      wrong: "COMO ASSIM TU ERROU ISSO??? 😭😭😭",
    },
    {
      text: "Brownie do Moize ou Brownie Gourmet? 🍫",
      options: ["Brownie Gourmet", "Brownie do Moize"],
      correct: 1, // Brownie do Moize
      wrong: "ERRADO, VIDA DO MOIZE 😭🍫 tu sabe qual é o melhor...",
    },
    {
      text: "Você ama a vida do Moize? 🥹❤️",
      options: ["Shim ne gui", "Lógico que não, briguento"],
      correct: 0, // Shim ne gui
      wrong: "Essa resposta não existe no nosso universo 😭 tenta de novo.",
    },
  ];

  // Mensagens carinhosas quando ela acerta (você pode trocar à vontade)
  const RIGHT_MESSAGES = [
    "Acertou! 💗",
    "Isso aí, vida do moize! ✨",
    "Certinho! 🥹",
    "Eu sabia que tu sabia! ❤️",
  ];

  // Mensagem do Bryan — EXATAMENTE como escrita (sem correções)
  const LETTER =
    "oi vida do moize, recadinho do baio de bom dia pa voce beieza, apliquei todos meus dotes de programação, e espeio que voce tenha gostado, saiba que voce é muito especial pra mi, e que voce é o amor da minha vida, pra sempre, eu te amo, to ansioso pra te ver hoje, beijao vida do moize, boa aula";

  /* ---------------------------------------------------------
     ESTADO
  --------------------------------------------------------- */
  const state = {
    current: 0,        // índice da pergunta atual
    correctCount: 0,   // quantas já acertou
    locked: false,     // trava cliques durante animações
    quizDone: false,   // libera a tela 2
    congratsDone: false, // libera a tela 3
  };

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------------------------------------------
     ATALHOS DO DOM
  --------------------------------------------------------- */
  const $ = (id) => document.getElementById(id);

  const screens = {
    quiz: $("screen-quiz"),
    congrats: $("screen-congrats"),
    message: $("screen-message"),
  };
  const intro = $("intro");
  const quiz = $("quiz");
  const startBtn = $("start-btn");
  const progressLabel = $("progress-label");
  const progressBar = $("progress-bar");
  const progressFill = $("progress-fill");
  const questionCard = $("question-card");
  const questionText = $("question-text");
  const optionsEl = $("options");
  const feedback = $("feedback");
  const continueBtn = $("continue-btn");
  const letterEl = $("letter");
  const letterText = $("letter-text");
  const skipHint = $("skip-hint");

  /* ---------------------------------------------------------
     TROCA DE TELAS (com transição) — respeita o bloqueio
  --------------------------------------------------------- */
  let currentScreen = "quiz";

  function showScreen(name) {
    // Bloqueios: não deixa pular etapas
    if (name === "congrats" && !state.quizDone) return;
    if (name === "message" && !state.congratsDone) return;
    if (name === currentScreen) return;

    const from = screens[currentScreen];
    const to = screens[name];
    currentScreen = name;

    from.classList.add("leaving");
    setTimeout(() => {
      from.classList.remove("leaving", "active");
      from.hidden = true;

      to.hidden = false;
      to.classList.add("active");
      window.scrollTo(0, 0);

      if (name === "message") startMessage();
    }, reduceMotion ? 0 : 450);
  }

  /* ---------------------------------------------------------
     QUIZ
  --------------------------------------------------------- */
  startBtn.addEventListener("click", () => {
    intro.hidden = true;
    quiz.hidden = false;
    renderQuestion();
  });

  function renderQuestion() {
    const q = QUESTIONS[state.current];
    state.locked = false;

    progressLabel.textContent = "Pergunta " + (state.current + 1) + " de " + QUESTIONS.length;
    questionText.textContent = q.text;

    feedback.className = "feedback";
    feedback.textContent = "";

    optionsEl.className = "options";
    optionsEl.innerHTML = "";

    q.options.forEach((label, index) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "option";
      btn.textContent = label;
      btn.addEventListener("click", () => onAnswer(btn, index));
      optionsEl.appendChild(btn);
    });

    // animação de entrada do cartão
    restartAnimation(questionCard, "enter");
  }

  function onAnswer(btn, index) {
    if (state.locked) return;
    const q = QUESTIONS[state.current];

    restartAnimation(btn, "picked");

    if (index === q.correct) {
      handleCorrect(btn);
    } else {
      handleWrong(btn, q);
    }
  }

  function handleCorrect(btn) {
    state.locked = true;
    state.correctCount++;

    btn.classList.add("correct");
    optionsEl.classList.add("locked");

    showFeedback(RIGHT_MESSAGES[state.current % RIGHT_MESSAGES.length], true);
    restartAnimation(questionCard, "win");

    // progresso
    const pct = (state.correctCount / QUESTIONS.length) * 100;
    progressFill.style.width = pct + "%";
    progressBar.setAttribute("aria-valuenow", String(state.correctCount));

    // mini explosão saindo do botão
    const r = btn.getBoundingClientRect();
    Confetti.burst(r.left + r.width / 2, r.top + r.height / 2, 28);

    const isLast = state.correctCount === QUESTIONS.length;

    setTimeout(() => {
      if (isLast) {
        finishQuiz();
      } else {
        state.current++;
        renderQuestion();
      }
    }, isLast ? 900 : 1100);
  }

  function handleWrong(btn, q) {
    state.locked = true;
    btn.classList.add("wrong");
    showFeedback(q.wrong, false);
    restartAnimation(questionCard, "shake");

    // libera nova tentativa depois da animação
    setTimeout(() => {
      btn.classList.remove("wrong");
      state.locked = false;
    }, 900);
  }

  function showFeedback(text, ok) {
    feedback.textContent = text;
    feedback.className = "feedback show" + (ok ? " ok" : "");
  }

  function finishQuiz() {
    state.quizDone = true;

    // animação especial de conclusão
    Confetti.celebrate();
    for (let i = 0; i < 10; i++) {
      setTimeout(() => spawnHeart(true), i * 90);
    }

    setTimeout(() => showScreen("congrats"), reduceMotion ? 0 : 1500);
  }

  /* ---------------------------------------------------------
     TELA 2 → TELA 3
  --------------------------------------------------------- */
  continueBtn.addEventListener("click", () => {
    state.congratsDone = true;
    Confetti.burst(window.innerWidth / 2, window.innerHeight * 0.7, 36);
    showScreen("message");
  });

  /* ---------------------------------------------------------
     MENSAGEM — revelada palavra por palavra
  --------------------------------------------------------- */
  let letterTimer = null;
  let letterStarted = false;

  function startMessage() {
    if (letterStarted) return;
    letterStarted = true;

    // Monta uma <span> por palavra; os espaços ficam como texto normal.
    const words = LETTER.split(" ");
    const frag = document.createDocumentFragment();
    const spans = [];

    words.forEach((w, i) => {
      const s = document.createElement("span");
      s.className = "word";
      s.textContent = w;
      frag.appendChild(s);
      spans.push(s);
      if (i < words.length - 1) frag.appendChild(document.createTextNode(" "));
    });

    letterText.innerHTML = "";
    letterText.setAttribute("aria-label", LETTER);
    letterText.appendChild(frag);

    let i = 0;
    const delay = reduceMotion ? 0 : 130;

    function revealAll() {
      clearInterval(letterTimer);
      spans.forEach((s) => s.classList.add("on"));
      skipHint.classList.add("gone");
    }

    // pequena pausa antes de começar
    setTimeout(() => {
      letterTimer = setInterval(() => {
        if (i < spans.length) {
          spans[i].classList.add("on");
          i++;
        } else {
          clearInterval(letterTimer);
          skipHint.classList.add("gone");
        }
      }, delay);
    }, 700);

    // tocar no recado mostra tudo de uma vez
    letterEl.addEventListener("click", revealAll);
  }

  /* ---------------------------------------------------------
     REVELAR AO ROLAR (IntersectionObserver)
  --------------------------------------------------------- */
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("in"));
  }

  /* ---------------------------------------------------------
     CARDS DOS MOMENTOS — efeito ao tocar (celular)
  --------------------------------------------------------- */
  document.querySelectorAll(".moment-card").forEach((card) => {
    let t = null;
    card.addEventListener("click", () => {
      card.classList.add("tapped");
      clearTimeout(t);
      t = setTimeout(() => card.classList.remove("tapped"), 1400);
    });
  });

  /* ---------------------------------------------------------
     FUNDO: BRILHOS E CORAÇÕES FLUTUANDO
  --------------------------------------------------------- */
  const sparklesEl = $("sparkles");
  const heartsEl = $("hearts-bg");
  const SPARKLE_CHARS = ["✨", "✦", "·", "🌙"];
  const HEART_CHARS = ["❤", "♡", "❤", "💗"];

  function buildSparkles() {
    const count = window.innerWidth < 600 ? 10 : 18;
    for (let i = 0; i < count; i++) {
      const s = document.createElement("span");
      s.className = "sparkle";
      s.textContent = SPARKLE_CHARS[Math.floor(Math.random() * SPARKLE_CHARS.length)];
      s.style.left = Math.random() * 100 + "%";
      s.style.top = Math.random() * 100 + "%";
      s.style.fontSize = 8 + Math.random() * 12 + "px";
      s.style.animationDuration = 3 + Math.random() * 4 + "s";
      s.style.animationDelay = Math.random() * 5 + "s";
      sparklesEl.appendChild(s);
    }
  }

  function spawnHeart(strong) {
    if (reduceMotion) return;
    if (heartsEl.childElementCount > 16) return; // limite para não pesar

    const h = document.createElement("span");
    h.className = "float-heart";
    h.textContent = HEART_CHARS[Math.floor(Math.random() * HEART_CHARS.length)];
    h.style.left = Math.random() * 100 + "%";
    h.style.fontSize = 12 + Math.random() * 20 + "px";
    h.style.setProperty("--sway", (Math.random() * 50 - 25) + "px");
    h.style.setProperty("--op", strong ? 0.7 : 0.18 + Math.random() * 0.25);
    const dur = strong ? 4 + Math.random() * 2 : 10 + Math.random() * 8;
    h.style.animationDuration = dur + "s";
    h.addEventListener("animationend", () => h.remove());
    heartsEl.appendChild(h);
  }

  buildSparkles();
  let heartTimer = setInterval(spawnHeart, window.innerWidth < 600 ? 1600 : 1000);

  // Pausa os corações quando a aba está escondida (economiza bateria)
  document.addEventListener("visibilitychange", () => {
    clearInterval(heartTimer);
    if (!document.hidden) {
      heartTimer = setInterval(spawnHeart, window.innerWidth < 600 ? 1600 : 1000);
    }
  });

  /* ---------------------------------------------------------
     CONFETES (canvas leve, só roda enquanto há partículas)
  --------------------------------------------------------- */
  const Confetti = (function () {
    const canvas = $("confetti");
    const ctx = canvas.getContext("2d");
    const COLORS = ["#c0324f", "#a3203f", "#f4cdd6", "#fff6f3", "#7b1230", "#ff8aa1"];
    let particles = [];
    let running = false;
    let dpr = 1;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);

    function make(x, y, speedBase, spread) {
      const angle = Math.random() * Math.PI * 2;
      const speed = speedBase * (0.4 + Math.random() * 0.8);
      return {
        x: x,
        y: y,
        vx: Math.cos(angle) * speed * spread,
        vy: Math.sin(angle) * speed - 3,
        size: 6 + Math.random() * 7,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.3,
        life: 1,
        decay: 0.006 + Math.random() * 0.008,
        shape: Math.random() < 0.28 ? "heart" : "rect",
      };
    }

    function burst(x, y, amount) {
      if (reduceMotion) return;
      for (let i = 0; i < amount; i++) particles.push(make(x, y, 7, 1));
      start();
    }

    // Confetes caindo do alto + explosões do centro
    function celebrate() {
      if (reduceMotion) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      burst(w / 2, h * 0.55, 70);
      setTimeout(() => burst(w * 0.2, h * 0.6, 40), 250);
      setTimeout(() => burst(w * 0.8, h * 0.6, 40), 450);
      for (let i = 0; i < 60; i++) {
        const p = make(Math.random() * w, -20 - Math.random() * 120, 2, 0.4);
        p.vy = 2 + Math.random() * 3;
        p.decay = 0.004;
        particles.push(p);
      }
      start();
    }

    function drawHeart(size) {
      const s = size / 2;
      ctx.beginPath();
      ctx.moveTo(0, s * 0.6);
      ctx.bezierCurveTo(-s * 1.4, -s * 0.4, -s * 0.5, -s * 1.3, 0, -s * 0.5);
      ctx.bezierCurveTo(s * 0.5, -s * 1.3, s * 1.4, -s * 0.4, 0, s * 0.6);
      ctx.fill();
    }

    function frame() {
      ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);

      particles = particles.filter((p) => p.life > 0 && p.y < window.innerHeight + 40);

      for (const p of particles) {
        p.vy += 0.16;       // gravidade
        p.vx *= 0.99;       // atrito do ar
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        p.life -= p.decay;

        ctx.save();
        ctx.globalAlpha = Math.max(p.life, 0);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        if (p.shape === "heart") {
          drawHeart(p.size * 1.4);
        } else {
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        }
        ctx.restore();
      }

      if (particles.length > 0) {
        requestAnimationFrame(frame);
      } else {
        running = false;
        ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
      }
    }

    function start() {
      if (!running) {
        running = true;
        requestAnimationFrame(frame);
      }
    }

    return { burst: burst, celebrate: celebrate };
  })();

  /* ---------------------------------------------------------
     MÚSICA (opcional) — coloque musica.mp3 na mesma pasta
     Só toca depois que ela clicar no botão (sem autoplay).
  --------------------------------------------------------- */
  const audio = $("audio");
  const musicBtn = $("music-btn");
  const musicIcon = $("music-icon");
  const toast = $("toast");
  let toastTimer = null;

  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
  }

  function setPlayingUI(isPlaying) {
    musicBtn.classList.toggle("playing", isPlaying);
    musicIcon.textContent = isPlaying ? "❚❚" : "♪";
    musicBtn.setAttribute("aria-label", isPlaying ? "Pausar música" : "Tocar música");
  }

  musicBtn.addEventListener("click", () => {
    if (audio.paused) {
      audio.play().then(
        () => setPlayingUI(true),
        () => {
          setPlayingUI(false);
          showToast("Não consegui tocar a música 🥲");
        }
      );
    } else {
      audio.pause();
      setPlayingUI(false);
    }
  });

  // Se o arquivo musica.mp3 não existir, avisa de forma discreta
  audio.addEventListener("error", () => {
    setPlayingUI(false);
    showToast("Música ainda não adicionada 🎵");
  });

  /* ---------------------------------------------------------
     UTILITÁRIO — reinicia uma animação CSS por classe
  --------------------------------------------------------- */
  function restartAnimation(el, className) {
    el.classList.remove("enter", "shake", "win", "picked");
    void el.offsetWidth; // força o navegador a recalcular
    el.classList.add(className);
  }
})();
