const HEADER_FALLBACK = `
<nav class="navbar" aria-label="Primary navigation">
    <div class="container">
        <a class="nav-brand" href="index.html#home" aria-label="Leopard Secure Services home">
            <img src="./images/logo.png" alt="Leopard Secure Services LTD">
        </a>

        <button class="nav-toggle" type="button" aria-label="Toggle navigation" aria-expanded="false" aria-controls="primary-navigation">
            <span></span>
            <span></span>
            <span></span>
        </button>

        <div class="nav-menu" id="primary-navigation">
            <ul class="nav-links">
                <li><a data-page="home" href="index.html#home">Home</a></li>
                <li><a data-page="services" href="index.html#services">Services</a></li>
                <li><a data-page="about" href="about.html">About</a></li>
                <li><a data-page="contact" href="contact.html">Contact</a></li>
            </ul>
        </div>

        <div class="nav-contact">
            <span class="nav-contact-label">Have any questions?</span>
            <a class="nav-contact-phone" href="tel:+441217511142">01217511142</a>
        </div>
    </div>
</nav>
`;

const FOOTER_FALLBACK = `
<footer class="footer">
    <div class="container">
        <div class="footer-grid">
            <div class="footer-section">
                <div class="footer-logo"><img src="./images/logo.png" alt="Leopard Secure Services Logo"></div>
                <p>Your trusted security partner in Seattle.</p>
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
                    <li><a href="index.html#services">Services</a></li>
                    <li><a href="#">Team</a></li>
                </ul>
            </div>

            <div class="footer-section">
                <h4>Address</h4>
                <p>256 Aurora Ave North, Seattle<br>WA 98109, United States</p>
            </div>

            <div class="footer-section">
                <h4>Contact</h4>
                <p><a href="tel:+447526551885"> +44 7526551885</a></p>
                <p><a href="mailto:info@yourcompanyname.co.uk">info@yourcompanyname.co.uk</a></p>
            </div>
        </div>

        <div class="footer-bottom">
            <p>&copy; 2024 haidery guarding LTD. All rights reserved. | <a href="#">Privacy Policy</a> | <a href="#">Terms of Service</a></p>
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

document.addEventListener('DOMContentLoaded', () => {
    injectSharedLayout().catch((error) => {
        console.error('Failed to load shared layout:', error);
    });
});
