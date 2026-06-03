/**
 * Holo Vault — refresh product lists after a normal browser refresh.
 * Shopify edge-caches full HTML pages; this re-fetches the section from the server
 * (with cache busting) so new listings appear without Ctrl+Shift+R.
 */
(function () {
  if (window.__hvFreshContent) return;
  window.__hvFreshContent = true;

  function refreshSection(sectionKey, rootSelector) {
    var root = document.querySelector(rootSelector);
    if (!root) return;

    var url = new URL(window.location.href);
    url.searchParams.set('sections', sectionKey);
    url.searchParams.set('_hv', String(Date.now()));

    fetch(url.toString(), { cache: 'no-store', credentials: 'same-origin' })
      .then(function (res) {
        if (!res.ok) throw new Error('section fetch ' + res.status);
        return res.json();
      })
      .then(function (data) {
        var html = data[sectionKey];
        if (!html) return;

        var wrap = document.createElement('div');
        wrap.innerHTML = html;

        var newRoot = wrap.querySelector(rootSelector);
        if (!newRoot) {
          var sectionWrap = wrap.querySelector('.shopify-section') || wrap.firstElementChild;
          if (sectionWrap) newRoot = sectionWrap.querySelector(rootSelector) || sectionWrap;
        }
        if (!newRoot) return;

        var curTarget = root.querySelector('[data-hv-refresh-target]');
        var newTarget = newRoot.querySelector('[data-hv-refresh-target]');

        if (curTarget && newTarget) {
          curTarget.replaceWith(newTarget);
          return;
        }

        var panel = root.querySelector('.panel');
        var newPanel = newRoot.querySelector('.panel');
        if (panel && newPanel) {
          panel.replaceWith(newPanel);
          return;
        }

        if (newRoot.innerHTML) root.innerHTML = newRoot.innerHTML;
      })
      .catch(function () {
        /* keep server-rendered fallback */
      });
  }

  function runRefresh() {
    if (document.querySelector('[data-hv-refresh="featured"]')) {
      refreshSection('featured', '[data-hv-refresh="featured"]');
    }
    if (document.querySelector('[data-hv-refresh="collection-main"]')) {
      refreshSection('main', '[data-hv-refresh="collection-main"]');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runRefresh);
  } else {
    runRefresh();
  }

  window.addEventListener('pageshow', function (evt) {
    if (evt.persisted) runRefresh();
  });
})();
