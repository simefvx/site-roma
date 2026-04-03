// =====================================================
// ROMA JOANA — Main JavaScript
// Navigation, view switching, cursor, scroll reveals
// =====================================================

document.addEventListener('DOMContentLoaded', () => {

  // ---- Page Loader ----
  const loader = document.createElement('div');
  loader.className = 'loader';
  loader.id = 'page-loader';
  loader.innerHTML = `
    <div class="loader__logo">
      <svg width="40" height="40" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="15" stroke="#000" stroke-width="1.5"/>
        <text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-family="Inter, sans-serif" font-size="13" font-weight="500" fill="#000">R</text>
      </svg>
    </div>`;
  document.body.prepend(loader);

  window.addEventListener('load', () => {
    setTimeout(() => {
      loader.classList.add('loader--hidden');
      setTimeout(() => loader.remove(), 400);
    }, 300);
  });


  // ---- Cursor Enhancement ----
  const cursor = document.createElement('div');
  cursor.className = 'cursor';
  document.body.appendChild(cursor);

  let mouseX = 0, mouseY = 0;
  let cursorX = 0, cursorY = 0;
  let rafId;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function animateCursor() {
    const speed = 0.15;
    cursorX += (mouseX - cursorX) * speed;
    cursorY += (mouseY - cursorY) * speed;
    cursor.style.left = cursorX + 'px';
    cursor.style.top = cursorY + 'px';
    rafId = requestAnimationFrame(animateCursor);
  }
  animateCursor();

  // Expand cursor on hoverable elements
  const hoverTargets = document.querySelectorAll('a, button, .project-card');
  hoverTargets.forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('cursor--expanded'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('cursor--expanded'));
  });

  // Hide cursor when leaving window
  document.addEventListener('mouseleave', () => { cursor.style.opacity = '0'; });
  document.addEventListener('mouseenter', () => { cursor.style.opacity = '1'; });


  // ---- View Toggle (Columns / Services / Contato) ----
  const btnColumns = document.getElementById('btn-columns');
  const btnServices = document.getElementById('btn-services');
  const btnContato = document.getElementById('btn-contato');
  const viewColumns = document.getElementById('view-columns');
  const viewServices = document.getElementById('view-services');
  const viewContato = document.getElementById('view-contato');

  // ---- Intro Sequence (Canvas Image Sequence) ----
  function initIntroSequence() {
    const section = document.getElementById('intro-sequence');
    const canvas = document.getElementById('intro-canvas');
    if (!section || !canvas) return;

    const ctx = canvas.getContext('2d');
    const frameCount = 72; // 0 to 71
    const images = [];
    let imagesLoaded = 0;

    canvas.width = 1920;
    canvas.height = 1080;

    for (let i = 0; i < frameCount; i++) {
      const img = new Image();
      const fileNum = i.toString().padStart(5, '0');
      img.src = `fatal/limp/anima_${fileNum}.jpg`;
      images.push(img);
      img.onload = () => {
        imagesLoaded++;
        if (i === 0) drawFrame(0);
      };
    }

    function drawFrame(index) {
      if (images[index] && images[index].complete) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Draw the image onto the canvas logic
        // Center crop if aspect ratios differ
        const img = images[index];
        const canvasRatio = canvas.width / canvas.height;
        const imgRatio = img.width / img.height;
        let drawWidth, drawHeight, offsetX, offsetY;

        if (imgRatio > canvasRatio) {
          drawHeight = canvas.height;
          drawWidth = img.width * (canvas.height / img.height);
          offsetX = (canvas.width - drawWidth) / 2;
          offsetY = 0;
        } else {
          drawWidth = canvas.width;
          drawHeight = img.height * (canvas.width / img.width);
          offsetX = 0;
          offsetY = (canvas.height - drawHeight) / 2;
        }
        ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
      }
    }

    window.addEventListener('scroll', () => {
      // Don't animate if services is active
      if(document.body.classList.contains('services-active')) return;

      const offsetTop = section.offsetTop;
      const scrollableHeight = section.offsetHeight - window.innerHeight;
      if (scrollableHeight <= 0) return;

      let progress = (window.scrollY - offsetTop) / scrollableHeight;
      progress = Math.max(0, Math.min(1, progress));
      
      const frameIndex = Math.min(frameCount - 1, Math.floor(progress * frameCount));
      requestAnimationFrame(() => drawFrame(frameIndex));
    }, { passive: true });
  }
  initIntroSequence();

  // ---- Hero: scroll-driven horizontal panels ----
  function initHeroScroll() {
    const hero = document.getElementById('hero-scroll');
    const track = document.getElementById('hero-scroll-track');
    const dotsWrap = document.getElementById('hero-scroll-dots');
    if (!hero || !track || !dotsWrap) return;

    const panels = track.children.length;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const mqMobile = window.matchMedia('(max-width: 768px)');
    let raf = 0;

    function buildDots() {
      dotsWrap.innerHTML = '';
      for (let i = 0; i < panels; i++) {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'hero-scroll__dot';
        b.setAttribute('role', 'tab');
        b.setAttribute('aria-label', `Painel ${i + 1} de ${panels}`);
        b.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
        b.addEventListener('click', () => scrollToPanel(i));
        b.addEventListener('mouseenter', () => cursor.classList.add('cursor--expanded'));
        b.addEventListener('mouseleave', () => cursor.classList.remove('cursor--expanded'));
        dotsWrap.appendChild(b);
      }
    }

    function heroDocumentTop() {
      return hero.getBoundingClientRect().top + window.scrollY;
    }

    function scrollToPanel(index) {
      const start = heroDocumentTop();
      const scrollable = Math.max(1, hero.offsetHeight - window.innerHeight);
      const maxIndex = Math.max(1, panels - 1);
      const slice = scrollable / maxIndex;
      const targetY = start + slice * Math.min(index, maxIndex);
      window.scrollTo({ top: targetY, behavior: 'smooth' });
    }

    function update() {
      if (reduceMotion || mqMobile.matches) {
        track.style.transform = '';
        return;
      }
      const start = heroDocumentTop();
      const scrollable = Math.max(1, hero.offsetHeight - window.innerHeight);
      let p = (window.scrollY - start) / scrollable;
      p = Math.max(0, Math.min(1, p));
      const shift = p * Math.max(0, panels - 1) * 100;
      track.style.transform = `translate3d(-${shift}vw, 0, 0)`;

      const dotIndex = Math.round(p * Math.max(1, panels - 1));
      dotsWrap.querySelectorAll('.hero-scroll__dot').forEach((d, i) => {
        d.setAttribute('aria-selected', i === dotIndex ? 'true' : 'false');
      });
    }

    function onScroll() {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    }

    buildDots();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', update);
    mqMobile.addEventListener('change', update);
    update();
  }
  initHeroScroll();

  if (btnColumns && viewColumns) {
    const views = {
      columns: { btn: btnColumns, section: viewColumns },
      services:{ btn: btnServices, section: viewServices },
      contato: { btn: btnContato, section: viewContato },
    };

    const intro = document.getElementById('intro-sequence');
    const hero  = document.getElementById('hero-scroll');

    // Restore saved view preference (default: columns)
    const savedView = localStorage.getItem('rj-view') || 'columns';
    switchView(savedView);

    function switchView(viewName) {
      Object.values(views).forEach(({ btn, section }) => {
        if (!btn || !section) return;
        btn.classList.remove('active');
        section.classList.remove('active');
        section.style.display = 'none';
      });

      const target = views[viewName];
      if (!target || !target.section) return;

      target.btn.classList.add('active');
      target.section.style.display = 'block';

      const fullscreen = viewName === 'services' || viewName === 'contato';
      if (fullscreen) {
        if (hero)  hero.style.display  = 'none';
        if (intro) intro.style.display = 'none';
        document.body.classList.add('services-active');
      } else {
        if (hero)  hero.style.display  = '';
        if (intro) intro.style.display = '';
        document.body.classList.remove('services-active');
      }

      requestAnimationFrame(() => target.section.classList.add('active'));

      document.body.dataset.view = viewName;
      localStorage.setItem('rj-view', viewName);

      if (viewName === 'columns') initScrollReveal();
    }

    if (btnColumns)  btnColumns.addEventListener('click',  () => switchView('columns'));
    if (btnServices) btnServices.addEventListener('click', () => switchView('services'));
    if (btnContato)  btnContato.addEventListener('click',  () => switchView('contato'));
  }


  // ---- Nav Hide/Show on Scroll ----
  const nav = document.getElementById('main-nav');
  let lastScrollY = window.scrollY;
  let ticking = false;

  function updateNav() {
    const currentScrollY = window.scrollY;
    const scrollDelta = currentScrollY - lastScrollY;

    if (currentScrollY < 60) {
      nav.classList.remove('nav--hidden');
    } else if (scrollDelta > 4) {
      nav.classList.add('nav--hidden');
    } else if (scrollDelta < -4) {
      nav.classList.remove('nav--hidden');
    }

    lastScrollY = currentScrollY;
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateNav);
      ticking = true;
    }
  }, { passive: true });


  // ---- Page Transition on Link Click ----
  const curtain = document.createElement('div');
  curtain.className = 'page-transition';
  document.body.appendChild(curtain);

  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    // Only internal links, skip external/email/anchor
    if (!href || href.startsWith('http') || href.startsWith('mailto') || href.startsWith('#') || href.startsWith('tel')) return;

    link.addEventListener('click', (e) => {
      e.preventDefault();
      curtain.classList.add('entering');

      setTimeout(() => {
        window.location.href = href;
      }, 480);
    });
  });

  // On page load, play exit animation
  window.addEventListener('pageshow', () => {
    curtain.classList.remove('entering');
    curtain.classList.add('exiting');
    setTimeout(() => {
      curtain.classList.remove('exiting');
    }, 600);
  });


  // ---- Scroll Reveal ----
  function initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal, .reveal-stagger');
    if (!reveals.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

    reveals.forEach(el => observer.observe(el));
  }
  initScrollReveal();


  // ---- List View: Image Follows Mouse ----
  function initListReveal() {
    const listItems = document.querySelectorAll('.list-item');

    listItems.forEach(item => {
      const preview = item.querySelector('.list-item__preview');
      if (!preview) return;

      item.addEventListener('mousemove', (e) => {
        const offset = 20;
        let x = e.clientX + offset;
        let y = e.clientY - preview.offsetHeight / 2;

        // Keep within viewport
        if (x + preview.offsetWidth > window.innerWidth) {
          x = e.clientX - preview.offsetWidth - offset;
        }
        if (y < 0) y = 0;
        if (y + preview.offsetHeight > window.innerHeight) {
          y = window.innerHeight - preview.offsetHeight;
        }

        preview.style.left = x + 'px';
        preview.style.top = y + 'px';
      });
    });
  }
  initListReveal();


  // ---- Grid: Stagger animation on load ----
  const gridCards = document.querySelectorAll('.project-card');
  gridCards.forEach((card, i) => {
    card.classList.add('grid-enter');
    card.style.animationDelay = `${i * 0.04}s`;
    card.style.animationFillMode = 'both';
  });


  // ---- Image load enhancement (eager + lazy) ----
  document.querySelectorAll('img[loading]').forEach(img => {
    if (img.complete) {
      img.classList.add('loaded');
    } else {
      img.addEventListener('load', () => img.classList.add('loaded'));
    }
  });

  // ---- Services scroll anim ----
  const bgText = document.getElementById('services-bg-text');
  if (bgText) {
    window.addEventListener('scroll', () => {
      // Only do it when services are active
      if (!document.body.classList.contains('services-active')) return;

      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      
      let newOpacity = 1 - (scrollY / (windowHeight * 0.8));
      if (newOpacity < 0) newOpacity = 0;
      if (newOpacity > 1) newOpacity = 1;

      // Calculate scale - drops from 1 down to 0.7
      let newScale = 1 - (scrollY / (windowHeight * 1.5));
      if (newScale < 0.7) newScale = 0.7;

      bgText.style.opacity = newOpacity;
      // Slight vertical rise + scale reduction
      bgText.style.transform = `translateY(${scrollY * 0.1}px) scale(${newScale})`;
    }, { passive: true });
  }

  // ---- Services boards: scroll reveal ----
  (function initBoardsReveal() {
    const boards = document.querySelectorAll('.service-board');
    if (!boards.length) return;

    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('board-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });

    boards.forEach(b => obs.observe(b));
  })();

  // ---- Columns view: scroll reveal ----
  (function initColumnsReveal() {
    const items = document.querySelectorAll('.column-item');
    if (!items.length) return;

    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('col-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    items.forEach(item => obs.observe(item));
  })();

  // ---- Blood drip effect ----
  (function initBloodDrip() {
    let idleTimer = null;
    let dripTimer = null;
    let cx = 0, cy = 0;
    let dripping = false;

    function createDrop() {
      const drop = document.createElement('div');
      drop.className = 'blood-drop';

      // pequena variação horizontal para parecer orgânico
      const offsetX = (Math.random() - 0.5) * 10;
      drop.style.left = (cx + offsetX) + 'px';
      drop.style.top  = cy + 'px';
      document.body.appendChild(drop);

      const fallDist = 200;
      const duration = 600;

      const anim = drop.animate([
        { transform: 'translateY(0) scaleX(1)',    opacity: 1   },
        { transform: `translateY(${fallDist * 0.4}px) scaleX(0.85)`, opacity: 1,   offset: 0.4 },
        { transform: `translateY(${fallDist}px) scaleX(1.1)`, opacity: 0.9 }
      ], { duration, easing: 'cubic-bezier(0.2, 0, 0.85, 1)', fill: 'forwards' });

      anim.onfinish = () => {
        // poça onde o sangue pousou
        const pool = document.createElement('div');
        pool.className = 'blood-pool';
        const w = 7 + Math.random() * 11;
        pool.style.left  = (cx + offsetX - w / 2) + 'px';
        pool.style.top   = (cy + fallDist - 2) + 'px';
        pool.style.width = w + 'px';
        document.body.appendChild(pool);
        drop.remove();

        // some depois de alguns segundos
        const linger = 3500 + Math.random() * 2500;
        setTimeout(() => {
          pool.style.opacity = '0';
          setTimeout(() => pool.remove(), 1200);
        }, linger);
      };
    }

    function scheduleDrop() {
      if (!dripping) return;
      createDrop();
      dripTimer = setTimeout(scheduleDrop, 1000 + Math.random() * 400);
    }

    document.addEventListener('mousemove', (e) => {
      cx = e.clientX;
      cy = e.clientY;

      // para de pingar ao mover
      dripping = false;
      clearTimeout(idleTimer);
      clearTimeout(dripTimer);

      // reinicia contagem de 3 s
      idleTimer = setTimeout(() => {
        dripping = true;
        scheduleDrop();
      }, 3000);
    });
  })();

});
