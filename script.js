// script.js
document.addEventListener("DOMContentLoaded", function() {
    // Load Header
    fetch("header.html?t=" + new Date().getTime())
        .then(response => response.text())
        .then(data => {
            const placeholder = document.getElementById("header-placeholder");
            if (placeholder) placeholder.innerHTML = data;
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
            if (!group) return;

            // Clear errors when the user interacts
            ['input', 'change', 'focus'].forEach(evtType => {
                input.addEventListener(evtType, () => {
                    group.classList.remove('invalid');
                });
            });
        });

        const requestedMaterial = new URLSearchParams(window.location.search).get('material');
        const materialSelect = document.getElementById('material-select');
        if (requestedMaterial && materialSelect) {
            const matchingOption = Array.from(materialSelect.options).find(option => option.value === requestedMaterial);
            if (matchingOption) {
                materialSelect.value = requestedMaterial;
            }
        }

        quoteForm.addEventListener('submit', function(e) {
            e.preventDefault();
            let hasErrors = false;

            const nameInput = document.getElementById('user-name');
            const phoneInput = document.getElementById('user-phone');
            const emailInput = document.getElementById('user-email');
            const materialSelect = document.getElementById('material-select');
            const qtyInput = document.getElementById('material-quantity');
            const locationInput = document.getElementById('delivery-location');

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

            // Material select check
            if (!materialSelect.value) {
                materialSelect.closest('.form-group').classList.add('invalid');
                hasErrors = true;
            }

            // Quantity check
            if (!qtyInput.value.trim()) {
                qtyInput.closest('.form-group').classList.add('invalid');
                hasErrors = true;
            }

            // Location check
            if (!locationInput.value.trim()) {
                locationInput.closest('.form-group').classList.add('invalid');
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

            // Simulate form submission API call
            setTimeout(() => {
                // Done loading
                submitBtn.classList.remove('submitting');
                
                // Show success screen
                successOverlay.classList.add('active');
                
                // Reset form fields
                quoteForm.reset();
                // Trigger label check for floating inputs
                inputs.forEach(input => {
                    input.dispatchEvent(new Event('input', { bubbles: true }));
                });
            }, 1800);
        });

        // Close success notification screen
        closeSuccessBtn.addEventListener('click', function() {
            successOverlay.classList.remove('active');
        });
    }
});
