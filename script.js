// script.js
document.addEventListener("DOMContentLoaded", function() {
    // Load Header
    fetch("header.html")
        .then(response => response.text())
        .then(data => {
            const placeholder = document.getElementById("header-placeholder");
            if (placeholder) placeholder.innerHTML = data;
        })
        .catch(err => console.error("Error loading header:", err));

    // Load Footer
    fetch("footer.html")
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
});
