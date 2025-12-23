document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('.section');
    const navItems = document.querySelectorAll('.nav-item');
    const navGroups = document.querySelectorAll('.nav-group-header');
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');
    const backToTop = document.getElementById('back-to-top');
    const toggleSidebarBtn = document.getElementById('toggle-sidebar');
    const sidebar = document.querySelector('.sidebar');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const filterInputs = document.querySelectorAll('.filter-input');
    const codeCopyBtns = document.querySelectorAll('.code-copy-btn');
    const collapsibles = document.querySelectorAll('.collapsible-header');

    let currentSection = 'home';

    const searchIndex = [];

    function buildSearchIndex() {
        sections.forEach(section => {
            const sectionId = section.id;
            const title = section.querySelector('.section-title')?.textContent || '';
            const description = section.querySelector('.section-description')?.textContent || '';
            const content = section.textContent || '';

            searchIndex.push({
                id: sectionId,
                title: title,
                category: 'Раздел',
                content: content.substring(0, 500)
            });

            section.querySelectorAll('h2, h3').forEach(heading => {
                searchIndex.push({
                    id: sectionId,
                    title: heading.textContent,
                    category: title,
                    content: heading.nextElementSibling?.textContent?.substring(0, 200) || ''
                });
            });

            section.querySelectorAll('table tbody tr').forEach(row => {
                const cells = row.querySelectorAll('td');
                if (cells.length >= 2) {
                    searchIndex.push({
                        id: sectionId,
                        title: cells[0].textContent.trim(),
                        category: 'Команда',
                        content: cells[cells.length - 1].textContent.substring(0, 200)
                    });
                }
            });
        });
    }

    function navigateTo(sectionId) {
        sections.forEach(s => s.classList.remove('active'));
        navItems.forEach(n => n.classList.remove('active'));

        const targetSection = document.getElementById(sectionId);
        const targetNav = document.querySelector(`.nav-item[data-section="${sectionId}"]`);

        if (targetSection) {
            targetSection.classList.add('active');
            currentSection = sectionId;
            window.scrollTo({ top: 0, behavior: 'smooth' });

            if (window.innerWidth <= 1024) {
                sidebar.classList.remove('open');
            }
        }

        if (targetNav) {
            targetNav.classList.add('active');
            const parentGroup = targetNav.closest('.nav-group');
            if (parentGroup) {
                parentGroup.classList.add('open');
            }
        }

        history.pushState({ section: sectionId }, '', `#${sectionId}`);
    }

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = item.dataset.section;
            if (sectionId) {
                navigateTo(sectionId);
            }
        });
    });

    navGroups.forEach(group => {
        group.addEventListener('click', () => {
            const parent = group.parentElement;
            parent.classList.toggle('open');
        });
    });

    function performSearch(query) {
        if (query.length < 2) {
            searchResults.classList.remove('active');
            return;
        }

        const lowerQuery = query.toLowerCase();
        const results = searchIndex
            .filter(item => 
                item.title.toLowerCase().includes(lowerQuery) ||
                item.content.toLowerCase().includes(lowerQuery)
            )
            .slice(0, 10);

        if (results.length > 0) {
            searchResults.innerHTML = results.map(result => `
                <div class="search-result-item" data-section="${result.id}">
                    <div class="search-result-title">${highlightMatch(result.title, query)}</div>
                    <div class="search-result-category">${result.category}</div>
                </div>
            `).join('');
            searchResults.classList.add('active');

            searchResults.querySelectorAll('.search-result-item').forEach(item => {
                item.addEventListener('click', () => {
                    navigateTo(item.dataset.section);
                    searchInput.value = '';
                    searchResults.classList.remove('active');
                });
            });
        } else {
            searchResults.innerHTML = '<div class="search-result-item"><div class="search-result-title">Ничего не найдено</div></div>';
            searchResults.classList.add('active');
        }
    }

    function highlightMatch(text, query) {
        const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
        return text.replace(regex, '<span class="search-result-match">$1</span>');
    }

    function escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            performSearch(e.target.value);
        });

        searchInput.addEventListener('focus', () => {
            if (searchInput.value.length >= 2) {
                searchResults.classList.add('active');
            }
        });

        document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
                searchResults.classList.remove('active');
            }
        });
    }

    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            searchInput?.focus();
        }
        if (e.key === 'Escape') {
            searchResults?.classList.remove('active');
            searchInput?.blur();
        }
    });

    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTop?.classList.add('visible');
        } else {
            backToTop?.classList.remove('visible');
        }
    });

    backToTop?.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    toggleSidebarBtn?.addEventListener('click', () => {
        sidebar?.classList.toggle('open');
    });

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabGroup = btn.closest('.tabs');
            const tabId = btn.dataset.tab;
            const contentContainer = tabGroup.nextElementSibling?.closest('.section') || tabGroup.parentElement;

            tabGroup.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            contentContainer.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
                if (content.dataset.tab === tabId) {
                    content.classList.add('active');
                }
            });
        });
    });

    filterInputs.forEach(input => {
        input.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const tableContainer = input.nextElementSibling;
            const rows = tableContainer?.querySelectorAll('tbody tr');

            rows?.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(query) ? '' : 'none';
            });
        });
    });

    codeCopyBtns.forEach(btn => {
        btn.addEventListener('click', async () => {
            const codeBlock = btn.closest('.code-block');
            const code = codeBlock?.querySelector('code')?.textContent;

            if (code) {
                try {
                    await navigator.clipboard.writeText(code);
                    btn.textContent = 'Скопировано!';
                    btn.classList.add('copied');
                    setTimeout(() => {
                        btn.textContent = 'Копировать';
                        btn.classList.remove('copied');
                    }, 2000);
                } catch (err) {
                    console.error('Failed to copy:', err);
                }
            }
        });
    });

    collapsibles.forEach(header => {
        header.addEventListener('click', () => {
            const collapsible = header.parentElement;
            collapsible.classList.toggle('open');
        });
    });

    function handleHashChange() {
        const hash = window.location.hash.slice(1);
        if (hash && document.getElementById(hash)) {
            navigateTo(hash);
        } else {
            navigateTo('home');
        }
    }

    window.addEventListener('popstate', handleHashChange);

    buildSearchIndex();

    setTimeout(() => {
        document.getElementById('loading-overlay')?.classList.add('hidden');
    }, 300);

    handleHashChange();
});
