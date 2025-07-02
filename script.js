let currentScripts = [];

const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const scriptsContainer = document.getElementById('scriptsContainer');

async function searchScripts(query) {
    const loaderContainer = document.querySelector('.loader-container');
    scriptsContainer.innerHTML = '';

    if (loaderContainer) {
        loaderContainer.style.display = 'flex';
        requestAnimationFrame(() => loaderContainer.classList.add('active'));
    }

    try {
        const apiUrl = `https://scriptblox.com/api/script/search?q=${encodeURIComponent(query)}&max=100&mode=free`;
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(apiUrl)}`;
        const response = await fetch(proxyUrl);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Network response was not ok: ${response.statusText} (${response.status}). Response text: ${errorText}`);
        }

        const proxyData = await response.json();
        if (!proxyData.contents) {
            throw new Error('No contents in proxy response');
        }

        const data = JSON.parse(proxyData.contents);
        console.log('API Response:', data);

        if (!data?.result?.scripts || !Array.isArray(data.result.scripts)) {
            console.warn('Invalid script data:', data);
            return [];
        }

        currentScripts = data.result.scripts;
        displayScripts();
        return currentScripts;
    } catch (error) {
        console.error('Error fetching scripts:', error);
    } finally {
        if (loaderContainer) {
            loaderContainer.classList.remove('active');
            await new Promise(resolve => setTimeout(resolve, 300));
            loaderContainer.style.display = 'none';
        }
    }
}

function displayScripts() {
    scriptsContainer.innerHTML = '';

    currentScripts.forEach((script, index) => {
        let imageUrl = script.game.imageUrl;
        if (imageUrl && !imageUrl.includes('rbxcdn')) {
            imageUrl = `https://scriptblox.com${script.game.imageUrl}`;
        }

        const scriptCard = document.createElement('div');
        scriptCard.className = 'script-card';
        scriptCard.style.animationDelay = `${index * 0.1}s`;

        scriptCard.innerHTML = `
            <img src="${imageUrl || 'placeholder.png'}" alt="${script.title}" onerror="this.src='https://via.placeholder.com/300x150'">
            <div class="script-info">
                <h3>${script.title}</h3>
                <div class="script-badges">
                    ${script.views ? `<span class="badge views"><i class="fas fa-eye"></i> ${script.views}</span>` : ''}
                    ${script.verified ? '<span class="badge verified"><i class="fas fa-check-circle"></i> Verified</span>' : ''}
                    ${script.key ? '<span class="badge key-system"><i class="fas fa-key"></i> Key System</span>' : ''}
                    ${script.isUniversal ? '<span class="badge universal"><i class="fas fa-globe"></i> Universal</span>' : ''}
                </div>
            </div>
            <div class="script-description">${script.game.name}</div>
            <button class="copy-btn">
                <span>Copy Script</span>
                <i class="fas fa-copy"></i>
            </button>
        `;

        const copyBtn = scriptCard.querySelector('.copy-btn');
        copyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(script.script)
                .then(() => {
                    copyBtn.innerHTML = '<span>Copied!</span><i class="fas fa-check"></i>';
                    copyBtn.style.background = '#22c55ee6';

                    setTimeout(() => {
                        copyBtn.innerHTML = '<span>Copy Script</span><i class="fas fa-copy"></i>';
                        copyBtn.style.background = '';
                    }, 2000);
                })
                .catch(err => console.error('Failed to copy script:', err));
        });

        scriptsContainer.appendChild(scriptCard);
    });
}

// Search via Enter
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchScripts(searchInput.value);
    }
});

// Loader and welcome modal
window.addEventListener('load', () => {
    const loader = document.querySelector('.website-loader');
    const welcomeModal = document.querySelector('.welcome-modal');

    setTimeout(() => {
        loader.classList.add('hide');
        setTimeout(() => {
            loader.style.display = 'none';
            welcomeModal.classList.add('show');
        }, 500);
    }, 1500);

    document.getElementById('continueBtn').addEventListener('click', () => {
        welcomeModal.classList.add('hide');
        document.body.style.overflow = 'auto';
    });

    setTimeout(() => {
        showToast("Script Hub Initialized!", "success")
    }, 2000);
});

function showToast(message, type) {
    const container = document.querySelector('.toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;

    container.appendChild(toast);
    toast.offsetHeight;

    setTimeout(() => {
        toast.classList.add('show');
    }, 10);

    setTimeout(() => {
        toast.classList.add('hide');
        setTimeout(() => {
            container.removeChild(toast);
        }, 1000);
    }, 2000);
}
