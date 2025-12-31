document.addEventListener('DOMContentLoaded', () => {
    const detailContainer = document.getElementById('detailContainer');
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    // Find the program
    const program = supportPrograms.find(p => p.id === id);

    if (!program) {
        detailContainer.innerHTML = `
            <div style="text-align: center; padding: 50px;">
                <h2>지원 사업을 찾을 수 없습니다.</h2>
                <a href="index.html" class="filter-btn active" style="text-decoration: none; display: inline-block; margin-top: 20px;">홈으로 돌아가기</a>
            </div>
        `;
        return;
    }

    // Set page title
    document.title = `${program.title} - BizSupport.kr`;

    // Calculate badge
    let badgeLabel = '';
    let badgeClass = '';
    switch (program.category) {
        case 'support': badgeLabel = '지원사업'; badgeClass = 'badge-support'; break;
        case 'contest': badgeLabel = '공모전'; badgeClass = 'badge-contest'; break;
        case 'loan': badgeLabel = '융자/보증'; badgeClass = 'badge-loan'; break;
    }

    // Render detail
    detailContainer.innerHTML = `
        <div class="detail-header fade-in-up">
            <span class="card-badge ${badgeClass}" style="font-size: 1rem; padding: 6px 16px;">${badgeLabel}</span>
            <h1 style="margin: 20px 0; font-size: 2rem;">${program.title}</h1>
            <div class="detail-meta">
                <div class="info-item">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21h18M5 21V7l8-4 8 4v14"/></svg>
                    <span style="font-weight: 500;">${program.organization}</span>
                </div>
                <div class="info-item">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    <span>마감일: ${program.deadline} (${program.dDay})</span>
                </div>
                <div class="info-item">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    <span>조회수: ${program.views.toLocaleString()}회</span>
                </div>
            </div>
        </div>

        <div class="detail-content fade-in-up" style="animation-delay: 0.1s; background: white; padding: 40px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); margin-top: 30px;">
            <h3>상세 정보</h3>
            <div class="tags-container" style="margin: 20px 0;">
                ${program.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
            
            <p style="line-height: 1.8; color: var(--text-secondary); margin-bottom: 30px;">
                본 지원사업은 <strong>${program.organization}</strong>에서 주관하는 사업입니다.<br>
                자세한 모집 요강과 접수 방법은 아래 공식 홈페이지를 통해 확인하실 수 있습니다.
            </p>

            <div class="detail-actions" style="display: flex; gap: 15px; flex-wrap: wrap;">
                <a href="${program.link}" target="_blank" class="details-link" style="background: var(--primary); color: white; padding: 12px 24px; border-radius: 12px; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; font-weight: 600;">
                    공식 홈페이지 이동
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                </a>
                <a href="index.html" class="details-link" style="background: var(--bg-secondary); color: var(--text-primary); padding: 12px 24px; border-radius: 12px; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; font-weight: 600;">
                    목록으로 돌아가기
                </a>
            </div>
        </div>
    `;
});
