// gallery.js - Endless horizontal carousel (vanilla JS, no build step)
// Wheel scroll pans horizontally, click-drag pans, content loops seamlessly.

(function() {
    'use strict';

    // Base path for GitHub Pages (works at root or subpath)
    var scriptEl = document.currentScript || document.querySelector('script[src*="gallery.js"]');
    var BASE = '/';
    if (scriptEl && scriptEl.src) {
        var url = new URL(scriptEl.src);
        // gallery.js lives at the site root; strip the filename
        BASE = url.pathname.replace(/\/gallery\.js.*$/, '/') || '/';
    }

    var ARTWORK_FOLDER = BASE + 'artwork/';
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
        var wrapper = document.getElementById('galleryCarousel');
        var track = document.getElementById('galleryTrack');
        if (!wrapper || !track || files.length === 0) return;

        var GAP = 16; // px space between images (kept consistent for seamless looping)

        // ----- state -----
        var period = 0;        // width of one full set of images (incl. trailing gap)
        var scroll = 0;        // current scroll position; increasing = move right
        var vel = 0;           // velocity for inertia / wheel glide
        var dragging = false;
        var startX = 0;
        var startScroll = 0;
        var lastX = 0;
        var lastDX = 0;
        var ready = false;

        var FRICTION = 0.92;
        var MAX_VEL = 60;

        build();
        window.addEventListener('resize', debounce(build, 150));

        // ----- build / measure / clone -----
        function build() {
            track.innerHTML = '';
            ready = false;

            var originals = files.map(makeImage);
            originals.forEach(function(im) { track.appendChild(im); });

            settle(originals).then(function() {
                // Drop any images that failed to load so they don't break measurement
                var good = originals.filter(function(im) {
                    return im.naturalWidth > 0 && im.offsetWidth > 0;
                });
                originals.forEach(function(im) {
                    if (good.indexOf(im) === -1 && im.parentNode) im.parentNode.removeChild(im);
                });
                if (good.length === 0) return;

                // One set's advance = sum of widths + a trailing gap after each
                period = 0;
                good.forEach(function(im) { period += im.offsetWidth + GAP; });

                // Clone whole sets until the track comfortably covers viewport + one period
                var needed = Math.ceil((wrapper.offsetWidth + period) / period) + 1;
                for (var s = 1; s < needed; s++) {
                    good.forEach(function(im) { track.appendChild(im.cloneNode(true)); });
                }

                scroll = 0;
                vel = 0;
                ready = true;
            });
        }

        function makeImage(file) {
            var im = document.createElement('img');
            im.className = 'gallery-image';
            im.src = ARTWORK_FOLDER + file;
            im.alt = file.replace(IMAGE_EXT, '').replace(/[-_]+/g, ' ');
            im.draggable = false;
            im.style.marginRight = GAP + 'px';
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

        // ----- wrap helper -----
        function wrap() {
            if (period > 0) {
                scroll = ((scroll % period) + period) % period;
            }
        }

        // ----- animation loop -----
        function tick() {
            if (ready) {
                if (!dragging) {
                    scroll += vel;
                    vel *= FRICTION;
                    if (Math.abs(vel) < 0.04) vel = 0;
                }
                wrap();
                track.style.transform = 'translate3d(' + (-scroll) + 'px,0,0)';
            }
            requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);

        // ----- wheel: vertical (or horizontal) delta -> horizontal pan -----
        wrapper.addEventListener('wheel', function(e) {
            if (!ready) return;
            e.preventDefault();
            var delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
            // scrolling down (positive) moves right
            vel += delta * 0.18;
            if (vel > MAX_VEL) vel = MAX_VEL;
            if (vel < -MAX_VEL) vel = -MAX_VEL;
        }, { passive: false });

        // ----- click / touch drag -----
        wrapper.addEventListener('pointerdown', function(e) {
            if (!ready) return;
            dragging = true;
            startX = e.clientX;
            startScroll = scroll;
            lastX = e.clientX;
            lastDX = 0;
            vel = 0;
            wrapper.classList.add('dragging');
            wrapper.setPointerCapture(e.pointerId);
        });

        wrapper.addEventListener('pointermove', function(e) {
            if (!dragging) return;
            var dx = e.clientX - startX;
            scroll = startScroll - dx; // drag right -> reveal earlier images
            lastDX = e.clientX - lastX;
            lastX = e.clientX;
        });

        function endDrag(e) {
            if (!dragging) return;
            dragging = false;
            wrapper.classList.remove('dragging');
            // carry drag momentum into inertia
            vel = -lastDX;
            if (vel > MAX_VEL) vel = MAX_VEL;
            if (vel < -MAX_VEL) vel = -MAX_VEL;
            if (e.pointerId != null && wrapper.hasPointerCapture && wrapper.hasPointerCapture(e.pointerId)) {
                wrapper.releasePointerCapture(e.pointerId);
            }
        }
        wrapper.addEventListener('pointerup', endDrag);
        wrapper.addEventListener('pointercancel', endDrag);
        wrapper.addEventListener('pointerleave', endDrag);

        // Prevent native image drag ghost
        wrapper.addEventListener('dragstart', function(e) { e.preventDefault(); });
    }

    function debounce(fn, ms) {
        var t = null;
        return function() {
            if (t) clearTimeout(t);
            t = setTimeout(fn, ms);
        };
    }
})();
