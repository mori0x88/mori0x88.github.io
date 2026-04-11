(function() {
  var activeFilter = null;
  var searchQuery  = '';

  var TOPIC_KEYS = [
    'idor','ssrf','xss','logic','auth','graphql',
    'recon','ai','video','writeup','notes','journey'
  ];

  function highlight(text, q) {
    if (!q) return text;
    var idx = text.toLowerCase().indexOf(q);
    if (idx === -1) return text;
    return text.substring(0, idx) + '<mark>' + text.substring(idx, idx+q.length) + '</mark>' + text.substring(idx+q.length);
  }

  function updateCounts() {
    TOPIC_KEYS.forEach(function(t) {
      var el = document.getElementById('count-' + t);
      if (!el) return;
      var count = (window.POSTS || []).filter(function(p) {
        return p.topics && p.topics.indexOf(t) !== -1;
      }).length;
      var unit = t === 'video' ? 'video' : t === 'writeup' ? 'writeup' : t === 'notes' ? 'note' : t === 'journey' ? 'entry' : 'post';
      el.textContent = count + ' ' + unit + (count !== 1 ? 's' : '');
    });
  }

  function render() {
    var list  = document.getElementById('post-list');
    var empty = document.getElementById('empty-state');
    var label = document.getElementById('filter-label');
    var q = searchQuery.toLowerCase();

    var filtered = (window.POSTS || []).filter(function(p) {
      var topicMatch  = !activeFilter || (p.topics && p.topics.indexOf(activeFilter) !== -1);
      var searchMatch = !q ||
        p.title.toLowerCase().indexOf(q) !== -1 ||
        (p.tag  && p.tag.toLowerCase().indexOf(q) !== -1) ||
        (p.desc && p.desc.toLowerCase().indexOf(q) !== -1) ||
        (p.topics && p.topics.some(function(t){ return t.toLowerCase().indexOf(q) !== -1; }));
      return topicMatch && searchMatch;
    });

    list.innerHTML = '';
    list.style.display = '';

    if (filtered.length === 0) {
      empty.style.display = 'block';
    } else {
      empty.style.display = 'none';
      list.innerHTML = filtered.map(function(p) {
        var topicTags = (p.topics || [])
          .map(function(t) { return '<span class="post-tag" style="font-size:8px;">' + t + '</span>'; })
          .join('');
        return (
          '<a href="' + p.url + '" class="post-item">' +
            '<span class="post-date">' + p.date + '</span>' +
            '<span class="post-tag">' + p.tag + '</span>' +
            '<div class="post-meta-row">' +
              '<span class="post-title">' + highlight(p.title, searchQuery) + '</span>' +
              (p.desc ? '<span class="post-desc">' + highlight(p.desc, searchQuery) + '</span>' : '') +
              (topicTags ? '<div style="display:flex;gap:6px;margin-top:5px;flex-wrap:wrap;">' + topicTags + '</div>' : '') +
            '</div>' +
          '</a>'
        );
      }).join('');
    }

    if (label) {
      if (activeFilter) {
        label.style.display = 'block';
        var span = document.getElementById('active-topic');
        if (span) span.textContent = activeFilter;
      } else {
        label.style.display = 'none';
      }
    }
  }

  /* Topic card clicks */
  document.querySelectorAll('.topic-card').forEach(function(card) {
    card.addEventListener('click', function() {
      var topic = card.dataset.topic;
      document.querySelectorAll('.topic-card').forEach(function(c) {
        c.classList.remove('active-card');
      });
      if (activeFilter === topic) {
        activeFilter = null;
      } else {
        activeFilter = topic;
        card.classList.add('active-card');
      }
      render();
    });
  });

  window.clearFilter = function() {
    activeFilter = null;
    document.querySelectorAll('.topic-card').forEach(function(c) {
      c.classList.remove('active-card');
    });
    render();
  };

  /* Search */
  var searchInput = document.getElementById('search-input');
  var searchClear = document.getElementById('search-clear');
  var searchIcon  = document.getElementById('search-icon');

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

  updateCounts();
  render();
})();
