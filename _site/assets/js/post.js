/* LIKES */
function toggleLike() {
  var btn     = document.getElementById('like-btn');
  var countEl = document.getElementById('like-count');
  if (!btn || !countEl) return;

  var liked = localStorage.getItem(POST_KEY + '_liked');
  var count = parseInt(countEl.textContent) || 0;

  if (liked) {
    localStorage.removeItem(POST_KEY + '_liked');
    btn.classList.remove('liked');
    btn.querySelector('.like-heart').textContent = '♡';
    countEl.textContent = Math.max(0, count - 1);
  } else {
    localStorage.setItem(POST_KEY + '_liked', '1');
    btn.classList.add('liked');
    btn.querySelector('.like-heart').textContent = '♥';
    countEl.textContent = count + 1;
  }
}

/* Restore like state on load */
(function restoreLike() {
  if (localStorage.getItem(POST_KEY + '_liked')) {
    var btn = document.getElementById('like-btn');
    if (!btn) return;
    btn.classList.add('liked');
    btn.querySelector('.like-heart').textContent = '♥';
  }
})();
