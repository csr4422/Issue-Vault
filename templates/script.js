// Global state
let currentFilter = 'all';
let searchTerm = '';

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    updateStats();
    renderIssues();
    setupEventListeners();
});

// Update stats in header and footer
function updateStats() {
    const repos = [...new Set(issues.map(i => `${i.repo_owner}/${i.repo_name}`))];
    document.getElementById('repoCount').textContent = repos.length;
    document.getElementById('issueCount').textContent = issues.length;
    document.getElementById('footerCount').textContent = issues.length;
}

// Setup event listeners
function setupEventListeners() {
    // Search input
    document.getElementById('searchInput').addEventListener('input', (e) => {
        searchTerm = e.target.value.toLowerCase();
        renderIssues();
    });
    
    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active state
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Update filter
            currentFilter = btn.dataset.filter;
            renderIssues();
        });
    });
}

// Filter issues based on current state
function getFilteredIssues() {
    return issues.filter(issue => {
        // Filter by state
        if (currentFilter !== 'all' && issue.state !== currentFilter) {
            return false;
        }
        
        // Filter by search term
        if (searchTerm) {
            const searchableText = [
                issue.title,
                issue.number.toString(),
                issue.body || '',
                issue.author,
                issue.repo_owner,
                issue.repo_name
            ].join(' ').toLowerCase();
            
            if (!searchableText.includes(searchTerm)) {
                return false;
            }
        }
        
        return true;
    });
}

// Render issues to DOM
function renderIssues() {
    const container = document.getElementById('issuesContainer');
    const noResults = document.getElementById('noResults');
    const filtered = getFilteredIssues();
    
    if (filtered.length === 0) {
        container.style.display = 'none';
        noResults.style.display = 'block';
        return;
    }
    
    container.style.display = 'block';
    noResults.style.display = 'none';
    
    container.innerHTML = filtered.map(issue => createIssueCard(issue)).join('');
}

// Create HTML for a single issue card
function createIssueCard(issue) {
    const date = new Date(issue.updated_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
    
    const labelsHtml = issue.labels && issue.labels.length > 0
        ? `<div class="labels">
            ${issue.labels.map(label => createLabelHtml(label)).join('')}
           </div>`
        : '';
    
    return `
        <div class="issue-card">
            <div class="repo-badge">${issue.repo_owner}/${issue.repo_name}</div>
            <div class="issue-header">
                <span class="issue-number">#${issue.number}</span>
                <div class="issue-title">
                    <a href="${issue.url}" target="_blank" rel="noopener noreferrer">
                        ${escapeHtml(issue.title)}
                    </a>
                </div>
                <span class="state-badge state-${issue.state}">${issue.state}</span>
            </div>
            <div class="issue-meta">
                Opened by ${escapeHtml(issue.author)} • Updated ${date}
            </div>
            ${labelsHtml}
        </div>
    `;
}

// Create HTML for a label
function createLabelHtml(label) {
    const color = label.color || '666666';
    const brightness = getBrightness(color);
    const textColor = brightness > 128 ? '#000' : '#fff';
    
    return `
        <span class="label" style="background-color: #${color}; color: ${textColor};">
            ${escapeHtml(label.name)}
        </span>
    `;
}

// Calculate brightness of a color (0-255)
function getBrightness(hexColor) {
    const r = parseInt(hexColor.substr(0, 2), 16);
    const g = parseInt(hexColor.substr(2, 2), 16);
    const b = parseInt(hexColor.substr(4, 2), 16);
    return (r * 299 + g * 587 + b * 114) / 1000;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}