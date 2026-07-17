document.addEventListener('DOMContentLoaded', () => {
  const CART_KEY = 'queso-v5-cart';
  const ORDER_KEY = 'queso-v5-order';
  const pageName = (name) => window.location.pathname.endsWith('-shareable.html') ? name.replace('.html', '-shareable.html') : name;
  const money = (value) => `HKD ${Number(value || 0).toLocaleString('en-HK')}`;
  const readCart = () => {
    try { return JSON.parse(localStorage.getItem(CART_KEY)) || null; } catch { return null; }
  };
  const writeCart = (item) => {
    localStorage.setItem(CART_KEY, JSON.stringify(item));
    refreshCart();
  };
  const refreshCart = () => {
    const cart = readCart();
    document.querySelectorAll('[data-cart]').forEach((link) => {
      link.textContent = `Cart (${cart ? Number(cart.quantity || 1) : 0})`;
    });
  };

  const menuButton = document.querySelector('[data-menu-toggle]');
  const mobileMenu = document.querySelector('[data-mobile-menu]');
  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', () => {
      const open = mobileMenu.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', String(open));
      document.body.classList.toggle('menu-open', open);
    });
  }

  const slides = [...document.querySelectorAll('.hero-slide')];
  const dots = [...document.querySelectorAll('.hero-dot')];
  let activeSlide = 0;
  let slideTimer;
  const showSlide = (index) => {
    if (!slides.length) return;
    activeSlide = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => slide.classList.toggle('is-active', i === activeSlide));
    dots.forEach((dot, i) => {
      dot.classList.toggle('is-active', i === activeSlide);
      dot.setAttribute('aria-pressed', String(i === activeSlide));
    });
  };
  const startSlides = () => {
    if (slides.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    clearInterval(slideTimer);
    slideTimer = setInterval(() => showSlide(activeSlide + 1), 5200);
  };
  dots.forEach((dot, index) => dot.addEventListener('click', () => { showSlide(index); startSlides(); }));
  if (slides.length) { showSlide(0); startSlides(); }

  const hoverMenu = document.querySelector('[data-cake-menu]');
  if (hoverMenu) {
    const preview = hoverMenu.querySelector('[data-menu-preview]');
    const previewImages = preview ? [...preview.querySelectorAll('img')] : [];
    const title = preview?.querySelector('[data-menu-title]');
    const copy = preview?.querySelector('[data-menu-copy]');
    hoverMenu.querySelectorAll('[data-menu-item]').forEach((item) => {
      const updatePreview = () => {
        const images = (item.dataset.images || '').split('|');
        const target = item.getAttribute('href');
        const cardLink = target ? document.querySelector(`.menu-card a[href="${target}"]`) : null;
        const cardImages = cardLink ? [...cardLink.closest('.menu-card').querySelectorAll('.menu-card-media img')] : [];
        previewImages.forEach((image, index) => {
          const source = cardImages[index]?.currentSrc || cardImages[index]?.src || images[index];
          if (source) image.src = source;
        });
        if (title) title.textContent = item.dataset.title || item.textContent.trim();
        if (copy) copy.textContent = item.dataset.copy || '';
        hoverMenu.querySelectorAll('[data-menu-item]').forEach((entry) => entry.classList.toggle('is-active', entry === item));
      };
      item.addEventListener('mouseenter', updatePreview);
      item.addEventListener('focus', updatePreview);
    });
  }

  document.querySelectorAll('[data-gallery]').forEach((gallery) => {
    const main = gallery.querySelector('[data-gallery-main]');
    const thumbs = [...gallery.querySelectorAll('[data-gallery-thumb]')];
    if (!main || !thumbs.length) return;
    thumbs.forEach((thumb, index) => {
      thumb.setAttribute('role', 'button');
      thumb.setAttribute('tabindex', '0');
      thumb.setAttribute('aria-label', `Show product photo ${index + 1}`);
      const activate = () => {
        const nextSrc = thumb.dataset.full || thumb.currentSrc || thumb.src;
        const nextAlt = thumb.alt || main.alt;
        main.src = nextSrc;
        main.alt = nextAlt;
        thumbs.forEach((entry) => entry.classList.toggle('is-active', entry === thumb));
      };
      thumb.addEventListener('click', activate);
      thumb.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); activate(); }
      });
    });
    thumbs[0].classList.add('is-active');
  });

  const flavorIngredients = {
    classic: 'Key ingredients: cream cheese, egg, sugar, flour and butter.',
    chocolate: 'Key ingredients: cream cheese, egg, sugar, flour, butter and premium Valrhona chocolate.',
    lemon: 'Key ingredients: cream cheese, egg, sugar, flour, butter and lemon.',
    caramel: 'Key ingredients: cream cheese, egg, sugar, flour, butter and caramel.',
    ube: 'Key ingredients: cream cheese, egg, sugar, flour, butter and ube.'
  };
  const queryFlavor = new URLSearchParams(window.location.search).get('flavor');
  document.querySelectorAll('[data-option-group]').forEach((group) => {
    const options = [...group.querySelectorAll('[data-option]')];
    options.forEach((option) => {
      if (group.dataset.optionGroup === 'flavor' && queryFlavor && option.dataset.option === queryFlavor) {
        options.forEach((entry) => entry.classList.remove('is-active'));
        option.classList.add('is-active');
      }
      option.addEventListener('click', () => {
        options.forEach((entry) => entry.classList.toggle('is-active', entry === option));
        if (group.dataset.optionGroup === 'flavor') {
          document.querySelectorAll('[data-flavor-ingredients]').forEach((target) => {
            target.textContent = flavorIngredients[option.dataset.option] || flavorIngredients.classic;
          });
        }
      });
    });
  });
  const activeFlavor = document.querySelector('[data-option-group="flavor"] [data-option].is-active');
  if (activeFlavor) document.querySelectorAll('[data-flavor-ingredients]').forEach((target) => {
    target.textContent = flavorIngredients[activeFlavor.dataset.option] || flavorIngredients.classic;
  });

  const journey = document.querySelector('[data-flavor-journey]');
  if (journey) {
    const choices = [...journey.querySelectorAll('[data-flavor-choice]')];
    const selectedName = journey.querySelector('[data-selected-flavor]');
    const formatLinks = [...journey.querySelectorAll('[data-format-link]')];
    const choose = (choice) => {
      const flavor = choice.dataset.flavorChoice;
      choices.forEach((entry) => {
        const active = entry === choice;
        entry.classList.toggle('is-active', active);
        entry.setAttribute('aria-pressed', String(active));
      });
      if (selectedName) selectedName.textContent = choice.dataset.flavorName;
      formatLinks.forEach((link) => {
        const page = pageName(link.dataset.formatLink);
        link.href = `${page}?flavor=${encodeURIComponent(flavor)}`;
      });
      history.replaceState(null, '', `${location.pathname}?flavor=${encodeURIComponent(flavor)}#choose-format`);
    };
    choices.forEach((choice) => choice.addEventListener('click', () => choose(choice)));
    choose(choices.find((choice) => choice.dataset.flavorChoice === queryFlavor) || choices[0]);
  }

  const productFromPage = (button) => {
    const root = button.closest('[data-product]') || document.querySelector('[data-product]');
    const flavor = root?.querySelector('[data-option-group="flavor"] [data-option].is-active')?.textContent.trim() || button.dataset.flavor || 'Classic';
    const size = root?.querySelector('[data-option-group="size"] [data-option].is-active')?.textContent.trim() || button.dataset.size || 'Standard';
    const quantity = Math.max(1, Number(root?.querySelector('[data-quantity]')?.value || button.dataset.quantity || 1));
    return {
      name: button.dataset.productName || root?.dataset.productName || 'Queso cheesecake',
      flavor,
      size,
      quantity,
      price: Number(button.dataset.productPrice || root?.dataset.productPrice || 0),
      image: button.dataset.productImage || root?.dataset.productImage || ''
    };
  };
  document.querySelectorAll('[data-add-cart]').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      const item = productFromPage(button);
      writeCart(item);
      const original = button.textContent;
      button.textContent = 'Added to cart';
      setTimeout(() => { window.location.href = button.getAttribute('href') || 'checkout.html'; }, 420);
      setTimeout(() => { button.textContent = original; }, 1400);
    });
  });

  const cart = readCart();
  if (document.querySelector('[data-checkout-summary]')) {
    const item = cart || { name: 'Classic Birthday Suit', flavor: 'Classic', size: 'Standard', quantity: 1, price: 368, image: '../assets/generated-campaign/02-birthday-suit.png' };
    const total = item.price * item.quantity;
    const set = (selector, value) => { const target = document.querySelector(selector); if (target) target.textContent = value; };
    const image = document.querySelector('[data-summary-image]');
    if (image) {
      const lowered = item.name.toLowerCase();
      const key = lowered.includes('artisan') ? 'artisan' : lowered.includes('canvas') ? 'canvas' : lowered.includes('biscoff') || lowered.includes('drop') ? 'drop' : 'birthday';
      const embedded = document.querySelector(`[data-summary-source="${key}"]`);
      const source = embedded?.currentSrc || embedded?.src || item.image;
      if (source) image.src = source;
      image.alt = item.name;
    }
    set('[data-summary-name]', item.name);
    set('[data-summary-options]', `${item.flavor} • ${item.size} • Qty ${item.quantity}`);
    set('[data-summary-line-price]', money(total));
    document.querySelectorAll('[data-summary-total]').forEach((target) => { target.textContent = money(total); });
    const pay = document.querySelector('[data-pay-button]');
    if (pay) pay.textContent = `Pay ${money(total)}`;
  }

  const finishOrder = (method) => {
    const item = readCart();
    const ref = `QSO-${String(Date.now()).slice(-6)}`;
    sessionStorage.setItem(ORDER_KEY, JSON.stringify({ item, method, ref }));
    window.location.href = pageName('confirmation.html');
  };
  document.querySelectorAll('[data-express]').forEach((button) => {
    button.addEventListener('click', () => finishOrder(button.dataset.express));
  });
  const checkoutForm = document.querySelector('[data-checkout-form]');
  if (checkoutForm) checkoutForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (checkoutForm.reportValidity()) finishOrder('Card');
  });

  if (document.querySelector('[data-confirmation]')) {
    let order = null;
    try { order = JSON.parse(sessionStorage.getItem(ORDER_KEY)) || null; } catch { order = null; }
    const item = order?.item || readCart();
    const reference = document.querySelector('[data-order-reference]');
    if (reference) reference.textContent = order?.ref || 'QSO-PREVIEW';
    const summary = document.querySelector('[data-confirmation-summary]');
    if (summary && item) summary.textContent = `${item.name} • ${item.flavor} • ${item.size} • Qty ${item.quantity}`;
  }

  document.querySelectorAll('form[data-prototype-form]').forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const submit = form.querySelector('[type="submit"]');
      if (!submit) return;
      const original = submit.textContent;
      submit.textContent = form.matches('.footer-form') ? 'You’re on the list' : 'Message received';
      setTimeout(() => { submit.textContent = original; }, 1800);
    });
  });

  const upload = document.querySelector('[data-canvas-upload]');
  const previewImage = document.querySelector('[data-canvas-image]');
  const canvasPreview = document.querySelector('[data-canvas-preview]');
  if (upload && previewImage) {
    upload.addEventListener('change', () => {
      const file = upload.files && upload.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        previewImage.src = reader.result;
        previewImage.hidden = false;
        canvasPreview?.classList.add('has-image');
      };
      reader.readAsDataURL(file);
    });
  }
  const message = document.querySelector('[data-canvas-message]');
  const previewMessage = document.querySelector('[data-canvas-preview-message]');
  if (message && previewMessage) message.addEventListener('input', () => {
    previewMessage.textContent = message.value.trim();
  });

  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches && window.matchMedia('(min-width: 981px)').matches) {
    const shifts = [...document.querySelectorAll('[data-scroll-shift]')];
    let ticking = false;
    const update = () => {
      shifts.forEach((node) => {
        const rect = node.getBoundingClientRect();
        const amount = Math.max(-1, Math.min(1, (window.innerHeight / 2 - rect.top) / window.innerHeight));
        node.style.setProperty('--scroll-shift', `${amount * Number(node.dataset.scrollShift || 24)}px`);
      });
      ticking = false;
    };
    window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    update();
  }

  refreshCart();
});
