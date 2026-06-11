/* ═══════════════════════════════════════════════════════════════
   ANTIGRAVITY 2.0 — LIQUID GLASS  |  Interactive Engine
   Physics-based animations, scroll reveals, and administrative tools
   ═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── DOM CACHE ── */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  /* ── IMAGE OPTIMIZER UTILITY ── */
  function optimizeImage(file, callback) {
    if (file.type === 'image/svg+xml' || file.name.endsWith('.svg')) {
      const reader = new FileReader();
      reader.onload = (e) => callback(e.target.result);
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const MAX_WIDTH = 1000;
        const MAX_HEIGHT = 1000;
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH || height > MAX_HEIGHT) {
          if (width > height) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          } else {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        const optimizedDataUrl = canvas.toDataURL('image/jpeg', 0.75);
        callback(optimizedDataUrl);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  const DOM = {
    loader:         $('#loader'),
    scrollProgress: $('#scrollProgress'),
    cursorGlow:     $('#cursorGlow'),
    navWrapper:     $('#navWrapper'),
    navbar:         $('#navbar'),
    navToggle:      $('#navToggle'),
    navLinks:       $('#navLinks'),
    productsGrid:   $('#productsGrid'),
    filterBtns:     $$('.filter-btn'),
    newsletterForm: $('#newsletterForm'),
    reveals:        $$('.reveal'),
    testimonialsGrid: $('#testimonialsGrid'),
    journalGrid:      $('#journalGrid'),
    adminGeneralImageInput: $('#adminGeneralImageInput'),
    hudSaveIndicator: $('#hudSaveIndicator'),
    hudReset:         $('#hudReset'),
    
    // Interactive Overlays
    navCart:          $('#nav-cart'),
    navCartBadge:     $('#navCartBadge'),
    cartSidebar:      $('#cartSidebar'),
    cartOverlay:      $('#cartOverlay'),
    cartClose:        $('#cartClose'),
    cartCountLabel:   $('#cartCountLabel'),
    cartItemsContainer: $('#cartItemsContainer'),
    cartSubtotal:     $('#cartSubtotal'),
    cartCheckoutBtn:  $('#cartCheckoutBtn'),
    
    navSearch:        $('#nav-search'),
    searchOverlay:    $('#searchOverlay'),
    searchClose:      $('#searchClose'),
    searchInput:      $('#searchInput'),
    searchProductsResults: $('#searchProductsResults'),
    searchBlogResults: $('#searchBlogResults'),
    searchEmptyState:  $('#searchEmptyState'),

    // Lead Capture Overlay
    leadModal:        $('#leadModal'),
    leadModalOverlay: $('#leadModalOverlay'),
    leadModalClose:   $('#leadModalClose'),
    leadModalForm:    $('#leadModalForm'),
    leadModalEmail:   $('#leadModalEmail'),
    
    wysiwygToolbar:   $('#wysiwygToolbar'),
    toastContainer:   $('#toastContainer'),
    
    // Admin & Auth Controls
    navAdmin:       $('#nav-admin'),
    adminHud:       $('#adminHud'),
    hudLogout:      $('#hudLogout'),
    loginModal:     $('#loginModal'),
    loginForm:      $('#loginForm'),
    loginUser:      $('#loginUser'),
    loginPass:      $('#loginPass'),
    loginError:     $('#loginError'),
    loginClose:     $('#loginClose'),
    adminModal:     $('#adminModal'),
    adminForm:      $('#adminForm'),
    adminClose:     $('#adminClose'),
    adminProductId: $('#adminProductId'),
    adminName:      $('#adminName'),
    adminPrice:     $('#adminPrice'),
    adminCategory:  $('#adminCategory'),
    adminColors:    $('#adminColors'),
    adminImage:     $('#adminImage'),
    adminImageData: $('#adminImageData'),
    fileDropZone:   $('#fileDropZone'),
    uploadFilename: $('#uploadFilename'),
    adminSubmitText:$('#adminSubmitText'),
    adminDeleteBtn: $('#adminDeleteBtn'),
    adminModalTitle:$('#adminModalTitle'),
    adminLink:      $('#adminLink'),
  };

  /* ── CONSTANTS & STATE ── */
  const DEFAULT_PRODUCTS = [
    {
      id: 'product-1',
      name: 'Pinterest Templates for Home Decor Creators',
      category: 'pinterest',
      price: 7,
      image: 'assets/preview-6-hero-cover.png',
      badge: 'BEST SELLER',
      colors: ['#faf6f0', '#dfd0bc', '#e8daca'],
      link: 'https://beautifulhomedecor.gumroad.com/l/sumtam',
      description: '10 beautiful, editable Pinterest templates to grow your brand and engagement. Canva editable — instant download.',
      discountCode: 'SAVE50 — 50% off',
      buttonText: 'Buy Now',
      discountText: '→ $3.50 with SAVE50'
    },
    {
      id: 'product-2',
      name: 'Instagram Templates for Home Decor Creators',
      category: 'instagram',
      price: 7,
      image: 'assets/preview-5-canva-editor.png',
      badge: 'BESTSELLER',
      colors: ['#c9a96e', '#1a1008'],
      link: 'https://beautifulhomedecor.gumroad.com/l/lbylpf',
      description: '10 stunning Instagram templates to create a cohesive and elegant feed. Canva editable — instant download.',
      discountCode: 'INSTA50 — 50% off',
      buttonText: 'Buy Now',
      discountText: '→ $3.50 with INSTA50'
    },
    {
      id: 'product-3',
      name: 'Pinterest + Instagram Bundle',
      category: 'bundle',
      price: 12,
      image: 'assets/preview-3-templates-grid.png',
      badge: 'BEST VALUE',
      colors: ['#faf6f0', '#c9a96e', '#1a1008'],
      link: 'https://beautifulhomedecor.gumroad.com',
      description: 'Get both Pinterest + Instagram template packs. 20 total templates. Save $2!',
      discountCode: 'SAVE50 or INSTA50 — 50% off',
      discountText: '→ $6 with codes'
    }
  ];

  /* ── SHA-256 HASH OF PASSKEY ── */
  const PASSKEY_HASH = '7c787f0bcc149e31bcd2a766087d890f1f5c40f0accaedd765dc681123037446';

  const DEFAULT_LAYOUT = {
    'nav-logo-text': 'Beautiful Home Decor',
    'nav-home': 'Home',
    'nav-store': 'Store',
    'nav-blog': 'Blog',
    'nav-about': 'About',
    'nav-cta-shop': 'Shop Templates',
    'hero-eyebrow': 'CANVA TEMPLATES — INSTANT DOWNLOAD',
    'hero-title': 'Aesthetic Pinterest Templates for Home Decor Creators',
    'hero-desc': 'Ready-to-edit Canva templates designed to stop the scroll. Post beautiful, cohesive pins in minutes — no design skills needed.',
    'hero-cta-explore': '🛍 Shop Now',
    'hero-cta-new': 'View Templates →',
    'hero-stat-1-num': '1,200+',
    'hero-stat-1-lbl': 'Happy Creators',
    'hero-stat-2-num': '4.9/5',
    'hero-stat-2-lbl': 'Avg. Rating',
    'hero-image': 'assets/preview-3-templates-grid.png',
    
    'trust-1': 'Instant Download',
    'trust-1-sub': 'Get your templates immediately',
    'trust-2': 'Canva Editable',
    'trust-2-sub': 'Works with FREE Canva',
    'trust-3': '50% OFF Today',
    'trust-3-sub': 'Use code SAVE50 at checkout',
    
    'brand-item-1': 'Home Decor Templates',
    'brand-item-2': 'Pinterest Templates',
    'brand-item-3': 'Canva Editable',
    'brand-item-4': 'Instant Download',
    'brand-item-5': '10 Aesthetics',
    'brand-item-6': 'Commercial Use',
    'brand-item-7': 'No Design Skills Needed',
    'brand-item-8': 'Beautiful Home Decor',
    
    'products-label': 'Our Collection',
    'products-title': 'Pinterest & Instagram Templates',
    'products-subtitle': 'Ready-to-edit Canva templates for home decor creators. Post beautiful, aesthetic content in minutes.',
    
    'highlight-image': 'assets/preview-6-hero-cover.png',
    'highlight-image-tag': 'PINTEREST TEMPLATES',
    'highlight-tag': '✦ BEST SELLER',
    'highlight-title': 'Pinterest Templates for Home Decor Creators',
    'highlight-desc': '10 beautiful, ready-to-edit Pinterest templates designed for home decor creators. Post stunning, cohesive pins in minutes using Canva.',
    'highlight-feature-1': '10 Templates',
    'highlight-feature-2': 'Canva Editable',
    'highlight-feature-3': 'Instant Download',
    'highlight-feature-4': 'Commercial Rights',
    'highlight-cta': 'Get Templates Now',
    
    'testimonials-label': 'WHAT OUR CUSTOMERS SAY',
    'testimonials-title': 'What Our Customers Say',
    'testimonials-subtitle': 'Real reviews from home decor creators who use our templates every day.',
    
    'journal-label': 'Tips & Tutorials',
    'journal-title': 'From the Blog',
    'journal-subtitle': 'Tips, tutorials, and inspiration to grow your Pinterest and home decor brand.',
    
    'about-label': 'ABOUT ME',
    'about-title': "Hello, I'm Pavan Sai! So glad you're here! ♡",
    'about-desc': "Hi! I'm Pavan Sai, a creator passionate about helping home decor lovers build their Pinterest presence with beautiful, ready-to-use Canva templates. I create high-quality aesthetic templates that save you time, elevate your brand, and help you share beautiful ideas that inspire and connect.",
    'mission-title': '✦ My Mission',
    'mission-desc': 'I create high-quality, aesthetic templates that save you time, elevate your brand, and help you share beautiful ideas that inspire and connect with your audience.',
    'about-image': 'assets/professional_male_designer_spectacles.png',
    
    'newsletter-title': 'Get 1 Free Pinterest Template',
    'newsletter-desc': 'Subscribe and receive 1 free home decor Pinterest template instantly. No spam, ever.',
    'newsletter-submit': 'Get Templates',
    'newsletter-action': '',
    'chatbot-key': '',
    
    'footer-logo': 'Beautiful Home Decor',
    'footer-tagline': 'Beautiful templates for home decor creators who love creating and inspiring.',
    'footer-copy': '&copy; 2026 Beautiful Home Decor. All rights reserved. Canva is a trademark of Canva Pty Ltd.'
  };

  /* ── DYNAMIC TESTIMONIALS ── */
  const DEFAULT_TESTIMONIALS = [
    {
      id: 'testimonial-1',
      stars: 5,
      quote: "These templates are stunning and so easy to use! My Pinterest engagement has grown so much since I started using them.",
      authorName: "Emily R.",
      authorRole: "Home Decor Blogger",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80"
    },
    {
      id: 'testimonial-2',
      stars: 5,
      quote: "I love how cohesive and beautiful my pins look now. Totally worth every penny!",
      authorName: "Sarah M.",
      authorRole: "Interior Stylist",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80"
    },
    {
      id: 'testimonial-3',
      stars: 5,
      quote: "Saved me hours of design work. My aesthetic is finally on point!",
      authorName: "Jessica T.",
      authorRole: "Content Creator",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80"
    }
  ];

  /* ── DYNAMIC BLOG POSTS ── */
  const DEFAULT_BLOG = [
    {
      id: 'blog-1',
      image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600&q=80',
      category: 'PINTEREST TIPS',
      date: 'Jun 2, 2026',
      title: '5 Pinterest Mistakes Costing You Views in 2026',
      excerpt: 'Avoid these common mistakes holding your Pinterest back.'
    },
    {
      id: 'blog-2',
      image: 'https://images.unsplash.com/photo-1615876234886-fd9a39fda97f?w=600&q=80',
      category: 'CANVA TUTORIAL',
      date: 'May 28, 2026',
      title: 'How to Make Pinterest Pins in 3 Minutes',
      excerpt: 'Create scroll-stopping pins fast using ready-made templates.'
    },
    {
      id: 'blog-3',
      image: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=600&q=80',
      category: 'DESIGN TIPS',
      date: 'May 15, 2026',
      title: 'Best Home Decor Color Palettes for Pinterest 2026',
      excerpt: 'Trending palettes that get more saves and clicks on Pinterest.'
    }
  ];

  let state = {
    products: [],
    testimonials: [],
    blog: [],
    layout: {},
    cart: [],
    isAdmin: false,
    observer: null,
    activeImageKey: null,
    activeBlogImageId: null,
    activeSelection: null,
    cursorLabel: '',
    couponApplied: false,
    appliedCouponCode: ''
  };

  function loadState() {
    // Legacy database migration to new Beautiful Home Decor template brand
    const oldProducts = localStorage.getItem('beautiful_home_products');
    const oldLayout = localStorage.getItem('beautiful_home_layout');
    let needsReset = false;

    if (oldProducts) {
      try {
        const parsedProducts = JSON.parse(oldProducts);
        // Reset if we don't have exactly 3 products or they don't have description/discountCode
        if (parsedProducts.length !== 3 || 
            parsedProducts[1].badge !== 'BESTSELLER' || 
            !parsedProducts[0].description.includes('Canva editable — instant download.') ||
            parsedProducts[0].image !== 'assets/preview-6-hero-cover.png' ||
            !parsedProducts[0].buttonText ||
            parsedProducts[0].buttonText !== 'Buy Now' ||
            !parsedProducts[0].discountText) {
          needsReset = true;
        }
      } catch (e) {
        needsReset = true;
      }
    }

    // Verify testimonials cache is not empty and has updated content
    const oldTestimonials = localStorage.getItem('beautiful_home_testimonials');
    if (oldTestimonials) {
      try {
        const parsedTestim = JSON.parse(oldTestimonials);
        if (parsedTestim.length === 0 || 
            !parsedTestim[0] ||
            !parsedTestim[0].quote ||
            !parsedTestim[0].quote.includes('since I started using them') ||
            !parsedTestim[0].avatar.startsWith('https://images.unsplash.com')) {
          needsReset = true;
        }
      } catch (e) {
        needsReset = true;
      }
    } else {
      needsReset = true;
    }

    // Verify blog cache is not empty and has updated content
    const oldBlog = localStorage.getItem('beautiful_home_blog');
    if (oldBlog) {
      try {
        const parsedBlog = JSON.parse(oldBlog);
        if (parsedBlog.length === 0 ||
            !parsedBlog[0] ||
            parsedBlog[0].category !== 'PINTEREST TIPS' ||
            parsedBlog[0].excerpt !== 'Avoid these common mistakes holding your Pinterest back.' ||
            !parsedBlog[0].image.startsWith('https://images.unsplash.com') ||
            !parsedBlog[2] ||
            parsedBlog[2].image !== 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=600&q=80') {
          needsReset = true;
        }
      } catch (e) {
        needsReset = true;
      }
    } else {
      needsReset = true;
    }

    if (oldLayout) {
      try {
        const parsedLayout = JSON.parse(oldLayout);
        if (parsedLayout['nav-logo-text'] !== 'Beautiful Home Decor' || 
            parsedLayout['hero-eyebrow'] !== 'CANVA TEMPLATES — INSTANT DOWNLOAD' ||
            parsedLayout['products-label'] !== 'Our Collection' ||
            !parsedLayout['about-title'] || 
            !parsedLayout['about-title'].includes("Pavan Sai") ||
            !parsedLayout['trust-1-sub'] ||
            parsedLayout['highlight-image-tag'] !== 'PINTEREST TEMPLATES' ||
            parsedLayout['testimonials-label'] !== 'WHAT OUR CUSTOMERS SAY' ||
            parsedLayout['journal-title'] !== 'From the Blog' ||
            parsedLayout['about-label'] !== 'ABOUT ME' ||
            parsedLayout['newsletter-title'] !== 'Get 1 Free Pinterest Template' ||
            parsedLayout['hero-image'] !== 'assets/preview-3-templates-grid.png' ||
            parsedLayout['hero-cta-explore'] !== '🛍 Shop Now' ||
            parsedLayout['about-image'] !== 'assets/professional_male_designer_spectacles.png') {
          needsReset = true;
        }
      } catch (e) {
        needsReset = true;
      }
    } else {
      needsReset = true;
    }

    if (needsReset) {
      localStorage.removeItem('beautiful_home_products');
      localStorage.removeItem('beautiful_home_layout');
      localStorage.removeItem('beautiful_home_testimonials');
      localStorage.removeItem('beautiful_home_blog');
      localStorage.removeItem('beautiful_home_cart');
    }

    // Load products database
    const stored = localStorage.getItem('beautiful_home_products');
    if (stored) {
      try {
        state.products = JSON.parse(stored);
      } catch (e) {
        state.products = [...DEFAULT_PRODUCTS];
      }
    } else {
      state.products = [...DEFAULT_PRODUCTS];
      localStorage.setItem('beautiful_home_products', JSON.stringify(state.products));
    }

    // Load testimonials database
    const storedTestimonials = localStorage.getItem('beautiful_home_testimonials');
    if (storedTestimonials) {
      try {
        state.testimonials = JSON.parse(storedTestimonials);
      } catch (e) {
        state.testimonials = [...DEFAULT_TESTIMONIALS];
      }
    } else {
      state.testimonials = [...DEFAULT_TESTIMONIALS];
      localStorage.setItem('beautiful_home_testimonials', JSON.stringify(state.testimonials));
    }

    // Load blog database
    const storedBlog = localStorage.getItem('beautiful_home_blog');
    if (storedBlog) {
      try {
        state.blog = JSON.parse(storedBlog);
      } catch (e) {
        state.blog = [...DEFAULT_BLOG];
      }
    } else {
      state.blog = [...DEFAULT_BLOG];
      localStorage.setItem('beautiful_home_blog', JSON.stringify(state.blog));
    }

    // Load layout database
    const storedLayout = localStorage.getItem('beautiful_home_layout');
    if (storedLayout) {
      try {
        state.layout = JSON.parse(storedLayout);
        if (state.layout['newsletter-action'] === undefined) {
          state.layout['newsletter-action'] = '';
          saveLayout();
        }
      } catch (e) {
        state.layout = { ...DEFAULT_LAYOUT };
      }
    } else {
      state.layout = { ...DEFAULT_LAYOUT };
      localStorage.setItem('beautiful_home_layout', JSON.stringify(state.layout));
    }

    // Load cart database
    const storedCart = localStorage.getItem('beautiful_home_cart');
    if (storedCart) {
      try {
        const parsedCart = JSON.parse(storedCart);
        // Purge items that no longer exist in products database to avoid TypeError crashes
        state.cart = parsedCart.filter(item => state.products.some(p => p.id === item.id));
        if (state.cart.length !== parsedCart.length) {
          saveCart();
        }
      } catch (e) {
        state.cart = [];
      }
    } else {
      state.cart = [];
    }

    // Load coupon state
    state.couponApplied = localStorage.getItem('beautiful_home_coupon_applied') === 'true';
    state.appliedCouponCode = localStorage.getItem('beautiful_home_coupon_code') || '';

    // Load admin login status
    state.isAdmin = sessionStorage.getItem('beautiful_home_is_admin') === 'true';
  }

  function saveProducts() {
    localStorage.setItem('beautiful_home_products', JSON.stringify(state.products));
  }

  function saveTestimonials() {
    localStorage.setItem('beautiful_home_testimonials', JSON.stringify(state.testimonials));
  }

  function saveBlog() {
    localStorage.setItem('beautiful_home_blog', JSON.stringify(state.blog));
  }

  function saveLayout() {
    localStorage.setItem('beautiful_home_layout', JSON.stringify(state.layout));
  }

  function saveCart() {
    localStorage.setItem('beautiful_home_cart', JSON.stringify(state.cart));
    localStorage.setItem('beautiful_home_coupon_applied', state.couponApplied ? 'true' : 'false');
    localStorage.setItem('beautiful_home_coupon_code', state.appliedCouponCode);
  }

  // Cryptographic hashing using Web Crypto API
  async function hashString(str) {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  }

  // Basic HTML Sanitizer to prevent script injection
  function sanitizeHTML(html) {
    if (!html) return '';
    // Strip <script>...</script> tags
    let cleaned = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    // Strip inline execution attributes (on*)
    cleaned = cleaned.replace(/on\w+\s*=\s*(['"][^'"]*['"]|[^\s>]+(?=\s|>))/gi, '');
    // Strip javascript: hrefs
    cleaned = cleaned.replace(/href\s*=\s*(['"]\s*javascript:[^'"]*['"]|javascript:[^\s>]+(?=\s|>))/gi, '');
    return cleaned;
  }

  // Helper to wrap matched search terms in highlight spans
  function highlightText(text, query) {
    if (!query) return text;
    const escapedQuery = query.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`(${escapedQuery})`, 'gi');
    return text.replace(regex, '<span class="search-highlight">$1</span>');
  }

  let saveIndicatorTimeout = null;
  function triggerSaveIndicator() {
    if (!DOM.hudSaveIndicator) return;
    DOM.hudSaveIndicator.classList.add('active');
    
    if (saveIndicatorTimeout) clearTimeout(saveIndicatorTimeout);
    saveIndicatorTimeout = setTimeout(() => {
      DOM.hudSaveIndicator.classList.remove('active');
    }, 1200);
  }


  /* ══════════════════════════════════════════════════════════════
     § 1  LOADING SCREEN
     ══════════════════════════════════════════════════════════════ */
  function initLoader() {
    // Disable automatic browser scroll restoration on refresh
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    
    // Force scroll to top immediately on load initialization
    window.scrollTo(0, 0);
    document.body.style.overflow = 'hidden';

    const hideLoader = () => {
      if (DOM.loader && !DOM.loader.classList.contains('loaded')) {
        DOM.loader.classList.add('loaded');
        
        // Slight delay so the loader fade starts before body animations kick in
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            document.body.classList.add('loader-done');
            document.body.style.overflow = '';
            // Snap to top one final time after revealing the page
            window.scrollTo({ top: 0, behavior: 'instant' });
          });
        });
      }
    };

    window.addEventListener('load', () => {
      // Min 1.8s to show the loader brand; max 3.5s total
      setTimeout(hideLoader, 1800);
    });
    
    // Absolute fallback in case 'load' never fires (e.g. offline)
    setTimeout(hideLoader, 3500);
  }


  /* ══════════════════════════════════════════════════════════════
     § 2  SCROLL PROGRESS BAR
     ══════════════════════════════════════════════════════════════ */
  function initScrollProgress() {
    const update = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      DOM.scrollProgress.style.width = `${progress}%`;
    };
    window.addEventListener('scroll', update, { passive: true });
  }


  /* ══════════════════════════════════════════════════════════════
     § 3  CURSOR GLOW (desktop only)
     ══════════════════════════════════════════════════════════════ */
  function initCursorGlow() {
    // Skip entirely on touch/mobile devices — cursor glow is desktop-only
    const isTouchDevice = window.matchMedia('(pointer: coarse)').matches
      || !window.matchMedia('(hover: hover)').matches;

    if (isTouchDevice) {
      if (DOM.cursorGlow) DOM.cursorGlow.style.display = 'none';
      return;
    }

    let mouseX = -300, mouseY = -300;
    let glowX = -300, glowY = -300;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      
      const target = e.target;
      
      // Reset classes & labels
      DOM.cursorGlow.classList.remove('cursor-hover', 'cursor-edit', 'cursor-image');
      DOM.cursorGlow.textContent = '';
      
      if (!target) return;
      
      // Interactive element checks
      const isInteractive = target.closest('a, button, input, select, textarea, .nav__toggle, .filter-btn, .product-card__wishlist, .cart-item__remove, .qty-btn');
      
      if (state.isAdmin) {
        const editableText = target.closest('.editable-text, .editable-card-text');
        const editableImage = target.closest('.editable-image, .editable-card-image');
        
        if (editableText) {
          DOM.cursorGlow.classList.add('cursor-edit');
          DOM.cursorGlow.textContent = 'Edit';
        } else if (editableImage) {
          DOM.cursorGlow.classList.add('cursor-image');
          DOM.cursorGlow.textContent = 'Swap';
        } else if (isInteractive) {
          DOM.cursorGlow.classList.add('cursor-hover');
        }
      } else {
        if (isInteractive) {
          DOM.cursorGlow.classList.add('cursor-hover');
        }
      }
    });

    // Apple-quality spring lerp: frame-rate independent
    let lastTime = performance.now();
    const LERP = 0.10; // softer follow = more fluid
    function animate(currentTime) {
      const dt = Math.min((currentTime - lastTime) / 16.666, 4);
      lastTime = currentTime;

      const adjustedLerp = 1 - Math.pow(1 - LERP, dt);
      glowX += (mouseX - glowX) * adjustedLerp;
      glowY += (mouseY - glowY) * adjustedLerp;
      DOM.cursorGlow.style.transform = `translate(${glowX}px, ${glowY}px)`;
      requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
    
    // Real-time ambient card glow on mousemove
    document.addEventListener('mousemove', (e) => {
      const card = e.target.closest('.product-card, .testimonial-card, .blog-card');
      if (card) {
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width)  * 100;
        const y = ((e.clientY - rect.top)  / rect.height) * 100;
        card.style.setProperty('--mouse-x', `${x}%`);
        card.style.setProperty('--mouse-y', `${y}%`);
      }
    });
  }


  /* ══════════════════════════════════════════════════════════════
     § 4  FLOATING NAVIGATION
     ══════════════════════════════════════════════════════════════ */
  function initNavigation() {
    let lastScroll = 0;
    const threshold = 80;

    window.addEventListener('scroll', () => {
      const currentScroll = window.scrollY;
      if (currentScroll > threshold && currentScroll > lastScroll) {
        DOM.navWrapper.classList.add('nav--hidden');
      } else {
        DOM.navWrapper.classList.remove('nav--hidden');
      }
      lastScroll = currentScroll;
    }, { passive: true });

    // Mobile menu toggle
    DOM.navToggle.addEventListener('click', () => {
      const isOpen = DOM.navLinks.classList.toggle('open');
      DOM.navToggle.classList.toggle('active', isOpen);
      // Prevent body scroll when menu is open
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    const closeMenu = () => {
      DOM.navToggle.classList.remove('active');
      DOM.navLinks.classList.remove('open');
      document.body.style.overflow = '';
    };

    $$('.nav__link', DOM.navLinks).forEach(link => {
      link.addEventListener('click', closeMenu);
    });

    // Close menu on outside tap (mobile)
    document.addEventListener('click', (e) => {
      if (DOM.navLinks.classList.contains('open')
        && !DOM.navLinks.contains(e.target)
        && !DOM.navToggle.contains(e.target)) {
        closeMenu();
      }
    });

    const sections = $$('section[id]');
    const navLinksArr = $$('.nav__link');

    window.addEventListener('scroll', () => {
      const scrollPos = window.scrollY + 200;
      sections.forEach(section => {
        const top = section.offsetTop;
        const height = section.offsetHeight;
        const id = section.getAttribute('id');

        if (scrollPos >= top && scrollPos < top + height) {
          navLinksArr.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${id}`) {
              link.classList.add('active');
            }
          });
        }
      });
    }, { passive: true });
  }


  /* ══════════════════════════════════════════════════════════════
     § 5  SCROLL REVEAL (IntersectionObserver)
     ══════════════════════════════════════════════════════════════ */
  function initScrollReveal() {
    // On mobile, reduce rootMargin for earlier triggers (items enter viewport sooner)
    const isMobile = window.innerWidth < 640;
    const rootMarginBottom = isMobile ? '-20px' : '-50px';

    state.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            state.observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.08,
        rootMargin: `0px 0px ${rootMarginBottom} 0px`,
      }
    );

    // Observe all existing .reveal elements
    DOM.reveals.forEach(el => state.observer.observe(el));
  }


  /* ══════════════════════════════════════════════════════════════
     § 6  PRODUCT FILTERING
     ══════════════════════════════════════════════════════════════ */
  function initProductFilters() {
    // Apple-quality spring easing string
    const springEase = 'cubic-bezier(0.22, 1.1, 0.36, 1)';

    DOM.filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        DOM.filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.dataset.filter;
        const cards = $$('.product-card, .add-product-card');

        cards.forEach((card, i) => {
          // Add button card is always visible in admin mode, but does not have category
          if (card.classList.contains('add-product-card')) {
            card.style.display = filter === 'all' ? '' : 'none';
            return;
          }

          const category = card.dataset.category;
          const show = filter === 'all' || category === filter;

          if (show) {
            card.style.display = '';
            card.style.opacity = '0';
            card.style.transform = 'translateY(28px) scale(0.96)';
            card.style.filter = 'blur(6px)';
            const delay = i * 0.045;
            setTimeout(() => {
              card.style.transition = `opacity 0.65s ${delay}s ${springEase}, transform 0.65s ${delay}s ${springEase}, filter 0.65s ${delay}s ease`;
              card.style.opacity = '1';
              card.style.transform = 'translateY(0) scale(1)';
              card.style.filter = 'blur(0)';
            }, 20);
          } else {
            card.style.transition = 'opacity 0.25s ease, transform 0.25s ease, filter 0.25s ease';
            card.style.opacity = '0';
            card.style.transform = 'scale(0.94)';
            card.style.filter = 'blur(4px)';
            setTimeout(() => {
              card.style.display = 'none';
            }, 260);
          }
        });
      });
    });
  }


  /* ══════════════════════════════════════════════════════════════
     § 7  PARALLAX ORBS
     ══════════════════════════════════════════════════════════════ */
  function initParallaxOrbs() {
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const orbs = $$('.orb');
    const speeds = [0.02, 0.015, 0.01, 0.025];

    document.addEventListener('mousemove', (e) => {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const dx = (e.clientX - centerX);
      const dy = (e.clientY - centerY);

      orbs.forEach((orb, i) => {
        const speed = speeds[i] || 0.02;
        const x = dx * speed * (i % 2 === 0 ? 1 : -1);
        const y = dy * speed * (i % 2 === 0 ? -1 : 1);
        orb.style.transform = `translate(${x}px, ${y}px)`;
      });
    });
  }


  /* --- HERO IMAGE PARALLAX (scroll, spring-smoothed) --- */
  function initHeroParallax() {
    var heroImg = document.querySelector('.hero__image-wrapper img');
    if (!heroImg) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var currentY = 0, targetY = 0, raf = null;
    function tick() {
      currentY += (targetY - currentY) * 0.07;
      heroImg.style.transform = 'scale(1.08) translateY(' + currentY.toFixed(3) + 'px)';
      raf = Math.abs(targetY - currentY) > 0.05 ? requestAnimationFrame(tick) : null;
    }
    window.addEventListener('scroll', function() {
      targetY = window.scrollY * 0.22;
      if (!raf) raf = requestAnimationFrame(tick);
    }, { passive: true });
  }

  /* --- SLIDING NAV ACTIVE PILL --- */
  function initNavPill() {
    var nl = document.getElementById('navLinks');
    if (!nl || window.innerWidth < 969) return;
    var pill = document.createElement('div');
    pill.className = 'nav__active-pill';
    nl.style.position = 'relative';
    nl.insertBefore(pill, nl.firstChild);
    function moveTo(lk) {
      var pr = nl.getBoundingClientRect(), lr = lk.getBoundingClientRect();
      pill.style.width = (lr.width + 20) + 'px';
      pill.style.left  = (lr.left - pr.left - 10) + 'px';
      pill.style.opacity = '1';
    }
    nl.querySelectorAll('.nav__link').forEach(function(l) {
      l.addEventListener('mouseenter', function() { moveTo(l); });
    });
    nl.addEventListener('mouseleave', function() { pill.style.opacity = '0'; });
  }

  /* --- SCROLL VELOCITY DOT --- */
  function initScrollVelocity() {
    var dot = document.createElement('div');
    dot.className = 'scroll-velocity-dot';
    document.body.appendChild(dot);
    var lastY = 0, timer;
    window.addEventListener('scroll', function() {
      var y = window.scrollY, v = Math.abs(y - lastY);
      lastY = y;
      var sc = Math.min(1 + v * 0.1, 6);
      var pct = (y / Math.max(document.documentElement.scrollHeight - window.innerHeight, 1)) * 100;
      dot.style.top = Math.min(Math.max(pct, 4), 96) + '%';
      dot.style.opacity = '0.8';
      dot.style.transform = 'translateY(-50%) scale(' + sc + ')';
      clearTimeout(timer);
      timer = setTimeout(function() { dot.style.opacity='0'; dot.style.transform='translateY(-50%) scale(1)'; }, 700);
    }, { passive: true });
  }

  /* --- SPRING STAGGER REVEAL --- */
  function initSpringStagger() {
    var gs = document.querySelectorAll('[data-stagger-group]');
    if (!gs.length) return;
    var ob = new IntersectionObserver(function(entries) {
      entries.forEach(function(e) {
        if (!e.isIntersecting) return;
        var g = e.target;
        g.querySelectorAll('[data-stagger-item]').forEach(function(it, i) {
          it.style.transitionDelay = (i * parseFloat(g.dataset.staggerBase || 0.06)) + 's';
          it.style.transitionDuration = parseFloat(g.dataset.staggerDur || 0.85) + 's';
          it.classList.add('revealed');
        });
        ob.unobserve(g);
      });
    }, { threshold: 0.05, rootMargin: '0px 0px -20px 0px' });
    gs.forEach(function(g) { ob.observe(g); });
  }


  /* ══════════════════════════════════════════════════════════════
     § 8  3D CARD TILT — spring physics (desktop only)
     ══════════════════════════════════════════════════════════════ */
  function applySpringTilt(card) {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Inject 3D reflection shine overlay
    let shine = card.querySelector('.card-shine');
    if (!shine) {
      shine = document.createElement('div');
      shine.className = 'card-shine';
      card.appendChild(shine);
    }

    // Spring state per card
    let rotX = 0, rotY = 0, lift = 0;
    let targetRotX = 0, targetRotY = 0, targetLift = 0;
    let raf = null;
    const MAX_TILT = 8; // degrees
    const LIFT_PX = 18;
    const SPRING = 0.12;

    function tick() {
      rotX  += (targetRotX  - rotX)  * SPRING;
      rotY  += (targetRotY  - rotY)  * SPRING;
      lift  += (targetLift  - lift)  * SPRING;

      card.style.transform =
        `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-${lift}px) scale(${1 + lift * 0.0006})`;

      if (Math.abs(targetRotX - rotX) > 0.01 ||
          Math.abs(targetRotY - rotY) > 0.01 ||
          Math.abs(targetLift - lift) > 0.01) {
        raf = requestAnimationFrame(tick);
      } else {
        raf = null;
      }
    }

    card.addEventListener('mouseenter', () => {
      targetLift = LIFT_PX;
      card.style.zIndex = '10';
      card.style.transition = 'box-shadow 0.4s ease';
      card.style.boxShadow = '0 32px 72px rgba(70, 50, 30, 0.22), inset 0 1px 0 rgba(255,255,255,0.5)';
      if (!raf) raf = requestAnimationFrame(tick);
    });

    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = rect.width  / 2;
      const cy = rect.height / 2;
      targetRotX = -((y - cy) / cy) * MAX_TILT;
      targetRotY =  ((x - cx) / cx) * MAX_TILT;

      // Dynamic light sweep reflection coordinate calculation
      const shineX = (x / rect.width) * 100;
      const shineY = (y / rect.height) * 100;
      shine.style.background = `radial-gradient(circle at ${shineX}% ${shineY}%, rgba(255, 255, 255, 0.3) 0%, transparent 60%)`;

      if (!raf) raf = requestAnimationFrame(tick);
    });

    card.addEventListener('mouseleave', () => {
      targetRotX = 0;
      targetRotY = 0;
      targetLift = 0;
      card.style.boxShadow = '';
      setTimeout(() => { card.style.zIndex = ''; }, 400);
      if (!raf) raf = requestAnimationFrame(tick);
    });
  }

  function initCardTilt() {
    const staticCards = $$('.testimonial-card, .blog-card');
    staticCards.forEach(card => applySpringTilt(card));
  }


  /* ══════════════════════════════════════════════════════════════
     § 9  WISHLIST TOGGLE (Static fallback)
     ══════════════════════════════════════════════════════════════ */
  function initWishlist() {
    // Dynamic cards are handled individually inside bindSingleCardEvents.
    // This is a safety catch.
  }


  /* ══════════════════════════════════════════════════════════════
     § 10  NEWSLETTER FORM
     ══════════════════════════════════════════════════════════════ */
  function initNewsletter() {
    if (!DOM.newsletterForm) return;
    DOM.newsletterForm.addEventListener('submit', (e) => {
      const action = DOM.newsletterForm.getAttribute('action');
      const email = $('#newsletterEmail').value;
      if (!email) {
        e.preventDefault();
        return;
      }

      const submitBtn = $('#newsletterSubmit');
      const originalText = submitBtn.textContent;

      if (action && action !== '#' && action !== '') {
        // Form submits naturally to Mailchimp in a new tab
        submitBtn.textContent = '✓ Connecting...';
        submitBtn.style.background = 'linear-gradient(135deg, var(--color-gold), var(--color-gold-light))';
        submitBtn.disabled = true;

        setTimeout(() => {
          submitBtn.textContent = originalText;
          submitBtn.style.background = '';
          submitBtn.disabled = false;
          $('#newsletterEmail').value = '';
        }, 3000);
        return;
      }

      e.preventDefault();
      submitBtn.textContent = '✓ Subscribed!';
      submitBtn.style.background = 'linear-gradient(135deg, var(--color-gold), var(--color-gold-light))';
      submitBtn.disabled = true;

      setTimeout(() => {
        submitBtn.textContent = originalText;
        submitBtn.style.background = '';
        submitBtn.disabled = false;
        $('#newsletterEmail').value = '';
      }, 3000);
    });
  }


  /* ══════════════════════════════════════════════════════════════
     § 11  SMOOTH ANCHOR SCROLLING
     ══════════════════════════════════════════════════════════════ */
  function initSmoothScroll() {
    $$('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        const href = anchor.getAttribute('href');
        if (href === '#') return;
        const target = $(href);
        if (!target) return;

        e.preventDefault();
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      });
    });
  }


  /* ══════════════════════════════════════════════════════════════
     § 12  IMAGE FALLBACK SYSTEM
     ══════════════════════════════════════════════════════════════ */
  function initImageFallbacks() {
    // Dynamic elements binding handles this inside bindSingleCardEvents.
  }


  /* ══════════════════════════════════════════════════════════════
     § 13  MAGNETIC BUTTON EFFECT
     ══════════════════════════════════════════════════════════════ */
  function initMagneticButtons() {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const magneticEls = $$('.btn-primary, .btn-secondary, .nav__cta');

    magneticEls.forEach(el => {
      const inner = $('.btn-magnetic-inner', el);
      if (!inner) return;

      let bx = 0, by = 0, targetBx = 0, targetBy = 0;
      let raf = null;
      const STRENGTH = 0.3;
      const SPRING = 0.14;

      function tick() {
        bx += (targetBx - bx) * SPRING;
        by += (targetBy - by) * SPRING;
        inner.style.transform = `translate(${bx}px, ${by}px)`;
        if (Math.abs(targetBx - bx) > 0.05 || Math.abs(targetBy - by) > 0.05) {
          raf = requestAnimationFrame(tick);
        } else {
          inner.style.transform = `translate(${targetBx}px, ${targetBy}px)`;
          raf = null;
        }
      }

      el.addEventListener('mousemove', e => {
        const rect = el.getBoundingClientRect();
        targetBx = (e.clientX - rect.left - rect.width  / 2) * STRENGTH;
        targetBy = (e.clientY - rect.top  - rect.height / 2) * STRENGTH;
        if (!raf) raf = requestAnimationFrame(tick);
      });

      el.addEventListener('mouseleave', () => {
        targetBx = 0;
        targetBy = 0;
        if (!raf) raf = requestAnimationFrame(tick);
      });
    });
  }


  /* ══════════════════════════════════════════════════════════════
     § 14  STAGGERED COUNTER ANIMATION
     ══════════════════════════════════════════════════════════════ */
  function initCounterAnimation() {
    const counters = $$('.stat-number');
    const observed = new Set();

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !observed.has(entry.target)) {
          observed.add(entry.target);
          animateCounter(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(counter => observer.observe(counter));

    function animateCounter(el) {
      const text = el.textContent;
      const match = text.match(/([\d,]+)/);
      if (!match) return;

      const target = parseInt(match[1].replace(/,/g, ''));
      const suffix = text.replace(match[1], '').trim();
      const prefix = text.substring(0, text.indexOf(match[1]));
      const duration = 2000;
      const startTime = performance.now();

      function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 4); // easeOutQuart
        const current = Math.round(eased * target);

        el.textContent = `${prefix}${current.toLocaleString()}${suffix}`;

        if (progress < 1) {
          requestAnimationFrame(update);
        } else {
          el.textContent = text;
        }
      }
      requestAnimationFrame(update);
    }
  }


  /* ══════════════════════════════════════════════════════════════
     § 15  FLOATING PARTICLE SYSTEM
     ══════════════════════════════════════════════════════════════ */
  function initParticles() {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const canvas = document.createElement('canvas');
    canvas.style.cssText = `
      position: fixed; inset: 0; z-index: -1; pointer-events: none;
      opacity: 0.75;
    `;
    document.body.insertBefore(canvas, document.body.firstChild);

    const ctx = canvas.getContext('2d');
    let particles = [];
    const PARTICLE_COUNT = 55;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    class Particle {
      constructor() {
        this.reset(true);
      }
      reset(init = false) {
        this.x = Math.random() * canvas.width;
        // Start slightly off-screen when resetting mid-animation
        this.y = init ? Math.random() * canvas.height : Math.random() * -100;
        
        this.size = Math.random() * 1.8 + 0.6; // slightly larger for visibility
        this.speedX = (Math.random() - 0.4) * 0.15; // slower horizontal drift
        this.speedY = Math.random() * 0.25 + 0.15;   // slower falling velocity
        
        this.opacity = Math.random() * 0.45 + 0.25; // higher baseline opacity
        this.life = Math.random() * 450 + 250;      // longer lifespan for slow movement
        this.maxLife = this.life;
        this.angle = Math.random() * Math.PI;
        this.spinSpeed = (Math.random() - 0.5) * 0.008; // slower spin
        
        const colors = [
          'rgba(196, 150, 90, ',  // Gold (#C4965A)
          'rgba(216, 175, 120, ', // Gold Light (#D8AF78)
          'rgba(212, 160, 160, ', // Rose (#d4a0a0)
          'rgba(250, 247, 242, '  // Cream (#FAF7F2)
        ];
        this.colorBase = colors[Math.floor(Math.random() * colors.length)];
        
        // 10% chance of being a fast shooting star
        this.isShootingStar = Math.random() < 0.10;
        if (this.isShootingStar) {
          this.x = Math.random() * (canvas.width * 0.5);
          this.y = Math.random() * (canvas.height * 0.3) - 50;
          this.speedX = Math.random() * 3.2 + 2.4; // slower than before but still swift
          this.speedY = Math.random() * 1.8 + 1.2;
          this.size = Math.random() * 2.2 + 1;
          this.life = Math.random() * 60 + 40; // slightly longer duration to be clearly visible
          this.maxLife = this.life;
          this.opacity = Math.random() * 0.75 + 0.4;
        }
      }
      update(dt) {
        this.x += this.speedX * dt;
        this.y += this.speedY * dt;
        this.life -= dt;
        this.angle += this.spinSpeed * dt;

        // Wrap falling stars horizontally
        if (!this.isShootingStar) {
          if (this.x < -20) this.x = canvas.width + 20;
          if (this.x > canvas.width + 20) this.x = -20;
        }

        const lifeRatio = this.life / this.maxLife;
        if (lifeRatio > 0.8) {
          this.currentOpacity = this.opacity * ((1 - lifeRatio) / 0.2);
        } else if (lifeRatio < 0.2) {
          this.currentOpacity = this.opacity * (lifeRatio / 0.2);
        } else {
          this.currentOpacity = this.opacity;
        }

        // Add twinkling sine wave fluctuation to falling stars
        if (!this.isShootingStar) {
          this.currentOpacity *= (0.7 + Math.sin(this.life * 0.055) * 0.3);
        }

        if (this.life <= 0 || this.y > canvas.height + 20 || this.x > canvas.width + 20) {
          this.reset(false);
        }
      }
      draw() {
        ctx.save();
        if (this.isShootingStar) {
          // Draw fast shooting star trace line
          ctx.beginPath();
          ctx.strokeStyle = this.colorBase + this.currentOpacity + ')';
          ctx.lineWidth = this.size;
          ctx.lineCap = 'round';
          ctx.moveTo(this.x, this.y);
          ctx.lineTo(this.x - this.speedX * 3.5, this.y - this.speedY * 3.5);
          ctx.stroke();
        } else {
          // Draw elegant, concave 4-pointed sparkle (matching modern vector ✦)
          ctx.beginPath();
          ctx.translate(this.x, this.y);
          ctx.rotate(this.angle);
          
          const outerRadius = this.size * 2.8;
          
          ctx.moveTo(0, -outerRadius);
          ctx.quadraticCurveTo(0, 0, outerRadius, 0);
          ctx.quadraticCurveTo(0, 0, 0, outerRadius);
          ctx.quadraticCurveTo(0, 0, -outerRadius, 0);
          ctx.quadraticCurveTo(0, 0, 0, -outerRadius);
          ctx.closePath();
          
          ctx.fillStyle = this.colorBase + this.currentOpacity + ')';
          ctx.shadowBlur = 4;
          ctx.shadowColor = this.colorBase + '0.3)';
          ctx.fill();
        }
        ctx.restore();
      }
    }

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(new Particle());
    }

    let lastTime = performance.now();
    function animate(currentTime) {
      const dt = Math.min((currentTime - lastTime) / 16.666, 4);
      lastTime = currentTime;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.update(dt);
        p.draw();
      });
      requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
  }


  /* ══════════════════════════════════════════════════════════════
     § 16  DYNAMIC CARD BINDING (Helps dynamic product catalog)
     ══════════════════════════════════════════════════════════════ */
  function bindSingleCardEvents(card) {
    // 3D Card Tilt (Spring-physics based)
    applySpringTilt(card);

    // Wishlist Toggle (CSS heart-pop spring animation)
    const wishlistBtn = card.querySelector('.product-card__wishlist');
    if (wishlistBtn) {
      wishlistBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isFilled = wishlistBtn.textContent.trim() === '♥';
        wishlistBtn.textContent = isFilled ? '♡' : '♥';
        wishlistBtn.style.color = isFilled ? '' : 'var(--color-rose)';

        wishlistBtn.classList.remove('heart-pop');
        void wishlistBtn.offsetWidth; // Force reflow to restart CSS animation
        wishlistBtn.classList.add('heart-pop');
        
        wishlistBtn.addEventListener('animationend', () => {
          wishlistBtn.classList.remove('heart-pop');
        }, { once: true });
      });
    }

    // Image Fallbacks
    const img = card.querySelector('img');
    if (img) {
      img.addEventListener('error', function () {
        const src = this.getAttribute('src') || '';
        const fallbacks = {
          'vase':    { gradient: 'linear-gradient(160deg, #f5efe5 0%, #e8ddd0 40%, #d4c5b2 100%)', icon: '🏺', label: 'Vase' },
          'lamp':    { gradient: 'linear-gradient(160deg, #faf3e8 0%, #eee3d0 40%, #ddd0b8 100%)', icon: '💡', label: 'Lamp' },
          'chair':   { gradient: 'linear-gradient(160deg, #ede5d8 0%, #ddd0be 40%, #cec0a8 100%)', icon: '🪑', label: 'Chair' },
          'candle':  { gradient: 'linear-gradient(160deg, #f0e8dc 0%, #e2d6c4 40%, #d4c8b2 100%)', icon: '🕯️', label: 'Candle' },
          'throw':   { gradient: 'linear-gradient(160deg, #f5f0e8 0%, #e8e0d4 40%, #dbd2c2 100%)', icon: '🧶', label: 'Throw' },
          'pendant': { gradient: 'linear-gradient(160deg, #ede4d5 0%, #ddd2be 40%, #cec2a8 100%)', icon: '🔆', label: 'Pendant' },
        };
        const key = Object.keys(fallbacks).find(k => src.includes(k));
        const fb = key ? fallbacks[key] : {
          gradient: 'linear-gradient(160deg, #ede5d8 0%, #ddd0be 100%)',
          icon: '✦',
          label: ''
        };

        const wrapper = this.parentElement;
        wrapper.style.background = fb.gradient;
        wrapper.style.display = 'flex';
        wrapper.style.alignItems = 'center';
        wrapper.style.justifyContent = 'center';
        wrapper.style.flexDirection = 'column';
        wrapper.style.gap = '0.75rem';
        wrapper.style.position = 'relative';
        wrapper.style.overflow = 'hidden';

        const decorCircle = document.createElement('div');
        decorCircle.style.cssText = `
          position: absolute; width: 60%; height: 60%; border-radius: 50%;
          background: radial-gradient(circle, rgba(255,255,255,0.15), transparent 70%);
          top: 20%; left: 20%;
        `;
        wrapper.appendChild(decorCircle);

        const iconEl = document.createElement('span');
        iconEl.textContent = fb.icon;
        iconEl.style.cssText = 'font-size: 3rem; position: relative; z-index: 1; opacity: 0.75;';
        wrapper.appendChild(iconEl);

        if (fb.label) {
          const labelEl = document.createElement('span');
          labelEl.textContent = fb.label;
          labelEl.style.cssText = `
            font-family: 'Playfair Display', serif; font-size: 0.85rem; font-weight: 500;
            color: rgba(26,16,8,0.35); letter-spacing: 0.08em; text-transform: uppercase;
            position: relative; z-index: 1;
          `;
          wrapper.appendChild(labelEl);
        }

        this.style.display = 'none';
      });
    }
  }

  function rebindCardEvents() {
    const cards = $$('.product-card, .add-product-card');
    cards.forEach(card => {
      if (!card.classList.contains('add-product-card')) {
        bindSingleCardEvents(card);
      }
      if (state.observer) {
        state.observer.observe(card);
      }
    });
  }


  /* ══════════════════════════════════════════════════════════════
     § 17  DYNAMIC PRODUCTS RENDER ENGINE
     ══════════════════════════════════════════════════════════════ */
  function renderProducts(filter = 'all') {
    if (!DOM.productsGrid) return;

    DOM.productsGrid.innerHTML = '';

    // If admin is active, prepend "Add Product Card"
    if (state.isAdmin) {
      const addCard = document.createElement('div');
      addCard.className = 'add-product-card reveal reveal-delay-1';
      addCard.innerHTML = `
        <div class="add-product-card__icon">＋</div>
        <h3 class="add-product-card__title">Add Product</h3>
        <p class="add-product-card__desc">Add a new item to the collection catalog</p>
      `;
      addCard.addEventListener('click', () => openAdminModal(null));
      DOM.productsGrid.appendChild(addCard);
    }

    const filtered = state.products.filter(p => filter === 'all' || p.category === filter);

    filtered.forEach((p, index) => {
      const card = document.createElement('article');
      card.className = `product-card reveal reveal-delay-${(index % 6) + 1}`;
      card.dataset.category = p.category;
      card.id = p.id;

      // Colors HSL/Hex rendering
      let colorsHtml = '';
      if (p.colors && p.colors.length > 0) {
        colorsHtml = `<div class="product-card__colors">`;
        p.colors.forEach(col => {
          colorsHtml += `<span class="product-card__color-dot" style="background:${col.trim()}" title="${col.trim()}"></span>`;
        });
        colorsHtml += `</div>`;
      }

      const badgeHtml = p.badge ? `<span class="product-card__badge">${p.badge}</span>` : '';
      const priceOrigHtml = p.originalPrice ? `<span class="original">$${p.originalPrice.toLocaleString()}</span>` : '';
      const editBtnHtml = state.isAdmin ? `<button class="product-card__edit-btn" data-id="${p.id}">Edit</button>` : '';

      const btnText = p.buttonText || 'Add to Bag';
      const buyBtnHtml = `<button class="product-card__add-to-cart" data-id="${p.id}" aria-label="Add to bag">${btnText}</button>`;

      card.innerHTML = `
        <div class="product-card__image">
          <img src="${p.image}" alt="${p.name}" loading="lazy" />
          ${badgeHtml}
          <button class="product-card__wishlist" aria-label="Add to wishlist">♡</button>
          ${buyBtnHtml}
          ${editBtnHtml}
        </div>
        <div class="product-card__info">
          <p class="product-card__category">${p.category}</p>
          <h3 class="product-card__name">${p.name}</h3>
          <p class="product-card__desc">${p.description || ''}</p>
          <div class="product-card__scarcity">⚡ Only 10 copies left at this price!</div>
          <div class="product-card__price">
            <span class="current">$${p.price.toLocaleString()}</span>
            ${priceOrigHtml}
            ${p.discountText ? `<span class="discount-calc" style="font-size:0.85rem; color:rgba(26,16,8,0.55); font-weight:500; margin-left:0.4rem;">(${p.discountText})</span>` : ''}
          </div>
          ${p.discountCode ? `<div class="product-card__promo-code">Promo Code: <strong>${p.discountCode}</strong></div>` : ''}
          <ul class="product-card__features" style="margin-top: 0.75rem; margin-bottom: 0.25rem; display: flex; flex-direction: column; gap: 0.35rem; font-size: 0.78rem; color: var(--color-ink-soft); list-style: none; padding: 0;">
            <li style="display: flex; align-items: center; gap: 0.4rem;"><span style="color: var(--color-gold); font-weight: 700;">✓</span> Instant Email Delivery</li>
            <li style="display: flex; align-items: center; gap: 0.4rem;"><span style="color: var(--color-gold); font-weight: 700;">✓</span> Lifetime Access & Free Updates</li>
            <li style="display: flex; align-items: center; gap: 0.4rem;"><span style="color: var(--color-gold); font-weight: 700;">✓</span> Works with Free & Pro Canva</li>
          </ul>
          ${colorsHtml}
        </div>
      `;

      if (state.isAdmin) {
        const editBtn = card.querySelector('.product-card__edit-btn');
        if (editBtn) {
          editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            openAdminModal(p.id);
          });
        }
      }

      // Make entire card clickable to open cart and add item (great for mobile/tablet usability)
      card.addEventListener('click', (e) => {
        // If clicking on edit button or wishlist, do not trigger cart addition
        if (e.target.closest('.product-card__edit-btn') || e.target.closest('.product-card__wishlist')) {
          return;
        }
        addToCart(p.id);
        DOM.cartSidebar.classList.add('open');
      });

      DOM.productsGrid.appendChild(card);
    });

    rebindCardEvents();
  }


  /* ══════════════════════════════════════════════════════════════
     § 18  ADMIN MODULE & AUTHENTICATION
     ══════════════════════════════════════════════════════════════ */
  function toggleModal(modal, show) {
    if (!modal) return;
    if (show) {
      modal.classList.add('open');
      document.body.style.overflow = 'hidden';
    } else {
      modal.classList.remove('open');
      document.body.style.overflow = '';
    }
  }

  function checkAdminSession() {
    const adminConfig = $('#newsletterAdminConfig');
    const actionInput = $('#newsletterActionInput');
    const chatbotKeyInput = $('#chatbotKeyInput');

    if (state.isAdmin) {
      document.body.classList.add('admin-active');
      DOM.navAdmin.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-gold)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`;
      if (adminConfig && actionInput) {
        adminConfig.style.display = 'block';
        actionInput.value = state.layout['newsletter-action'] || '';
        if (chatbotKeyInput) {
          chatbotKeyInput.value = state.layout['chatbot-key'] || '';
        }
      }
    } else {
      document.body.classList.remove('admin-active');
      DOM.navAdmin.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`;
      if (adminConfig) {
        adminConfig.style.display = 'none';
      }
    }
    applyLayout();
    renderTestimonials();
    renderBlog();
  }

  function applyLayout() {
    // 1. Text elements
    $$('.editable-text').forEach(el => {
      const key = el.dataset.layoutKey;
      if (key && state.layout[key] !== undefined) {
        // We use innerHTML only for keys that might have tags like hero-title, highlight-title, or footer-copy
        const useHTML = ['hero-title', 'highlight-title', 'footer-copy'].includes(key);
        if (useHTML) {
          el.innerHTML = state.layout[key];
        } else {
          el.textContent = state.layout[key];
        }
      }
      
      // Toggle contenteditable
      if (state.isAdmin) {
        el.setAttribute('contenteditable', 'true');
      } else {
        el.removeAttribute('contenteditable');
      }
      
      bindEditableTextEvents(el);
    });

    // 2. Image elements
    $$('.editable-image').forEach(el => {
      const key = el.dataset.layoutKey;
      if (key && state.layout[key] !== undefined) {
        el.src = state.layout[key];
      }
    });

    // 3. Render Brand Strip Marquee dynamically
    renderMarquee();

    // 4. Update newsletter form action URL
    const newsletterForm = $('#newsletterForm');
    if (newsletterForm) {
      newsletterForm.setAttribute('action', state.layout['newsletter-action'] || '#');
    }
  }

  function renderMarquee() {
    const track = $('#brandTrack');
    if (!track) return;
    
    // Gather items
    const items = [];
    for (let i = 1; i <= 8; i++) {
      const key = `brand-item-${i}`;
      if (state.layout[key] !== undefined) {
        items.push(state.layout[key]);
      }
    }
    
    // Construct HTML
    let html = '';
    // Build twice for seamless scrolling marquee
    for (let loop = 0; loop < 2; loop++) {
      items.forEach((item, idx) => {
        const itemIndex = idx + 1;
        html += `<span class="brand-strip__item editable-text" data-layout-key="brand-item-${itemIndex}">${item} <span class="brand-strip__dot"></span></span>`;
      });
    }
    
    track.innerHTML = html;
    
    // Re-bind contenteditable and event listeners for brand-items
    $$('.editable-text', track).forEach(el => {
      if (state.isAdmin) {
        el.setAttribute('contenteditable', 'true');
      }
      bindEditableTextEvents(el);
    });
  }

  function bindEditableTextEvents(el) {
    if (el.dataset.bound === 'true') return;
    el.dataset.bound = 'true';

    el.addEventListener('blur', () => {
      const key = el.dataset.layoutKey;
      if (key) {
        const newVal = sanitizeHTML(el.innerHTML.trim());
        if (el.innerHTML !== newVal) {
          el.innerHTML = newVal;
        }
        state.layout[key] = newVal;
        saveLayout();
        triggerSaveIndicator();
        
        // Keep brand-strip duplicates in sync
        if (key.startsWith('brand-item-')) {
          $$(`[data-layout-key="${key}"]`).forEach(match => {
            if (match !== el) {
              match.innerHTML = newVal;
            }
          });
        }
      }
    });

    el.addEventListener('keydown', (e) => {
      // Prevent Enter key in single-line items
      const multiLineFields = ['hero-title', 'hero-desc', 'highlight-desc', 'products-subtitle', 'footer-tagline', 'testimonials-subtitle', 'journal-subtitle'];
      const key = el.dataset.layoutKey;
      if (e.key === 'Enter' && !multiLineFields.includes(key)) {
        e.preventDefault();
        el.blur();
      }
    });
  }

  function renderTestimonials() {
    const grid = DOM.testimonialsGrid;
    if (!grid) return;
    
    grid.innerHTML = '';
    
    // If admin is active, prepend "Add Testimonial" card
    if (state.isAdmin) {
      const addCard = document.createElement('div');
      addCard.className = 'add-testimonial-card reveal reveal-delay-1';
      addCard.innerHTML = `
        <div class="add-card__icon">＋</div>
        <h3 class="add-card__title">Add Story</h3>
        <p class="add-card__desc">Add a new client testimonial story</p>
      `;
      addCard.addEventListener('click', () => {
        const newTestim = {
          id: `testimonial-${Date.now()}`,
          stars: 5,
          quote: "Click here to write your custom testimonial quote. It is fully editable.",
          authorName: "New Client",
          authorRole: "Interior Designer",
          avatar: "N"
        };
        state.testimonials.push(newTestim);
        saveTestimonials();
        renderTestimonials();
        triggerSaveIndicator();
      });
      grid.appendChild(addCard);
      if (state.observer) {
        state.observer.observe(addCard);
      }
    }
    
    state.testimonials.forEach((t, i) => {
      const card = document.createElement('div');
      card.className = `testimonial-card reveal reveal-delay-${(i % 3) + 1}`;
      card.id = t.id;
      
      const deleteBtn = state.isAdmin ? `<button class="card-delete-btn" data-id="${t.id}" aria-label="Delete">&times;</button>` : '';
      
      const isImg = t.avatar && (t.avatar.startsWith('http') || t.avatar.startsWith('assets/') || t.avatar.includes('.png') || t.avatar.includes('.jpg'));
      const avatarContent = isImg 
        ? `<img src="${t.avatar}" alt="${t.authorName}" style="width:100%; height:100%; object-fit:cover; display:block; border-radius:50%;" />`
        : t.avatar;

      card.innerHTML = `
        ${deleteBtn}
        <div class="testimonial-card__stars">★ ★ ★ ★ ★</div>
        <p class="testimonial-card__quote ${state.isAdmin ? 'editable-card-text' : ''}" data-id="${t.id}" data-field="quote" ${state.isAdmin ? 'contenteditable="true"' : ''}>
          ${t.quote}
        </p>
        <div class="testimonial-card__author">
          <div class="testimonial-card__avatar ${state.isAdmin ? 'editable-card-text' : ''}" data-id="${t.id}" data-field="avatar" ${state.isAdmin ? 'contenteditable="true"' : ''}>${avatarContent}</div>
          <div>
            <div class="testimonial-card__name ${state.isAdmin ? 'editable-card-text' : ''}" data-id="${t.id}" data-field="authorName" ${state.isAdmin ? 'contenteditable="true"' : ''}>${t.authorName}</div>
            <div class="testimonial-card__role ${state.isAdmin ? 'editable-card-text' : ''}" data-id="${t.id}" data-field="authorRole" ${state.isAdmin ? 'contenteditable="true"' : ''}>${t.authorRole}</div>
          </div>
        </div>
      `;
      
      if (state.isAdmin) {
        const del = card.querySelector('.card-delete-btn');
        del.addEventListener('click', (e) => {
          e.stopPropagation();
          if (confirm('Are you sure you want to delete this testimonial?')) {
            state.testimonials = state.testimonials.filter(item => item.id !== t.id);
            saveTestimonials();
            renderTestimonials();
            triggerSaveIndicator();
          }
        });
      }
      
      grid.appendChild(card);
      if (state.observer) {
        state.observer.observe(card);
      }
    });

    // Rebind tilt animations
    initCardTilt();
    
    // Bind inline editors for Testimonials
    if (state.isAdmin) {
      $$('.editable-card-text', grid).forEach(el => {
        el.addEventListener('blur', () => {
          const id = el.dataset.id;
          const field = el.dataset.field;
          const useHTML = field === 'quote';
          const newVal = sanitizeHTML(useHTML ? el.innerHTML.trim() : el.innerText.trim());
          if (useHTML) {
            el.innerHTML = newVal;
          } else {
            el.innerText = newVal;
          }
          const item = state.testimonials.find(t => t.id === id);
          if (item && field) {
            item[field] = newVal;
            saveTestimonials();
            triggerSaveIndicator();
          }
        });
        
        el.addEventListener('keydown', (e) => {
          const field = el.dataset.field;
          if (e.key === 'Enter' && field !== 'quote') {
            e.preventDefault();
            el.blur();
          }
        });
      });
    }
  }

  function renderBlog() {
    const grid = DOM.journalGrid;
    if (!grid) return;
    
    grid.innerHTML = '';
    
    state.blog.forEach((b, i) => {
      const card = document.createElement('article');
      card.className = `blog-card reveal reveal-delay-${(i % 3) + 1}`;
      card.id = b.id;
      
      const deleteBtn = state.isAdmin ? `<button class="card-delete-btn" data-id="${b.id}" aria-label="Delete">&times;</button>` : '';
      
      card.innerHTML = `
        ${deleteBtn}
        <div class="blog-card__image">
          <img src="${b.image}" alt="${b.title}" loading="lazy" class="${state.isAdmin ? 'editable-card-image' : ''}" data-id="${b.id}" />
        </div>
        <div class="blog-card__body">
          <div class="blog-card__meta">
            <span class="blog-card__tag ${state.isAdmin ? 'editable-card-text' : ''}" data-id="${b.id}" data-field="category" ${state.isAdmin ? 'contenteditable="true"' : ''}>${b.category}</span>
            <span class="blog-card__date ${state.isAdmin ? 'editable-card-text' : ''}" data-id="${b.id}" data-field="date" ${state.isAdmin ? 'contenteditable="true"' : ''}>${b.date}</span>
          </div>
          <h3 class="blog-card__title ${state.isAdmin ? 'editable-card-text' : ''}" data-id="${b.id}" data-field="title" ${state.isAdmin ? 'contenteditable="true"' : ''}>${b.title}</h3>
          <p class="blog-card__excerpt ${state.isAdmin ? 'editable-card-text' : ''}" data-id="${b.id}" data-field="excerpt" ${state.isAdmin ? 'contenteditable="true"' : ''}>${b.excerpt}</p>
          <span class="blog-card__read-more">
            Read More
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </span>
        </div>
      `;
      
      if (state.isAdmin) {
        const del = card.querySelector('.card-delete-btn');
        del.addEventListener('click', (e) => {
          e.stopPropagation();
          if (confirm('Are you sure you want to delete this blog post?')) {
            state.blog = state.blog.filter(item => item.id !== b.id);
            saveBlog();
            renderBlog();
            triggerSaveIndicator();
          }
        });
        
        // Clicking blog image triggers image selector
        const img = card.querySelector('.editable-card-image');
        if (img) {
          img.addEventListener('click', () => {
            state.activeBlogImageId = b.id;
            state.activeImageKey = null;
            DOM.adminGeneralImageInput.click();
          });
        }
      }
      
      grid.appendChild(card);
      if (state.observer) {
        state.observer.observe(card);
      }
    });
    
    // If admin is active, append "Add Blog" card
    if (state.isAdmin) {
      const addCard = document.createElement('div');
      addCard.className = 'add-blog-card reveal reveal-delay-1';
      addCard.innerHTML = `
        <div class="add-card__icon">＋</div>
        <h3 class="add-card__title">Add Article</h3>
        <p class="add-card__desc">Add a new journal blog article</p>
      `;
      addCard.addEventListener('click', () => {
        const newBlog = {
          id: `blog-${Date.now()}`,
          image: 'assets/blog-wabi-sabi.svg',
          category: 'New Category',
          date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
          title: 'Click here to write your custom article title.',
          excerpt: 'Click here to write a brief summary of the new article. You can replace the image by clicking on it.'
        };
        state.blog.push(newBlog);
        saveBlog();
        renderBlog();
        triggerSaveIndicator();
      });
      grid.appendChild(addCard);
      if (state.observer) {
        state.observer.observe(addCard);
      }
    }

    // Rebind tilt animations
    initCardTilt();
    
    // Bind inline editors for Blog Posts
    if (state.isAdmin) {
      $$('.editable-card-text', grid).forEach(el => {
        el.addEventListener('blur', () => {
          const id = el.dataset.id;
          const field = el.dataset.field;
          const useHTML = ['title', 'excerpt'].includes(field);
          const newVal = sanitizeHTML(useHTML ? el.innerHTML.trim() : el.innerText.trim());
          if (useHTML) {
            el.innerHTML = newVal;
          } else {
            el.innerText = newVal;
          }
          const item = state.blog.find(b => b.id === id);
          if (item && field) {
            item[field] = newVal;
            saveBlog();
            triggerSaveIndicator();
          }
        });
        
        el.addEventListener('keydown', (e) => {
          const field = el.dataset.field;
          if (e.key === 'Enter' && field !== 'title' && field !== 'excerpt') {
            e.preventDefault();
            el.blur();
          }
        });
      });
    }
  }

  function openAdminModal(productId) {
    if (productId === null) {
      // Add Product Mode
      DOM.adminModalTitle.textContent = 'Add New Product';
      DOM.adminSubmitText.textContent = 'Add Product';
      DOM.adminProductId.value = '';
      DOM.adminForm.reset();
      DOM.adminImageData.value = '';
      if (DOM.adminLink) DOM.adminLink.value = '';
      DOM.uploadFilename.style.display = 'none';
      DOM.adminDeleteBtn.style.display = 'none';
    } else {
      // Edit Product Mode
      const p = state.products.find(item => item.id === productId);
      if (!p) return;

      DOM.adminModalTitle.textContent = 'Edit Product';
      DOM.adminSubmitText.textContent = 'Save Changes';
      DOM.adminProductId.value = p.id;
      DOM.adminName.value = p.name;
      DOM.adminPrice.value = p.price;
      DOM.adminCategory.value = p.category;
      DOM.adminColors.value = p.colors ? p.colors.join(', ') : '';
      if (DOM.adminLink) DOM.adminLink.value = p.link || '';
      DOM.adminImageData.value = ''; // stays empty unless they upload a new file
      DOM.uploadFilename.textContent = p.image.startsWith('data:') ? 'Custom Uploaded File' : p.image.substring(p.image.lastIndexOf('/') + 1);
      DOM.uploadFilename.style.display = 'block';
      DOM.adminDeleteBtn.style.display = 'block';
    }
    toggleModal(DOM.adminModal, true);
  }

  function initAdminMode() {
    // Open login screen
    DOM.navAdmin.addEventListener('click', (e) => {
      e.preventDefault();
      if (state.isAdmin) {
        window.location.hash = '#products';
      } else {
        DOM.loginUser.value = '';
        DOM.loginPass.value = '';
        DOM.loginError.textContent = '';
        toggleModal(DOM.loginModal, true);
      }
    });

    // Close Modals
    DOM.loginClose.addEventListener('click', () => toggleModal(DOM.loginModal, false));
    DOM.adminClose.addEventListener('click', () => toggleModal(DOM.adminModal, false));

    DOM.loginModal.addEventListener('click', (e) => {
      if (e.target === DOM.loginModal) toggleModal(DOM.loginModal, false);
    });
    DOM.adminModal.addEventListener('click', (e) => {
      if (e.target === DOM.adminModal) toggleModal(DOM.adminModal, false);
    });

    // Authenticate Form Submit with SHA-256 Hashing
    DOM.loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const user = DOM.loginUser.value.trim();
      const pass = DOM.loginPass.value.trim();

      const hashedInput = await hashString(pass);

      if (user === 'homedecor' && hashedInput === PASSKEY_HASH) {
        state.isAdmin = true;
        sessionStorage.setItem('beautiful_home_is_admin', 'true');
        checkAdminSession();
        toggleModal(DOM.loginModal, false);
        renderProducts();
        showToast('Successfully authenticated as administrator!', 'success');
      } else {
        DOM.loginError.textContent = 'Invalid username or passkey credentials.';
      }
    });

    // Log Out
    DOM.hudLogout.addEventListener('click', () => {
      state.isAdmin = false;
      sessionStorage.setItem('beautiful_home_is_admin', 'false');
      checkAdminSession();
      renderProducts();
      window.location.hash = '';
      showToast('Logged out of admin session.', 'info');
    });

    // Reset Site Content Handler
    if (DOM.hudReset) {
      DOM.hudReset.addEventListener('click', () => {
        if (confirm('Revert all customizations back to factory defaults? This will restore original texts, images, product catalogs, and clear the shopping cart.')) {
          localStorage.removeItem('beautiful_home_layout');
          localStorage.removeItem('beautiful_home_products');
          localStorage.removeItem('beautiful_home_testimonials');
          localStorage.removeItem('beautiful_home_blog');
          localStorage.removeItem('beautiful_home_cart');
          showToast('Site content database reset. Reloading page...');
          setTimeout(() => window.location.reload(), 1500);
        }
      });
    }

    // File Drop & Select handlers for Product Modal
    const dropzone = DOM.fileDropZone;
    const fileInput = DOM.adminImage;

    dropzone.addEventListener('click', () => fileInput.click());

    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.classList.add('dragover');
    });

    dropzone.addEventListener('dragleave', () => {
      dropzone.classList.remove('dragover');
    });

    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
      const files = e.dataTransfer.files;
      if (files.length) handleUploadedFile(files[0]);
    });

    fileInput.addEventListener('change', (e) => {
      if (e.target.files.length) handleUploadedFile(e.target.files[0]);
    });

    function handleUploadedFile(file) {
      if (!file.type.match('image.*') && !file.name.endsWith('.svg')) {
        alert('Please select an SVG vector file or image (PNG/JPG).');
        return;
      }
      
      DOM.uploadFilename.textContent = 'Optimizing image...';
      DOM.uploadFilename.style.display = 'block';
      
      optimizeImage(file, (optimizedData) => {
        DOM.adminImageData.value = optimizedData;
        DOM.uploadFilename.textContent = `${file.name} (Optimized)`;
      });
    }

    // Save/Add Product Form Submit
    DOM.adminForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = DOM.adminProductId.value;
      const name = DOM.adminName.value.trim();
      const price = parseInt(DOM.adminPrice.value);
      const category = DOM.adminCategory.value;
      
      const colorsRaw = DOM.adminColors.value;
      const colors = colorsRaw ? colorsRaw.split(',').map(s => s.trim()).filter(s => s.length > 0) : [];

      const customData = DOM.adminImageData.value;
      const link = DOM.adminLink ? DOM.adminLink.value.trim() : '';
      
      if (id) {
        // Edit Mode
        const pIndex = state.products.findIndex(item => item.id === id);
        if (pIndex !== -1) {
          const originalImage = state.products[pIndex].image;
          state.products[pIndex] = {
            ...state.products[pIndex],
            name,
            price,
            category,
            colors,
            image: customData ? customData : originalImage,
            link
          };
        }
        showToast('Product updated successfully.', 'success');
      } else {
        // Add Mode
        const newProduct = {
          id: `product-${Date.now()}`,
          name,
          price,
          category,
          colors,
          badge: 'New',
          image: customData ? customData : 'assets/product-vase.svg',
          link
        };
        state.products.push(newProduct);
        showToast('New product added to catalog.', 'success');
      }

      saveProducts();
      renderProducts();
      toggleModal(DOM.adminModal, false);
    });

    // Delete Product Action
    DOM.adminDeleteBtn.addEventListener('click', () => {
      const id = DOM.adminProductId.value;
      if (!id) return;

      if (confirm('Are you sure you want to delete this product?')) {
        state.products = state.products.filter(item => item.id !== id);
        saveProducts();
        renderProducts();
        toggleModal(DOM.adminModal, false);
        showToast('Product deleted from catalog.', 'info');
      }
    });

    // ── WYSIWYG EVENT HANDLERS ──

    // Setup editable layout text elements binding
    $$('.editable-text').forEach(el => {
      bindEditableTextEvents(el);
    });

    // Setup layout image click replacing
    $$('.editable-image').forEach(el => {
      el.addEventListener('click', () => {
        if (state.isAdmin) {
          state.activeImageKey = el.dataset.layoutKey;
          state.activeBlogImageId = null; // Clear blog image context
          DOM.adminGeneralImageInput.click();
        }
      });
    });

    // Handle general image upload replacement (layouts & blog posts)
    DOM.adminGeneralImageInput.addEventListener('change', (e) => {
      const files = e.target.files;
      if (files.length === 0) return;
      
      const file = files[0];
      showToast('Optimizing image...', 'info');
      
      optimizeImage(file, (base64Data) => {
        if (state.activeBlogImageId) {
          // Blog post card image
          const blogItem = state.blog.find(b => b.id === state.activeBlogImageId);
          if (blogItem) {
            blogItem.image = base64Data;
            saveBlog();
            renderBlog();
            triggerSaveIndicator();
            showToast('Blog article thumbnail updated and optimized.', 'success');
          }
        } else if (state.activeImageKey) {
          // General layout image
          state.layout[state.activeImageKey] = base64Data;
          saveLayout();
          
          // Update DOM directly
          const imgEl = $(`[data-layout-key="${state.activeImageKey}"]`);
          if (imgEl) {
            imgEl.src = base64Data;
          }
          triggerSaveIndicator();
          showToast('Layout image replaced and optimized.', 'success');
        }
        
        DOM.adminGeneralImageInput.value = ''; // Reset uploader input
      });
    });

    // Mailchimp input config listener
    const actionInput = $('#newsletterActionInput');
    if (actionInput) {
      actionInput.addEventListener('blur', () => {
        const newVal = actionInput.value.trim();
        state.layout['newsletter-action'] = newVal;
        saveLayout();
        
        const newsletterForm = $('#newsletterForm');
        if (newsletterForm) {
          newsletterForm.setAttribute('action', newVal || '#');
        }
        triggerSaveIndicator();
      });
      actionInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          actionInput.blur();
        }
      });
    }

    // Chatbot Web3Forms Key input config listener
    const chatbotKeyInput = $('#chatbotKeyInput');
    if (chatbotKeyInput) {
      chatbotKeyInput.addEventListener('blur', () => {
        const newVal = chatbotKeyInput.value.trim();
        state.layout['chatbot-key'] = newVal;
        saveLayout();
        triggerSaveIndicator();
      });
      chatbotKeyInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          chatbotKeyInput.blur();
        }
      });
    }
  }

  /* ══════════════════════════════════════════════════════════════
     § 20  INTERACTIVE CART SYSTEM
     ══════════════════════════════════════════════════════════════ */
  function initCart() {
    if (!DOM.navCart) return;

    // Toggle Cart open/close
    DOM.navCart.addEventListener('click', (e) => {
      e.preventDefault();
      DOM.cartSidebar.classList.add('open');
    });

    DOM.cartClose.addEventListener('click', () => {
      DOM.cartSidebar.classList.remove('open');
    });

    DOM.cartOverlay.addEventListener('click', () => {
      DOM.cartSidebar.classList.remove('open');
    });

    // Checkout Action
    DOM.cartCheckoutBtn.addEventListener('click', () => {
      if (state.cart.length === 0) {
        showToast('Your shopping bag is empty.', 'error');
        return;
      }
      
      showToast('Redirecting to secure checkout...', 'success');
      
      setTimeout(() => {
        let checkoutUrl = 'https://beautifulhomedecor.gumroad.com';
        if (state.cart.length === 1) {
          const item = state.products.find(p => p.id === state.cart[0].id);
          if (item && item.link) {
            checkoutUrl = item.link;
          }
        }
        
        window.open(checkoutUrl, '_blank');
        
        // Reset cart state after redirect
        state.cart = [];
        state.couponApplied = false;
        const couponInput = document.getElementById('cartCouponInput');
        if (couponInput) couponInput.value = '';
        saveCart();
        renderCart();
        DOM.cartSidebar.classList.remove('open');
      }, 1000);
    });

    // Coupon code apply
    const applyBtn = document.getElementById('cartCouponApply');
    const couponInput = document.getElementById('cartCouponInput');
    if (applyBtn && couponInput) {
      applyBtn.addEventListener('click', () => {
        const code = couponInput.value.trim().toUpperCase();
        if (code === 'SAVE50' || code === 'INSTA50') {
          state.couponApplied = true;
          state.appliedCouponCode = code;
          showToast(`Discount code ${code} applied! 50% Off.`, 'success');
          saveCart();
          renderCart();
        } else if (code === '') {
          state.couponApplied = false;
          state.appliedCouponCode = '';
          saveCart();
          renderCart();
        } else {
          state.couponApplied = false;
          state.appliedCouponCode = '';
          saveCart();
          showToast('Invalid promo code.', 'error');
          renderCart();
        }
      });
    }

    renderCart();
  }

  function addToCart(productId) {
    const product = state.products.find(p => p.id === productId);
    if (!product) return;

    const cartItem = state.cart.find(item => item.id === productId);
    if (cartItem) {
      cartItem.quantity += 1;
    } else {
      state.cart.push({ id: productId, quantity: 1 });
    }

    saveCart();
    renderCart();
    showToast(`"${product.name}" added to bag!`, 'success');
  }

  function updateCartQty(productId, delta) {
    const cartItem = state.cart.find(item => item.id === productId);
    if (!cartItem) return;

    cartItem.quantity += delta;
    if (cartItem.quantity <= 0) {
      state.cart = state.cart.filter(item => item.id !== productId);
      showToast('Item removed from bag.', 'info');
    }

    saveCart();
    renderCart();
  }

  function removeFromCart(productId) {
    state.cart = state.cart.filter(item => item.id !== productId);
    saveCart();
    renderCart();
    showToast('Item removed from bag.', 'info');
  }

  function renderCart() {
    const container = DOM.cartItemsContainer;
    if (!container) return;

    container.innerHTML = '';

    let subtotal = 0;
    let totalItems = 0;

    state.cart.forEach(item => {
      const p = state.products.find(prod => prod.id === item.id);
      if (!p) return;

      subtotal += p.price * item.quantity;
      totalItems += item.quantity;

      const cartCard = document.createElement('div');
      cartCard.className = 'cart-item';
      cartCard.innerHTML = `
        <div class="cart-item__image">
          <img src="${p.image}" alt="${p.name}" />
        </div>
        <div class="cart-item__info">
          <h4 class="cart-item__name">${p.name}</h4>
          <span class="cart-item__price">$${(p.price * item.quantity).toLocaleString()}</span>
          <div class="cart-item__ctrls">
            <button class="cart-item__qty-btn qty-minus" data-id="${p.id}">−</button>
            <span class="cart-item__qty">${item.quantity}</span>
            <button class="cart-item__qty-btn qty-plus" data-id="${p.id}">＋</button>
          </div>
        </div>
        <button class="cart-item__remove" data-id="${p.id}" aria-label="Remove item">&times;</button>
      `;

      // Bind increment/decrement quantity buttons
      cartCard.querySelector('.qty-minus').addEventListener('click', () => updateCartQty(p.id, -1));
      cartCard.querySelector('.qty-plus').addEventListener('click', () => updateCartQty(p.id, 1));
      cartCard.querySelector('.cart-item__remove').addEventListener('click', () => removeFromCart(p.id));

      container.appendChild(cartCard);
    });

    // Update numbers
    DOM.cartSubtotal.textContent = `$${subtotal.toLocaleString()}`;
    DOM.cartCountLabel.textContent = `${totalItems} ${totalItems === 1 ? 'item' : 'items'}`;
    DOM.navCartBadge.textContent = totalItems;
    
    // Toggle badge animation scale (CSS badge-pop spring animation)
    if (totalItems > 0) {
      DOM.navCartBadge.classList.remove('badge-pop');
      void DOM.navCartBadge.offsetWidth; // Force reflow
      DOM.navCartBadge.classList.add('badge-pop');
      
      DOM.navCartBadge.addEventListener('animationend', () => {
        DOM.navCartBadge.classList.remove('badge-pop');
      }, { once: true });
    }

    const discountRow = document.getElementById('cartDiscountRow');
    const discountAmount = document.getElementById('cartDiscountAmount');
    const finalTotalRow = document.getElementById('cartFinalTotalRow');
    const finalTotal = document.getElementById('cartFinalTotal');
    const couponInput = document.getElementById('cartCouponInput');

    if (state.couponApplied) {
      const discount = subtotal * 0.5;
      const total = subtotal - discount;

      if (discountRow) {
        discountRow.style.display = 'flex';
        discountAmount.textContent = `-$${discount.toLocaleString()}`;
      }
      if (finalTotalRow) {
        finalTotalRow.style.display = 'flex';
        finalTotal.textContent = `$${total.toLocaleString()}`;
      }
      if (couponInput && state.appliedCouponCode) {
        couponInput.value = state.appliedCouponCode;
      }
    } else {
      if (discountRow) discountRow.style.display = 'none';
      if (finalTotalRow) finalTotalRow.style.display = 'none';
      if (couponInput && (couponInput.value.toUpperCase() === 'SAVE50' || couponInput.value.toUpperCase() === 'INSTA50')) {
        couponInput.value = '';
      }
    }
  }

  /* ══════════════════════════════════════════════════════════════
     § 21  DYNAMIC SEARCH SYSTEM
     ══════════════════════════════════════════════════════════════ */
  function initSearch() {
    if (!DOM.navSearch) return;

    // Toggle Search Modal
    DOM.navSearch.addEventListener('click', (e) => {
      e.preventDefault();
      DOM.searchOverlay.classList.add('open');
      setTimeout(() => DOM.searchInput.focus(), 100);
    });

    DOM.searchClose.addEventListener('click', () => {
      DOM.searchOverlay.classList.remove('open');
      DOM.searchInput.value = '';
      performSearch('');
    });

    DOM.searchInput.addEventListener('input', () => {
      performSearch(DOM.searchInput.value.trim());
    });
  }

  function performSearch(query) {
    const prodSection = $('#searchProductsSection');
    const blogSection = $('#searchBlogSection');
    const prodResults = DOM.searchProductsResults;
    const blogResults = DOM.searchBlogResults;
    const emptyState = DOM.searchEmptyState;

    if (!query) {
      prodSection.style.display = 'none';
      blogSection.style.display = 'none';
      emptyState.style.display = 'none';
      return;
    }

    const lowerQuery = query.toLowerCase();

    // 1. Search Products
    const matchedProducts = state.products.filter(p => 
      p.name.toLowerCase().includes(lowerQuery) || p.category.toLowerCase().includes(lowerQuery)
    );

    // 2. Search Blog Articles
    const matchedBlogs = state.blog.filter(b => 
      b.title.toLowerCase().includes(lowerQuery) || b.category.toLowerCase().includes(lowerQuery)
    );

    // Render Products
    prodResults.innerHTML = '';
    if (matchedProducts.length > 0) {
      prodSection.style.display = 'block';
      matchedProducts.forEach(p => {
        const itemCard = document.createElement('div');
        itemCard.className = 'search-result-card';
        const highlightedName = highlightText(p.name, query);
        const highlightedCategory = highlightText(p.category, query);
        itemCard.innerHTML = `
          <img src="${p.image}" alt="${p.name}" />
          <div>
            <div class="search-result-card__title">${highlightedName}</div>
            <div class="search-result-card__subtitle">$${p.price.toLocaleString()} &bull; ${highlightedCategory}</div>
          </div>
        `;
        itemCard.addEventListener('click', () => {
          DOM.searchOverlay.classList.remove('open');
          DOM.searchInput.value = '';
          performSearch('');
          window.location.hash = '#products';
          const cardEl = document.getElementById(p.id);
          if (cardEl) {
            cardEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            cardEl.style.outline = '2px solid var(--color-gold)';
            setTimeout(() => cardEl.style.outline = '', 2000);
          }
        });
        prodResults.appendChild(itemCard);
      });
    } else {
      prodSection.style.display = 'none';
    }

    // Render Blogs
    blogResults.innerHTML = '';
    if (matchedBlogs.length > 0) {
      blogSection.style.display = 'block';
      matchedBlogs.forEach(b => {
        const itemCard = document.createElement('div');
        itemCard.className = 'search-result-card';
        const highlightedTitle = highlightText(b.title, query);
        const highlightedCategory = highlightText(b.category, query);
        itemCard.innerHTML = `
          <img src="${b.image}" alt="${b.title}" />
          <div>
            <div class="search-result-card__title">${highlightedTitle}</div>
            <div class="search-result-card__subtitle">${highlightedCategory}</div>
          </div>
        `;
        itemCard.addEventListener('click', () => {
          DOM.searchOverlay.classList.remove('open');
          DOM.searchInput.value = '';
          performSearch('');
          window.location.hash = '#journal';
          const cardEl = document.getElementById(b.id);
          if (cardEl) {
            cardEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            cardEl.style.outline = '2px solid var(--color-gold)';
            setTimeout(() => cardEl.style.outline = '', 2000);
          }
        });
        blogResults.appendChild(itemCard);
      });
    } else {
      blogSection.style.display = 'none';
    }

    // Empty state
    if (matchedProducts.length === 0 && matchedBlogs.length === 0) {
      emptyState.style.display = 'block';
    } else {
      emptyState.style.display = 'none';
    }
  }

  /* ══════════════════════════════════════════════════════════════
     § 22  WYSIWYG FORMAT BAR ENGINE
     ══════════════════════════════════════════════════════════════ */
  function initWYSIWYGToolbar() {
    const toolbar = DOM.wysiwygToolbar;
    if (!toolbar) return;

    // Track text selection changes
    document.addEventListener('selectionchange', () => {
      if (!state.isAdmin) return;

      const selection = window.getSelection();
      if (!selection.rangeCount || selection.isCollapsed) {
        toolbar.classList.remove('active');
        return;
      }

      // Check if selection anchor is within an editable text node
      const range = selection.getRangeAt(0);
      const parentEditable = range.commonAncestorContainer.parentElement.closest('.editable-text, .editable-card-text');

      if (parentEditable) {
        state.activeSelection = parentEditable;

        // Position format bar above highlighted selection
        const rect = range.getBoundingClientRect();
        const scrollTop = window.scrollY || document.documentElement.scrollTop;

        toolbar.style.top = `${rect.top + scrollTop - toolbar.offsetHeight - 12}px`;
        toolbar.style.left = `${rect.left + (rect.width / 2) - (toolbar.offsetWidth / 2)}px`;
        toolbar.classList.add('active');
      } else {
        toolbar.classList.remove('active');
      }
    });

    // Formatting button action bindings
    $$('.wysiwyg-btn', toolbar).forEach(btn => {
      btn.addEventListener('mousedown', (e) => {
        e.preventDefault(); // Prevents losing focus/selection
        const command = btn.dataset.command;
        if (!command) return;

        // Execute browser rich-text editor command
        document.execCommand(command, false, null);

        // Instantly sync the modified HTML to layout / card array states
        if (state.activeSelection) {
          const el = state.activeSelection;
          
          if (el.classList.contains('editable-text')) {
            const key = el.dataset.layoutKey;
            if (key) {
              const cleaned = sanitizeHTML(el.innerHTML.trim());
              el.innerHTML = cleaned;
              state.layout[key] = cleaned;
              saveLayout();
              triggerSaveIndicator();
              
              if (key.startsWith('brand-item-')) {
                $$(`[data-layout-key="${key}"]`).forEach(match => {
                  if (match !== el) match.innerHTML = cleaned;
                });
              }
            }
          } else if (el.classList.contains('editable-card-text')) {
            const id = el.dataset.id;
            const field = el.dataset.field;
            const cleaned = sanitizeHTML(el.innerHTML.trim());
            el.innerHTML = cleaned;

            const testim = state.testimonials.find(t => t.id === id);
            if (testim && field) {
              testim[field] = cleaned;
              saveTestimonials();
              triggerSaveIndicator();
            }

            const blog = state.blog.find(b => b.id === id);
            if (blog && field) {
              blog[field] = cleaned;
              saveBlog();
              triggerSaveIndicator();
            }
          }
        }
      });
    });
  }

  /* ══════════════════════════════════════════════════════════════
     § 23  TOAST NOTIFICATIONS UTILITY
     ══════════════════════════════════════════════════════════════ */
  function showToast(message, type = 'success') {
    const container = DOM.toastContainer;
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;

    let icon = '✦';
    if (type === 'success') icon = '✓';
    if (type === 'error') icon = '×';
    if (type === 'info') icon = 'ℹ';

    toast.innerHTML = `<span style="color:var(--color-gold); font-weight:700;">${icon}</span> <span>${message}</span>`;
    container.appendChild(toast);

    // Slide out and remove
    setTimeout(() => {
      toast.style.transition = 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(20px)';
      setTimeout(() => {
        toast.remove();
      }, 400);
    }, 3200);
  }

  /* ══════════════════════════════════════════════════════════════
     § 23.5  GLOBAL KEYBOARD CONTROLS
     ══════════════════════════════════════════════════════════════ */
  function initGlobalKeydown() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (DOM.cartSidebar && DOM.cartSidebar.classList.contains('open')) {
          DOM.cartSidebar.classList.remove('open');
        }
        if (DOM.searchOverlay && DOM.searchOverlay.classList.contains('open')) {
          DOM.searchOverlay.classList.remove('open');
          DOM.searchInput.value = '';
          performSearch('');
        }
        if (DOM.loginModal && DOM.loginModal.classList.contains('open')) {
          toggleModal(DOM.loginModal, false);
        }
        if (DOM.adminModal && DOM.adminModal.classList.contains('open')) {
          toggleModal(DOM.adminModal, false);
        }
      }
    });
  }

  /* ══════════════════════════════════════════════════════════════
     § 24  INITIALIZATION
     ══════════════════════════════════════════════════════════════ */
  /* ══════════════════════════════════════════════════════════════
     § 23.8  PERSISTENT COUNTDOWN TIMER
     ══════════════════════════════════════════════════════════════ */
  function initCountdownTimer() {
    const timerEl = document.getElementById('countdownTimer');
    if (!timerEl) return;

    let targetTime = localStorage.getItem('countdown_target_time');
    
    if (!targetTime || parseInt(targetTime) <= Date.now()) {
      targetTime = Date.now() + 24 * 60 * 60 * 1000;
      localStorage.setItem('countdown_target_time', targetTime);
    } else {
      targetTime = parseInt(targetTime);
    }

    function updateTimer() {
      const now = Date.now();
      let diff = targetTime - now;

      if (diff <= 0) {
        targetTime = Date.now() + 24 * 60 * 60 * 1000;
        localStorage.setItem('countdown_target_time', targetTime);
        diff = 24 * 60 * 60 * 1000;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      const hStr = hours.toString().padStart(2, '0');
      const mStr = minutes.toString().padStart(2, '0');
      const sStr = seconds.toString().padStart(2, '0');

      timerEl.textContent = `${hStr}:${mStr}:${sStr}`;
    }

    updateTimer();
    setInterval(updateTimer, 1000);
  }


  /* ══════════════════════════════════════════════════════════════
     § 23.9  SMOOTH MOMENTUM SCROLL (Lenis-like spring scrolling)
     ══════════════════════════════════════════════════════════════ */
  function initSmoothMomentumScroll() {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let targetY = window.scrollY;
    let currentY = window.scrollY;
    let isScrolling = false;

    window.addEventListener('wheel', (e) => {
      const target = e.target;
      if (target.closest('.cart-sidebar__items, .glass-modal, .search-overlay__content, .wysiwyg-toolbar')) {
        return;
      }

      e.preventDefault();

      // Normalize wheel delta for different scrolling devices/modes
      let delta = e.deltaY;
      if (e.deltaMode === 1) { // lines mode
        delta *= 33; // 33px per line is standard
      } else if (e.deltaMode === 2) { // pages mode
        delta *= window.innerHeight;
      }

      targetY += delta * 1.0;
      targetY = Math.max(0, Math.min(targetY, document.documentElement.scrollHeight - window.innerHeight));

      if (!isScrolling) {
        isScrolling = true;
        requestAnimationFrame(tick);
      }
    }, { passive: false });

    const SPRING = 0.26;

    function tick() {
      const diff = targetY - currentY;
      
      if (Math.abs(diff) < 0.15) {
        currentY = targetY;
        window.scrollTo(0, currentY);
        isScrolling = false;
        return;
      }

      currentY += diff * SPRING;
      window.scrollTo(0, currentY);

      if (isScrolling) {
        requestAnimationFrame(tick);
      }
    }

    window.addEventListener('scroll', () => {
      if (!isScrolling) {
        targetY = window.scrollY;
        currentY = window.scrollY;
      }
    }, { passive: true });
  }


  /* ══════════════════════════════════════════════════════════════
     § 23.95  3D INTERACTIVE HERO SCENE (spring-smoothed)
     ══════════════════════════════════════════════════════════════ */
  function init3DHeroScene() {
    const wrapper = $('.hero__visual');
    const laptop = $('.laptop-mockup');
    const shadow = $('#laptopShadow');
    const topCard = $('.hero__float-card--top');
    const bottomCard = $('.hero__float-card--bottom');
    
    if (!wrapper || !laptop) return;
    if (window.matchMedia('(pointer: coarse)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Remove CSS float animations on desktop to let JS physics loop take over
    laptop.style.animation = 'none';
    if (topCard) topCard.style.animation = 'none';
    if (bottomCard) bottomCard.style.animation = 'none';

    let rotX = 0, rotY = 0;
    let targetRotX = 0, targetRotY = 0;
    let time = 0;
    const SPRING = 0.08;

    function tick() {
      time += 0.015;
      
      // Compute spring rotation
      rotX += (targetRotX - rotX) * SPRING;
      rotY += (targetRotY - rotY) * SPRING;

      // Laptop 3D rotation and drift
      const laptopDriftY = Math.sin(time) * 8;
      laptop.style.transform = `perspective(1200px) rotateX(${4 + rotX}deg) rotateY(${-6 + rotY}deg) translateY(${laptopDriftY}px)`;

      // Dynamic screen glare reflection angle update
      const overlay = laptop.querySelector('.canva-editor-overlay');
      if (overlay) {
        const glareAngle = 135 + (rotY * 2.5);
        overlay.style.setProperty('--screen-glare-angle', `${glareAngle}deg`);
      }

      // Dynamic Shadow update
      if (shadow) {
        const heightRatio = (laptopDriftY + 8) / 16; // 0 to 1
        const shadowScale = 0.85 + heightRatio * 0.15; 
        const shadowOpacity = 0.20 - heightRatio * 0.08; 
        const shadowBlur = 14 + heightRatio * 8;
        
        shadow.style.transform = `scale(${shadowScale}) translate(${-rotY * 0.8}px, ${-rotX * 0.8}px)`;
        shadow.style.opacity = shadowOpacity;
        shadow.style.filter = `blur(${shadowBlur}px)`;
      }

      // Front card parallax (moves with mouse, drifts out of phase)
      if (topCard) {
        const topDriftY = Math.sin(time + 1.2) * 6;
        topCard.style.transform = `translate(${rotY * 1.6}px, ${rotX * 1.6 + topDriftY}px)`;
      }

      // Back card parallax (moves opposite to mouse, drifts out of phase)
      if (bottomCard) {
        const bottomDriftY = Math.sin(time - 0.8) * 5;
        bottomCard.style.transform = `translate(${rotY * -0.9}px, ${rotX * -0.9 + bottomDriftY}px)`;
      }

      requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);

    wrapper.addEventListener('mousemove', (e) => {
      const rect = wrapper.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = rect.width / 2;
      const cy = rect.height / 2;

      // Tilts based on cursor coordinates
      targetRotX = -((y - cy) / cy) * 12;
      targetRotY = ((x - cx) / cx) * 12;
    });

    wrapper.addEventListener('mouseleave', () => {
      targetRotX = 0;
      targetRotY = 0;
    });
  }


  /* ══════════════════════════════════════════════════════════════
     § 23.98  LEAD CAPTURE MODAL & EXIT INTENT
     ══════════════════════════════════════════════════════════════ */
  function initLeadModal() {
    const modal = DOM.leadModal;
    const overlay = DOM.leadModalOverlay;
    const closeBtn = DOM.leadModalClose;
    const form = DOM.leadModalForm;
    const emailInput = DOM.leadModalEmail;

    if (!modal || !overlay || !closeBtn || !form) return;

    let timerFallback;

    const showModal = () => {
      // Clean up triggers immediately to prevent redundant tracking/calls
      window.removeEventListener('scroll', handleScroll);
      if (timerFallback) clearTimeout(timerFallback);

      // Check if already shown in this session
      if (sessionStorage.getItem('lead_modal_shown') === 'true') return;
      
      // Mark as shown
      sessionStorage.setItem('lead_modal_shown', 'true');
      
      // Open modal
      modal.classList.add('active');
    };

    const hideModal = () => {
      modal.classList.remove('active');
    };

    // Scroll depth trigger (e.g., scrolls past 50%)
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0 && (scrollTop / docHeight) >= 0.5) {
        showModal();
      }
    };

    // Timer fallback (20 seconds)
    timerFallback = setTimeout(() => {
      showModal();
    }, 20000);

    // Register scroll depth listener
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Close on button click
    closeBtn.addEventListener('click', hideModal);

    // Close on overlay click
    overlay.addEventListener('click', hideModal);

    // Close on Escape key
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('active')) {
        hideModal();
      }
    });

    // Exit Intent Detection (Desktop only)
    document.addEventListener('mouseleave', (e) => {
      // clientY < 15 triggers when mouse exits towards the browser bar (top of screen)
      if (e.clientY < 15) {
        showModal();
      }
    });

    // Form submission
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = emailInput.value.trim();
      if (!email) return;

      showToast('Thank you! Your free templates are on their way.', 'success');
      
      // Visual feedback: disable button during transition
      const submitBtn = $('.lead-modal__submit', modal);
      if (submitBtn) {
        submitBtn.disabled = true;
        const innerText = $('.btn-magnetic-inner', submitBtn);
        if (innerText) innerText.textContent = 'Sending...';
      }

      setTimeout(() => {
        hideModal();
        emailInput.value = '';
        if (submitBtn) {
          submitBtn.disabled = false;
          const innerText = $('.btn-magnetic-inner', submitBtn);
          if (innerText) innerText.textContent = 'Send Me My Gift!';
        }
      }, 1000);
    });
  }

  /* ── DYNAMIC AUTOMATED CHATBOT ── */
  function initChatbot() {
    const chatbotWidget = document.getElementById('chatbotWidget');
    if (!chatbotWidget) return;

    const toggleBtn = document.getElementById('chatbotToggle');
    const windowEl = document.getElementById('chatbotWindow');
    const closeBtn = document.getElementById('chatbotClose');
    const messagesContainer = document.getElementById('chatbotMessages');
    const quickRepliesContainer = document.getElementById('chatbotQuickReplies');
    const form = document.getElementById('chatbotForm');
    const input = document.getElementById('chatbotInput');

    let chatState = 'chat'; // 'chat' or 'awaiting_email'
    let pendingUserMessage = '';

    const botResponses = {
      welcome: "Hi! I'm Aura, your virtual design assistant. How can I help you elevate your feed today? ✦",
      templates: "All our Canva templates are 100% compatible with the **FREE version of Canva**. When you make a purchase, you'll receive a PDF with template links. Clicking those links instantly adds them to your Canva account. You can then edit fonts, layouts, and colors with a single click!",
      discounts: "We have two active promotions running! Use code **SAVE50** at checkout to get 50% off any Pinterest pack, or use code **INSTA50** to get 50% off Instagram sets! Apply them in your shopping bag before check out.",
      downloads: "Your template download PDF is delivered instantly to your email inbox as soon as your checkout completes. If you haven't received it within 5 minutes, please check your spam folder or contact support at tumpalapavansai@gmail.com.",
      commercial: "Yes! All templates include commercial rights. You can use them to create visual assets for your own personal brand, business, or for client accounts. However, you cannot resell the editable Canva templates themselves.",
      buying: "To buy our templates, click **Add to Bag** on any product in the **Store** section. When you're ready, click the Shopping Bag icon in the top right, apply discount codes (like **SAVE50**), and click **Proceed to Checkout**. Transactions are secure and handled via Gumroad using Card or PayPal!",
      benefits: "Our templates help home decor creators, designers, and visual bloggers **grow their Pinterest & Instagram presence** with beautiful, cohesive, and professional graphics. ✦\n\n**Key Benefits:**\n• **Save Hours**: Stop designing from scratch. Just drag-and-drop your photos in Canva.\n• **High Engagement**: Optimized designs to grab attention and drive link clicks.\n• **Fully Customizable**: Change all colors, fonts, and photos with free Canva accounts.\n• **Consistent Brand**: Maintain a gorgeous, high-end visual aesthetic across your feed!",
      default: "Thanks for your message! Since I'm an automated assistant, I've prepared a direct email draft with your question. Click the **Send as Email** button below to send it to our inbox, or write to us at tumpalapavansai@gmail.com!"
    };

    const quickReplies = [
      { text: "🎨 How to edit?", key: "templates" },
      { text: "🏷️ Discount codes?", key: "discounts" },
      { text: "📩 Where is my download?", key: "downloads" },
      { text: "💼 Commercial rights?", key: "commercial" }
    ];

    // Open/Close toggle
    toggleBtn.addEventListener('click', () => {
      windowEl.classList.toggle('open');
      // Hide notification dot when first opened
      const dot = document.querySelector('.chatbot-toggle__dot');
      if (dot) dot.style.display = 'none';

      // Send initial welcome message if empty
      if (messagesContainer.children.length === 0) {
        showBotMessage(botResponses.welcome);
        renderQuickReplies();
      }
    });

    closeBtn.addEventListener('click', () => {
      windowEl.classList.remove('open');
    });

    // Handle Quick Reply Clicks
    function renderQuickReplies() {
      quickRepliesContainer.innerHTML = '';
      quickReplies.forEach(reply => {
        const btn = document.createElement('button');
        btn.className = 'chatbot-quick-reply';
        btn.textContent = reply.text;
        btn.addEventListener('click', () => {
          addUserMessage(reply.text);
          triggerBotTyping(botResponses[reply.key]);
        });
        quickRepliesContainer.appendChild(btn);
      });
    }

    // Append User Message
    function addUserMessage(text) {
      const msg = document.createElement('div');
      msg.className = 'chatbot-message chatbot-message--user';
      msg.textContent = text;
      messagesContainer.appendChild(msg);
      scrollToBottom();
    }

    // Append Bot Message
    function showBotMessage(text) {
      const msg = document.createElement('div');
      msg.className = 'chatbot-message chatbot-message--bot';
      // Format simple markdown bold tags like **text**
      msg.innerHTML = formatMessageText(text);
      messagesContainer.appendChild(msg);
      scrollToBottom();
    }

    // Simple formatting helper
    function formatMessageText(text) {
      return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
    }

    // Bot Typing Animation & Response
    function triggerBotTyping(response, showEmailButton = false, originalUserText = '') {
      // Remove quick replies temporarily during typing
      quickRepliesContainer.style.opacity = '0.5';
      quickRepliesContainer.style.pointerEvents = 'none';

      const typingEl = document.createElement('div');
      typingEl.className = 'chatbot-typing';
      typingEl.innerHTML = '<span></span><span></span><span></span>';
      messagesContainer.appendChild(typingEl);
      scrollToBottom();

      setTimeout(() => {
        typingEl.remove();
        showBotMessage(response);

        if (showEmailButton && originalUserText) {
          const btnWrapper = document.createElement('div');
          btnWrapper.style.margin = '0.5rem 0';
          btnWrapper.style.alignSelf = 'flex-start';

          const emailLink = document.createElement('a');
          emailLink.href = 'mailto:tumpalapavansai@gmail.com?subject=Support Inquiry - Beautiful Home Decor&body=' + encodeURIComponent(originalUserText);
          emailLink.className = 'btn-primary';
          emailLink.style.fontSize = '0.75rem';
          emailLink.style.padding = '0.45rem 1rem';
          emailLink.style.borderRadius = 'var(--radius-sm)';
          emailLink.style.display = 'inline-flex';
          emailLink.style.alignItems = 'center';
          emailLink.style.gap = '0.4rem';
          emailLink.innerHTML = '<span class="btn-magnetic-inner">✉ Send as Email</span>';

          emailLink.addEventListener('click', (event) => {
            // Attempt to copy user message to clipboard
            navigator.clipboard.writeText(originalUserText).then(() => {
              showToast('Inquiry copied to clipboard! Opening mail client...', 'success');
            }).catch(() => {
              showToast('Opening mail client...', 'success');
            });
          });

          btnWrapper.appendChild(emailLink);
          messagesContainer.appendChild(btnWrapper);
          scrollToBottom();
        }

        quickRepliesContainer.style.opacity = '1';
        quickRepliesContainer.style.pointerEvents = 'all';
      }, 1000 + Math.random() * 800);
    }

    function scrollToBottom() {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // Custom text input form submit
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = input.value.trim();
      if (!text) return;

      addUserMessage(text);
      input.value = '';

      if (chatState === 'awaiting_email') {
        // Simple email validation regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(text)) {
          triggerBotTyping("That email address doesn't seem valid. Please type a valid email address so I can route your inquiry:");
          return;
        }

        // Email is valid! Reset state and trigger submission
        chatState = 'chat';
        const userEmail = text;
        const userMsg = pendingUserMessage;
        pendingUserMessage = '';

        // Get Web3Forms key
        const web3formsKey = state.layout['chatbot-key'] || '';

        if (web3formsKey && web3formsKey !== '') {
          // Send to Web3Forms API in the background!
          triggerBotTyping("Perfect! Sending your inquiry in the background now... ✦");
          
          fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify({
              access_key: web3formsKey,
              name: 'Beautiful Home Decor Chatbot Visitor',
              email: userEmail,
              subject: 'New Chatbot Support Inquiry from ' + userEmail,
              message: userMsg,
              from_name: 'Beautiful Home Decor'
            })
          })
          .then(async (response) => {
            const json = await response.json();
            if (response.status === 200) {
              triggerBotTyping("Thank you! Your message has been sent successfully in the background to our email desk at **tumpalapavansai@gmail.com**. We will get back to you at **" + userEmail + "** shortly!");
            } else {
              // Failed: fall back to mailto link
              triggerBotTyping("Web3Forms submission failed: " + (json.message || "Unknown error") + ". No worries, you can click the button below to send it using your mail client:", true, userMsg);
            }
          })
          .catch(() => {
            triggerBotTyping("Network error sending background message. Please click the button below to send it using your mail client instead:", true, userMsg);
          });

        } else {
          // If no key is set, fall back to showing the mailto button
          triggerBotTyping("Thank you! To complete sending your message, please click the **Send as Email** button below. It will open your mail client with your message prefilled to **tumpalapavansai@gmail.com**:", true, userMsg);
        }
        return;
      }

      // Check if custom message matches any keyword
      let lower = text.toLowerCase();
      let matchedResponse = botResponses.default;
      let isDefault = false;

      if (lower.includes('edit') || lower.includes('canva') || lower.includes('how to')) {
        matchedResponse = botResponses.templates;
      } else if (lower.includes('discount') || lower.includes('coupon') || lower.includes('code') || lower.includes('promo')) {
        matchedResponse = botResponses.discounts;
      } else if (lower.includes('download') || lower.includes('where') || lower.includes('receive') || lower.includes('email')) {
        matchedResponse = botResponses.downloads;
      } else if (lower.includes('license') || lower.includes('commercial') || lower.includes('rights') || lower.includes('sell')) {
        matchedResponse = botResponses.commercial;
      } else if (lower.includes('use') || lower.includes('benefit') || lower.includes('why') || lower.includes('purpose') || lower.includes('advantage') || lower.includes('help') || lower.includes('what do i get')) {
        matchedResponse = botResponses.benefits;
      } else if (lower.includes('buy') || lower.includes('purchase') || lower.includes('pay') || lower.includes('order') || lower.includes('checkout') || lower.includes('price') || lower.includes('how much') || lower.includes('buying')) {
        matchedResponse = botResponses.buying;
      } else {
        isDefault = true;
      }

      if (isDefault) {
        // Switch to awaiting email state
        chatState = 'awaiting_email';
        pendingUserMessage = text;
        
        const web3formsKey = state.layout['chatbot-key'] || '';
        if (web3formsKey && web3formsKey !== '') {
          triggerBotTyping("Thanks for your question! To send this automatically in the background to our support inbox, please type your **email address** below:");
        } else {
          triggerBotTyping("Thanks for your question! To prepare this for our support team, please type your **email address** below:");
        }
      } else {
        triggerBotTyping(matchedResponse);
      }
    });
  }

  function init() {
    loadState();
    
    // Core Modules
    initLoader();
    initScrollProgress();
    initCursorGlow();
    initNavigation();
    initScrollReveal();
    initProductFilters();
    initParallaxOrbs();
    initCardTilt();
    initWishlist();
    initNewsletter();
    initSmoothScroll();
    initImageFallbacks();
    initMagneticButtons();
    initCounterAnimation();
    initParticles();
    initHeroParallax();
    init3DHeroScene();
    initNavPill();
    initScrollVelocity();
    initSpringStagger();
    initCountdownTimer();
    initSmoothMomentumScroll();
    
    // Dynamic CMS & Custom Overlays
    initCart();
    initSearch();
    initLeadModal();
    initWYSIWYGToolbar();
    initGlobalKeydown();
    initChatbot();
    
    // Admin Session Controls
    initAdminMode();
    checkAdminSession();
    renderProducts();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

