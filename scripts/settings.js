document.addEventListener('DOMContentLoaded', () => {
    // Basic Settings
    const keywordInput = document.getElementById('keywordInput');
    const addBtn = document.getElementById('addKeywordBtn');
    const keywordList = document.getElementById('keywordList');
    const pushToggle = document.getElementById('pushToggle');

    // Profile Settings
    const profileName = document.getElementById('profileName');
    const profileRegion = document.getElementById('profileRegion');
    const saveProfileBtn = document.getElementById('saveProfileBtn');
    const testPushBtn = document.getElementById('testPushBtn');
    const toastPopup = document.getElementById('toastPopup');

    const termButtons = document.querySelectorAll('#profileTermGroup .chip-btn');
    const categoryButtons = document.querySelectorAll('#profileCategoryGroup .chip-btn');

    // Load saved settings
    const savedKeywords = JSON.parse(localStorage.getItem('bizSupport_keywords')) || ['청년창업', 'R&D'];
    const savedPush = localStorage.getItem('bizSupport_push') !== 'false'; // Default true
    
    // Load profile
    const defaultProfile = {
        name: '',
        term: 'all',
        region: 'all',
        categories: ['support', 'contest', 'loan']
    };
    const savedProfile = JSON.parse(localStorage.getItem('bizSupport_profile')) || defaultProfile;

    // Apply values to inputs
    pushToggle.checked = savedPush;
    renderKeywords();

    profileName.value = savedProfile.name || '';
    profileRegion.value = savedProfile.region || 'all';

    // Highlight active profile term chip
    termButtons.forEach(btn => {
        if (btn.dataset.value === savedProfile.term) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Highlight active profile category chips
    categoryButtons.forEach(btn => {
        if (savedProfile.categories.includes(btn.dataset.value)) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // --- Interactive Chip Event Handlers ---
    
    // Startup Term Group (Single select)
    termButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            termButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // Category Group (Multi select)
    categoryButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const activeCats = document.querySelectorAll('#profileCategoryGroup .chip-btn.active');
            // Allow toggling, but prevent having 0 selected categories
            if (btn.classList.contains('active') && activeCats.length <= 1) {
                showToast('최소 하나의 관심 분야를 선택해야 합니다.');
                return;
            }
            btn.classList.toggle('active');
        });
    });

    // --- Event Listeners ---
    addBtn.addEventListener('click', addKeyword);
    keywordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addKeyword();
    });

    pushToggle.addEventListener('change', () => {
        localStorage.setItem('bizSupport_push', pushToggle.checked);
    });

    saveProfileBtn.addEventListener('click', () => {
        const nameVal = profileName.value.trim();
        if (!nameVal) {
            showToast('이름을 입력해주세요.');
            profileName.focus();
            return;
        }

        const activeTermBtn = document.querySelector('#profileTermGroup .chip-btn.active');
        const termVal = activeTermBtn ? activeTermBtn.dataset.value : 'all';
        const regionVal = profileRegion.value;

        const activeCategoryBtns = document.querySelectorAll('#profileCategoryGroup .chip-btn.active');
        const categoriesVal = Array.from(activeCategoryBtns).map(btn => btn.dataset.value);

        const profileData = {
            name: nameVal,
            term: termVal,
            region: regionVal,
            categories: categoriesVal
        };

        localStorage.setItem('bizSupport_profile', JSON.stringify(profileData));
        showToast('맞춤 프로필이 성공적으로 저장되었습니다!');
    });

    testPushBtn.addEventListener('click', () => {
        triggerDemoNotification();
    });

    // --- Helper Functions ---

    function showToast(message) {
        toastPopup.textContent = message;
        toastPopup.classList.add('show');
        setTimeout(() => {
            toastPopup.classList.remove('show');
        }, 2500);
    }

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

    function triggerDemoNotification() {
        if (!('Notification' in window)) {
            showToast('이 브라우저는 데스크톱 알림을 지원하지 않습니다.');
            return;
        }

        const nameVal = profileName.value.trim() || '고객';

        if (Notification.permission === 'granted') {
            sendNotification(nameVal);
        } else if (Notification.permission !== 'denied') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    sendNotification(nameVal);
                } else {
                    showToast('알림 권한이 차단되었습니다. 설정에서 권한을 변경해 주세요.');
                }
            });
        } else {
            showToast('브라우저 설정에서 알림 허용 권한이 거부되어 있습니다.');
        }
    }

    function sendNotification(userName) {
        const title = '🔔 BizSupport 맞춤 추천 공고';
        const options = {
            body: `안녕하세요 ${userName}님! 새로운 R&D 지원사업 공고가 등록되었습니다. 지금 바로 확인해 보세요!`,
            icon: 'manifest.json' // Path to notification icon
        };
        new Notification(title, options);
        showToast('테스트 알림이 성공적으로 전송되었습니다.');
    }
});
