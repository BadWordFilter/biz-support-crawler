document.addEventListener('DOMContentLoaded', () => {
    const cardsGrid = document.getElementById('cardsGrid');
    const searchInput = document.getElementById('searchInput');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const resultCount = document.getElementById('resultCount');
    const tags = document.querySelectorAll('.tag');

    let currentFilter = 'all';
    let currentSearch = '';

    // Initialize
    renderCards(supportPrograms);

    // Filter Buttons
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active state
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Apply filter
            currentFilter = btn.dataset.filter;
            filterAndRender();
        });
    });

    // Search Input
    searchInput.addEventListener('input', (e) => {
        currentSearch = e.target.value.toLowerCase();
        filterAndRender();
    });

    // Tag Clicks
    tags.forEach(tag => {
        tag.addEventListener('click', () => {
            const keyword = tag.textContent.replace('#', '');
            searchInput.value = keyword;
            currentSearch = keyword.toLowerCase();
            filterAndRender();
        });
    });

    function filterAndRender() {
        const filtered = supportPrograms.filter(program => {
            const matchFilter = currentFilter === 'all' || program.category === currentFilter;
            const matchSearch = program.title.toLowerCase().includes(currentSearch) ||
                program.organization.toLowerCase().includes(currentSearch) ||
                program.tags.some(tag => tag.toLowerCase().includes(currentSearch));
            return matchFilter && matchSearch;
        });

        renderCards(filtered);
    }

    function renderCards(programs) {
        cardsGrid.innerHTML = '';
        resultCount.textContent = `${programs.length}건`;

        if (programs.length === 0) {
            cardsGrid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 50px; color: var(--text-secondary);">
                    검색 결과가 없습니다.
                </div>
            `;
            return;
        }

        programs.forEach((program, index) => {
            const card = document.createElement('div');
            card.className = 'card';
            // Staggered delay for animation
            card.style.animationDelay = `${index * 0.1}s`;
            card.classList.add('fade-in-up');

            // Determine badge label
            let badgeLabel = '';
            let badgeClass = '';
            switch (program.category) {
                case 'support': badgeLabel = '지원사업'; badgeClass = 'badge-support'; break;
                case 'contest': badgeLabel = '공모전'; badgeClass = 'badge-contest'; break;
                case 'loan': badgeLabel = '융자/보증'; badgeClass = 'badge-loan'; break;
            }

            card.innerHTML = `
                <span class="card-badge ${badgeClass}">${badgeLabel}</span>
                <h3>${program.title}</h3>
                <div class="card-info">
                    <div class="info-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21h18M5 21V7l8-4 8 4v14"/></svg>
                        ${program.organization}
                    </div>
                    <div class="info-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                        ~ ${program.deadline}
                    </div>
                    <div class="info-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                        ${program.views}회 조회
                    </div>
                </div>
                <div class="card-footer">
                    <span class="d-day">${program.dDay}</span>
                    <a href="${program.link}" target="_blank" class="details-link">
                        자세히 보기
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                    </a>
                </div>
            `;

            cardsGrid.appendChild(card);
        });
    }
});
