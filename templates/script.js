// Global state
let currentFilter = 'all';
let searchTerm = '';
let collapsedRepos = new Set(); // Track collapsed repos

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
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            renderIssues();
        });
    });
}

// Toggle repository collapse
function toggleRepo(repoKey) {
    if (collapsedRepos.has(repoKey)) {
        collapsedRepos.delete(repoKey);
    } else {
        collapsedRepos.add(repoKey);
    }
    renderIssues();
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

// Group issues by repository
function groupIssuesByRepo(issuesList) {
    const grouped = {};
    
    issuesList.forEach(issue => {
        const repoKey = `${issue.repo_owner}/${issue.repo_name}`;
        if (!grouped[repoKey]) {
            grouped[repoKey] = {
                owner: issue.repo_owner,
                name: issue.repo_name,
                issues: []
            };
        }
        grouped[repoKey].issues.push(issue);
    });
    
    return grouped;
}

// Get SVG icon for issue state
function getIssueIcon(state) {
    if (state === 'open') {
        return `<svg viewBox="0 0 16 16" version="1.1" aria-hidden="true">
            <path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"></path>
            <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Z"></path>
        </svg>`;
    } else {
        return `<svg viewBox="0 0 16 16" version="1.1" aria-hidden="true">
            <path d="M11.28 6.78a.75.75 0 0 0-1.06-1.06L7.25 8.69 5.78 7.22a.75.75 0 0 0-1.06 1.06l2 2a.75.75 0 0 0 1.06 0l3.5-3.5Z"></path>
            <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0Zm-1.5 0a6.5 6.5 0 1 0-13 0 6.5 6.5 0 0 0 13 0Z"></path>
        </svg>`;
    }
}

// Get chevron icon for collapse state
function getChevronIcon(isCollapsed) {
    if (isCollapsed) {
        // Right chevron (collapsed)
        return `<svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
            <path d="M6.22 3.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L9.94 8 6.22 4.28a.75.75 0 0 1 0-1.06Z"></path>
        </svg>`;
    } else {
        // Down chevron (expanded)
        return `<svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
            <path d="M12.78 5.22a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L3.22 6.28a.75.75 0 0 1 1.06-1.06L8 8.94l3.72-3.72a.75.75 0 0 1 1.06 0Z"></path>
        </svg>`;
    }
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
    
    // Group by repository
    const grouped = groupIssuesByRepo(filtered);
    
    // Render each repository group
    const html = Object.entries(grouped).map(([repoKey, repo]) => {
        const isCollapsed = collapsedRepos.has(repoKey);
        const openCount = repo.issues.filter(i => i.state === 'open').length;
        const closedCount = repo.issues.length - openCount;
        
        return `
            <div class="repo-group ${isCollapsed ? 'collapsed' : ''}">
                <div class="repo-group-header" onclick="toggleRepo('${repoKey}')">
                    <div class="repo-title-row">
                        <span class="chevron-icon">
                            ${getChevronIcon(isCollapsed)}
                        </span>
                        <h2 class="repo-group-title">
                            ${escapeHtml(repoKey)}
                        </h2>
                    </div>
                    <div class="repo-stats">
                        <span class="repo-stat">${repo.issues.length} issues</span>
                        <span class="repo-stat repo-stat-open">${openCount} open</span>
                        <span class="repo-stat repo-stat-closed">${closedCount} closed</span>
                    </div>
                </div>
                <div class="repo-issues" style="display: ${isCollapsed ? 'none' : 'block'}">
                    ${repo.issues.map(issue => createIssueItem(issue)).join('')}
                </div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = html;
}

// Create HTML for a single issue item (GitHub style)
function createIssueItem(issue) {
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
        <div class="issue-item">
            <div class="issue-icon state-${issue.state}">
                ${getIssueIcon(issue.state)}
            </div>
            <div class="issue-content">
                <div class="issue-title-row">
                    <span class="issue-title">
                        <a href="${issue.url}" target="_blank" rel="noopener noreferrer">
                            ${escapeHtml(issue.title)}
                        </a>
                    </span>
                    ${labelsHtml}
                </div>
                <div class="issue-meta">
                    <a href="${issue.url}" class="issue-number" target="_blank">#${issue.number}</a>
                    opened by ${escapeHtml(issue.author)} • Updated ${date}
                </div>
            </div>
        </div>
    `;
}

// Create HTML for a label (GitHub style)
function createLabelHtml(label) {
    const color = label.color || '666666';
    const brightness = getBrightness(color);
    const textColor = brightness > 128 ? '#000' : '#fff';
    
    return `
        <span class="label" style="background-color: #${color}; color: ${textColor}; border-color: #${color};">
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