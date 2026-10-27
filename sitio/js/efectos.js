/* Angie's Secret: efectos de brillo.
   - Con mouse (computador): estela de brillos dorados y rosados que sigue al puntero.
   - Con el dedo (celular o tablet): estallido de brillos tipo fuego artificial donde se toca.
   No tapa ni bloquea nada: es una capa transparente que no recibe clics.
   Se apaga sola si la persona pidió "reducir movimiento" en su equipo. */
(() => {
  const reducir = window.matchMedia("(prefers-reduced-motion: reduce)");
  const COLORES = ["#D9A21F", "#F0C04A", "#D42A63", "#F47CA2"];
  const MAXIMO = 180;            // tope de brillos en pantalla, para no cargar el equipo

  const lienzo = document.createElement("canvas");
  lienzo.className = "efectos";
  lienzo.setAttribute("aria-hidden", "true");
  document.body.appendChild(lienzo);
  const ctx = lienzo.getContext("2d");
  if (!ctx) return;

  let escala = 1, ancho = 0, alto = 0;
  function medir() {
    escala = Math.min(window.devicePixelRatio || 1, 2);
    ancho = window.innerWidth; alto = window.innerHeight;
    lienzo.width = Math.round(ancho * escala); lienzo.height = Math.round(alto * escala);
    ctx.setTransform(escala, 0, 0, escala, 0, 0);
  }
  medir();
  window.addEventListener("resize", medir);

  const brillos = [];
  let animando = false, anterior = 0, ultimoX = null, ultimoY = null;

  function crear(x, y, vx, vy, vida, tam, gravedad, color) {
    if (brillos.length >= MAXIMO) brillos.shift();
    brillos.push({
      x, y, vx, vy, vida, tam, gravedad, edad: 0,
      color: color || COLORES[(Math.random() * COLORES.length) | 0],
      giro: Math.random() * Math.PI, vgiro: (Math.random() - 0.5) * 0.2
    });
    if (!animando) { animando = true; anterior = performance.now(); requestAnimationFrame(cuadro); }
  }

  // Estrella de 4 puntas, como el brillo de la corona
  function dibujar(b, opacidad) {
    const r = b.tam, ri = r * 0.38;
    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.rotate(b.giro);
    ctx.globalAlpha = opacidad;
    ctx.fillStyle = b.color;
    ctx.shadowColor = b.color;
    ctx.shadowBlur = r * 1.6;
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const ang = (i * Math.PI) / 4, rr = i % 2 === 0 ? r : ri;
      ctx.lineTo(Math.cos(ang) * rr, Math.sin(ang) * rr);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function cuadro(ahora) {
    const dt = Math.min(48, ahora - anterior);
    anterior = ahora;
    const k = dt / 16.7;
    ctx.clearRect(0, 0, ancho, alto);
    for (let i = brillos.length - 1; i >= 0; i--) {
      const b = brillos[i];
      b.edad += dt;
      if (b.edad >= b.vida) { brillos.splice(i, 1); continue; }
      const roce = Math.pow(0.95, k);
      b.vx *= roce;
      b.vy = b.vy * roce + b.gravedad * k;
      b.x += b.vx * k; b.y += b.vy * k; b.giro += b.vgiro * k;
      const resto = 1 - b.edad / b.vida;
      const titileo = 0.7 + 0.3 * Math.sin(b.edad / 40 + b.giro * 9);
      dibujar(b, resto * titileo);
    }
    if (brillos.length) requestAnimationFrame(cuadro);
    else { animando = false; ctx.clearRect(0, 0, ancho, alto); }
  }

  // Estela: solo con mouse, cada pocos píxeles de movimiento
  window.addEventListener("pointermove", e => {
    if (reducir.matches || e.pointerType !== "mouse") return;
    if (ultimoX !== null && Math.hypot(e.clientX - ultimoX, e.clientY - ultimoY) < 7) return;
    ultimoX = e.clientX; ultimoY = e.clientY;
    const cuantos = Math.random() < 0.45 ? 2 : 1;
    for (let i = 0; i < cuantos; i++) {
      crear(e.clientX + (Math.random() - 0.5) * 10, e.clientY + (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 0.7, (Math.random() - 0.3) * 0.7,
        600 + Math.random() * 400, 3.5 + Math.random() * 4, 0.03);
    }
  }, { passive: true });

  // Estallido: al tocar con el dedo o un lápiz
  window.addEventListener("pointerdown", e => {
    if (reducir.matches || e.pointerType === "mouse") return;
    const cuantos = 26;
    for (let i = 0; i < cuantos; i++) {
      const ang = (i / cuantos) * Math.PI * 2 + Math.random() * 0.3;
      const vel = 2.6 + Math.random() * 2.8;
      crear(e.clientX, e.clientY, Math.cos(ang) * vel, Math.sin(ang) * vel,
        700 + Math.random() * 450, 3.5 + Math.random() * 3.5, 0.07);
    }
    crear(e.clientX, e.clientY, 0, 0, 300, 14, 0, "#F0C04A");
  }, { passive: true });
})();
