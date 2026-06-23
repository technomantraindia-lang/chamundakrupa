// script.js
document.addEventListener("DOMContentLoaded", function() {
    function initializeDynamicHeader() {
        const header = document.querySelector('.main-header');
        if (!header) return;

        const menuToggle = header.querySelector('.mobile-menu-toggle');
        const nav = header.querySelector('.centered-nav');
        const primaryNavLinks = header.querySelectorAll('nav ul a');
        const navLinks = header.querySelectorAll('nav a');
        const backdrop = document.querySelector('.mobile-nav-backdrop');
        const desktopBreakpoint = window.matchMedia('(min-width: 769px)');
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';

        primaryNavLinks.forEach(link => {
            const linkPage = new URL(link.href, window.location.href).pathname.split('/').pop() || 'index.html';

            if (linkPage === currentPage) {
                link.classList.add('active');
                link.setAttribute('aria-current', 'page');
            }
        });

        if (!menuToggle || !nav || !backdrop) return;

        const setMenuState = (isOpen) => {
            header.classList.toggle('menu-open', isOpen);
            document.body.classList.toggle('menu-open', isOpen);
            menuToggle.setAttribute('aria-expanded', String(isOpen));
            menuToggle.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
            backdrop.hidden = !isOpen;
        };

        const closeMenu = () => setMenuState(false);

        menuToggle.addEventListener('click', () => {
            setMenuState(!header.classList.contains('menu-open'));
        });

        backdrop.addEventListener('click', closeMenu);

        navLinks.forEach(link => {
            link.addEventListener('click', closeMenu);
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && header.classList.contains('menu-open')) {
                closeMenu();
            }
        });

        desktopBreakpoint.addEventListener('change', (event) => {
            if (event.matches) {
                closeMenu();
            }
        });
    }

    // Load Header
    fetch("header.html?t=" + new Date().getTime())
        .then(response => response.text())
        .then(data => {
            const placeholder = document.getElementById("header-placeholder");
            if (placeholder) {
                placeholder.innerHTML = data;
                initializeDynamicHeader();
            }
        })
        .catch(err => console.error("Error loading header:", err));

    // Load Footer
    fetch("footer.html?t=" + new Date().getTime())
        .then(response => response.text())
        .then(data => {
            const placeholder = document.getElementById("footer-placeholder");
            if (placeholder) placeholder.innerHTML = data;
        })
        .catch(err => console.error("Error loading footer:", err));

    // Process Section Scroll Animation (Robust Scroll Listener)
    const steps = document.querySelectorAll('.process-step');
    const images = document.querySelectorAll('.p-img');

    if (steps.length > 0) {
        function updateProcessSteps() {
            let activeIndex = 0;
            const scrollY = window.scrollY + window.innerHeight * 0.5; // middle of the screen

            steps.forEach((step, index) => {
                const rect = step.getBoundingClientRect();
                const stepTop = rect.top + window.scrollY;
                if (scrollY >= stepTop) {
                    activeIndex = index;
                }
            });

            // Remove active from all
            steps.forEach(s => {
                s.classList.remove('active');
                const icon = s.querySelector('.step-icon');
                if (icon) icon.classList.remove('active');
            });
            images.forEach(img => img.classList.remove('active'));

            // Add active to current
            const currentStep = steps[activeIndex];
            if (currentStep) {
                currentStep.classList.add('active');
                const icon = currentStep.querySelector('.step-icon');
                if (icon) icon.classList.add('active');
                
                const stepNum = currentStep.getAttribute('data-step');
                const activeImg = document.getElementById(`pimg-${stepNum}`);
                if (activeImg) activeImg.classList.add('active');
            }
        }

        window.addEventListener('scroll', updateProcessSteps);
        // Initial check
        updateProcessSteps();
    }

    // Global Reveal Animations
    const reveals = document.querySelectorAll('.reveal');
    
    if (reveals.length > 0) {
        const revealOptions = {
            threshold: 0.15,
            rootMargin: "0px 0px -50px 0px"
        };
        
        const revealOnScroll = new IntersectionObserver(function(entries, observer) {
            entries.forEach(entry => {
                if (!entry.isIntersecting) {
                    return;
                } else {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target);
                }
            });
        }, revealOptions);
        
        reveals.forEach(reveal => {
            revealOnScroll.observe(reveal);
        });
    }

    const transportScene = document.getElementById('transport-scene');
    const truck = document.getElementById('animated-truck');
    const loadArea = document.querySelector('.truck-load');
    const materialLabel = document.querySelector('.material-name');

    if (transportScene && truck && loadArea && materialLabel) {
        const materials = [
            { label: 'Construction Sand', color: 'linear-gradient(135deg, #cb9b2b, #f2d385)' },
            { label: 'Kapchi', color: 'linear-gradient(135deg, #c18b44, #e0b165)' },
            { label: 'Grit Metal', color: 'linear-gradient(135deg, #7f7f7f, #b0b0b0)' },
            { label: 'Dust', color: 'linear-gradient(135deg, #d8c9b4, #f0e4d0)' },
            { label: 'WMM', color: 'linear-gradient(135deg, #7b6f42, #b29c5e)' },
            { label: 'GSB', color: 'linear-gradient(135deg, #8b7c59, #c0ae7f)' },
            { label: 'Rubble', color: 'linear-gradient(135deg, #6d6962, #9f9b95)' },
            { label: 'Aggregate Material', color: 'linear-gradient(135deg, #6f7455, #a9ae84)' }
        ];

        let currentMaterial = 0;
        materialLabel.textContent = materials[currentMaterial].label;
        loadArea.style.background = materials[currentMaterial].color;

        truck.addEventListener('animationiteration', () => {
            currentMaterial = (currentMaterial + 1) % materials.length;
            materialLabel.textContent = materials[currentMaterial].label;
            loadArea.style.background = materials[currentMaterial].color;
        });

        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    transportScene.classList.remove('paused');
                } else {
                    transportScene.classList.add('paused');
                }
            });
        }, { threshold: 0.2 });

        observer.observe(transportScene);
    }

    const scrollTruckSection = document.querySelector('[data-scroll-truck]');

    if (scrollTruckSection) {
        const stage = scrollTruckSection.querySelector('.ck-scroll-truck-stage');
        const sandTruck = scrollTruckSection.querySelector('.ck-sand-truck');
        const introReveal = document.getElementById('ck-intro-reveal');
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        let ticking = false;

        const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
        const easeOut = value => 1 - Math.pow(1 - value, 3);
        const easeInOut = value => value < 0.5
            ? 4 * value * value * value
            : 1 - Math.pow(-2 * value + 2, 3) / 2;

        function updateScrollTruck() {
            ticking = false;

            const rect = scrollTruckSection.getBoundingClientRect();
            const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
            const travelDistance = Math.max(1, rect.height - viewportHeight);
            const rawProgress = clamp((-rect.top) / travelDistance, 0, 1);
            const smoothProgress = easeInOut(rawProgress);
            const gateProgress = clamp((rawProgress - 0.42) / 0.26, 0, 1);
            const dustProgress = clamp((rawProgress - 0.25) / 0.45, 0, 1);
            const revealProgress = clamp((rawProgress - 0.58) / 0.28, 0, 1);
            const truckX = reduceMotion ? 44 : -124 + (smoothProgress * 248);
            const bounce = reduceMotion ? 0 : Math.sin(rawProgress * Math.PI * 10) * -4;
            const copyOpacity = clamp(1 - (rawProgress * 0.42), 0.58, 1);
            const copyY = rawProgress * -34;
            const easedGate = easeOut(gateProgress);
            const easedDust = easeOut(dustProgress);

            if (stage) {
                stage.style.setProperty('--truck-progress', rawProgress.toFixed(3));
                stage.style.setProperty('--gate-progress', easedGate.toFixed(3));
                stage.style.setProperty('--gate-scale', (0.62 + (easedGate * 0.38)).toFixed(3));
                stage.style.setProperty('--dust-progress', easedDust.toFixed(3));
                stage.style.setProperty('--dust-opacity', (0.25 + (easedDust * 0.75)).toFixed(3));
                stage.style.setProperty('--copy-opacity', copyOpacity.toFixed(3));
                stage.style.setProperty('--copy-y', `${copyY.toFixed(1)}px`);
            }

            if (sandTruck) {
                sandTruck.style.setProperty('--truck-x', `${truckX.toFixed(2)}%`);
                sandTruck.style.setProperty('--truck-y', `${bounce.toFixed(2)}px`);
            }

            scrollTruckSection.classList.toggle('is-centered', rawProgress > 0.4 && rawProgress < 0.68);

            if (introReveal) {
                introReveal.style.setProperty('--intro-glow', easeOut(revealProgress).toFixed(3));
                introReveal.classList.toggle('truck-revealed', rawProgress > 0.72);
            }
        }

        function requestScrollTruckUpdate() {
            if (!ticking) {
                window.requestAnimationFrame(updateScrollTruck);
                ticking = true;
            }
        }

        updateScrollTruck();
        window.addEventListener('scroll', requestScrollTruckUpdate, { passive: true });
        window.addEventListener('resize', requestScrollTruckUpdate);
    }

    // Premium Form Submission and Validation Logic
    const quoteForm = document.getElementById('ck-quote-form');
    const successOverlay = document.getElementById('form-success-msg');

    if (quoteForm && successOverlay) {
        const submitBtn = quoteForm.querySelector('.submit-btn-premium');
        const closeSuccessBtn = successOverlay.querySelector('.close-success-btn');
        const submitMessage = document.getElementById('form-submit-message');
        const requestedMaterialInput = document.getElementById('requested-material');
        const queryParams = new URLSearchParams(window.location.search);
        const materialParam = queryParams.get('material');
        const statusParam = queryParams.get('status');

        if (requestedMaterialInput && materialParam) {
            requestedMaterialInput.value = materialParam;
        }

        if (statusParam === 'success') {
            successOverlay.classList.add('active');
            window.history.replaceState({}, document.title, window.location.pathname + (materialParam ? `?material=${encodeURIComponent(materialParam)}` : ''));
        } else if (statusParam === 'error' && submitMessage) {
            submitMessage.textContent = 'We could not send your inquiry right now. Please try again in a moment.';
        }
        
        // Helper to validate email format
        function isValidEmail(email) {
            const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(String(email).toLowerCase());
        }

        // Helper to validate phone format (10 digits)
        function isValidPhone(phone) {
            const cleaned = phone.replace(/\D/g, '');
            return cleaned.length === 10;
        }

        // Live input validation clear on type/focus
        const inputs = quoteForm.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            const group = input.closest('.form-group');

            ['input', 'change', 'focus'].forEach(evtType => {
                input.addEventListener(evtType, () => {
                    if (group) {
                        group.classList.remove('invalid');
                    }

                    if (submitMessage) {
                        submitMessage.textContent = '';
                        submitMessage.classList.remove('is-success');
                    }
                });
            });
        });

        quoteForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            let hasErrors = false;

            const nameInput = document.getElementById('user-name');
            const phoneInput = document.getElementById('user-phone');
            const emailInput = document.getElementById('user-email');
            const messageInput = document.getElementById('additional-message');

            if (submitMessage) {
                submitMessage.textContent = '';
                submitMessage.classList.remove('is-success');
            }

            // Name check
            if (!nameInput.value.trim()) {
                nameInput.closest('.form-group').classList.add('invalid');
                hasErrors = true;
            }

            // Phone check
            if (!isValidPhone(phoneInput.value.trim())) {
                phoneInput.closest('.form-group').classList.add('invalid');
                hasErrors = true;
            }

            // Email check (optional but must be valid if filled)
            if (emailInput.value.trim() && !isValidEmail(emailInput.value.trim())) {
                emailInput.closest('.form-group').classList.add('invalid');
                hasErrors = true;
            }

            if (hasErrors) {
                // Focus first error
                const firstError = quoteForm.querySelector('.form-group.invalid input, .form-group.invalid select');
                if (firstError) firstError.focus();
                return;
            }

            // If valid, start submit animation
            submitBtn.classList.add('submitting');
            if (submitMessage) {
                submitMessage.textContent = 'Sending your request...';
                submitMessage.classList.add('is-success');
            }

            const formData = new FormData(quoteForm);
            const rawPhone = phoneInput.value.trim();
            formData.set('phone', rawPhone.replace(/\D/g, ''));
            if (emailInput.value.trim()) {
                formData.set('replyto', emailInput.value.trim());
            }

            if (!messageInput.value.trim() && materialParam) {
                formData.set('message', `Requested material: ${materialParam}`);
            }

            try {
                const response = await fetch(quoteForm.action, {
                    method: 'POST',
                    body: formData
                });

                const result = await response.json().catch(() => ({
                    success: false,
                    message: 'Unable to send your request right now.'
                }));

                if (!response.ok || !result.success) {
                    throw new Error(result.message || 'Unable to send your request right now.');
                }
                
                submitBtn.classList.remove('submitting');
                successOverlay.classList.add('active');
                if (submitMessage) {
                    submitMessage.textContent = '';
                    submitMessage.classList.remove('is-success');
                }
                quoteForm.reset();
                if (requestedMaterialInput && materialParam) {
                    requestedMaterialInput.value = materialParam;
                }
                inputs.forEach(input => {
                    input.dispatchEvent(new Event('input', { bubbles: true }));
                });
            } catch (error) {
                submitBtn.classList.remove('submitting');
                if (submitMessage) {
                    submitMessage.textContent = error.message || 'Something went wrong. Please try again in a moment.';
                    submitMessage.classList.remove('is-success');
                }
            }
        });

        // Close success notification screen
        closeSuccessBtn.addEventListener('click', function() {
            successOverlay.classList.remove('active');
        });
    }

    // Lightbox Functionality for Gallery Grid
    const galleryItems = document.querySelectorAll('.gallery-grid .gallery-item');
    const lightbox = document.getElementById('gallery-lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const lightboxClose = document.querySelector('.lightbox-close');
    const lightboxPrev = document.querySelector('.lightbox-prev');
    const lightboxNext = document.querySelector('.lightbox-next');

    if (galleryItems.length > 0 && lightbox && lightboxImg) {
        let currentIndex = 0;
        const imagesList = Array.from(galleryItems).map(item => {
            const img = item.querySelector('img');
            return {
                src: img.getAttribute('src'),
                alt: img.getAttribute('alt') || 'Project Supply Preview'
            };
        });

        function showImage(index) {
            if (index < 0) index = imagesList.length - 1;
            if (index >= imagesList.length) index = 0;
            currentIndex = index;
            
            // Temporary fade out before source change
            lightboxImg.style.opacity = '0';
            lightboxImg.style.transform = 'scale(0.97)';
            
            setTimeout(() => {
                lightboxImg.setAttribute('src', imagesList[currentIndex].src);
                lightboxImg.setAttribute('alt', imagesList[currentIndex].alt);
                lightboxCaption.textContent = imagesList[currentIndex].alt;
                
                // Trigger transition after image source is loaded
                setTimeout(() => {
                    lightboxImg.style.opacity = '1';
                    lightboxImg.style.transform = 'scale(1)';
                }, 50);
            }, 150);
        }

        galleryItems.forEach((item, index) => {
            item.addEventListener('click', () => {
                lightbox.classList.add('active');
                document.body.style.overflow = 'hidden'; // prevent scrolling underneath
                showImage(index);
            });
        });

        function closeLightbox() {
            lightbox.classList.remove('active');
            document.body.style.overflow = ''; // restore scrolling
        }

        lightboxClose.addEventListener('click', closeLightbox);
        
        // Close on background click
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox || e.target.classList.contains('lightbox-content')) {
                closeLightbox();
            }
        });

        lightboxPrev.addEventListener('click', (e) => {
            e.stopPropagation();
            showImage(currentIndex - 1);
        });

        lightboxNext.addEventListener('click', (e) => {
            e.stopPropagation();
            showImage(currentIndex + 1);
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (!lightbox.classList.contains('active')) return;
            
            if (e.key === 'Escape') {
                closeLightbox();
            } else if (e.key === 'ArrowLeft') {
                showImage(currentIndex - 1);
            } else if (e.key === 'ArrowRight') {
                showImage(currentIndex + 1);
            }
        });
    }
});
