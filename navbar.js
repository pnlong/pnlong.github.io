// Load navbar into page
// This script determines the correct path to navbar.html based on the current page's location
// and adjusts all navbar links to work correctly from any page depth

(function() {
    // Determine the path depth (how many directories deep we are)
    // For root level: index.html -> depth 0
    // For blog posts: blog_posts/post-title/index.html -> depth 2
    const path = window.location.pathname;
    const pathSegments = path.split('/').filter(segment => segment);
    
    // Count directories (exclude the HTML file itself)
    let depth = 0;
    if (pathSegments.length > 1) {
        // If we have more than just the filename, count directories
        depth = pathSegments.length - 1;
    }
    
    // Calculate the relative path to navbar.html
    // Root level pages: ./navbar.html
    // Blog posts (2 levels deep): ../../navbar.html
    let navbarPath;
    if (depth === 0) {
        navbarPath = './navbar.html';
    } else {
        navbarPath = '../'.repeat(depth) + 'navbar.html';
    }
    
    // Calculate base path for navbar links (same as navbarPath but without navbar.html)
    let basePath = '';
    if (depth === 0) {
        basePath = './';
    } else {
        basePath = '../'.repeat(depth);
    }
    
    // Load and inject navbar
    fetch(navbarPath)
        .then(response => response.text())
        .then(html => {
            // Replace relative paths in navbar links with correct paths
            // Match href="./something" and replace with correct base path
            html = html.replace(/href="\.\//g, 'href="' + basePath);
            
            // Insert navbar at the beginning of body
            document.body.insertAdjacentHTML('afterbegin', html);
            
            // After navbar is loaded, initialize the mobile menu functionality
            const menu = document.querySelector("#mobile-menu");
            const menu_links = document.querySelector(".nav-menu");
            if (menu && menu_links) {
                menu.addEventListener("click", function() {
                    menu.classList.toggle("is-active");
                    menu_links.classList.toggle("active");
                });
            }
        })
        .catch(error => {
            console.error('Error loading navbar:', error);
        });
})();
