// Global state
let currentView = 'home';
let currentRepo = null;
let currentIssue = null;
let searchTerm = '';
let filterState = 'all';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupRouter();
    setupEventListeners();
});

// Router
function setupRouter() {
    // Handle initial route
    handleRoute();
    
    // Handle browser back/forward
    window.addEventListener('hashchange', handleRoute);
}

function handleRoute() {
    const hash = window.location.hash.slice(1) || '/';
    const parts = hash.split('/').filter(Boolean);
    
    if (!parts.length || parts[0] === '') {
        showHome();
    } else if (parts[0] === 'repo' && parts.length === 3) {
        showRepo(parts[1], parts[2]);
    } else if (parts[0] === 'issue' && parts.length === 4) {
        showIssue(parts[1], parts[2], parts[3]);
    } else {
        showHome();
    }
}

function navigateTo(path) {
    window.location.hash = path;
}

// Event Listeners
function setupEventListeners() {
    document.getElementById('searchInput').addEventListener('input', (e) => {
        searchTerm = e.target.value.toLowerCase();
        if (currentView === 'repo') {
            renderRepoView();
        }
    });
    
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filterState = btn.dataset.filter;
            if (currentView === 'repo') {
                renderRepoView();
            }
        });
    });
}

// View: Home (Repos List)
function showHome() {
    currentView = 'home';
    currentRepo = null;
    currentIssue = null;
    
    document.getElementById('breadcrumb').innerHTML = '<span class="breadcrumb-item active">Repositories</span>';
    document.getElementById('searchBar').style.display = 'none';
    document.getElementById('filters').style.display = 'none';
    
    renderHomeView();
}

function renderHomeView() {
    const repos = groupIssuesByRepo(issues);
    
    const html = `
        <div class="repos-grid">
            ${Object.entries(repos).map(([repoKey, repo]) => {
                const openCount = repo.issues.filter(i => i.state === 'open').length;
                const closedCount = repo.issues.length - openCount;
                
                return `
                    <div class="repo-card" onclick="navigateTo('/repo/${repo.owner}/${repo.name}')">
                        <div class="repo-card-header">
                            <h3 class="repo-card-title">
                                <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
                                    <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.087a.249.249 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z"></path>
                                </svg>
                                ${escapeHtml(repo.owner)}/<strong>${escapeHtml(repo.name)}</strong>
                            </h3>
                        </div>
                        <div class="repo-card-stats">
                            <span class="stat-item">
                                <span class="stat-number">${repo.issues.length}</span> issues
                            </span>
                            <span class="stat-item stat-open">
                                <span class="stat-number">${openCount}</span> open
                            </span>
                            <span class="stat-item stat-closed">
                                <span class="stat-number">${closedCount}</span> closed
                            </span>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
    
    document.getElementById('appContainer').innerHTML = html;
}

// View: Repo (Issues List)
function showRepo(owner, name) {
    currentView = 'repo';
    currentRepo = { owner, name };
    currentIssue = null;
    
    document.getElementById('breadcrumb').innerHTML = `
        <span class="breadcrumb-item" onclick="navigateTo('/')">Repositories</span>
        <span class="breadcrumb-separator">/</span>
        <span class="breadcrumb-item active">${escapeHtml(owner)}/${escapeHtml(name)}</span>
    `;
    
    document.getElementById('searchBar').style.display = 'block';
    document.getElementById('filters').style.display = 'flex';
    
    renderRepoView();
}

function renderRepoView() {
    const repoIssues = issues.filter(i => 
        i.repo_owner === currentRepo.owner && 
        i.repo_name === currentRepo.name
    );
    
    const filtered = repoIssues.filter(issue => {
        if (filterState !== 'all' && issue.state !== filterState) return false;
        
        if (searchTerm) {
            const searchableText = [
                issue.title,
                issue.number.toString(),
                issue.body || '',
                issue.author
            ].join(' ').toLowerCase();
            
            if (!searchableText.includes(searchTerm)) return false;
        }
        
        return true;
    });
    
    if (filtered.length === 0) {
        document.getElementById('appContainer').innerHTML = `
            <div class="no-results">No issues found</div>
        `;
        return;
    }
    
    const html = `
        <div class="issues-list">
            ${filtered.map(issue => `
                <div class="issue-item" onclick="navigateTo('/issue/${currentRepo.owner}/${currentRepo.name}/${issue.number}')">
                    <div class="issue-icon state-${issue.state}">
                        ${getIssueIcon(issue.state)}
                    </div>
                    <div class="issue-content">
                        <div class="issue-title-row">
                            <span class="issue-title">${escapeHtml(issue.title)}</span>
                            ${issue.labels && issue.labels.length > 0 ? `
                                <div class="labels">
                                    ${issue.labels.map(label => createLabelHtml(label)).join('')}
                                </div>
                            ` : ''}
                        </div>
                        <div class="issue-meta">
                            #${issue.number} opened by ${escapeHtml(issue.author)} • Updated ${formatDate(issue.updated_at)}
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    
    document.getElementById('appContainer').innerHTML = html;
}

// View: Issue Detail
function showIssue(owner, repo, number) {
    currentView = 'issue';
    currentIssue = issues.find(i => 
        i.repo_owner === owner && 
        i.repo_name === repo && 
        i.number === parseInt(number)
    );
    
    if (!currentIssue) {
        showHome();
        return;
    }
    
    document.getElementById('breadcrumb').innerHTML = `
        <span class="breadcrumb-item" onclick="navigateTo('/')">Repositories</span>
        <span class="breadcrumb-separator">/</span>
        <span class="breadcrumb-item" onclick="navigateTo('/repo/${owner}/${repo}')">${escapeHtml(owner)}/${escapeHtml(repo)}</span>
        <span class="breadcrumb-separator">/</span>
        <span class="breadcrumb-item active">#${number}</span>
    `;
    
    document.getElementById('searchBar').style.display = 'none';
    document.getElementById('filters').style.display = 'none';
    
    renderIssueView();
}

function renderIssueView() {
    const issue = currentIssue;
    
    const html = `
        <div class="issue-detail">
            <div class="issue-detail-header">
                <h1 class="issue-detail-title">
                    ${escapeHtml(issue.title)}
                    <span class="issue-number">#${issue.number}</span>
                </h1>
                <div class="issue-detail-meta">
                    <span class="state-badge state-${issue.state}">
                        ${getIssueIcon(issue.state)}
                        ${issue.state}
                    </span>
                    <span class="issue-detail-info">
                        ${escapeHtml(issue.author)} opened this issue on ${formatDate(issue.created_at)} • Updated ${formatDate(issue.updated_at)}
                    </span>
                </div>
                ${issue.labels && issue.labels.length > 0 ? `
                    <div class="labels">
                        ${issue.labels.map(label => createLabelHtml(label)).join('')}
                    </div>
                ` : ''}
            </div>
            
            <div class="issue-detail-body">
                <div class="issue-body-header">
                    <strong>${escapeHtml(issue.author)}</strong> commented
                </div>
                <div class="issue-body-content">
                    ${formatBody(issue.body || 'No description provided.')}
                </div>
            </div>
            
            <div class="issue-actions">
                <a href="${issue.url}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">
                    View on GitHub
                    <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
                        <path d="M3.75 2h3.5a.75.75 0 0 1 0 1.5h-3.5a.25.25 0 0 0-.25.25v8.5c0 .138.112.25.25.25h8.5a.25.25 0 0 0 .25-.25v-3.5a.75.75 0 0 1 1.5 0v3.5A1.75 1.75 0 0 1 12.25 14h-8.5A1.75 1.75 0 0 1 2 12.25v-8.5C2 2.784 2.784 2 3.75 2Zm6.854-1h4.146a.25.25 0 0 1 .25.25v4.146a.25.25 0 0 1-.427.177L13.03 4.03 9.28 7.78a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042l3.75-3.75-1.543-1.543A.25.25 0 0 1 10.604 1Z"></path>
                    </svg>
                </a>
            </div>
        </div>
    `;
    
    document.getElementById('appContainer').innerHTML = html;
}

// Utility Functions
function groupIssuesByRepo(issuesList) {
    const grouped = {};
    issuesList.forEach(issue => {
        const key = `${issue.repo_owner}/${issue.repo_name}`;
        if (!grouped[key]) {
            grouped[key] = {
                owner: issue.repo_owner,
                name: issue.repo_name,
                issues: []
            };
        }
        grouped[key].issues.push(issue);
    });
    return grouped;
}

function getIssueIcon(state) {
    if (state === 'open') {
        return `<svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
            <path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"></path>
            <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Z"></path>
        </svg>`;
    }
    return `<svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
        <path d="M11.28 6.78a.75.75 0 0 0-1.06-1.06L7.25 8.69 5.78 7.22a.75.75 0 0 0-1.06 1.06l2 2a.75.75 0 0 0 1.06 0l3.5-3.5Z"></path>
        <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0Zm-1.5 0a6.5 6.5 0 1 0-13 0 6.5 6.5 0 0 0 13 0Z"></path>
    </svg>`;
}

function createLabelHtml(label) {
    const color = label.color || '666666';
    const brightness = getBrightness(color);
    const textColor = brightness > 128 ? '#000' : '#fff';
    
    return `<span class="label" style="background-color: #${color}; color: ${textColor};">${escapeHtml(label.name)}</span>`;
}

function getBrightness(hexColor) {
    const r = parseInt(hexColor.substr(0, 2), 16);
    const g = parseInt(hexColor.substr(2, 2), 16);
    const b = parseInt(hexColor.substr(4, 2), 16);
    return (r * 299 + g * 587 + b * 114) / 1000;
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function formatBody(body) {
    // Basic markdown-like formatting
    return escapeHtml(body)
        .replace(/\n/g, '<br>')
        .replace(/`([^`]+)`/g, '<code>$1</code>');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}