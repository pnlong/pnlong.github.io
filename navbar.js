// Load navbar into page
// This script determines the correct path to navbar.html based on the current page's location
// and adjusts all navbar links to work correctly from any page depth

(function() {
    // Determine the path depth (how many directories deep we are)
    // For root level: /index.html or / -> depth 0
    // For blog posts: /blog_posts/post-title/index.html -> depth 2
    const path = window.location.pathname;
    // Remove leading/trailing slashes and filter out empty segments and index.html
    const pathSegments = path.split('/').filter(segment => segment && segment !== 'index.html');
    
    // Count directories (exclude the HTML file itself)
    // On GitHub Pages, the repo name is part of the path but we treat root pages as depth 0
    let depth = 0;
    // Check if we're in a subdirectory (blog_posts, etc.)
    if (pathSegments.length > 0) {
        // If path contains 'blog_posts', calculate depth from there
        const blogPostsIndex = pathSegments.indexOf('blog_posts');
        if (blogPostsIndex >= 0) {
            // Depth is number of segments after 'blog_posts' (including blog_posts itself)
            // blog_posts/post-title -> depth 2
            depth = pathSegments.length - blogPostsIndex;
        } else {
            // Root level page (index.html, blog.html, etc.)
            // On GitHub Pages, might have repo name as first segment
            const knownFiles = ['blog.html', 'projects.html', 'publications.html'];
            const knownDirs = ['assets'];
            const firstSegment = pathSegments[0];
            
            // If first segment is not a known file/dir, it might be repo name (GitHub Pages)
            if (pathSegments.length > 0 && !knownFiles.includes(firstSegment) && !knownDirs.includes(firstSegment) && firstSegment !== '') {
                // Likely GitHub Pages with repo name - root page is depth 0
                depth = 0;
            } else {
                // Local or root level - depth 0
                depth = 0;
            }
        }
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
