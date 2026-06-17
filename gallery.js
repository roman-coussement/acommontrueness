// gallery.js - Endless horizontal carousel (vanilla JS, no build step)
// The carousel is a flex, overflow:hidden scroll container. We pan it by setting
// scrollLeft from wheel + drag, and loop endlessly with cloned image nodes.

(function() {
    'use strict';

    // Paths are RELATIVE to the gallery page (gallery/index.html). The artwork
    // folder is a sibling of the gallery folder, so "../artwork/" resolves
    // correctly whether the site is served at the domain root, a project
    // subpath, or opened directly via file:// .
    var ARTWORK_FOLDER = '../artwork/';
    var MANIFEST = ARTWORK_FOLDER + 'artwork.json';
    // The personal photo shown on the home page - not part of the artwork gallery
    var EXCLUDE = ['iceland_photo.png'];

    // Fallback list (mirrors artwork.json) for when fetch is unavailable (file://)
    var FALLBACK = [
        'ansel-adams-moon-over-half-domr.png',
        'ansel-adams-petroglyphs.jpg',
        'caravaggio_beheading_of_john.jpg',
        'caravaggio_judith_beheading_holofernes.jpg',
        'fayum_mummy.jpg',
        'fayum_mummy_2.jpg',
        'gordon-parks-the-invisible-man.jpg',
        'goya-el-colosso.jpg',
        'goya_2ndmay.jpg',
        'goya_thedog.jpg',
        'hockney_american_collectors_fred_and_marcia_weisman.jpg',
        'hockney_my_parents.jpg',
        'hockney_portrait_of_an_artist.avif',
        'hopper_chop_suey.jpg',
        'hopper_gas.png',
        'hopper_soir_bleu.jpg',
        'kandinsky-color-study.jpg',
        'kandinsky-impression-iii-concert.jpg',
        'mondrian_broadway_boogie-woogie.jpg',
        'mondrian_windmill_in_sunglight.jpg',
        'picasso_bulls_head.jpg',
        'picasso_don_quixote.jpg',
        'picasso_guernica.jpg',
        'picasso_le_taureau.jpg',
        'rembrandt-syndics-of-the-drapers-guild.jpg',
        'w-eugene-smith-steelworker-with-goggles.jpg'
    ];

    var IMAGE_EXT = /\.(jpg|jpeg|png|avif|webp|gif)$/i;

    document.addEventListener('DOMContentLoaded', function() {
        loadList().then(initCarousel);
    });

    function loadList() {
        return fetch(MANIFEST)
            .then(function(r) { return r.ok ? r.json() : Promise.reject(); })
            .then(function(files) {
                return Array.isArray(files) ? files : FALLBACK;
            })
            .catch(function() { return FALLBACK; })
            .then(function(files) {
                return files.filter(function(f) {
                    return typeof f === 'string' && IMAGE_EXT.test(f) && EXCLUDE.indexOf(f) === -1;
                });
            });
    }

    function initCarousel(files) {
        var carousel = document.getElementById('galleryCarousel');
        if (!carousel || files.length === 0) return;

        // ----- state -----
        var setWidth = 0;     // width of ONE original set of images (the loop period)
        var ready = false;

        build();
        window.addEventListener('resize', debounce(build, 150));

        // ----- build: render originals, then clone the set so we can loop endlessly -----
        function build() {
            ready = false;
            carousel.innerHTML = '';

            var originals = files.map(makeImage);
            originals.forEach(function(im) { carousel.appendChild(im); });

            settle(originals).then(function() {
                // Drop any images that failed to load so they don't break the math
                var good = originals.filter(function(im) {
                    return im.naturalWidth > 0 && im.offsetWidth > 0;
                });
                originals.forEach(function(im) {
                    if (good.indexOf(im) === -1 && im.parentNode) im.parentNode.removeChild(im);
                });
                if (good.length === 0) return;

                // Append two more clone sets -> [orig][cloneA][cloneB] (3 identical sets).
                // Starting in the middle set lets us loop in BOTH directions seamlessly.
                var cloneSetA = good.map(function(im) { return im.cloneNode(true); });
                var cloneSetB = good.map(function(im) { return im.cloneNode(true); });
                cloneSetA.forEach(function(c) { carousel.appendChild(c); });
                cloneSetB.forEach(function(c) { carousel.appendChild(c); });

                // The first clone's offset from the start IS the exact set width (incl. gaps).
                setWidth = cloneSetA[0].offsetLeft;

                // Park in the middle set so there is a full set of buffer on each side.
                carousel.scrollLeft = setWidth;
                ready = true;
            });
        }

        function makeImage(file) {
            var im = document.createElement('img');
            im.className = 'gallery-image';
            im.src = ARTWORK_FOLDER + file;
            im.alt = file.replace(IMAGE_EXT, '').replace(/[-_]+/g, ' ');
            im.draggable = false;
            return im;
        }

        function settle(imgs) {
            return Promise.all(imgs.map(function(im) {
                if (im.complete) return Promise.resolve();
                return new Promise(function(res) {
                    im.addEventListener('load', res, { once: true });
                    im.addEventListener('error', res, { once: true });
                });
            }));
        }

        // ----- endless loop: keep scrollLeft within [setWidth, 2*setWidth) -----
        // Because the three sets are identical, shifting by exactly setWidth is
        // visually seamless (the same pixels are on screen before and after).
        function normalize() {
            if (setWidth <= 0) return;
            if (carousel.scrollLeft >= setWidth * 2) {
                carousel.scrollLeft -= setWidth;
            } else if (carousel.scrollLeft < setWidth) {
                carousel.scrollLeft += setWidth;
            }
        }
        carousel.addEventListener('scroll', normalize);

        // ----- wheel: vertical (or horizontal) delta -> horizontal scrollLeft -----
        carousel.addEventListener('wheel', function(e) {
            if (!ready) return;
            e.preventDefault();
            // Use the dominant axis; trackpads send deltaX, mouse wheels send deltaY.
            var delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
            carousel.scrollLeft += delta; // scrolling down (positive) moves right
            normalize();
        }, { passive: false });

        // ----- click & drag panning (mousedown / mousemove / mouseup) -----
        var isDown = false;
        var startX = 0;
        var startScroll = 0;

        carousel.addEventListener('mousedown', function(e) {
            if (!ready) return;
            isDown = true;
            startX = e.pageX;
            startScroll = carousel.scrollLeft;
            carousel.classList.add('dragging');
            e.preventDefault();
        });

        // Listen on window so a drag continues even if the cursor leaves the strip.
        window.addEventListener('mousemove', function(e) {
            if (!isDown) return;
            var dx = e.pageX - startX;
            carousel.scrollLeft = startScroll - dx; // drag right -> reveal earlier images
            normalize();
        });

        window.addEventListener('mouseup', function() {
            if (!isDown) return;
            isDown = false;
            carousel.classList.remove('dragging');
        });

        // ----- touch panning (mobile) -----
        var touchX = 0;
        var touchScroll = 0;
        carousel.addEventListener('touchstart', function(e) {
            if (!ready) return;
            touchX = e.touches[0].pageX;
            touchScroll = carousel.scrollLeft;
        }, { passive: true });

        carousel.addEventListener('touchmove', function(e) {
            if (!ready) return;
            var dx = e.touches[0].pageX - touchX;
            carousel.scrollLeft = touchScroll - dx;
            normalize();
            e.preventDefault();
        }, { passive: false });

        // Prevent the native image drag-ghost from hijacking a pan
        carousel.addEventListener('dragstart', function(e) { e.preventDefault(); });
    }

    function debounce(fn, ms) {
        var t = null;
        return function() {
            if (t) clearTimeout(t);
            t = setTimeout(fn, ms);
        };
    }
})();
