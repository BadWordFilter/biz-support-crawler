document.addEventListener('DOMContentLoaded', () => {
    const cardsGrid = document.getElementById('cardsGrid');
    const searchInput = document.getElementById('searchInput');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const resultCount = document.getElementById('resultCount');
    const filterToggle = document.getElementById('filterToggle');
    const filterPanel = document.getElementById('filterPanel');

    let currentFilter = 'all';
    let currentSearch = '';
    let activeAdvancedFilters = {
        region: 'all',
        agency: 'all',
        term: 'all'
    };

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
            filterAndRender();
        }, 150);
    });

    function filterAndRender() {
        const filtered = supportPrograms.filter(program => {
            const matchFilter = currentFilter === 'all' || program.category === currentFilter;
            const matchSearch = program.title.toLowerCase().includes(currentSearch) ||
                program.organization.toLowerCase().includes(currentSearch);
            
            const matchRegion = activeAdvancedFilters.region === 'all' || program.region === activeAdvancedFilters.region;
            const matchAgency = activeAdvancedFilters.agency === 'all' || program.agencyType === activeAdvancedFilters.agency;
            const matchTerm = activeAdvancedFilters.term === 'all' || program.startupTerm === activeAdvancedFilters.term;

            return matchFilter && matchSearch && matchRegion && matchAgency && matchTerm;
        });

        renderCards(filtered);
    }

    function renderCards(programs) {
        cardsGrid.innerHTML = '';
        resultCount.textContent = programs.length;

        if (programs.length === 0) {
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

        programs.forEach((program, index) => {
            // Inject In-feed Ad every 8 cards
            if (index > 0 && index % 8 === 0) {
                const adContainer = document.createElement('div');
                adContainer.className = 'adsense-container ad-infeed fade-in-up';
                adContainer.innerHTML = `
                    <ins class="adsbygoogle"
                         style="display:block"
                         data-ad-format="fluid"
                         data-ad-layout-key="-fb+5w+4e-db+86"
                         data-ad-client="ca-pub-4540972419156905"
                         data-ad-slot="##########"></ins>
                    <span class="ad-placeholder-text">In-feed Ad Unit</span>
                `;
                cardsGrid.appendChild(adContainer);
                try { (adsbygoogle = window.adsbygoogle || []).push({}); } catch (e) {}
            }

            const card = document.createElement('div');
            card.className = 'card fade-in-up';
            card.style.animationDelay = `${index * 0.05}s`;

            // Badge Setup
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
                <div class="card-footer">
                    <span class="deadline-txt">마감: ${program.deadline}</span>
                    <div class="card-tag-preview">${program.startupTerm}</div>
                </div>
            `;

            card.addEventListener('click', () => {
                if (program.link) window.open(program.link, '_blank');
            });

            cardsGrid.appendChild(card);
        });
    }
});
