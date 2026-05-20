(function () {
  var ZOOM = 2.5;
  var LENS_SIZE = 140;

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function openModal(modal) {
    if (!modal) return;
    modal.hidden = false;
    document.body.classList.add('product-zoom-modal-open');
    var closeBtn = modal.querySelector('.product-zoom-modal__close');
    if (closeBtn) closeBtn.focus();
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.hidden = true;
    document.body.classList.remove('product-zoom-modal-open');
  }

  function init(root) {
    var stage = root.querySelector('.product-zoom__stage');
    var img = root.querySelector('.product-zoom__img');
    var lens = root.querySelector('.product-zoom__lens');
    var pane = root.querySelector('.product-zoom__pane');
    var modal = root.nextElementSibling;
    if (!modal || !modal.hasAttribute('data-zoom-modal')) {
      modal = document.querySelector('[data-zoom-modal]');
    }

    if (!stage || !img || !lens || !pane) return;

    var zoomSrc = img.getAttribute('data-zoom-src') || img.src;
    var canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    function setPaneBackground() {
      var rect = stage.getBoundingClientRect();
      pane.style.backgroundImage = 'url("' + zoomSrc + '")';
      pane.style.backgroundSize = rect.width * ZOOM + 'px ' + rect.height * ZOOM + 'px';
    }

    function showZoom(clientX, clientY) {
      var rect = stage.getBoundingClientRect();
      var x = clientX - rect.left;
      var y = clientY - rect.top;
      var half = LENS_SIZE / 2;

      var lensLeft = clamp(x - half, 0, rect.width - LENS_SIZE);
      var lensTop = clamp(y - half, 0, rect.height - LENS_SIZE);

      lens.style.width = LENS_SIZE + 'px';
      lens.style.height = LENS_SIZE + 'px';
      lens.style.transform = 'translate(' + lensLeft + 'px, ' + lensTop + 'px)';
      lens.classList.add('is-active');

      var pctX = ((x / rect.width) * 100).toFixed(2);
      var pctY = ((y / rect.height) * 100).toFixed(2);

      setPaneBackground();
      pane.style.backgroundPosition = pctX + '% ' + pctY + '%';
      pane.classList.add('is-active');
      root.classList.add('is-zooming');
    }

    function hideZoom() {
      lens.classList.remove('is-active');
      pane.classList.remove('is-active');
      root.classList.remove('is-zooming');
    }

    if (canHover) {
      stage.addEventListener('mouseenter', setPaneBackground);
      stage.addEventListener('mousemove', function (e) {
        showZoom(e.clientX, e.clientY);
      });
      stage.addEventListener('mouseleave', hideZoom);
    }

    function bindOpen(el) {
      if (!el) return;
      el.addEventListener('click', function () {
        openModal(modal);
      });
    }

    bindOpen(root.querySelector('[data-zoom-open]'));
    if (!canHover) {
      stage.addEventListener('click', function () {
        openModal(modal);
      });
      stage.style.cursor = 'zoom-in';
    } else {
      stage.addEventListener('click', function () {
        openModal(modal);
      });
      stage.style.cursor = 'crosshair';
    }

    if (modal) {
      modal.querySelectorAll('[data-zoom-close]').forEach(function (el) {
        el.addEventListener('click', function () {
          closeModal(modal);
        });
      });

      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && !modal.hidden) closeModal(modal);
      });
    }

    window.addEventListener('resize', setPaneBackground);
  }

  function boot() {
    document.querySelectorAll('[data-product-zoom]').forEach(init);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
