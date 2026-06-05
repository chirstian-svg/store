/**
 * Holo Vault — keep product grids fresh on normal refresh.
 * Homepage: re-fetch featured section HTML (same product-card.liquid as collection page).
 * Collection pages: re-fetch the main section HTML (respects sort_by in the URL).
 */
(function () {
  if (window.__hvFreshContent) return;
  window.__hvFreshContent = true;

  function shopifyRoot() {
    var root = (window.Shopify && window.Shopify.routes && window.Shopify.routes.root) || '/';
    return root.charAt(root.length - 1) === '/' ? root : root + '/';
  }

  function replaceRefreshTarget(root, newRoot) {
    if (!root || !newRoot) return false;
    var curTarget = root.querySelector('[data-hv-refresh-target]');
    var newTarget = newRoot.querySelector('[data-hv-refresh-target]');
    if (curTarget && newTarget) {
      curTarget.replaceWith(newTarget);
      return true;
    }
    if (newRoot.innerHTML) {
      root.innerHTML = newRoot.innerHTML;
      return true;
    }
    return false;
  }

  function fetchSectionHtml(sectionKey, baseUrl) {
    var url = new URL(baseUrl || window.location.href);
    url.searchParams.set('sections', sectionKey);
    url.searchParams.set('_hv', String(Date.now()));

    return fetch(url.toString(), { cache: 'no-store', credentials: 'same-origin' })
      .then(function (res) {
        if (!res.ok) throw new Error('section fetch ' + res.status);
        return res.json();
      })
      .then(function (data) {
        return data[sectionKey] || '';
      });
  }

  function parseSectionRoot(html, rootSelector) {
    if (!html) return null;
    var wrap = document.createElement('div');
    wrap.innerHTML = html;

    var newRoot = wrap.querySelector(rootSelector);
    if (!newRoot) {
      var sectionWrap = wrap.querySelector('.shopify-section') || wrap.firstElementChild;
      if (sectionWrap) newRoot = sectionWrap.querySelector(rootSelector) || sectionWrap;
    }
    return newRoot;
  }

  /** Homepage featured row — server-rendered cards (stock_qty metafield + inventory). */
  function refreshHomeFeatured() {
    var root = document.querySelector('[data-hv-refresh="featured"]');
    if (!root) return;

    fetchSectionHtml('featured', shopifyRoot())
      .then(function (html) {
        var newRoot = parseSectionRoot(html, '[data-hv-refresh="featured"]');
        if (newRoot) replaceRefreshTarget(root, newRoot);
      })
      .catch(function () {
        /* keep server-rendered grid */
      });
  }

  function refreshCollectionSection(sectionKey, rootSelector) {
    var root = document.querySelector(rootSelector);
    if (!root) return;

    fetchSectionHtml(sectionKey)
      .then(function (html) {
        var newRoot = parseSectionRoot(html, rootSelector);
        if (newRoot) replaceRefreshTarget(root, newRoot);
      })
      .catch(function () {});
  }

  function runRefresh() {
    if (document.querySelector('[data-hv-refresh="featured"]')) {
      refreshHomeFeatured();
    }
    if (document.querySelector('[data-hv-refresh="collection-main"]')) {
      refreshCollectionSection('main', '[data-hv-refresh="collection-main"]');
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
