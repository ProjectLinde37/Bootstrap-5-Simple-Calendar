// Dynamic navigation menu for Goosse Calendar demos
async function buildNavigation() {
    const demoPages = [
        { file: 'index.html' },
        { file: 'ajax.html' },
        { file: 'datepicker.html' },
        { file: 'timepicker.html' }
    ];

    const currentPage = window.location.pathname.split('/').pop();
    const navContainer = document.getElementById('demoNav');

    for (const page of demoPages) {
        try {
            // Fetch the HTML file to extract the title
            const response = await fetch(page.file);
            const html = await response.text();

            // Extract title from <title> tag
            const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
            const title = titleMatch ? titleMatch[1].trim() : page.file;

            // Clean up the title (remove common prefixes)
            const cleanTitle = title
                .replace(/^Goosse\s*[–\-]\s*/i, '') // Remove "Goosse - " prefix
                .replace(/\s*\([^)]*\)$/, ''); // Remove parenthetical parts

            const li = document.createElement('li');
            li.className = 'nav-item';

            const a = document.createElement('a');
            a.className = `nav-link ${page.file === currentPage ? 'active' : ''}`;
            a.href = page.file;
            a.title = `View ${cleanTitle} demo`;

            // Highlight current page
            if (page.file === currentPage) {
                a.innerHTML = `<strong>${cleanTitle}</strong>`;
            } else {
                a.textContent = cleanTitle;
            }

            li.appendChild(a);
            navContainer.appendChild(li);
        } catch (error) {
            console.warn(`Could not load title for ${page.file}:`, error);
            // Fallback to filename
            const li = document.createElement('li');
            li.className = 'nav-item';

            const a = document.createElement('a');
            a.className = `nav-link ${page.file === currentPage ? 'active' : ''}`;
            a.href = page.file;
            a.title = `View ${page.file} demo`;

            if (page.file === currentPage) {
                a.innerHTML = `<strong>${page.file}</strong>`;
            } else {
                a.textContent = page.file;
            }

            li.appendChild(a);
            navContainer.appendChild(li);
        }
    }
}

// Initialize navigation when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildNavigation);
} else {
    buildNavigation();
}
