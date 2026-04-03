// =====================================================
// ROMA JOANA — Project Page JavaScript
// Pagination, split scroll, keyboard nav
// =====================================================

// Project list for pagination
const PROJECTS = [
  { slug: 'one-meta',      title: 'One Meta',                    url: 'one-meta.html' },
  { slug: 'fazenda-futuro',title: 'Fazenda Futuro × Anitta',     url: 'fazenda-futuro.html' },
  { slug: 'google-trans',  title: 'Google Trans Visibility',     url: 'google-trans.html' },
  { slug: 'nana',          title: 'Labchoriti de Naná',          url: 'nana.html' },
  { slug: 'sweat',         title: 'SWEAT®',                      url: 'sweat.html' },
  { slug: 'guarana',       title: 'Guaraná Antarctica',          url: 'guarana.html' },
  { slug: 'marina-sena',   title: 'Marina Sena — Fort Magazine', url: 'marina-sena.html' },
  { slug: 'do-bem',        title: 'Do Bem',                      url: 'do-bem.html' },
  { slug: 'aveia-futuro',  title: 'Aveia + Futuro',              url: 'aveia-futuro.html' },
  { slug: 'spotify',       title: 'Spotify',                     url: 'spotify.html' },
  { slug: 'facebook',      title: 'Facebook Campaign',           url: 'facebook.html' },
  { slug: 'ferty',         title: 'FERTY',                       url: 'ferty.html' },
];

document.addEventListener('DOMContentLoaded', () => {

  // ---- Determine current project ----
  const currentSlug = document.body.dataset.project;
  const currentIndex = PROJECTS.findIndex(p => p.slug === currentSlug);
  const total = PROJECTS.length;

  // ---- Update nav: hide view toggle, show pagination ----
  const viewToggle = document.getElementById('view-toggle');
  if (viewToggle) viewToggle.style.display = 'none';

  const navCenter = document.getElementById('nav-center');
  if (navCenter && currentIndex !== -1) {
    const padded = String(currentIndex + 1).padStart(2, '0');
    const totalPadded = String(total).padStart(2, '0');

    const prevProject = PROJECTS[(currentIndex - 1 + total) % total];
    const nextProject = PROJECTS[(currentIndex + 1) % total];

    navCenter.innerHTML = `
      <div class="nav__pagination" id="nav-pagination">
        <a href="${prevProject.url}" class="nav__pag-btn" id="pag-prev" title="${prevProject.title}" aria-label="Previous project">←</a>
        <span class="nav__pag-count" id="pag-count">${padded} / ${totalPadded}</span>
        <a href="${nextProject.url}" class="nav__pag-btn" id="pag-next" title="${nextProject.title}" aria-label="Next project">→</a>
      </div>`;

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft')  { navigateTo(prevProject.url); }
      if (e.key === 'ArrowRight') { navigateTo(nextProject.url); }
      if (e.key === 'Escape')     { navigateTo('../index.html'); }
    });
  }

  // ---- Page transition before navigate ----
  function navigateTo(url) {
    const curtain = document.querySelector('.page-transition');
    if (curtain) {
      curtain.classList.add('entering');
      setTimeout(() => { window.location.href = url; }, 460);
    } else {
      window.location.href = url;
    }
  }

  // Intercept pagination links for transition
  document.querySelectorAll('.nav__pag-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo(btn.getAttribute('href'));
    });
  });


  // ---- Gallery scroll enhancement ----
  const gallery = document.getElementById('project-gallery');
  if (gallery) {
    // Reveal images as they scroll into view
    const imgs = gallery.querySelectorAll('.project-gallery__img');
    const imgObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('gallery-img--visible');
          imgObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    imgs.forEach(img => {
      img.classList.add('gallery-img--hidden');
      imgObserver.observe(img);
    });
  }


  // ---- Cursor for project pages ----
  const cursor = document.createElement('div');
  cursor.className = 'cursor';
  document.body.appendChild(cursor);

  let mouseX = 0, mouseY = 0;
  let cursorX = 0, cursorY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function animateCursor() {
    cursorX += (mouseX - cursorX) * 0.15;
    cursorY += (mouseY - cursorY) * 0.15;
    cursor.style.left = cursorX + 'px';
    cursor.style.top = cursorY + 'px';
    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  document.querySelectorAll('a, button').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('cursor--expanded'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('cursor--expanded'));
  });

  document.addEventListener('mouseleave', () => { cursor.style.opacity = '0'; });
  document.addEventListener('mouseenter', () => { cursor.style.opacity = '1'; });


  // ---- Page transition overlay ----
  const curtain = document.createElement('div');
  curtain.className = 'page-transition';
  document.body.appendChild(curtain);

  // Internal link transitions
  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    if (!href || href.startsWith('http') || href.startsWith('mailto') || href.startsWith('#')) return;
    if (link.closest('.nav__pag-btn')) return; // Already handled above

    link.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo(href);
    });
  });

  window.addEventListener('pageshow', () => {
    curtain.classList.remove('entering');
    curtain.classList.add('exiting');
    setTimeout(() => curtain.classList.remove('exiting'), 600);
  });


  // ---- Nav hide on scroll ----
  const nav = document.getElementById('main-nav');
  let lastScrollY = 0;
  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const current = window.scrollY;
        if (current < 60) {
          nav.classList.remove('nav--hidden');
        } else if (current > lastScrollY + 4) {
          nav.classList.add('nav--hidden');
        } else if (current < lastScrollY - 4) {
          nav.classList.remove('nav--hidden');
        }
        lastScrollY = current;
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

});
