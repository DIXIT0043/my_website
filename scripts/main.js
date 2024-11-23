document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('.nav-link');
    const pagesContainer = document.querySelector('.pages-container');
    const pages = document.querySelectorAll('.page');
    let currentScrollPosition = 0;
    let isScrolling = false;
    let scrollTimeout;
    let touchStartY;

    function updatePagePosition(scrollAmount, checkSnap = true) {
        currentScrollPosition += scrollAmount;
        currentScrollPosition = Math.max(0, Math.min(currentScrollPosition, (pages.length - 1) * window.innerHeight));
        
        if (checkSnap) {
            const currentPageIndex = Math.floor(currentScrollPosition / window.innerHeight);
            const nextPageThreshold = (currentPageIndex + 0.9) * window.innerHeight;
            
            if (currentScrollPosition > nextPageThreshold) {
                currentScrollPosition = (currentPageIndex + 1) * window.innerHeight;
            }
        }

        pagesContainer.style.transform = `translateY(-${currentScrollPosition}px)`;
        updateActiveNavLink();

        // Debugging: Log the current page index
        console.log("Current Page Index:", Math.round(currentScrollPosition / window.innerHeight));
    }

    function updateActiveNavLink() {
        const currentPageIndex = Math.round(currentScrollPosition / window.innerHeight);
        navLinks.forEach((link, index) => {
            if (index === currentPageIndex) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        // Handle About page sliding effect
        pages.forEach((page, index) => {
            if (index === currentPageIndex && page.id === 'about') {
                const slideElements = page.querySelectorAll('.slide-in');
                slideElements.forEach(element => {
                    element.classList.add('appear');
                });
            } else if (page.id === 'about') {
                const slideElements = page.querySelectorAll('.slide-in');
                slideElements.forEach(element => {
                    element.classList.remove('appear');
                });
            }
        });
    }

    // Add this function to handle direct navigation
    navLinks.forEach((link, index) => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            currentScrollPosition = index * window.innerHeight;
            updatePagePosition(0);
            updateActiveNavLink(); // Ensure active link is updated on click
        });
    });

    function handleWheel(e) {
        e.preventDefault();
        if (isScrolling) return;

        isScrolling = true;
        clearTimeout(scrollTimeout);

        updatePagePosition(e.deltaY * 3, false);

        scrollTimeout = setTimeout(() => {
            isScrolling = false;
            updatePagePosition(0, true);  // Check for snap after scrolling stops
        }, 50);
    }

    function handleTouchStart(e) {
        touchStartY = e.touches[0].clientY;
    }

    function handleTouchMove(e) {
        if (isScrolling) return;

        const touchEndY = e.touches[0].clientY;
        const diff = touchStartY - touchEndY;

        isScrolling = true;
        clearTimeout(scrollTimeout);

        updatePagePosition(diff * 3, false);

        touchStartY = touchEndY;

        scrollTimeout = setTimeout(() => {
            isScrolling = false;
            updatePagePosition(0, true);  // Check for snap after touch ends
        }, 50);
    }

    pagesContainer.addEventListener('wheel', handleWheel, { passive: false });
    pagesContainer.addEventListener('touchstart', handleTouchStart);
    pagesContainer.addEventListener('touchmove', handleTouchMove);

    // Prevent default scrolling behavior
    document.body.addEventListener('wheel', (e) => e.preventDefault(), { passive: false });

    // Show the home page by default
    updatePagePosition(0);

    // Adjust scroll position on window resize
    window.addEventListener('resize', () => {
        const currentPageIndex = Math.round(currentScrollPosition / window.innerHeight);
        currentScrollPosition = currentPageIndex * window.innerHeight;
        updatePagePosition(0);
    });

    // Typewriter effect function
    function typeWriter(text, elementId, speed = 50, delay = 1000) {
        let i = 0;
        const element = document.getElementById(elementId);
        
        function type() {
            if (i < text.length) {
                element.innerHTML += text.charAt(i);
                i++;
                setTimeout(type, speed);
            } else {
                setTimeout(erase, delay);
            }
        }
        
        function erase() {
            if (i > 0) {
                element.innerHTML = text.substring(0, i-1);
                i--;
                setTimeout(erase, speed / 2);
            } else {
                setTimeout(type, speed);
            }
        }
        
        type();
    }

    // Call the typewriter function for the home page
    const typewriterElement = document.getElementById('typewriter');
    if (typewriterElement) {
        typeWriter("Artificial Intelligence and Machine Learning Enthusiast", "typewriter");
    }
});
