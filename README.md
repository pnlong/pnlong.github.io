# portfolio

My personal portfolio website.

---

# Notes

## Adding a New Project

1. Open `projects.html`
2. In the `#projects-list` div, add a new `<div class="project">` entry (or `<div class="project in-progress">` if it's a work in progress)
3. Structure the project entry with:
   - `<div class="project-face project-cover">` - Front of card with title and cover image
   - `<div class="project-face project-info">` - Back of card with project name and description
4. For the cover image, you have two options:
   - **Option A (GIF with still)**: Include a .gif under `.project-cover-image` (which can be made at [ezgif.com](https://ezgif.com/video-speed)) and a still under `.project-cover-image-still` -- either a .png or .jpg, which is usually the first frame of the .gif, which can be made at [onlinegiftools.com](https://onlinegiftools.com/extract-gif-frames)
   - **Option B (Solid color with emoji)**: Only include a `.project-cover-image` and instead of setting the `style="background-image:url('');"`, set it as `style="background-color:rgb();"` and then write a related emoji inside the `div`
5. Add entries in reverse chronological order (newest first)

## Adding a New Publication

1. Open `publications.html`
2. In the `#publications-list` div, add a new `<div class="publication">` entry
3. Structure:
   - `<h3 class="publication-title">` - Publication title
   - `<p class="publication-info">` - Authors, venue, and link
   - `<p class="publication-info publication-summary">` - Summary/description
   - `<ul class="publication-info publication-summary publication-links">` - Links (Paper, Code, Demo, etc.)
4. Add entries in reverse chronological order (newest first)

## Adding a New Blog Post

1. Create a new directory in `/blog_posts/` with your post title (e.g., `/blog_posts/my-post-title/`)
2. Copy the template from `/blog_posts/template_post/index.html` to your new directory
3. Create a `figs/` subdirectory in your post directory for images
4. Create a `references.bib` file in your post directory with your BibTeX citations
5. Update the template:
   - Change the title in `<h2 class="section-header">`
   - Update the date in `<p class="blog-post-date">` (use readable format like "January 15, 2024")
   - Add your content in the blog post content area
   - For figures, use: `<img src="./figs/figure-name.png" alt="Description">`
   - For citations, use: `<span class="citation" data-cite="bibtexkey">Author (Year)</span>`
   - Uncomment the bibliography section: `<h3 class="blog-section">References</h3>` and `<div class="blog-bibliography" id="bibliography-list"></div>`
6. Add an entry to `blog.html` in the `#blog-list` div:
   ```html
   <div class="blog-post">
       <h3 class="blog-post-title"><a href="./blog_posts/your-post-title/index.html">Your Post Title</a></h3>
       <p class="blog-post-date">January 15, 2024</p>
       <p class="blog-post-description">A short description of what this blog post is about.</p>
   </div>
   ```
7. Add entries in reverse chronological order (newest first)

**Note**: The citation system automatically:
- Parses `references.bib` from your post directory
- Generates bibliography from only cited references
- Sorts bibliography alphabetically by BibTeX key
- Makes citations clickable links to bibliography entries

## Adding a New Navbar Tab

To add a new tab to the navbar, you only need to update **one file**:

1. **Update `navbar.html`**: Add a new `<li>` entry in the `<ul class="nav-menu">`:
   ```html
   <li><a href="./your-page.html" class="nav-links">Your Tab Name</a></li>
   ```

2. **Update CSS** in `style.css`:
   - Change `.nav-menu` `grid-template-columns` from `repeat(5, auto)` to `repeat(6, auto)` (or whatever the new count is)
   - Update the comment: `/* adjust if number of tabs changes*/`

The navbar is automatically loaded into all pages via `navbar.js`, so you only need to update `navbar.html` once.
