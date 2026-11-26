// Plain module (not 'use client') so the server layout can inline the script string.
export const PRELOADER_SEEN_KEY = 'invento-intro-seen'
export const PRELOADER_DONE_EVENT = 'invento:preloader-done'
export const PRELOADER_SKIP_EVENT = 'invento:preloader-skip'

/**
 * Runs before first paint:
 * 1. decides whether this page view shows the preloader (home only, first visit this session,
 *    motion allowed, no ?skip / ?motion=off). `?intro` shows it again in the same session;
 * 2. wires Skip, Escape and Tab immediately, so skipping works even before React has loaded
 *    (slow phones), and keyboard users never tab into links hidden under the overlay.
 *    React's Preloader hears the skip event and stops its animation.
 */
export const PRELOADER_INLINE_SCRIPT = `(function(){try{var d=document.documentElement,l=location;if(!/^\\/(mk|en)\\/?$/.test(l.pathname))return;if(/[?&](skip|motion=off)\\b/.test(l.search))return;if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;if(!/[?&]intro\\b/.test(l.search)&&sessionStorage.getItem('${PRELOADER_SEEN_KEY}'))return;d.classList.add('show-preloader');try{sessionStorage.setItem('${PRELOADER_SEEN_KEY}','1')}catch(e){}var skip=function(){if(!d.classList.contains('show-preloader'))return;d.classList.remove('show-preloader');window.dispatchEvent(new Event('${PRELOADER_SKIP_EVENT}'))};document.addEventListener('click',function(e){var t=e.target;if(t&&t.closest&&t.closest('[data-preloader-skip]'))skip()},true);document.addEventListener('keydown',function(e){if(e.key==='Escape'||e.key==='Tab'){if(d.classList.contains('show-preloader')&&e.key==='Tab')e.preventDefault();skip()}})}catch(e){}})();`
