// Load navbar into page
// This script determines the correct path to navbar.html based on the current page's location
// and adjusts all navbar links to work correctly from any page depth

(function() {
    // Determine the path depth (how many directories deep we are)
    // For root level: index.html -> depth 0
    // For blog posts: blog_posts/post-title/index.html -> depth 2
    const path = window.location.pathname;
    const pathSegments = path.split('/').filter(segment => segment && segment !== 'index.html');
    
    // Count directories (exclude the HTML file itself and repository name on GitHub Pages)
    // On GitHub Pages: /repository-name/ -> depth 0, /repository-name/blog_posts/post/index.html -> depth 2
    let depth = 0;
    if (pathSegments.length > 1) {
        // Check if first segment is likely a repository name (common GitHub Pages pattern)
        // If pathSegments[0] is not a known file/directory, it might be the repo name
        const firstSegment = pathSegments[0];
        const knownFiles = ['index.html', 'blog.html', 'projects.html', 'publications.html'];
        const knownDirs = ['blog_posts', 'assets'];
        
        // If first segment is not a known file/dir, it's probably the repo name (skip it)
        if (!knownFiles.includes(firstSegment) && !knownDirs.includes(firstSegment)) {
            depth = pathSegments.length - 2; // Subtract repo name and filename
        } else {
            depth = pathSegments.length - 1; // Just subtract filename
        }
        
        // Ensure depth is never negative
        if (depth < 0) depth = 0;
    }
    
    // Calculate the relative path to navbar.html
    // Root level pages: ./navbar.html
    // Blog posts (2 levels deep): ../../navbar.html
    // Handle GitHub Pages: if pathname starts with /repository-name/, adjust accordingly
    let navbarPath;
    let basePath = '';
    
    // Check if we're on GitHub Pages (pathname starts with repo name)
    const pathname = window.location.pathname;
    const isGitHubPages = pathname.split('/').length > 2 && pathname.split('/')[1] !== '';
    
    if (depth === 0) {
        navbarPath = './navbar.html';
        basePath = './';
    } else {
        navbarPath = '../'.repeat(depth) + 'navbar.html';
        basePath = '../'.repeat(depth);
    }
    
    // For GitHub Pages, ensure paths are correct
    if (isGitHubPages && depth === 0) {
        // On GitHub Pages root, paths should still be relative
        navbarPath = './navbar.html';
        basePath = './';
    }
    
    // Load and inject navbar
    fetch(navbarPath)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text();
        })
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
            console.error('Attempted path:', navbarPath);
            console.error('Current pathname:', window.location.pathname);
        });
})();
