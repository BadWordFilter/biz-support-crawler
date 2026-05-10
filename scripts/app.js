document.addEventListener('DOMContentLoaded', () => {
    const cardsGrid = document.getElementById('cardsGrid');
    const searchInput = document.getElementById('searchInput');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const resultCount = document.getElementById('resultCount');
    const tags = document.querySelectorAll('.tag');

    let currentFilter = 'all';
    let currentSearch = '';

    // Initialize
    if (typeof supportPrograms !== 'undefined') {
        renderCards(supportPrograms);
    } else {
        console.error("supportPrograms data not found. Please check data.js");
        cardsGrid.innerHTML = `<div class="error-msg">데이터를 불러올 수 없습니다.</div>`;
    }

    // Filter Buttons
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            filterAndRender();
        });
    });

    // Search Input with debounce
    let debounceTimer;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            currentSearch = e.target.value.toLowerCase();
            filterAndRender();
        }, 150);
    });

    // Tag Clicks
    tags.forEach(tag => {
        tag.addEventListener('click', () => {
            const keyword = tag.textContent.replace('#', '');
            searchInput.value = keyword;
            currentSearch = keyword.toLowerCase();
            filterAndRender();

            // Scroll to results on mobile
            if (window.innerWidth < 768) {
                document.getElementById('results').scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    function filterAndRender() {
        const filtered = supportPrograms.filter(program => {
            const matchFilter = currentFilter === 'all' || program.category === currentFilter;
            const matchSearch = program.title.toLowerCase().includes(currentSearch) ||
                program.organization.toLowerCase().includes(currentSearch) ||
                (program.tags && program.tags.some(tag => tag.toLowerCase().includes(currentSearch)));
            return matchFilter && matchSearch;
        });

        renderCards(filtered);
    }

    function renderCards(programs) {
        cardsGrid.innerHTML = '';
        resultCount.textContent = programs.length;

        if (programs.length === 0) {
            cardsGrid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 100px 20px; color: var(--text-low);">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 20px; opacity: 0.5;">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        <line x1="8" y1="11" x2="14" y2="11" stroke-linecap="round"></line>
                    </svg>
                    <p style="font-size: 1.1rem; font-weight: 600;">검색 결과가 없습니다.</p>
                    <p style="font-size: 0.9rem; margin-top: 8px;">다른 키워드로 검색해 보세요.</p>
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
                
                // Initialize the injected ad
                try {
                    (adsbygoogle = window.adsbygoogle || []).push({});
                } catch (e) {
                    console.log("AdSense push error:", e);
                }
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
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                        ${program.views || 0}
                    </div>
                </div>
                <h3>${program.title}</h3>
                <div class="card-org">
                    <div class="org-icon">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 21h18M5 21V7l8-4 8 4v14"/></svg>
                    </div>
                    ${program.organization}
                </div>
                <div class="card-meta">
                    <div class="meta-item">
                        <span class="meta-label">마감일</span>
                        <span class="meta-value">${program.deadline}</span>
                    </div>
                    <div class="meta-item d-day-wrap">
                        <span class="d-day-pill">${program.dDay}</span>
                    </div>
                </div>
            `;

            card.addEventListener('click', () => {
                if (program.link) window.open(program.link, '_blank');
            });

            cardsGrid.appendChild(card);
        });
    }
});
