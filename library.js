// library.js - Library table with CSV parsing and intelligent filtering

(function() {
    'use strict';
    
    // Configuration
    const CSV_FILE = '/books.csv';
    const ITEMS_PER_PAGE = 100;
    
    // State
    let allBooks = [];
    let filteredBooks = [];
    let currentPage = 1;
    let currentSort = { column: 'author', direction: 'asc' };
    let filters = {
        search: '',
        type: '',
        tag: '',
        subtag: ''
    };
    
    // Initialize on DOM ready
    document.addEventListener('DOMContentLoaded', function() {
        const libraryTable = document.getElementById('libraryTable');
        if (!libraryTable) return;
        
        initLibraryTitle();
        loadCSV();
    });
    
    // Load and parse CSV file
    function loadCSV() {
        fetch(CSV_FILE)
            .then(response => {
                if (!response.ok) throw new Error('CSV file not found');
                return response.text();
            })
            .then(csvText => {
                allBooks = parseCSV(csvText);
                filteredBooks = [...allBooks];
                initializeFilters();
                sortBooks();
                renderTable();
                renderPagination();
                updateSortIndicators();
            })
            .catch(error => {
                console.error('Error loading library data:', error);
                showError('Unable to load library. Please check that books.csv exists.');
            });
    }
    
    // Parse CSV text into array of objects
    function parseCSV(text) {
        const lines = text.trim().split('\n');
        if (lines.length < 2) return [];
        
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        
        const books = [];
        for (let i = 1; i < lines.length; i++) {
            const values = parseCSVLine(lines[i]);
            if (values.length >= headers.length) {
                const book = {};
                headers.forEach((header, index) => {
                    book[header] = (values[index] || '').trim();
                });
                books.push(book);
            }
        }
        
        return books;
    }
    
    // Parse CSV line handling quoted fields with commas
    function parseCSVLine(line) {
        const values = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                values.push(current);
                current = '';
            } else {
                current += char;
            }
        }
        values.push(current);
        
        return values.map(v => v.replace(/^"|"$/g, '').trim());
    }
    
    // Initialize filter dropdowns with all unique values
    function initializeFilters() {
        updateFilterOptions();
        attachFilterListeners();
        attachSearchListener();
        attachSortListeners();
    }
    
    // Update filter options based on current filtered books (smart filtering)
    function updateFilterOptions() {
        const getFilteredBooksFor = (excludeFilter) => {
            return allBooks.filter(book => {
                if (excludeFilter !== 'search' && filters.search) {
                    const searchLower = filters.search.toLowerCase();
                    const searchableText = [
                        book.author,
                        book.title,
                        book.type,
                        book.tag,
                        book['sub-tag']
                    ].join(' ').toLowerCase();
                    if (!searchableText.includes(searchLower)) return false;
                }
                if (excludeFilter !== 'type' && filters.type && book.type !== filters.type) return false;
                if (excludeFilter !== 'tag' && filters.tag && book.tag !== filters.tag) return false;
                if (excludeFilter !== 'subtag' && filters.subtag && book['sub-tag'] !== filters.subtag) return false;
                return true;
            });
        };
        
        updateDropdown('categoryFilter', 'type', getFilteredBooksFor('type'));
        updateDropdown('tagFilter', 'tag', getFilteredBooksFor('tag'));
        updateDropdown('subtagFilter', 'sub-tag', getFilteredBooksFor('subtag'));
    }
    
    // Update a single dropdown with available options
    function updateDropdown(elementId, field, books) {
        const select = document.getElementById(elementId);
        if (!select) return;
        
        const values = [...new Set(books.map(b => b[field]).filter(Boolean))].sort();
        const currentValue = select.value;
        
        select.innerHTML = '<option value="">All</option>';
        values.forEach(value => {
            const option = document.createElement('option');
            option.value = value;
            option.textContent = value;
            if (value === currentValue) option.selected = true;
            select.appendChild(option);
        });
    }
    
    // Attach filter change listeners
    function attachFilterListeners() {
        const filterMap = {
            categoryFilter: 'type',
            tagFilter: 'tag',
            subtagFilter: 'subtag'
        };
        
        Object.entries(filterMap).forEach(([id, filterKey]) => {
            const select = document.getElementById(id);
            if (select) {
                select.addEventListener('change', function() {
                    filters[filterKey] = this.value;
                    applyFilters();
                });
            }
        });
    }
    
    // Attach search input listener
    function attachSearchListener() {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', function() {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    filters.search = this.value;
                    applyFilters();
                }, 300);
            });
        }
    }
    
    // Apply all filters and update display
    function applyFilters() {
        filteredBooks = allBooks.filter(book => {
            if (filters.search) {
                const searchLower = filters.search.toLowerCase();
                const searchableText = [
                    book.author,
                    book.title,
                    book.type,
                    book.tag,
                    book['sub-tag']
                ].join(' ').toLowerCase();
                if (!searchableText.includes(searchLower)) return false;
            }
            
            if (filters.type && book.type !== filters.type) return false;
            if (filters.tag && book.tag !== filters.tag) return false;
            if (filters.subtag && book['sub-tag'] !== filters.subtag) return false;
            
            return true;
        });
        
        updateFilterOptions();
        currentPage = 1;
        sortBooks();
        renderTable();
        renderPagination();
        updateSortIndicators();
    }
    
    // Attach sort listeners to column headers
    function attachSortListeners() {
        const headers = document.querySelectorAll('.sortable');
        headers.forEach(header => {
            header.addEventListener('click', function() {
                const column = this.dataset.column;
                
                if (currentSort.column === column) {
                    currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
                } else {
                    currentSort.column = column;
                    currentSort.direction = 'asc';
                }
                
                sortBooks();
                renderTable();
                updateSortIndicators();
            });
        });
    }
    
    // Sort filtered books
    function sortBooks() {
        filteredBooks.sort((a, b) => {
            const col = currentSort.column;
            const aVal = (a[col] || '').toLowerCase();
            const bVal = (b[col] || '').toLowerCase();
            
            const comparison = aVal.localeCompare(bVal);
            return currentSort.direction === 'asc' ? comparison : -comparison;
        });
    }
    
    // Update sort indicators on headers
    function updateSortIndicators() {
        document.querySelectorAll('.sortable').forEach(header => {
            header.classList.remove('sorted-asc', 'sorted-desc');
        });
        
        const currentHeader = document.querySelector(`[data-column="${currentSort.column}"]`);
        if (currentHeader) {
            currentHeader.classList.add(`sorted-${currentSort.direction}`);
        }
    }
    
    // Render table with paginated books
    function renderTable() {
        const tbody = document.querySelector('#libraryTable tbody');
        if (!tbody) return;
        
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        const pageBooks = filteredBooks.slice(startIndex, endIndex);
        
        tbody.innerHTML = '';
        
        if (pageBooks.length === 0) {
            tbody.innerHTML = '<tr><td colspan="2" class="no-results">No books found matching your filters.</td></tr>';
            updateResultCount();
            return;
        }
        
        pageBooks.forEach(book => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${escapeHtml(book.author)}</td>
                <td>${escapeHtml(book.title)}</td>
            `;
            tbody.appendChild(row);
        });
        
        updateResultCount();
    }
    
    // Render pagination controls
    function renderPagination() {
        const paginationContainer = document.getElementById('pagination');
        if (!paginationContainer) return;
        
        const totalPages = Math.ceil(filteredBooks.length / ITEMS_PER_PAGE);
        
        if (totalPages <= 1) {
            paginationContainer.innerHTML = '';
            return;
        }
        
        let html = '<div class="pagination-controls">';
        
        if (currentPage > 1) {
            html += `<button class="page-btn" data-page="${currentPage - 1}">← Previous</button>`;
        }
        
        const pageNumbers = getPageNumbers(currentPage, totalPages);
        pageNumbers.forEach(page => {
            if (page === '...') {
                html += '<span class="page-ellipsis">...</span>';
            } else {
                const activeClass = page === currentPage ? 'active' : '';
                html += `<button class="page-btn ${activeClass}" data-page="${page}">${page}</button>`;
            }
        });
        
        if (currentPage < totalPages) {
            html += `<button class="page-btn" data-page="${currentPage + 1}">Next →</button>`;
        }
        
        html += '</div>';
        paginationContainer.innerHTML = html;
        
        document.querySelectorAll('.page-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                currentPage = parseInt(this.dataset.page, 10);
                renderTable();
                renderPagination();
                
                const table = document.getElementById('libraryTable');
                if (table) {
                    table.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
    }
    
    // Get page numbers to display (with ellipsis for many pages)
    function getPageNumbers(current, total) {
        if (total <= 7) {
            return Array.from({ length: total }, (_, i) => i + 1);
        }
        
        const pages = [1];
        
        if (current > 3) pages.push('...');
        
        for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
            pages.push(i);
        }
        
        if (current < total - 2) pages.push('...');
        
        if (total > 1 && pages[pages.length - 1] !== total) pages.push(total);
        
        return pages;
    }
    
    // Result count removed from UI for cleaner design
    function updateResultCount() {
        return;
    }
    
    // Escape HTML to prevent XSS
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text || '';
        return div.innerHTML;
    }
    
    // Initialize baffle.js on library page title
    function initLibraryTitle() {
        const titleElement = document.getElementById('libraryTitle');
        if (!titleElement || typeof baffle !== 'function') return;
        
        const states = {
            name: 'roman coussement',
            title: 'a common trueness'
        };
        let currentState = localStorage.getItem('titleState') || 'name';
        if (currentState !== 'name' && currentState !== 'title') currentState = 'name';
        
        titleElement.textContent = states[currentState];
        titleElement.style.cursor = 'pointer';
        titleElement.style.userSelect = 'none';
        
        titleElement.addEventListener('click', function() {
            const targetState = currentState === 'name' ? 'title' : 'name';
            const targetText = states[targetState];
            
            const baffleInstance = baffle(titleElement, {
                characters: '~!@#$%^&*-+=<>?/\\|abcdefghijklmnopqrstuvwxyz',
                speed: 50
            });
            
            baffleInstance.start();
            
            setTimeout(function() {
                baffleInstance.text(function() { return targetText; });
                baffleInstance.reveal(1000);
                
                setTimeout(function() {
                    currentState = targetState;
                    localStorage.setItem('titleState', currentState);
                }, 1000);
            }, 1000);
        });
    }
    
    // Show error message
    function showError(message) {
        const container = document.querySelector('.library-container');
        if (container) {
            container.innerHTML = `<p class="error-message">${escapeHtml(message)}</p>`;
        }
    }
    
})();
