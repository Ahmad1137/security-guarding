const HEADER_FALLBACK = `
<nav class="navbar" aria-label="Primary navigation">
    <div class="container">
        <a class="nav-brand" href="index.html#home" aria-label="Haidery Guarding LTD home">
            <img src="./images/logo.png" alt="Haidery Guarding LTD">
        </a>

        <button class="nav-toggle" type="button" aria-label="Toggle navigation" aria-expanded="false" aria-controls="primary-navigation">
            <span></span>
            <span></span>
            <span></span>
        </button>

        <div class="nav-menu" id="primary-navigation">
            <ul class="nav-links">
                <li><a data-page="home" href="index.html#home">Home</a></li>
                <li><a data-page="services" href="services.html">Services</a></li>
                <li><a data-page="about" href="about.html">About</a></li>
                <li><a data-page="contact" href="contact.html">Contact</a></li>
            </ul>
        </div>

        <div class="nav-contact">
            <span class="nav-contact-label">Have any questions?</span>
            <a class="nav-contact-phone" href="tel:+447526551885">+44 7526551885</a>
        </div>
    </div>
</nav>
`;

const FOOTER_FALLBACK = `
<footer class="footer">
    <div class="container">
        <div class="footer-grid">
            <div class="footer-section">
                <div class="footer-logo"><img src="./images/logo.png" alt="Haidery Guarding LTD logo"></div>
                <p>UK registered security company delivering reliable and professional solutions.</p>
                <div class="social-links">
                    <a href="#"><img src="./images/facebook-app-symbol.png" alt="Facebook"></a>
                    <a href="#"><img src="./images/message.png" alt="LinkedIn"></a>
                    <a href="#"><img src="./images/twitter.png" alt="Twitter"></a>
                </div>
            </div>

            <div class="footer-section">
                <h4>Company</h4>
                <ul>
                    <li><a href="about.html">About Us</a></li>
                    <li><a href="services.html">Services</a></li>
                    <li><a href="#">Team</a></li>
                </ul>
            </div>

            <div class="footer-section">
                <h4>Address</h4>
                <p>708 Alum Rock Road, Birmingham<br>B8 3NU, United Kingdom</p>
            </div>

            <div class="footer-section">
                <h4>Contact</h4>
                <p><a href="tel:+447526551885">+44 7526551885</a></p>
                <p><a href="mailto:info@haideryguardingltd.co.uk">info@haideryguardingltd.co.uk</a></p>
            </div>
        </div>

        <div class="footer-bottom">
            <div class="footer-bottom-left">
                <p>Copyright &copy; 2026 HAIDERY GUARDING LTD.</p>
              
                <p>Company Registration No : 17123919</p>
                <p>Company Representative : M.ABUZAR</p>
            </div>
        </div>
    </div>
</footer>
`;

async function loadComponent(slot, path, fallback) {
    try {
        const response = await fetch(path);
        if (!response.ok) {
            throw new Error(`Failed to load ${path}`);
        }
        slot.innerHTML = await response.text();
    } catch (error) {
        slot.innerHTML = fallback;
    }
}

async function injectSharedLayout() {
    const headerSlot = document.getElementById('site-header');
    const footerSlot = document.getElementById('site-footer');

    const requests = [];

    if (headerSlot) {
        requests.push(loadComponent(headerSlot, './components/header.html', HEADER_FALLBACK));
    }

    if (footerSlot) {
        requests.push(loadComponent(footerSlot, './components/footer.html', FOOTER_FALLBACK));
    }

    await Promise.all(requests);

    initNavToggle();
    markActiveNavItem();
}

function initNavToggle() {
    const navbar = document.querySelector('.navbar');
    const navToggle = document.querySelector('.nav-toggle');

    if (!navbar || !navToggle) {
        return;
    }

    const setNavState = (isOpen) => {
        navbar.classList.toggle('is-open', isOpen);
        navToggle.setAttribute('aria-expanded', String(isOpen));
    };

    navToggle.addEventListener('click', () => {
        setNavState(!navbar.classList.contains('is-open'));
    });

    document.querySelectorAll('.nav-links a').forEach((link) => {
        link.addEventListener('click', () => setNavState(false));
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            setNavState(false);
        }
    });
}

function markActiveNavItem() {
    const currentPage = document.body.getAttribute('data-page');
    if (!currentPage) {
        return;
    }

    const activeLink = document.querySelector(`.nav-links a[data-page="${currentPage}"]`);
    if (activeLink) {
        activeLink.classList.add('is-active');
    }
}

function initScrollAnimations() {
    const animatedTargets = Array.from(
        document.querySelectorAll(
            '.stat-card, .about-grid > *, .service-card, .feature-card, .contact-grid > *, .footer-section, .pillar-card, .showcase-item, .module-card, .solution-grid > *, .form-layout > *, .quick-grid > div, .map-frame'
        )
    );

    if (animatedTargets.length === 0) {
        return;
    }

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
        animatedTargets.forEach((el) => {
            el.setAttribute('data-animate', '');
            el.classList.add('is-visible');
        });
        return;
    }

    animatedTargets.forEach((el) => {
        const parent = el.parentElement;
        const siblings = parent ? Array.from(parent.children) : [];
        const siblingIndex = Math.max(0, siblings.indexOf(el));
        const delay = Math.min(siblingIndex * 70, 350);

        el.setAttribute('data-animate', '');
        el.style.setProperty('--reveal-delay', `${delay}ms`);
    });

    const observer = new IntersectionObserver(
        (entries, obs) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    obs.unobserve(entry.target);
                }
            });
        },
        {
            threshold: 0.16,
            rootMargin: '0px 0px -8% 0px'
        }
    );

    animatedTargets.forEach((el) => observer.observe(el));
}

document.addEventListener('DOMContentLoaded', () => {
    injectSharedLayout().catch((error) => {
        console.error('Failed to load shared layout:', error);
    });

    initScrollAnimations();
});
