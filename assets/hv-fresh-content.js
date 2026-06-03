/**
 * Holo Vault — keep product grids fresh on normal refresh.
 * Homepage: fetch /collections/pokemon/products.json sorted newest-first (limit 4).
 * Collection pages: re-fetch the main section HTML (respects sort_by in the URL).
 */
(function () {
  if (window.__hvFreshContent) return;
  window.__hvFreshContent = true;

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/"/g, '&quot;');
  }

  function formatMoney(cents) {
    if (window.Shopify && typeof Shopify.formatMoney === 'function') {
      return Shopify.formatMoney(cents);
    }
    return '$' + (Number(cents) / 100).toFixed(2);
  }

  function productFinish(title) {
    if (!title || title.indexOf(' — ') === -1) return 'Pokémon Card';
    return title.split(' — ').pop().trim() || 'Pokémon Card';
  }

  function stockLine(product, variant) {
    var v = variant || (product.variants && product.variants[0]);
    if (!v) return '';
    if (v.inventory_management === 'shopify' && v.inventory_quantity > 0) {
      var q = v.inventory_quantity;
      return (
        '<p class="hv-stock hv-stock--in">' +
        (q === 1 ? '1 in stock' : q + ' in stock') +
        '</p>'
      );
    }
    if (product.available) {
      return '<p class="hv-stock hv-stock--in">In stock</p>';
    }
    return '<p class="hv-stock hv-stock--out">Sold out</p>';
  }

  function renderProductCard(product) {
    var variant = product.variants && product.variants[0];
    var img =
      product.featured_image ||
      (product.images && product.images[0] && (product.images[0].src || product.images[0]));
    var imgTag = img
      ? '<img src="' +
        escapeHtml(img) +
        '" alt="' +
        escapeHtml(product.title) +
        '" loading="lazy" class="hv-product-img">'
      : '';
    var url = product.url || '/products/' + product.handle;
    var finish = productFinish(product.title);
    var actions = '';

    if (product.available && variant && variant.id) {
      actions +=
        '<form method="post" action="/cart/add" class="product-card__form" id="card-form-' +
        product.id +
        '">' +
        '<input type="hidden" name="id" value="' +
        variant.id +
        '">' +
        '<button type="submit" name="add" class="btn primary product-card__atc">Add to cart</button>' +
        '</form>' +
        '<a class="btn secondary product-card__view" href="' +
        escapeHtml(url) +
        '">View details</a>';
    } else {
      actions = '<span class="product-card__sold">Sold out</span>';
    }

    return (
      '<article class="product">' +
      '<a class="product-img product-img--link" href="' +
      escapeHtml(url) +
      '" aria-label="' +
      escapeHtml(product.title) +
      '">' +
      imgTag +
      '</a>' +
      '<div class="product-info">' +
      '<a class="product-info__title-link" href="' +
      escapeHtml(url) +
      '"><h3>' +
      escapeHtml(product.title) +
      '</h3></a>' +
      '<p class="product-info__type"><span class="product-info__finish">' +
      escapeHtml(finish) +
      '</span></p>' +
      '<div class="price">' +
      (variant ? formatMoney(variant.price) : '') +
      '</div>' +
      stockLine(product, variant) +
      '<div class="product-card__actions">' +
      actions +
      '</div>' +
      '</div>' +
      '</article>'
    );
  }

  function shopifyRoot() {
    return (window.Shopify && window.Shopify.routes && window.Shopify.routes.root) || '/';
  }

  function refreshHomeFeatured() {
    var grid = document.querySelector('[data-hv-refresh-target].product-grid--home');
    if (!grid) return;

    var handle = grid.getAttribute('data-hv-collection') || 'pokemon';
    var sort = grid.getAttribute('data-hv-sort') || 'created-descending';
    var limit = grid.getAttribute('data-hv-limit') || '4';
    var url =
      shopifyRoot() +
      'collections/' +
      encodeURIComponent(handle) +
      '/products.json?limit=' +
      encodeURIComponent(limit) +
      '&sort_by=' +
      encodeURIComponent(sort) +
      '&_hv=' +
      Date.now();

    fetch(url, { cache: 'no-store', credentials: 'same-origin' })
      .then(function (res) {
        if (!res.ok) throw new Error('products.json ' + res.status);
        return res.json();
      })
      .then(function (data) {
        if (!data.products || !data.products.length) return;
        grid.innerHTML = data.products.map(renderProductCard).join('');
      })
      .catch(function () {
        /* keep server-rendered grid */
      });
  }

  function refreshCollectionSection(sectionKey, rootSelector) {
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

        if (newRoot.innerHTML) root.innerHTML = newRoot.innerHTML;
      })
      .catch(function () {});
  }

  function runRefresh() {
    /* Homepage uses inline loader in hv-home-featured-loader.liquid */
    if (document.querySelector('[data-hv-refresh="featured"]') && !document.getElementById('hv-home-featured')) {
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
