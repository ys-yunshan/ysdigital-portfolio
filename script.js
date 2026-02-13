document.addEventListener('DOMContentLoaded', () => {
    // Mobile Menu Logic
    const mobileMenu = document.getElementById('mobile-menu');
    const navbarMenu = document.querySelector('.navbar-menu');

    // Dark Mode Logic
    const themeToggleBtn = document.createElement('button');
    themeToggleBtn.className = 'theme-toggle';
    themeToggleBtn.innerHTML = '🌙'; // Default Moon icon
    themeToggleBtn.ariaLabel = 'Toggle Dark Mode';

    // Let's append to navbar menu for better layout (aligns with links)
    if (navbarMenu) {
        navbarMenu.appendChild(themeToggleBtn);
    }

    // Check LocalStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        themeToggleBtn.innerHTML = '☀️';
    }

    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        if (currentTheme === 'dark') {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
            themeToggleBtn.innerHTML = '🌙';
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
            themeToggleBtn.innerHTML = '☀️';
        }
    });

    if (mobileMenu) {
        mobileMenu.addEventListener('click', () => {
            navbarMenu.classList.toggle('active');
        });
    }

    // Client-Side Routing Logic
    // Select all links in the navbar
    const navLinks = document.querySelectorAll('.navbar-link');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            // Only intercept local links
            const href = link.getAttribute('href');
            if (href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto')) {
                return;
            }

            // If running on file:// protocol, skip custom routing to avoid CORS errors
            if (window.location.protocol === 'file:') {
                return;
            }

            e.preventDefault();

            // Update Active State
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            // Close mobile menu if open
            if (navbarMenu && navbarMenu.classList.contains('active')) {
                navbarMenu.classList.remove('active');
            }

            // Perform Navigation
            navigateTo(href);
        });
    });

    // Handle Back/Forward Browser Buttons
    window.addEventListener('popstate', (e) => {
        if (window.location.protocol === 'file:') return;

        if (e.state && e.state.path) {
            loadPage(e.state.path, false);
        } else {
            // Fallback for initial state or external changes
            loadPage(window.location.pathname, false);
        }
    });

    // Form Submission Logic (Delegated to handle dynamic page loads)
    document.addEventListener('submit', (e) => {
        if (e.target && e.target.classList.contains('contact-form')) {
            e.preventDefault();
            const form = e.target;
            const messageContainer = form.querySelector('.form-message');

            if (!messageContainer) return;

            // Show loading state
            messageContainer.textContent = 'Sending message...';
            messageContainer.className = 'form-message loading';
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) submitBtn.disabled = true;

            // Simulate API call
            setTimeout(() => {
                // Success state
                messageContainer.textContent = 'Message sent successfully! I will get back to you soon.';
                messageContainer.className = 'form-message success';

                // Clear form
                form.reset();
                if (submitBtn) submitBtn.disabled = false;

                // Clear success message after 5 seconds
                setTimeout(() => {
                    messageContainer.textContent = '';
                    messageContainer.className = 'form-message';
                }, 5000);
            }, 1500); // 1.5s delay to simulate network
        }
    });

    // Video Toggle Logic (Delegated)
    document.addEventListener('click', (e) => {
        // Open Video
        if (e.target && e.target.id === 'showVideoBtn') {
            const btn = e.target;
            const videoContainer = document.getElementById('videoContainer');
            if (videoContainer) {
                videoContainer.style.display = 'block';
                btn.style.display = 'none';

                // Auto-play video if desired (optional, maybe not for now to be less intrusive)
                // const video = videoContainer.querySelector('video');
                // if(video) video.play(); 
            }
        }

        // Close Video
        if (e.target && e.target.id === 'closeVideoBtn') {
            const videoContainer = document.getElementById('videoContainer');
            const showBtn = document.getElementById('showVideoBtn');

            if (videoContainer && showBtn) {
                // Pause video when closing
                const video = videoContainer.querySelector('video');
                if (video) {
                    video.pause();
                    video.currentTime = 0; // Reset to start
                }

                videoContainer.style.display = 'none';
                showBtn.style.display = 'block';
            }
        }
    });


    // Back to Top Button Logic
    const backToTopBtn = document.createElement('button');
    backToTopBtn.id = 'backToTopBtn';
    backToTopBtn.innerHTML = '&#8679;'; // Up Arrow HTML Entity
    backToTopBtn.ariaLabel = 'Back to Top';
    document.body.appendChild(backToTopBtn);

    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    });

    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // Initial check for scroll reveal
    revealSections();
    window.addEventListener('scroll', revealSections);
});

// Scroll Reveal Function
function revealSections() {
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        const sectionTop = section.getBoundingClientRect().top;
        if (sectionTop < window.innerHeight - 100) {
            section.classList.add('visible');
        }
    });
}

/**
 * Navigates to a new URL using fetch and History API
 * @param {string} url - The URL to navigate to
 */
function navigateTo(url) {
    try {
        history.pushState({ path: url }, '', url);
        loadPage(url);
    } catch (e) {
        // Fallback for file:// protocol or security restrictions
        window.location.href = url;
    }
}

/**
 * Fetches the page content and updates the DOM
 * @param {string} url - The URL to fetch
 * @param {boolean} adjustScroll - Whether to scroll to top after loading
 */
async function loadPage(url, adjustScroll = true) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Page not found');

        const htmlText = await response.text();

        // Parse the fetched HTML
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlText, 'text/html');

        // Replace Main Content
        const newMain = doc.querySelector('main');
        const currentMain = document.querySelector('main');

        if (newMain && currentMain) {
            // simple fade out effect could go here
            currentMain.innerHTML = newMain.innerHTML;

            // Update Page Title
            document.title = doc.title;

            // Re-initialize any page specific scripts if needed
            // (Not needed for this tailored static site as mostly CSS)

            if (adjustScroll) {
                window.scrollTo(0, 0);
            }

            // Update Navbar Active State (useful for Back button)
            updateNavbarActiveState(url);

            // Re-trigger scroll reveal for new content
            revealSections();
        }

    } catch (error) {
        console.error('Error loading page:', error);
        // Fallback: Hard reload if fetch fails (e.g., local file system without server)
        window.location.href = url;
    }
}

/**
 * Updates the navbar active class based on current URL
 * @param {string} url 
 */
function updateNavbarActiveState(url) {
    const navLinks = document.querySelectorAll('.navbar-link');
    // Extract filename from path (e.g., "/projects.html" -> "projects.html")
    // This handles both "/" and "/index.html"
    let path = url.split('/').pop() || 'index.html';
    if (path === '') path = 'index.html'; // handle root

    navLinks.forEach(link => {
        link.classList.remove('active');
        const linkHref = link.getAttribute('href');
        if (linkHref === path || (path === 'index.html' && (linkHref === '/' || linkHref === 'index.html'))) {
            // Simplified matching logic for this specific project
            link.classList.add('active');
        }
    });
}
