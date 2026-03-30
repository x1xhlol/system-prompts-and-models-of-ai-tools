// ===================================
// Sami Assiri - Landing Page Scripts
// ===================================

let currentLang = 'ar';

/**
 * Toggle between Arabic and English
 */
function toggleLanguage() {
    currentLang = currentLang === 'ar' ? 'en' : 'ar';

    const html = document.documentElement;
    const body = document.body;

    if (currentLang === 'en') {
        html.setAttribute('lang', 'en');
        html.setAttribute('dir', 'ltr');
        body.setAttribute('dir', 'ltr');
        document.getElementById('lang-btn-text').textContent = 'AR';
    } else {
        html.setAttribute('lang', 'ar');
        html.setAttribute('dir', 'rtl');
        body.removeAttribute('dir');
        document.getElementById('lang-btn-text').textContent = 'EN';
    }

    // Toggle all language spans
    document.querySelectorAll('.ar').forEach(el => {
        el.style.display = currentLang === 'ar' ? '' : 'none';
    });
    document.querySelectorAll('.en').forEach(el => {
        el.style.display = currentLang === 'en' ? '' : 'none';
    });
}

/**
 * Download vCard contact file
 */
function downloadVCard() {
    const vcard = `BEGIN:VCARD
VERSION:3.0
FN:Sami Mohammed Assiri
N:Assiri;Sami;Mohammed;;
TITLE:Field Services Engineer - Airport Security
ORG:METCO - Middle East Services
TEL;TYPE=CELL:+966597788539
EMAIL;TYPE=INTERNET:sami.assiri11@gmail.com
URL:https://www.linkedin.com/in/sami-assiri-a300622b2/
ADR;TYPE=WORK:;;King Khalid International Airport;Riyadh;;12345;Saudi Arabia
NOTE:Smiths Detection Airport Security Specialist | Mechanical Engineer | Ex-Samsung E&A | President SPE Alasala Chapter
END:VCARD`;

    const blob = new Blob([vcard], { type: 'text/vcard;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Sami_Assiri.vcf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Initialize Cal.com embed if booking URL is configured
 */
function initCalEmbed() {
    // Replace with your Cal.com username when ready
    const calUsername = ''; // e.g., 'sami-assiri'

    if (calUsername) {
        const calEmbed = document.getElementById('cal-embed');
        calEmbed.innerHTML = `
            <iframe
                src="https://cal.com/${calUsername}?embed=true&theme=dark"
                style="width:100%;height:400px;border:none;border-radius:12px;"
                loading="lazy"
            ></iframe>
        `;
    }
}

/**
 * Smooth scroll for anchor links
 */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

/**
 * Intersection Observer for scroll animations
 */
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('section').forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(section);
    });
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    initCalEmbed();
    initSmoothScroll();
    initScrollAnimations();
});
