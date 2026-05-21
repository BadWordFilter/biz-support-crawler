document.addEventListener('DOMContentLoaded', () => {
    // 서비스 워커 강제 등록 해제 및 캐시 전면 소거 (구버전 롤백 버그 해결)
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(function(registrations) {
            for (let registration of registrations) {
                registration.unregister().then(function(success) {
                    if (success) console.log('Old Service Worker unregistered.');
                });
            }
        });
    }
    if ('caches' in window) {
        caches.keys().then(function(names) {
            for (let name of names) {
                caches.delete(name);
            }
        });
    }

    const cardsGrid = document.getElementById('cardsGrid');
    const searchInput = document.getElementById('searchInput');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const resultCount = document.getElementById('resultCount');
    const filterToggle = document.getElementById('filterToggle');
    const filterPanel = document.getElementById('filterPanel');
    const pagination = document.getElementById('pagination');

    let currentFilter = 'all';
    let currentSearch = '';
    let activeAdvancedFilters = {
        region: 'all',
        agency: 'all',
        term: 'all'
    };

    // Pagination State
    let currentPage = 1;
    const itemsPerPage = 20;
    let filteredData = [];

    // Initialize
    if (typeof supportPrograms !== 'undefined') {
        filterAndRender();
    } else {
        console.error("supportPrograms data not found. Please check data.js");
        cardsGrid.innerHTML = `<div class="error-msg">데이터를 불러올 수 없습니다.</div>`;
    }

    // Advanced Filter Toggle
    if (filterToggle && filterPanel) {
        filterToggle.addEventListener('click', () => {
            const isVisible = getComputedStyle(filterPanel).display === 'block';
            filterPanel.style.display = isVisible ? 'none' : 'block';
            filterToggle.classList.toggle('active');
        });
    }

    // Filter Buttons (Top Category)
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            currentPage = 1; // Reset to page 1
            filterAndRender();
        });
    });

    // Advanced Filter Options
    const setupFilterGroup = (groupId, key) => {
        const options = document.querySelectorAll(`#${groupId} .filter-opt`);
        options.forEach(opt => {
            opt.addEventListener('click', () => {
                document.querySelectorAll(`#${groupId} .filter-opt`).forEach(o => o.classList.remove('active'));
                opt.classList.add('active');
                activeAdvancedFilters[key] = opt.dataset.value;
                currentPage = 1; // Reset to page 1
                filterAndRender();
            });
        });
    };

    setupFilterGroup('filter-region', 'region');
    setupFilterGroup('filter-agency', 'agency');
    setupFilterGroup('filter-term', 'term');

    // Search Input with debounce
    let debounceTimer;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            currentSearch = e.target.value.toLowerCase();
            currentPage = 1; // Reset to page 1
            filterAndRender();
        }, 150);
    });

    function filterAndRender() {
        filteredData = supportPrograms.filter(program => {
            const matchFilter = currentFilter === 'all' || program.category === currentFilter;
            const matchSearch = program.title.toLowerCase().includes(currentSearch) ||
                program.organization.toLowerCase().includes(currentSearch);
            
            const matchRegion = activeAdvancedFilters.region === 'all' || program.region === activeAdvancedFilters.region;
            const matchAgency = activeAdvancedFilters.agency === 'all' || program.agencyType === activeAdvancedFilters.agency;
            const matchTerm = activeAdvancedFilters.term === 'all' || program.startupTerm === activeAdvancedFilters.term;

            return matchFilter && matchSearch && matchRegion && matchAgency && matchTerm;
        });

        renderCards();
        renderPagination();
    }

    function renderCards() {
        cardsGrid.innerHTML = '';
        resultCount.textContent = filteredData.length;

        if (filteredData.length === 0) {
            cardsGrid.innerHTML = `
                <div class="empty-state" style="grid-column: 1/-1; text-align: center; padding: 100px 20px; color: var(--text-low);">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 20px; opacity: 0.5;">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <p style="font-size: 1.1rem; font-weight: 600;">검색 결과가 없습니다.</p>
                    <p style="font-size: 0.9rem; margin-top: 8px;">필터를 조정하거나 다른 키워드로 검색해 보세요.</p>
                </div>
            `;
            return;
        }

        // Slice data for pagination
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedItems = filteredData.slice(startIndex, endIndex);

        paginatedItems.forEach((program, index) => {


            const card = document.createElement('div');
            card.className = 'card fade-in-up';
            card.style.animationDelay = `${index * 0.05}s`;

            let badgeLabel = '';
            let badgeClass = '';
            switch (program.category) {
                case 'support': badgeLabel = '지원금'; badgeClass = 'badge-support'; break;
                case 'contest': badgeLabel = '공모전'; badgeClass = 'badge-contest'; break;
                case 'loan': badgeLabel = '금융지원'; badgeClass = 'badge-loan'; break;
                default: badgeLabel = '기타'; badgeClass = '';
            }

            card.innerHTML = `
                <div class="card-top">
                    <span class="card-badge ${badgeClass}">${badgeLabel}</span>
                    <div class="card-views">
                        <i class="xi-eye-o"></i> ${program.views || 0}
                    </div>
                </div>
                <h3>${program.title}</h3>
                <div class="card-org">
                    <i class="xi-building"></i> ${program.organization}
                </div>
                <div class="card-meta">
                    <div class="meta-item">
                        <span class="meta-label">지역/구분</span>
                        <span class="meta-value">${program.region} | ${program.agencyType}</span>
                    </div>
                    <div class="meta-item d-day-wrap">
                        <span class="d-day-pill">${program.dDay}</span>
                    </div>
                </div>
                <div class="card-footer" style="margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--glass-border); display: flex; justify-content: space-between; font-size: 0.85rem; color: var(--text-low);">
                    <span>마감: ${program.deadline}</span>
                    <span style="color: var(--accent-primary); font-weight: 600;">${program.startupTerm}</span>
                </div>
            `;

            card.addEventListener('click', () => {
                if (program.link) window.open(program.link, '_blank');
            });

            cardsGrid.appendChild(card);
        });
    }

    function renderPagination() {
        const totalPages = Math.ceil(filteredData.length / itemsPerPage);
        pagination.innerHTML = '';

        if (totalPages <= 1) return;

        // Previous Button
        const prevBtn = document.createElement('button');
        prevBtn.className = 'page-btn page-btn-wide';
        prevBtn.innerHTML = '<i class="xi-angle-left"></i> 이전';
        prevBtn.disabled = currentPage === 1;
        prevBtn.onclick = () => {
            currentPage--;
            updateUI();
        };
        pagination.appendChild(prevBtn);

        // Page Numbers (Visible window logic)
        let startPage = Math.max(1, currentPage - 2);
        let endPage = Math.min(totalPages, startPage + 4);
        if (endPage - startPage < 4) startPage = Math.max(1, endPage - 4);

        for (let i = startPage; i <= endPage; i++) {
            const btn = document.createElement('button');
            btn.className = `page-btn ${i === currentPage ? 'active' : ''}`;
            btn.textContent = i;
            btn.onclick = () => {
                currentPage = i;
                updateUI();
            };
            pagination.appendChild(btn);
        }

        // Next Button
        const nextBtn = document.createElement('button');
        nextBtn.className = 'page-btn page-btn-wide';
        nextBtn.innerHTML = '다음 <i class="xi-angle-right"></i>';
        nextBtn.disabled = currentPage === totalPages;
        nextBtn.onclick = () => {
            currentPage++;
            updateUI();
        };
        pagination.appendChild(nextBtn);
    }

    function updateUI() {
        renderCards();
        renderPagination();
        document.getElementById('results').scrollIntoView({ behavior: 'smooth' });
    }
});
