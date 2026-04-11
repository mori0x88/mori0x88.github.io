/* THEME */
function toggleTheme() {
  var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  var next = isDark ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('mori-theme', next);
}

/* MOBILE NAV */
var menuOpen = false;

function toggleMenu() {
  menuOpen = !menuOpen;
  var hamburger = document.getElementById('hamburger');
  var mobileMenu = document.getElementById('mobile-menu');
  if (hamburger) hamburger.classList.toggle('open', menuOpen);
  if (mobileMenu) mobileMenu.classList.toggle('open', menuOpen);
  document.body.style.overflow = menuOpen ? 'hidden' : '';
}

function closeMenu() {
  menuOpen = false;
  var hamburger = document.getElementById('hamburger');
  var mobileMenu = document.getElementById('mobile-menu');
  if (hamburger) hamburger.classList.remove('open');
  if (mobileMenu) mobileMenu.classList.remove('open');
  document.body.style.overflow = '';
}

document.addEventListener('click', function(e) {
  if (!menuOpen) return;
  var nav = document.querySelector('nav');
  var menu = document.getElementById('mobile-menu');
  if (nav && menu && !nav.contains(e.target) && !menu.contains(e.target)) closeMenu();
});

window.addEventListener('resize', function() {
  if (window.innerWidth > 768) closeMenu();
});

/* TOAST */
function showToast(msg) {
  var t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(function() { t.classList.remove('show'); }, 2200);
}

/* SHARED UTILS */
function escHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function highlight(text, query) {
  if (!query) return escHtml(text);
  var re = new RegExp('(' + escRe(query) + ')', 'gi');
  return escHtml(text).replace(re, '<mark>$1</mark>');
}
