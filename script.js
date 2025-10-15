// Utilities
const $ = (sel, parent = document) => parent.querySelector(sel);
const $$ = (sel, parent = document) => Array.from(parent.querySelectorAll(sel));

// Theme toggle with localStorage
const applyStoredTheme = () => {
    const stored = localStorage.getItem('theme');
    if (stored === 'light') document.documentElement.setAttribute('data-theme', 'light');
    if (stored === 'dark') document.documentElement.removeAttribute('data-theme');
};
applyStoredTheme();

$('#theme-toggle')?.addEventListener('click', () => {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    if (isLight) {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('theme', 'dark');
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
    }
});

// Mobile nav toggle
const navToggle = $('.nav-toggle');
const navMenu = $('#nav-menu');
navToggle?.addEventListener('click', () => {
    const open = navMenu.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(open));
});
$$('.nav-link', navMenu).forEach(link => link.addEventListener('click', () => {
    navMenu.classList.remove('open');
    navToggle?.setAttribute('aria-expanded', 'false');
}));

// Smooth scroll: prevent reduced motion users
$$('.nav-link').forEach(link => {
    link.addEventListener('click', e => {
        const href = link.getAttribute('href');
        if (href?.startsWith('#')) {
            const target = $(href);
            if (target) {
                e.preventDefault();
                const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
                target.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'start' });
                history.replaceState(null, '', href);
            }
        }
    });
});

// Active link highlighting based on scroll position
const sections = ['#home', '#about', '#projects', '#contact'].map(id => $(id)).filter(Boolean);
const updateActive = () => {
    const fromTop = window.scrollY + 120; // header offset
    let currentId = sections[0]?.id;
    sections.forEach(sec => {
        if (sec.offsetTop <= fromTop) currentId = sec.id;
    });
    $$('.nav-link').forEach(a => {
        const href = a.getAttribute('href');
        const matches = href === `#${currentId}`;
        a.toggleAttribute('aria-current', matches);
        if (!matches) a.removeAttribute('aria-current');
    });
};
window.addEventListener('scroll', updateActive);
window.addEventListener('load', updateActive);

// Scroll reveal
const revealEls = $$('[data-reveal], section');
const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
    });
}, { threshold: 0.1 });
revealEls.forEach(el => observer.observe(el));

// Contact form validation and fake submit (for GitHub Pages/static)
const form = $('#contact-form');
const status = $('#form-status');
const showError = (id, msg) => { const el = $(`#error-${id}`); if (el) el.textContent = msg || ''; };

form?.addEventListener('submit', async e => {
    e.preventDefault();
    const name = $('#name').value.trim();
    const email = $('#email').value.trim();
    const message = $('#message').value.trim();

    let valid = true;
    if (name.length < 2) { showError('name', 'Please enter your name.'); valid = false; } else showError('name');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showError('email', 'Enter a valid email.'); valid = false; } else showError('email');
    if (message.length < 10) { showError('message', 'Message should be at least 10 characters.'); valid = false; } else showError('message');
    if (!valid) return;

    status.textContent = 'Sending…';
    await new Promise(r => setTimeout(r, 800)); // simulate network
    status.textContent = 'Message sent successfully!';
    toast('Thanks! I will get back to you soon.');
    form.reset();
});

// Toast helper
function toast(text) {
    const el = $('#toast');
    if (!el) return;
    el.textContent = text;
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), 2200);
}

// Footer year
$('#year').textContent = new Date().getFullYear();


// Profile image fallback loader (handles jpg/jpeg/png variants)
(() => {
    const avatarImg = document.querySelector('.hero-visual .avatar img');
    if (!avatarImg) return;
    const baseNames = ['profile'];
    const exts = ['jpg', 'jpeg', 'png'];
    const tryLoad = (idx) => {
        if (idx >= baseNames.length * exts.length) return;
        const base = baseNames[Math.floor(idx / exts.length)];
        const ext = exts[idx % exts.length];
        const url = `./${base}.${ext}?v=${Date.now()}`;
        const test = new Image();
        test.onload = () => { avatarImg.src = url; };
        test.onerror = () => tryLoad(idx + 1);
        test.src = url;
    };
    // If current src fails to load, start fallback sequence
    avatarImg.addEventListener('error', () => tryLoad(0), { once: true });
})();




