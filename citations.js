// BibTeX Citation Processor
// Shared script for processing citations and generating bibliographies from references.bib
// Usage: Include this script and a references.bib file in your blog post directory

(function() {
    // Helper function to extract balanced braces content
    function extractBracedContent(text, startPos) {
        if (text[startPos] !== '{') return null;
        let depth = 0;
        let pos = startPos;
        let start = pos;
        
        while (pos < text.length) {
            if (text[pos] === '{') {
                depth++;
            } else if (text[pos] === '}') {
                depth--;
                if (depth === 0) {
                    // Return content without outer braces
                    return {
                        content: text.substring(start + 1, pos),
                        endPos: pos + 1
                    };
                }
            } else if (text[pos] === '\\' && pos + 1 < text.length) {
                // Skip escaped characters
                pos++;
            }
            pos++;
        }
        return null;
    }

    // Helper function to remove all curly brackets from a string while preserving content
    function removeAllBraces(text) {
        if (!text) return text;
        // Remove all { and } characters
        return text.replace(/\{|\}/g, '');
    }

    // Simple BibTeX parser with nested brace support
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
            // Match field = {value} with proper nested brace handling
            const fieldRegex = /(\w+)\s*=\s*/g;
            let fieldMatch;
            let lastIndex = 0;
            
            while ((fieldMatch = fieldRegex.exec(content)) !== null) {
                const fieldName = fieldMatch[1];
                const valueStart = fieldMatch.index + fieldMatch[0].length;
                
                // Skip whitespace
                let pos = valueStart;
                while (pos < content.length && /\s/.test(content[pos])) {
                    pos++;
                }
                
                // Check if value starts with brace
                if (content[pos] === '{') {
                    const braced = extractBracedContent(content, pos);
                    if (braced) {
                        let value = braced.content;
                        // Handle LaTeX special characters first (before removing braces)
                        value = value.replace(/\\'([a-z])/g, "$1");
                        value = value.replace(/\\`([a-z])/g, "$1");
                        value = value.replace(/\\"/g, '"');
                        value = value.replace(/\\&/g, '&');
                        value = value.replace(/\\%/g, '%');
                        value = value.replace(/\\{/g, '{');
                        value = value.replace(/\\}/g, '}');
                        
                        // Remove all internal curly brackets for specific fields
                        const fieldsToClean = ['author', 'title', 'journal', 'booktitle'];
                        if (fieldsToClean.includes(fieldName.toLowerCase())) {
                            value = removeAllBraces(value);
                        }
                        
                        fields[fieldName] = value;
                        lastIndex = braced.endPos;
                    }
                } else {
                    // Simple value without braces (until comma or newline)
                    const simpleValueEnd = content.indexOf(',', valueStart);
                    const newlineValueEnd = content.indexOf('\n', valueStart);
                    let endPos = content.length;
                    if (simpleValueEnd !== -1 && (newlineValueEnd === -1 || simpleValueEnd < newlineValueEnd)) {
                        endPos = simpleValueEnd;
                    } else if (newlineValueEnd !== -1) {
                        endPos = newlineValueEnd;
                    }
                    fields[fieldName] = content.substring(valueStart, endPos).trim();
                    lastIndex = endPos;
                }
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
