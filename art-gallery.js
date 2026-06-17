// art-gallery.js - Static headshot in the left margin (non-interactive)

(function() {
    'use strict';

    // Base path for GitHub Pages (works with subpath or root)
    var scriptEl = document.currentScript || document.querySelector('script[src*="art-gallery"]');
    var BASE = '/';
    if (scriptEl && scriptEl.src) {
        var url = new URL(scriptEl.src);
        BASE = url.pathname.replace(/\/[^/]*$/, '/') || '/';
    }

    // Configuration
    const ARTWORK_FOLDER = BASE + 'artwork/';
    const HEADSHOT_IMAGE = 'iceland_photo.png';

    document.addEventListener('DOMContentLoaded', function() {
        initHeadshot();
    });

    function initHeadshot() {
        const gallery = document.getElementById('artGallery');
        const image = document.getElementById('artImage');

        if (!gallery || !image) return;

        // Skip on article pages
        if (document.body.classList.contains('article-page')) return;

        // Render the headshot as a fixed, non-interactive image
        image.src = ARTWORK_FOLDER + HEADSHOT_IMAGE;
        image.alt = 'roman coussement';

        // Disable transitions on initial load to prevent flash
        gallery.style.transition = 'none';
        image.style.transition = 'none';

        // Position gallery after image loads (needed for desktop dimensions)
        image.addEventListener('load', function onLoad() {
            image.removeEventListener('load', onLoad);
            positionGallery(gallery, image);
        });
        positionGallery(gallery, image);

        // Re-enable transitions after initial positioning (next frame)
        requestAnimationFrame(function() {
            requestAnimationFrame(function() {
                gallery.style.transition = '';
                image.style.transition = '';
            });
        });

        // Attach optimized resize listener
        window.addEventListener('resize', function() {
            handleResize(gallery, image);
        });

        // Reposition after full page load (fonts, images) - fixes GitHub Pages timing
        window.addEventListener('load', function() {
            positionGallery(gallery, image);
        });

        // Smooth scroll handling
        let scrollRAF = null;
        window.addEventListener('scroll', function() {
            if (window.innerWidth < 1200) return; // Only on desktop

            if (scrollRAF) {
                cancelAnimationFrame(scrollRAF);
            }

            scrollRAF = requestAnimationFrame(function() {
                positionGallery(gallery, image);
                scrollRAF = null;
            });
        }, { passive: true });
    }

    // Optimized positioning function with batched reads/writes
    function positionGallery(gallery, image) {
        // Only run on desktop layouts
        if (window.innerWidth < 1200) {
            // Clear custom properties on non-desktop
            gallery.style.removeProperty('--gallery-x');
            gallery.style.removeProperty('--gallery-y');
            gallery.style.removeProperty('--gallery-max-height');
            gallery.style.removeProperty('--gallery-max-width');
            gallery.style.paddingTop = '';
            gallery.classList.remove('hidden');
            gallery.classList.remove('gallery-at-bottom');
            return;
        }

        const titleElement = document.querySelector('.site-title');
        const lastNavItem = document.querySelector('.nav-menu-desktop .nav-item:last-child');

        if (!titleElement || !lastNavItem) {
            gallery.classList.remove('hidden');
            gallery.classList.add('gallery-at-bottom');
            gallery.style.removeProperty('--gallery-x');
            gallery.style.removeProperty('--gallery-y');
            gallery.style.removeProperty('--gallery-max-height');
            gallery.style.removeProperty('--gallery-max-width');
            gallery.style.paddingTop = '';
            return;
        }

        // ===== BATCH ALL READS FIRST (single layout pass) =====
        const titleRect = titleElement.getBoundingClientRect();
        const lastNavRect = lastNavItem.getBoundingClientRect();

        // ===== PERFORM CALCULATIONS (no DOM access) =====

        const spacing = 20;
        const minLeftMargin = 24;
        const padding = 32; // var(--space-xl) horizontal padding each side
        // Max width available for image in left margin (consistent for all images at this viewport)
        const availableWidth = titleRect.left - spacing - minLeftMargin - (padding * 2);

        // Min width threshold: if too narrow, show all at bottom instead of tiny left image
        const minWidthForLeft = 150;
        const useLeftMargin = availableWidth >= minWidthForLeft;

        // Calculate max height: from title top to nav bottom with padding
        const maxHeight = Math.max(200, lastNavRect.bottom - titleRect.top - 20);

        // When using left margin: constrain image so it always fits (same decision for all images)
        const maxImageWidth = Math.max(100, availableWidth);

        // ===== WRITE max-width FIRST so gallery dimensions are correct =====
        gallery.style.setProperty('--gallery-max-height', maxHeight + 'px');
        gallery.style.setProperty('--gallery-max-width', useLeftMargin ? (maxImageWidth + 'px') : 'none');

        // Read gallery width after max-width applied (needed for X position)
        const galleryWidth = gallery.offsetWidth;

        // Calculate X position: align right edge with left edge of title
        const galleryX = titleRect.left - galleryWidth - spacing;
        const galleryY = titleRect.top + 12; // Halfway between title top and +24px

        // ===== BATCH REMAINING WRITES =====

        gallery.style.setProperty('--gallery-x', galleryX + 'px');
        gallery.style.setProperty('--gallery-y', galleryY + 'px');

        // At a given width: either ALL on left (resized to fit) or ALL at bottom
        if (useLeftMargin) {
            gallery.classList.remove('hidden');
            gallery.classList.remove('gallery-at-bottom');
            gallery.style.paddingTop = '0'; // Remove top padding so image top aligns with title top
        } else {
            gallery.classList.remove('hidden');
            gallery.classList.add('gallery-at-bottom');
            gallery.style.paddingTop = ''; // Restore default padding
        }
    }

    // Optimized resize handler using requestAnimationFrame
    let resizeRAF = null;
    let lastWidth = window.innerWidth;
    let lastHeight = window.innerHeight;

    function handleResize(gallery, image) {
        // Cancel pending frame if exists
        if (resizeRAF) {
            cancelAnimationFrame(resizeRAF);
        }

        // Schedule new frame
        resizeRAF = requestAnimationFrame(function() {
            // Only recalculate if dimensions meaningfully changed
            const currentWidth = window.innerWidth;
            const currentHeight = window.innerHeight;

            // Threshold: ignore tiny changes (< 10px)
            const widthChanged = Math.abs(currentWidth - lastWidth) > 10;
            const heightChanged = Math.abs(currentHeight - lastHeight) > 10;

            if (widthChanged || heightChanged) {
                positionGallery(gallery, image);
                lastWidth = currentWidth;
                lastHeight = currentHeight;
            }

            resizeRAF = null;
        });
    }
})();
