/* ============================================================
   StockholmVibe.com — Main JavaScript
   Particles, Animations, Interactions
   ============================================================ */

(function () {
  'use strict';

  /* ---------- Particle System (Hero Background) ---------- */
  class ParticleSystem {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.particles = [];
      this.mouse = { x: null, y: null, radius: 120 };
      this.animationId = null;
      this.resize();
      this.init();
      this.bindEvents();
      this.animate();
    }

    resize() {
      this.canvas.width = this.canvas.parentElement.offsetWidth;
      this.canvas.height = this.canvas.parentElement.offsetHeight;
    }

    init() {
      this.particles = [];
      const count = Math.min(
        Math.floor((this.canvas.width * this.canvas.height) / 12000),
        150
      );
      for (let i = 0; i < count; i++) {
        this.particles.push(new Particle(this.canvas));
      }
    }

    bindEvents() {
      window.addEventListener('resize', () => {
        this.resize();
        this.init();
      });

      this.canvas.addEventListener('mousemove', (e) => {
        const rect = this.canvas.getBoundingClientRect();
        this.mouse.x = e.clientX - rect.left;
        this.mouse.y = e.clientY - rect.top;
      });

      this.canvas.addEventListener('mouseleave', () => {
        this.mouse.x = null;
        this.mouse.y = null;
      });
    }

    animate() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      for (let i = 0; i < this.particles.length; i++) {
        const p = this.particles[i];
        p.update(this.mouse);
        p.draw(this.ctx);

        for (let j = i + 1; j < this.particles.length; j++) {
          const p2 = this.particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 150) {
            const opacity = (1 - dist / 150) * 0.15;
            this.ctx.beginPath();
            this.ctx.strokeStyle = `rgba(0, 212, 255, ${opacity})`;
            this.ctx.lineWidth = 0.5;
            this.ctx.moveTo(p.x, p.y);
            this.ctx.lineTo(p2.x, p2.y);
            this.ctx.stroke();
          }
        }
      }

      this.animationId = requestAnimationFrame(() => this.animate());
    }

    destroy() {
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
      }
    }
  }

  class Particle {
    constructor(canvas) {
      this.canvas = canvas;
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.vx = (Math.random() - 0.5) * 0.5;
      this.vy = (Math.random() - 0.5) * 0.5;
      this.radius = Math.random() * 2 + 0.5;
      this.baseRadius = this.radius;
      this.opacity = Math.random() * 0.5 + 0.2;
      this.color = Math.random() > 0.7 ? '124, 58, 237' : '0, 212, 255';
    }

    update(mouse) {
      this.x += this.vx;
      this.y += this.vy;

      if (this.x < 0 || this.x > this.canvas.width) this.vx *= -1;
      if (this.y < 0 || this.y > this.canvas.height) this.vy *= -1;

      if (mouse.x !== null && mouse.y !== null) {
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          this.x += dx * force * 0.02;
          this.y += dy * force * 0.02;
          this.radius = this.baseRadius + force * 2;
        } else {
          this.radius += (this.baseRadius - this.radius) * 0.05;
        }
      }
    }

    draw(ctx) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.color}, ${this.opacity})`;
      ctx.fill();
    }
  }

  /* ---------- Audio Visualizer Effect (Decorative) ---------- */
  class AudioVisualizer {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.bars = 64;
      this.barValues = new Array(this.bars).fill(0);
      this.targetValues = new Array(this.bars).fill(0);
      this.resize();
      this.animate();

      window.addEventListener('resize', () => this.resize());
    }

    resize() {
      this.canvas.width = this.canvas.parentElement.offsetWidth;
      this.canvas.height = this.canvas.parentElement.offsetHeight;
    }

    animate() {
      const time = Date.now() * 0.001;

      for (let i = 0; i < this.bars; i++) {
        this.targetValues[i] =
          Math.sin(time * 2 + i * 0.3) * 0.3 +
          Math.sin(time * 3.7 + i * 0.5) * 0.2 +
          Math.sin(time * 1.3 + i * 0.8) * 0.15 +
          0.5;
        this.barValues[i] += (this.targetValues[i] - this.barValues[i]) * 0.08;
      }

      this.draw();
      requestAnimationFrame(() => this.animate());
    }

    draw() {
      const { ctx, canvas, bars, barValues } = this;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = canvas.width / bars;
      const maxHeight = canvas.height * 0.7;

      for (let i = 0; i < bars; i++) {
        const h = barValues[i] * maxHeight;
        const x = i * barWidth;
        const y = canvas.height - h;

        const gradient = ctx.createLinearGradient(x, canvas.height, x, y);
        gradient.addColorStop(0, 'rgba(0, 212, 255, 0.02)');
        gradient.addColorStop(0.5, 'rgba(124, 58, 237, 0.08)');
        gradient.addColorStop(1, 'rgba(224, 64, 251, 0.12)');

        ctx.fillStyle = gradient;
        ctx.fillRect(x + 1, y, barWidth - 2, h);

        ctx.fillStyle = `rgba(0, 212, 255, ${0.3 + barValues[i] * 0.4})`;
        ctx.fillRect(x + 1, y, barWidth - 2, 2);
      }
    }
  }

  /* ---------- Smooth Wave Background ---------- */
  class WaveBackground {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.resize();
      this.animate();
      window.addEventListener('resize', () => this.resize());
    }

    resize() {
      this.canvas.width = this.canvas.parentElement.offsetWidth;
      this.canvas.height = this.canvas.parentElement.offsetHeight;
    }

    animate() {
      const { ctx, canvas } = this;
      const time = Date.now() * 0.0005;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let w = 0; w < 3; w++) {
        ctx.beginPath();
        const amplitude = 30 + w * 15;
        const frequency = 0.003 - w * 0.0005;
        const yOffset = canvas.height * (0.5 + w * 0.1);
        const opacity = 0.04 - w * 0.01;

        ctx.moveTo(0, yOffset);
        for (let x = 0; x <= canvas.width; x += 2) {
          const y =
            yOffset +
            Math.sin(x * frequency + time + w) * amplitude +
            Math.sin(x * frequency * 2 + time * 1.5 + w) * (amplitude * 0.3);
          ctx.lineTo(x, y);
        }
        ctx.lineTo(canvas.width, canvas.height);
        ctx.lineTo(0, canvas.height);
        ctx.closePath();

        const gradient = ctx.createLinearGradient(0, yOffset - amplitude, 0, canvas.height);
        gradient.addColorStop(0, `rgba(0, 212, 255, ${opacity})`);
        gradient.addColorStop(1, 'rgba(0, 212, 255, 0)');
        ctx.fillStyle = gradient;
        ctx.fill();
      }

      requestAnimationFrame(() => this.animate());
    }
  }

  /* ---------- Navigation ---------- */
  function initNav() {
    const nav = document.querySelector('.nav');
    const toggle = document.querySelector('.nav__toggle');
    const mobile = document.querySelector('.nav__mobile');

    if (!nav) return;

    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 50);
    });

    if (toggle && mobile) {
      toggle.addEventListener('click', () => {
        toggle.classList.toggle('open');
        mobile.classList.toggle('open');
        document.body.style.overflow = mobile.classList.contains('open')
          ? 'hidden'
          : '';
      });

      mobile.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => {
          toggle.classList.remove('open');
          mobile.classList.remove('open');
          document.body.style.overflow = '';
        });
      });
    }
  }

  /* ---------- Scroll Reveal ---------- */
  function initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal');
    if (!reveals.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    reveals.forEach((el) => observer.observe(el));
  }

  /* ---------- FAQ Accordion ---------- */
  function initFAQ() {
    document.querySelectorAll('.faq-item__question').forEach((btn) => {
      btn.addEventListener('click', () => {
        const item = btn.parentElement;
        const isOpen = item.classList.contains('open');

        item
          .closest('.faq-list')
          .querySelectorAll('.faq-item')
          .forEach((i) => i.classList.remove('open'));

        if (!isOpen) item.classList.add('open');
      });
    });
  }

  /* ---------- Smooth scroll for anchors ---------- */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener('click', (e) => {
        const target = document.querySelector(a.getAttribute('href'));
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  /* ---------- Lazy load images ---------- */
  function initLazyLoad() {
    const images = document.querySelectorAll('img[data-src]');
    if (!images.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            if (img.dataset.srcset) img.srcset = img.dataset.srcset;
            img.removeAttribute('data-src');
            img.removeAttribute('data-srcset');
            observer.unobserve(img);
          }
        });
      },
      { rootMargin: '200px' }
    );

    images.forEach((img) => observer.observe(img));
  }

  /* ---------- Counter animation ---------- */
  function initCounters() {
    const counters = document.querySelectorAll('[data-count]');
    if (!counters.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const target = parseInt(el.dataset.count, 10);
            const suffix = el.dataset.suffix || '';
            const duration = 2000;
            const start = performance.now();

            function step(now) {
              const progress = Math.min((now - start) / duration, 1);
              const eased = 1 - Math.pow(1 - progress, 4);
              el.textContent = Math.floor(eased * target) + suffix;

              if (progress < 1) {
                requestAnimationFrame(step);
              }
            }

            requestAnimationFrame(step);
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.5 }
    );

    counters.forEach((el) => observer.observe(el));
  }

  /* ---------- Horizontal scroll with drag ---------- */
  function initHorizontalScroll() {
    document.querySelectorAll('.hscroll').forEach((scroller) => {
      let isDown = false;
      let startX;
      let scrollLeft;

      scroller.addEventListener('mousedown', (e) => {
        isDown = true;
        scroller.style.cursor = 'grabbing';
        startX = e.pageX - scroller.offsetLeft;
        scrollLeft = scroller.scrollLeft;
      });

      scroller.addEventListener('mouseleave', () => {
        isDown = false;
        scroller.style.cursor = 'grab';
      });

      scroller.addEventListener('mouseup', () => {
        isDown = false;
        scroller.style.cursor = 'grab';
      });

      scroller.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - scroller.offsetLeft;
        const walk = (x - startX) * 1.5;
        scroller.scrollLeft = scrollLeft - walk;
      });
    });
  }

  /* ---------- Parallax on scroll ---------- */
  function initParallax() {
    const parallaxEls = document.querySelectorAll('[data-parallax]');
    if (!parallaxEls.length) return;

    function update() {
      const scrollY = window.scrollY;
      parallaxEls.forEach((el) => {
        const speed = parseFloat(el.dataset.parallax) || 0.3;
        const rect = el.getBoundingClientRect();
        const visible = rect.bottom > 0 && rect.top < window.innerHeight;
        if (visible) {
          const offset = scrollY * speed;
          el.style.transform = `translateY(${offset}px)`;
        }
      });
    }

    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  /* ---------- Init canvas backgrounds ---------- */
  function initCanvasBackgrounds() {
    const particleCanvases = document.querySelectorAll('[data-particles]');
    particleCanvases.forEach((wrapper) => {
      const cvs = document.createElement('canvas');
      wrapper.appendChild(cvs);
      new ParticleSystem(cvs);
    });

    const vizCanvases = document.querySelectorAll('[data-visualizer]');
    vizCanvases.forEach((wrapper) => {
      const cvs = document.createElement('canvas');
      wrapper.appendChild(cvs);
      new AudioVisualizer(cvs);
    });

    const waveCanvases = document.querySelectorAll('[data-waves]');
    waveCanvases.forEach((wrapper) => {
      const cvs = document.createElement('canvas');
      wrapper.appendChild(cvs);
      new WaveBackground(cvs);
    });
  }

  /* ---------- Typewriter effect ---------- */
  function initTypewriter() {
    const els = document.querySelectorAll('[data-typewriter]');
    els.forEach((el) => {
      const words = el.dataset.typewriter.split(',');
      let wordIndex = 0;
      let charIndex = 0;
      let deleting = false;
      let pauseTimer = 0;

      function type() {
        const currentWord = words[wordIndex];

        if (!deleting) {
          el.textContent = currentWord.substring(0, charIndex + 1);
          charIndex++;

          if (charIndex === currentWord.length) {
            pauseTimer = 40;
            deleting = true;
          }
        } else if (pauseTimer > 0) {
          pauseTimer--;
        } else {
          el.textContent = currentWord.substring(0, charIndex - 1);
          charIndex--;

          if (charIndex === 0) {
            deleting = false;
            wordIndex = (wordIndex + 1) % words.length;
          }
        }

        const speed = deleting && pauseTimer === 0 ? 40 : 80;
        setTimeout(type, speed);
      }

      type();
    });
  }

  /* ---------- Boot ---------- */
  document.addEventListener('DOMContentLoaded', () => {
    initNav();
    initScrollReveal();
    initFAQ();
    initSmoothScroll();
    initLazyLoad();
    initCounters();
    initHorizontalScroll();
    initParallax();
    initCanvasBackgrounds();
    initTypewriter();
  });
})();
