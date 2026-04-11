(function () {
  var activeFilter = 'all';
  var searchQuery  = '';

  /* DOM refs */
  var pinnedList   = document.getElementById('pinned-list');
  var hotList      = document.getElementById('hot-list');
  var recentList   = document.getElementById('recent-list');
  var postList     = document.getElementById('post-list');
  var emptyState   = document.getElementById('empty-state');
  var pinnedSec    = document.getElementById('pinned-section');
  var hotSec       = document.getElementById('hot-section');
  var recentSec    = document.getElementById('recent-section');
  var resultsSec   = document.getElementById('results-section');
  var rules        = document.querySelectorAll('.rule');
  var ctaBlock     = document.querySelector('.cta-block');
  var searchInput  = document.getElementById('search-input');
  var searchClear  = document.getElementById('search-clear');
  var searchIcon   = document.getElementById('search-icon');
  var btns         = document.querySelectorAll('.filter-btn');

  /* Interaction count (likes + comments from localStorage) */
  function getInteractions(url) {
    var key    = 'post_' + url.replace(/\//g, '_');
    var liked  = localStorage.getItem(key + '_liked') ? 1 : 0;
    var comments = 0;
    try {
      var c = JSON.parse(localStorage.getItem(key + '_comments') || '[]');
      comments = c.length;
    } catch(e) {}
    return liked + comments;
  }

  /* Build a post card HTML string */
  function postCard(p, q) {
    var badges = '';
    if (p.pinned) badges += '<span class="pin-badge">pinned</span> ';

    var topicTags = (p.topics || [])
      .map(function(t) { return '<span class="post-tag" style="font-size:8px;">' + escHtml(t) + '</span>'; })
      .join('');

    var interactions = getInteractions(p.url);
    var interBadge = interactions > 0
      ? '<span style="font-family:var(--mono);font-size:10px;color:var(--text4);">♥ ' + interactions + '</span>'
      : '';

    return (
      '<a href="' + p.url + '" class="post-item">' +
        '<span class="post-date">' + escHtml(p.date) + '</span>' +
        '<span class="post-tag">' + escHtml(p.tag) + '</span>' +
        '<div class="post-meta-row">' +
          '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">' +
            '<span class="post-title">' + highlight(p.title, q) + '</span>' +
            badges +
          '</div>' +
          (p.desc ? '<span class="post-desc">' + highlight(p.desc, q) + '</span>' : '') +
          '<div style="display:flex;gap:6px;margin-top:5px;flex-wrap:wrap;align-items:center;">' +
            topicTags +
            interBadge +
          '</div>' +
        '</div>' +
      '</a>'
    );
  }

  /* Show default (sectioned) view */
  function showSections() {
    pinnedSec.style.display  = 'block';
    hotSec.style.display     = 'block';
    recentSec.style.display  = 'block';
    resultsSec.style.display = 'none';
    rules.forEach(function(r) { r.style.display = ''; });
    if (ctaBlock) ctaBlock.style.display = '';

    /* Filter out journey posts from the homepage */
    var feed = (window.POSTS || []).filter(function(p) {
      return !(p.topics && p.topics.indexOf('journey') !== -1);
    });

    /* PINNED: posts with pinned:true */
    var pinned = feed.filter(function(p) { return p.pinned; });
    if (pinned.length === 0) {
      pinnedList.innerHTML = '<p class="empty" style="padding:12px 0 0;">nothing pinned yet.</p>';
    } else {
      pinnedList.innerHTML = pinned.map(function(p) { return postCard(p, ''); }).join('');
    }

    /* HOTTEST: top 5 by interactions */
    var withScore = feed
      .filter(function(p) { return !p.pinned; })
      .map(function(p) {
        return { post: p, score: p.likes + getInteractions(p.url) };
      })
      .sort(function(a, b) { return b.score - a.score; })
      .slice(0, 5);

    if (withScore.length === 0) {
      hotList.innerHTML = '<p class="empty" style="padding:12px 0 0;">no posts yet.</p>';
    } else {
      hotList.innerHTML = withScore.map(function(x) { return postCard(x.post, ''); }).join('');
    }

    /* RECENT: 5 most recent by isoDate */
    var recent = feed
      .filter(function(p) { return !p.pinned; })
      .sort(function(a, b) {
        return (b.isoDate || '').localeCompare(a.isoDate || '');
      })
      .slice(0, 5);

    if (recent.length === 0) {
      recentList.innerHTML = '<p class="empty" style="padding:12px 0 0;">no posts yet — working on it.</p>';
    } else {
      recentList.innerHTML = recent.map(function(p) { return postCard(p, ''); }).join('');
    }
  }

  /* Show flat results (search / filter mode) */
  function showResults() {
    pinnedSec.style.display  = 'none';
    hotSec.style.display     = 'none';
    recentSec.style.display  = 'none';
    resultsSec.style.display = 'block';
    rules.forEach(function(r) { r.style.display = 'none'; });

    var q   = searchQuery.toLowerCase();
    var filtered = (window.POSTS || []).filter(function(p) {
      if (p.topics && p.topics.indexOf('journey') !== -1) return false;
      var tagMatch = activeFilter === 'all' || p.tag === activeFilter;
      var searchMatch = !q ||
        p.title.toLowerCase().indexOf(q) !== -1 ||
        (p.tag  && p.tag.toLowerCase().indexOf(q) !== -1)  ||
        (p.desc && p.desc.toLowerCase().indexOf(q) !== -1) ||
        (p.topics && p.topics.some(function(t) { return t.toLowerCase().indexOf(q) !== -1; }));
      return tagMatch && searchMatch;
    });

    postList.innerHTML = '';
    if (filtered.length === 0) {
      emptyState.style.display = 'block';
    } else {
      emptyState.style.display = 'none';
      postList.innerHTML = filtered.map(function(p) { return postCard(p, q); }).join('');
    }
  }

  /* Main render router */
  function render() {
    var isSearching  = searchQuery.length > 0;
    var isFiltering  = activeFilter !== 'all';
    if (isSearching || isFiltering) {
      showResults();
    } else {
      showSections();
    }
  }

  /* Filter buttons */
  btns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      btns.forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      activeFilter = btn.dataset.filter;
      render();
    });
  });

  /* Search */
  if (searchInput) {
    searchInput.addEventListener('input', function() {
      searchQuery = searchInput.value.trim();
      if (searchClear) searchClear.classList.toggle('visible', searchQuery.length > 0);
      if (searchIcon)  searchIcon.style.display = searchQuery.length > 0 ? 'none' : 'block';
      render();
    });
  }

  window.clearSearch = function() {
    if (searchInput) searchInput.value = '';
    searchQuery = '';
    if (searchClear) searchClear.classList.remove('visible');
    if (searchIcon)  searchIcon.style.display = 'block';
    render();
  };

  /* Initial render */
  render();

})();
