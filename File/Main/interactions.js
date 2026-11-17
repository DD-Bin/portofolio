(() => {
  if (window.__portfolioInteractionsInitialized) return;
  window.__portfolioInteractionsInitialized = true;

  function initPortfolioSearch() {
    const container = document.querySelector('#portfolioContainer');
    const search = document.querySelector('#portfolioSearch');
    if (!container || !search) return;

    const items = Array.from(container.querySelectorAll('.portfolio-item'));
    const buttons = Array.from(document.querySelectorAll('.filter-btn'));
    const results = document.querySelector('#portfolioResults');
    const emptyState = document.querySelector('#portfolioEmptyState');
    let activeCategory = 'all';

    function updateResults() {
      const query = search.value.trim().toLocaleLowerCase();
      let visibleCount = 0;

      items.forEach(item => {
        const matchesCategory = activeCategory === 'all' || item.dataset.category === activeCategory;
        const matchesQuery = item.textContent.toLocaleLowerCase().includes(query);
        const isVisible = matchesCategory && matchesQuery;

        item.hidden = !isVisible;
        item.style.display = isVisible ? '' : 'none';
        if (isVisible) visibleCount += 1;
      });

      if (results) {
        results.textContent = `Menampilkan ${visibleCount} dari ${items.length} laporan.`;
      }
      if (emptyState) emptyState.hidden = visibleCount > 0;
    }

    buttons.forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.filter === activeCategory));
      button.addEventListener('click', () => {
        activeCategory = button.dataset.filter || 'all';
        buttons.forEach(filterButton => {
          const isActive = filterButton === button;
          filterButton.classList.toggle('active', isActive);
          filterButton.setAttribute('aria-pressed', String(isActive));
        });
        updateResults();
      });
    });

    search.addEventListener('input', updateResults);
    updateResults();
  }

  function initScrollReveal() {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion || !('IntersectionObserver' in window)) return;

    const elements = document.querySelectorAll(
      '.portfolio-item, .service-card, .feature-card, .surface, .portfolio-card, .step-container, .laprak-header'
    );
    if (!elements.length) return;

    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        currentObserver.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -32px 0px' });

    elements.forEach((element, index) => {
      element.classList.add('reveal');
      if (element.classList.contains('portfolio-item')) {
        element.style.setProperty('--reveal-delay', `${(index % 3) * 70}ms`);
      }
      observer.observe(element);
    });
  }

  function initImageLightbox() {
    const images = document.querySelectorAll('.img-detail, .img-screenshot');
    if (!images.length || typeof HTMLDialogElement === 'undefined' || typeof HTMLDialogElement.prototype.showModal !== 'function') return;

    const dialog = document.createElement('dialog');
    dialog.className = 'image-lightbox';
    dialog.setAttribute('aria-label', 'Pratinjau gambar laporan');

    const closeButton = document.createElement('button');
    closeButton.className = 'image-lightbox-close';
    closeButton.type = 'button';
    closeButton.setAttribute('aria-label', 'Tutup pratinjau');
    closeButton.innerHTML = '<i class="bi bi-x-lg" aria-hidden="true"></i>';

    const image = document.createElement('img');
    const caption = document.createElement('p');
    caption.className = 'image-lightbox-caption';

    dialog.append(closeButton, image, caption);
    document.body.append(dialog);

    function closeLightbox() {
      if (dialog.open) dialog.close();
    }

    closeButton.addEventListener('click', closeLightbox);
    dialog.addEventListener('keydown', event => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      closeLightbox();
    });
    dialog.addEventListener('click', event => {
      if (event.target === dialog) closeLightbox();
    });
    dialog.addEventListener('close', () => {
      image.removeAttribute('src');
      caption.textContent = '';
    });

    images.forEach(reportImage => {
      reportImage.classList.add('image-zoomable');
      reportImage.tabIndex = 0;
      reportImage.setAttribute('role', 'button');
      reportImage.setAttribute('aria-label', `Perbesar gambar: ${reportImage.alt || 'screenshot laporan'}`);

      function openLightbox() {
        image.src = reportImage.currentSrc || reportImage.src;
        image.alt = reportImage.alt;
        caption.textContent = reportImage.alt;
        dialog.showModal();
        closeButton.focus();
      }

      reportImage.addEventListener('click', openLightbox);
      reportImage.addEventListener('keydown', event => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        openLightbox();
      });
    });
  }

  function initBackToTop() {
    const button = document.createElement('button');
    button.className = 'back-to-top';
    button.type = 'button';
    button.setAttribute('aria-label', 'Kembali ke atas');
    button.setAttribute('aria-hidden', 'true');
    button.tabIndex = -1;
    button.innerHTML = '<i class="bi bi-arrow-up" aria-hidden="true"></i>';
    document.body.append(button);

    let scheduled = false;
    function updateVisibility() {
      const isVisible = window.scrollY > 420;
      button.classList.toggle('is-visible', isVisible);
      button.setAttribute('aria-hidden', String(!isVisible));
      button.tabIndex = isVisible ? 0 : -1;
      scheduled = false;
    }

    window.addEventListener('scroll', () => {
      if (scheduled) return;
      scheduled = true;
      window.requestAnimationFrame(updateVisibility);
    }, { passive: true });

    button.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    updateVisibility();
  }

  function init() {
    initPortfolioSearch();
    initScrollReveal();
    initImageLightbox();
    initBackToTop();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
