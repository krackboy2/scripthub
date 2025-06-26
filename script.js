let currentPage = 1;
const scriptsPerPage = 50;
let currentScripts = [];

const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const scriptsContainer = document.getElementById('scriptsContainer');

async function searchScripts(query) {
    const loaderContainer = document.querySelector('.loader-container');
    scriptsContainer.innerHTML = '';

    if (loaderContainer) {
        loaderContainer.style.display = 'flex';
        requestAnimationFrame(() => loaderContainer.classList.add('active'));
    }

    try {
        const apiUrl = `https://scriptblox.com/api/script/search?q=${encodeURIComponent(query)}&mode=free`;
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
        updatePaginationButtons();
        updateStats();
        return currentScripts;
    } catch (error) {
        console.error('Error fetching scripts:', error);
        alert('Error fetching scripts. Please try again.');
    } finally {
        if (loaderContainer) {
            loaderContainer.classList.remove('active');
            await new Promise(resolve => setTimeout(resolve, 300));
            loaderContainer.style.display = 'none';
        }
    }
}

async function fetchScripts() {
    const loaderContainer = document.querySelector('.loader-container');
    scriptsContainer.innerHTML = '';

    if (loaderContainer) {
        loaderContainer.style.display = 'flex';
        requestAnimationFrame(() => loaderContainer.classList.add('active'));
    }

    try {
        const apiUrl = `https://scriptblox.com/api/script/fetch?mode=free`;
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
        updatePaginationButtons();
        return currentScripts;
    } catch (error) {
        console.error('Error fetching scripts:', error);
        alert('Error fetching scripts. Please try again.');
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

    const startIndex = (currentPage - 1) * scriptsPerPage;
    const endIndex = startIndex + scriptsPerPage;
    const scriptsToShow = currentScripts.slice(startIndex, endIndex);

    scriptsToShow.forEach((script, index) => {
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

function updatePaginationButtons() {
    const maxPages = Math.ceil(currentScripts.length / scriptsPerPage);
    prevBtn.disabled = currentPage === 1;
    if(maxPages == 0){
        nextBtn.disabled = true;
    }
    else{
        nextBtn.disabled = currentPage === maxPages;
    }
}

// Event Listeners
/*searchBtn.addEventListener('click', () => {
    currentPage = 1;
    searchScripts(searchInput.value);
});*/

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        currentPage = 1;
        searchScripts(searchInput.value);
    }
});

prevBtn.addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        displayScripts();
        updatePaginationButtons();
    }
});

nextBtn.addEventListener('click', () => {
    const maxPages = Math.ceil(currentScripts.length / scriptsPerPage);
    if (currentPage < maxPages) {
        currentPage++;
        displayScripts();
        updatePaginationButtons();
    }
});

// Website loader
// Website loader
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
});

function updateStats() {
    const gameCount = document.getElementById('gameCount');

    const uniqueGames = new Set(currentScripts.map(script => script.game.name));
    if(currentScripts.length != 0 && uniqueGames.size != 0){
        gameCount.textContent = `${uniqueGames.size} Games`;
    }
    else{
        gameCount.textContent = `- Games`;
    }
}
function showToast(message, type) {
    const container = document.querySelector('.toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        container.appendChild(toast);
        
        // Trigger reflow
        toast.offsetHeight;
        
        // Show toast
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
        // Remove toast after 3 seconds
        setTimeout(() => {
            toast.classList.add('hide');
            setTimeout(() => {
                container.removeChild(toast);
            }, 1000); // Match the transition duration
        }, 20000);
    }

currentPage = 1;
fetchScripts();