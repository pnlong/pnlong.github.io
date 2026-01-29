// BibTeX Citation Processor
// Shared script for processing citations and generating bibliographies from references.bib
// Usage: Include this script and a references.bib file in your blog post directory

(function() {
    // Simple BibTeX parser
    function parseBibTeX(bibtex) {
        const entries = {};
        // Match @type{key, ...fields...}
        const entryRegex = /@(\w+)\{([^,]+),\s*([\s\S]*?)(?=@\w+\{|$)/g;
        let match;
        
        while ((match = entryRegex.exec(bibtex)) !== null) {
            const entryType = match[1];
            const key = match[2].trim();
            const content = match[3];
            
            const fields = {};
            // Match field = {value} or field = value
            const fieldRegex = /(\w+)\s*=\s*\{([^}]*)\}/g;
            let fieldMatch;
            
            while ((fieldMatch = fieldRegex.exec(content)) !== null) {
                let value = fieldMatch[2];
                // Handle LaTeX special characters
                value = value.replace(/\\'([a-z])/g, "$1");
                value = value.replace(/\\`([a-z])/g, "$1");
                value = value.replace(/\\"/g, '"');
                value = value.replace(/\\&/g, '&');
                value = value.replace(/\\%/g, '%');
                fields[fieldMatch[1]] = value;
            }
            
            entries[key] = {
                type: entryType,
                fields: fields
            };
        }
        
        return entries;
    }

    // Format bibliography entry
    function formatBibliographyEntry(entry, key) {
        const fields = entry.fields;
        const authors = fields.author || 'Unknown';
        const year = fields.year || '';
        const title = fields.title || '';
        const journal = fields.journal || fields.booktitle || '';
        const volume = fields.volume || '';
        const number = fields.number || '';
        const pages = fields.pages || '';
        const url = fields.url || '';
        const publisher = fields.publisher || '';
        
        // Format authors
        let authorStr = authors;
        if (authors.includes(' and ')) {
            const authorList = authors.split(' and ');
            if (authorList.length === 2) {
                authorStr = authorList[0] + ' and ' + authorList[1];
            } else if (authorList.length > 2) {
                // Get first author's last name
                const firstAuthor = authorList[0].split(',')[0].trim();
                authorStr = firstAuthor + ' et al.';
            }
        } else {
            // Single author - get last name
            const parts = authors.split(',');
            if (parts.length > 1) {
                authorStr = parts[0].trim() + ', ' + parts.slice(1).join(', ');
            }
        }
        
        // Build citation string
        let citation = authorStr;
        if (year) citation += ' (' + year + '). ';
        if (title) citation += '<i>' + title + '</i>. ';
        if (journal) citation += '<i>' + journal + '</i>';
        if (volume) citation += ', ' + volume;
        if (number) citation += '(' + number + ')';
        if (pages) citation += ', ' + pages;
        if (publisher && !journal) citation += '. ' + publisher;
        if (url) citation += '. <a href="' + url + '" class="text-link" target="_blank">' + url + '</a>';
        if (!url && !publisher) citation += '.';
        
        return citation;
    }

    // Format citation text from BibTeX entry
    function formatCitationText(entry) {
        const fields = entry.fields;
        let authors = fields.author || 'Unknown';
        const year = fields.year || '';
        
        // Handle "and others" case
        const hasOthers = authors.includes(' and others');
        if (hasOthers) {
            authors = authors.replace(' and others', '');
        }
        
        // Parse authors
        let authorList = [];
        if (authors.includes(' and ')) {
            authorList = authors.split(' and ');
        } else {
            authorList = [authors];
        }
        
        // Extract last name from first author
        // BibTeX format: "Last, First" or "First Last"
        let firstAuthor = authorList[0].trim();
        let lastName = '';
        
        if (firstAuthor.includes(',')) {
            // Format: "Last, First"
            lastName = firstAuthor.split(',')[0].trim();
        } else {
            // Format: "First Last" - get last word
            const parts = firstAuthor.split(' ');
            lastName = parts[parts.length - 1];
        }
        
        // Format citation text
        let citationText = lastName;
        // Use "et al." if there are multiple authors OR if "and others" was present
        if (authorList.length > 1 || hasOthers) {
            citationText += ' et al.';
        }
        if (year) {
            citationText += ' ' + year;
        }
        
        return citationText;
    }

    // Process citations - make them clickable links to bibliography and format text
    function processCitations(bibEntries) {
        const citations = document.querySelectorAll('.citation[data-cite]');
        citations.forEach(citation => {
            const key = citation.getAttribute('data-cite');
            if (bibEntries[key]) {
                const entry = bibEntries[key];
                const citationText = formatCitationText(entry);
                
                // Make citation a link to bibliography entry
                const link = document.createElement('a');
                link.href = '#ref-' + key;
                link.className = 'citation-link';
                link.textContent = citationText;
                citation.innerHTML = '';
                citation.appendChild(link);
            }
        });
    }

    // Generate bibliography
    function generateBibliography(bibEntries) {
        const bibContainer = document.getElementById('bibliography-list');
        if (!bibContainer) return;

        // Get all cited keys from the document
        const citedKeys = new Set();
        document.querySelectorAll('.citation[data-cite]').forEach(citation => {
            citedKeys.add(citation.getAttribute('data-cite'));
        });

        // Sort entries by key (alphabetically)
        const sortedKeys = Array.from(citedKeys).sort();

        sortedKeys.forEach(key => {
            const entry = bibEntries[key];
            if (!entry) return;
            
            const formatted = formatBibliographyEntry(entry, key);
            
            const p = document.createElement('p');
            p.id = 'ref-' + key;
            p.innerHTML = formatted;
            bibContainer.appendChild(p);
        });
    }

    // Determine the path to references.bib based on current page location
    function getBibTeXPath() {
        const path = window.location.pathname;
        const pathSegments = path.split('/').filter(segment => segment);
        
        // Count directories (exclude the HTML file itself)
        let depth = 0;
        if (pathSegments.length > 1) {
            depth = pathSegments.length - 1;
        }
        
        // Calculate relative path to references.bib
        // For blog posts: ./references.bib (same directory as index.html)
        // references.bib should be in the same directory as the blog post's index.html
        return './references.bib';
    }

    // Load and process BibTeX
    function loadBibTeX() {
        const bibPath = getBibTeXPath();
        return fetch(bibPath)
            .then(response => response.text())
            .then(bibtex => {
                const entries = parseBibTeX(bibtex);
                processCitations(entries);
                generateBibliography(entries);
                return entries;
            })
            .catch(error => {
                console.error('Error loading BibTeX:', error);
                return {};
            });
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadBibTeX);
    } else {
        loadBibTeX();
    }
})();
