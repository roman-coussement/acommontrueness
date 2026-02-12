// art-gallery.js - Interactive rotating art gallery

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
    const ARTWORK_MANIFEST = BASE + 'artwork/artwork.json';
    const DEFAULT_IMAGE = 'iceland_photo.png';
    const SESSION_KEY = 'currentArtwork';
    const HISTORY_KEY = 'artworkHistory';
    const HISTORY_LENGTH = 5;
    
    // Fallback list when artwork.json is unavailable (e.g. local file, network error)
    const FALLBACK_ARTWORK = [
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
        'iceland_photo.png',
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
    
    let artworkFiles = [];
    
    document.addEventListener('DOMContentLoaded', function() {
        initArtGallery();
    });
    
    function initArtGallery() {
        const gallery = document.getElementById('artGallery');
        const image = document.getElementById('artImage');
        
        if (!gallery || !image) return;
        
        // Skip on article pages
        if (document.body.classList.contains('article-page')) return;
        
        // Load artwork manifest, then initialize
        loadArtworkManifest().then(function(files) {
            artworkFiles = files;
            if (artworkFiles.length === 0) return;
            
            let currentArtwork = sessionStorage.getItem(SESSION_KEY);
            const defaultFile = artworkFiles.includes(DEFAULT_IMAGE) ? DEFAULT_IMAGE : artworkFiles[0];
            if (!currentArtwork || !artworkFiles.includes(currentArtwork)) {
                currentArtwork = defaultFile;
            }
            
            setArtwork(image, currentArtwork);
            image.addEventListener('error', function onError() {
                image.removeEventListener('error', onError);
                var next = getRandomArtwork(currentArtwork);
                if (next !== currentArtwork) {
                    setArtwork(image, next);
                    currentArtwork = next;
                    sessionStorage.setItem(SESSION_KEY, currentArtwork);
                    updateHistory(currentArtwork);
                    positionGallery(gallery, image);
                }
            }, { once: true });
            
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
            
            image.addEventListener('click', function() {
                const nextArtwork = getRandomArtwork(currentArtwork);
                // Disable transitions during swap so top/right stay anchored (no movement)
                gallery.style.transition = 'none';
                image.style.transition = 'none';
                function onSwapLoad() {
                    image.removeEventListener('load', onSwapLoad);
                    image.removeEventListener('error', onSwapError);
                    positionGallery(gallery, image);
                    requestAnimationFrame(function() {
                        requestAnimationFrame(function() {
                            gallery.style.transition = '';
                            image.style.transition = '';
                        });
                    });
                }
                function onSwapError() {
                    image.removeEventListener('load', onSwapLoad);
                    image.removeEventListener('error', onSwapError);
                    var fallback = getRandomArtwork(nextArtwork);
                    if (fallback !== nextArtwork) {
                        setArtwork(image, fallback);
                        currentArtwork = fallback;
                        sessionStorage.setItem(SESSION_KEY, currentArtwork);
                        updateHistory(currentArtwork);
                        image.addEventListener('load', onSwapLoad, { once: true });
                        image.addEventListener('error', function() {
                            positionGallery(gallery, image);
                        }, { once: true });
                    }
                    requestAnimationFrame(function() {
                        requestAnimationFrame(function() {
                            gallery.style.transition = '';
                            image.style.transition = '';
                        });
                    });
                }
                image.addEventListener('load', onSwapLoad, { once: true });
                image.addEventListener('error', onSwapError, { once: true });
                setArtwork(image, nextArtwork);
                currentArtwork = nextArtwork;
                sessionStorage.setItem(SESSION_KEY, currentArtwork);
                updateHistory(currentArtwork);
                positionGallery(gallery, image);
            });
        });
    }
    
    const IMAGE_EXT_REGEX = /\.(jpg|jpeg|png|avif|webp|gif)$/i;
    
    function loadArtworkManifest() {
        return fetch(ARTWORK_MANIFEST)
            .then(function(res) { return res.ok ? res.json() : Promise.reject(); })
            .then(function(files) {
                return Array.isArray(files) ? files.filter(function(f) {
                    return typeof f === 'string' && IMAGE_EXT_REGEX.test(f);
                }) : [];
            })
            .catch(function() {
                return FALLBACK_ARTWORK;
            });
    }
    
    function setArtwork(imageElement, filename) {
        imageElement.src = ARTWORK_FOLDER + filename;
        imageElement.alt = 'Artwork: ' + filename.replace(IMAGE_EXT_REGEX, '');
    }
    
    function getRandomArtwork(currentFilename) {
        const history = getHistory();
        let availableFiles = artworkFiles.filter(function(file) {
            return file !== currentFilename && !history.includes(file);
        });
        
        if (availableFiles.length === 0) {
            clearHistory();
            availableFiles = artworkFiles.filter(function(file) {
                return file !== currentFilename;
            });
        }
        
        if (availableFiles.length === 0) {
            return currentFilename;
        }
        
        const randomIndex = Math.floor(Math.random() * availableFiles.length);
        return availableFiles[randomIndex];
    }
    
    function getHistory() {
        const historyJson = sessionStorage.getItem(HISTORY_KEY);
        if (!historyJson) return [];
        try {
            return JSON.parse(historyJson);
        } catch (e) {
            return [];
        }
    }
    
    function updateHistory(filename) {
        let history = getHistory();
        history.push(filename);
        if (history.length > HISTORY_LENGTH) {
            history = history.slice(-HISTORY_LENGTH);
        }
        sessionStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    }
    
    function clearHistory() {
        sessionStorage.removeItem(HISTORY_KEY);
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
