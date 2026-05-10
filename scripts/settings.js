document.addEventListener('DOMContentLoaded', () => {
    const keywordInput = document.getElementById('keywordInput');
    const addBtn = document.getElementById('addKeywordBtn');
    const keywordList = document.getElementById('keywordList');
    const pushToggle = document.getElementById('pushToggle');

    // Load saved settings
    const savedKeywords = JSON.parse(localStorage.getItem('bizSupport_keywords')) || ['청년창업', 'R&D'];
    const savedPush = localStorage.getItem('bizSupport_push') !== 'false'; // Default true

    pushToggle.checked = savedPush;
    renderKeywords();

    // Event Listeners
    addBtn.addEventListener('click', addKeyword);
    keywordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addKeyword();
    });

    pushToggle.addEventListener('change', () => {
        localStorage.setItem('bizSupport_push', pushToggle.checked);
    });

    function addKeyword() {
        const keyword = keywordInput.value.trim();
        if (keyword && !savedKeywords.includes(keyword)) {
            savedKeywords.push(keyword);
            localStorage.setItem('bizSupport_keywords', JSON.stringify(savedKeywords));
            renderKeywords();
            keywordInput.value = '';
        }
    }

    function removeKeyword(keyword) {
        const index = savedKeywords.indexOf(keyword);
        if (index > -1) {
            savedKeywords.splice(index, 1);
            localStorage.setItem('bizSupport_keywords', JSON.stringify(savedKeywords));
            renderKeywords();
        }
    }

    function renderKeywords() {
        keywordList.innerHTML = '';
        savedKeywords.forEach(keyword => {
            const tag = document.createElement('span');
            tag.className = 'tag';
            tag.style.display = 'flex';
            tag.style.alignItems = 'center';
            tag.style.gap = '8px';
            tag.innerHTML = `
                #${keyword} 
                <span style="font-size: 1.2em; line-height: 0.5;">&times;</span>
            `;
            tag.onclick = () => removeKeyword(keyword);
            keywordList.appendChild(tag);
        });
    }
});
