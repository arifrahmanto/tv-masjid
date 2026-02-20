// ============================================================================
// TV Masjid Admin Panel - Main Module
// ============================================================================

const AdminPanel = (() => {
    // ========== Configuration ==========
    const GITHUB_CLIENT_ID = "YOUR_CLIENT_ID_HERE";  // Replace with your OAuth app Client ID
    const GITHUB_REDIRECT_URI = "https://tvmasjid.banjarsari-gajah.web.id//admin.html";  // Replace with your domain
    const REPO_OWNER = "arifrahmanto";  // Replace with GitHub username
    const REPO_NAME = "tv-masjid";  // Replace with repo name
    const TOKEN_EXPIRY_MS = 60 * 60 * 1000;  // 1 hour
    const API_BASE_URL = "https://api.github.com";
    
    // ========== State ==========
    let state = {
        token: null,
        user: null,
        settings: null,
        settingsMetadata: null,  // { sha, path, size }
        unsavedChanges: false,
        currentTab: 'marquee',
        isLoading: false,
        errors: []
    };

    // ========== Token Management ==========
    const TokenManager = (() => {
        const KEY_TOKEN = 'gh_admin_token';
        const KEY_USER = 'gh_admin_user';
        const KEY_TIME = 'gh_admin_token_time';
        
        const set = (token, userInfo = null) => {
            state.token = token;
            sessionStorage.setItem(KEY_TOKEN, token);
            sessionStorage.setItem(KEY_TIME, Date.now().toString());
            
            if (userInfo) {
                state.user = userInfo;
                sessionStorage.setItem(KEY_USER, JSON.stringify(userInfo));
            }
        };

        const get = () => {
            if (!state.token) {
                state.token = sessionStorage.getItem(KEY_TOKEN);
            }
            return state.token;
        };

        const getUser = () => {
            if (!state.user) {
                const stored = sessionStorage.getItem(KEY_USER);
                if (stored) {
                    state.user = JSON.parse(stored);
                }
            }
            return state.user;
        };

        const isValid = () => {
            const token = get();
            if (!token) return false;
            
            const tokenTime = parseInt(sessionStorage.getItem(KEY_TIME) || '0');
            const isExpired = Date.now() - tokenTime > TOKEN_EXPIRY_MS;
            
            if (isExpired) {
                clear();
                return false;
            }
            return true;
        };

        const clear = () => {
            state.token = null;
            state.user = null;
            sessionStorage.removeItem(KEY_TOKEN);
            sessionStorage.removeItem(KEY_USER);
            sessionStorage.removeItem(KEY_TIME);
        };

        const refresh = () => {
            if (state.token) {
                sessionStorage.setItem(KEY_TIME, Date.now().toString());
            }
        };

        return { set, get, getUser, isValid, clear, refresh };
    })();

    // ========== GitHub API ==========
    const GitHubAPI = (() => {
        const request = async (method, path, body = null) => {
            const token = TokenManager.get();
            if (!token) {
                throw new Error('Not authenticated');
            }

            const url = `${API_BASE_URL}${path}`;
            const headers = {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'TV-Masjid-Admin'
            };

            const options = {
                method,
                headers
            };

            if (body) {
                headers['Content-Type'] = 'application/json';
                options.body = JSON.stringify(body);
            }

            let response;
            try {
                response = await fetch(url, options);
            } catch (error) {
                throw new Error(`Network error: ${error.message}`);
            }

            // Handle token expiry
            if (response.status === 401) {
                TokenManager.clear();
                throw new Error('Authentication expired. Please log in again.');
            }

            if (response.status === 404) {
                throw new Error('Not found: ' + path);
            }

            if (response.status === 409) {
                throw new Error('Conflict: Resource was modified elsewhere. Please refresh.');
            }

            if (response.status === 429) {
                throw new Error('Rate limited: Too many requests. Please wait a moment.');
            }

            let data;
            try {
                data = await response.json();
            } catch (e) {
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                return null;
            }

            if (!response.ok) {
                throw new Error(data.message || `HTTP ${response.status}`);
            }

            TokenManager.refresh();
            return data;
        };

        const get = (path) => request('GET', path);
        const put = (path, body) => request('PUT', path, body);
        const post = (path, body) => request('POST', path, body);

        return { get, put, post, request };
    })();

    // ========== User Management ==========
    const UserManager = (() => {
        const fetchUserInfo = async () => {
            try {
                const user = await GitHubAPI.get('/user');
                TokenManager.set(TokenManager.get(), user);
                return user;
            } catch (error) {
                throw new Error(`Failed to fetch user info: ${error.message}`);
            }
        };

        const login = async (token) => {
            try {
                // Validate token by fetching user info
                TokenManager.set(token);  // Set temporarily to make API call
                const user = await fetchUserInfo();
                return { success: true, user };
            } catch (error) {
                TokenManager.clear();
                return { success: false, error: error.message };
            }
        };

        const logout = () => {
            TokenManager.clear();
        };

        const getDisplayName = () => {
            const user = TokenManager.getUser();
            return user ? user.name || user.login : 'Unknown';
        };

        return { login, logout, getDisplayName, fetchUserInfo };
    })();

    // ========== Settings Management ==========
    const Settings = (() => {
        const load = async () => {
            try {
                UI.setLoading(true, 'Loading settings...');
                
                const path = `/repos/${REPO_OWNER}/${REPO_NAME}/contents/setting.json`;
                const data = await GitHubAPI.get(path);
                
                if (!data) {
                    throw new Error('Failed to fetch setting.json');
                }

                // Decode content
                const content = atob(data.content);
                const parsed = JSON.parse(content);
                
                state.settings = parsed;
                state.settingsMetadata = {
                    sha: data.sha,
                    path: data.path,
                    size: data.size,
                    url: data.html_url
                };
                
                UI.setLoading(false);
                return true;
            } catch (error) {
                UI.setLoading(false);
                UI.showError(`Failed to load settings: ${error.message}`);
                return false;
            }
        };

        const save = async (commitMessage) => {
            try {
                UI.setLoading(true, 'Validating...');
                
                // Validate
                if (!Validation.validateAll()) {
                    UI.setLoading(false);
                    UI.showError('Please fix validation errors before saving');
                    return false;
                }

                UI.setLoading(true, 'Collecting changes...');
                
                // Prepare updated settings
                const updatedSettings = collectFormData();
                const jsonString = JSON.stringify(updatedSettings, null, 2);
                
                UI.setLoading(true, 'Saving to GitHub...');
                
                // Commit
                const path = `/repos/${REPO_OWNER}/${REPO_NAME}/contents/setting.json`;
                const result = await GitHubAPI.put(path, {
                    message: commitMessage || 'Update settings from admin panel',
                    content: btoa(unescape(encodeURIComponent(jsonString))),
                    sha: state.settingsMetadata.sha
                });
                
                state.settings = updatedSettings;
                state.unsavedChanges = false;
                state.settingsMetadata.sha = result.content.sha;
                
                UI.setLoading(false);
                UI.showSuccess(`Saved! Commit: ${result.commit.sha.substring(0, 7)}`);
                
                // Reload metadata and history
                await Settings.load();
                await History.load();
                
                return true;
            } catch (error) {
                UI.setLoading(false);
                UI.showError(`Save failed: ${error.message}`);
                return false;
            }
        };

        const markChanged = () => {
            state.unsavedChanges = true;
            UI.updateValidationStatus('Unsaved changes');
        };

        return { load, save, markChanged };
    })();

    // ========== Form Data Collection ==========
    const collectFormData = () => {
        // Collect marquee transactions
        const marqueeTransactions = [];
        document.querySelectorAll('[data-marquee-row]').forEach(row => {
            const date = row.querySelector('[data-field="date"]')?.value;
            const desc = row.querySelector('[data-field="description"]')?.value;
            const amount = row.querySelector('[data-field="amount"]')?.value;
            if (date && desc && amount) {
                marqueeTransactions.push(`(${date}) ${desc} : ${amount}`);
            }
        });

        // Collect financial data
        const financialSummary = {};
        ['pembangunan', 'takmir', 'sawah'].forEach(fund => {
            const form = document.querySelector(`form[data-fund="${fund}"]`);
            if (form) {
                financialSummary[fund] = {
                    month: form.querySelector('[name="month"]')?.value || '',
                    previousBalance: parseInt(form.querySelector('[name="previousBalance"]')?.value || '0'),
                    income: parseInt(form.querySelector('[name="income"]')?.value || '0'),
                    expenses: parseInt(form.querySelector('[name="expenses"]')?.value || '0'),
                    currentBalance: parseInt(form.querySelector('[name="currentBalance"]')?.value || '0')
                };
            }
        });

        // Collect site settings
        const pageTitle = document.querySelector('[name="pageTitle"]')?.value || state.settings.pageTitle;
        const contentUrls = [];
        document.querySelectorAll('[data-url-input]').forEach(input => {
            if (input.value.trim()) {
                contentUrls.push(input.value.trim());
            }
        });

        // Collect prayer settings
        const prayerApiCity = document.querySelector('[name="prayerApiCity"]')?.value || state.settings.prayerApiCity;
        const prayerApiTune = document.querySelector('[name="prayerApiTune"]')?.value || state.settings.prayerApiTune;
        const tarhimOffsetMinutes = parseInt(document.querySelector('[name="tarhimOffsetMinutes"]')?.value || state.settings.tarhimOffsetMinutes);
        const tarhimAudioFile = document.querySelector('[name="tarhimAudioFile"]')?.value || state.settings.tarhimAudioFile;
        const beepAudioFile = document.querySelector('[name="beepAudioFile"]')?.value || state.settings.beepAudioFile;
        const countdownSecondsThreshold = parseInt(document.querySelector('[name="countdownSecondsThreshold"]')?.value || state.settings.countdownSecondsThreshold);
        const countdownHtmlFile = document.querySelector('[name="countdownHtmlFile"]')?.value || state.settings.countdownHtmlFile;

        // Build result
        const result = {
            ...state.settings,
            pageTitle,
            marqueeText: marqueeTransactions,
            financialSummary,
            contentUrls: contentUrls.length > 0 ? contentUrls : state.settings.contentUrls,
            prayerApiCity,
            prayerApiTune,
            tarhimOffsetMinutes,
            tarhimAudioFile,
            beepAudioFile,
            countdownSecondsThreshold,
            countdownHtmlFile
        };

        return result;
    };

    // ========== Marquee / Transaction Ledger ==========
    const TransactionLedger = (() => {
        const render = () => {
            const container = document.getElementById('marquee-table-container');
            const marquee = state.settings.marqueeText || [];
            
            // Parse transactions
            const transactions = marquee.map((text, idx) => ({
                ...parseTransaction(text),
                original: text,
                idx
            }));
            
            // Sort by date (newest first)
            transactions.sort((a, b) => {
                const aDate = parseDate(a.date);
                const bDate = parseDate(b.date);
                return bDate - aDate;
            });
            
            let html = `
                <table class="w-full border-collapse border border-gray-300 text-sm">
                    <thead>
                        <tr class="bg-gray-200">
                            <th class="border border-gray-300 p-2">Date</th>
                            <th class="border border-gray-300 p-2">Description</th>
                            <th class="border border-gray-300 p-2">Amount</th>
                            <th class="border border-gray-300 p-2 w-32">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            
            transactions.forEach((tx, idx) => {
                html += `
                    <tr data-marquee-row data-idx="${tx.idx}">
                        <td class="border border-gray-300 p-2">
                            <input type="text" class="w-full border rounded px-1" data-field="date" value="${tx.date}" placeholder="DD/MM/YYYY">
                        </td>
                        <td class="border border-gray-300 p-2">
                            <input type="text" class="w-full border rounded px-1" data-field="description" value="${tx.description}">
                        </td>
                        <td class="border border-gray-300 p-2">
                            <input type="text" class="w-full border rounded px-1 text-right" data-field="amount" value="${tx.amount}">
                        </td>
                        <td class="border border-gray-300 p-2 flex gap-1">
                            <button class="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600 delete-marquee-btn" data-idx="${tx.idx}">Delete</button>
                        </td>
                    </tr>
                `;
            });
            
            html += `
                    </tbody>
                </table>
            `;
            
            container.innerHTML = html;

            // Add event listeners
            document.querySelectorAll('.delete-marquee-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    if (confirm('Delete this entry?')) {
                        e.target.closest('tr').remove();
                        Settings.markChanged();
                    }
                });
            });

            document.querySelectorAll('[data-marquee-row] input').forEach(input => {
                input.addEventListener('change', () => Settings.markChanged());
            });
        };

        const parseTransaction = (text) => {
            const match = text.match(/\((\d{2}\/\d{2}\/\d{4})\)\s+(.*?)\s+:\s+(.+)/);
            if (match) {
                return {
                    date: match[1],
                    description: match[2],
                    amount: match[3]
                };
            }
            return { date: '', description: '', amount: '' };
        };

        const parseDate = (dateStr) => {
            const parts = dateStr.split('/');
            if (parts.length === 3) {
                return new Date(parts[2], parts[1] - 1, parts[0]);
            }
            return new Date(0);
        };

        const addNew = () => {
            const container = document.getElementById('marquee-table-container');
            const tbody = container.querySelector('tbody');
            const newRow = document.createElement('tr');
            newRow.setAttribute('data-marquee-row', '');
            newRow.innerHTML = `
                <td class="border border-gray-300 p-2">
                    <input type="text" class="w-full border rounded px-1" data-field="date" placeholder="DD/MM/YYYY">
                </td>
                <td class="border border-gray-300 p-2">
                    <input type="text" class="w-full border rounded px-1" data-field="description" placeholder="Description">
                </td>
                <td class="border border-gray-300 p-2">
                    <input type="text" class="w-full border rounded px-1 text-right" data-field="amount" placeholder="Amount">
                </td>
                <td class="border border-gray-300 p-2 flex gap-1">
                    <button class="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600 delete-marquee-btn">Delete</button>
                </td>
            `;
            tbody.appendChild(newRow);
            newRow.querySelector('.delete-marquee-btn').addEventListener('click', () => {
                newRow.remove();
                Settings.markChanged();
            });
            newRow.querySelectorAll('input').forEach(input => {
                input.addEventListener('change', () => Settings.markChanged());
            });
        };

        return { render, addNew };
    })();

    // ========== Financial Summary ==========
    const FinancialSummary = (() => {
        const render = () => {
            const container = document.getElementById('financial-forms-container');
            const financial = state.settings.financialSummary || {};

            let html = '';
            
            Object.keys({ pembangunan: {}, takmir: {}, sawah: {} }).forEach(fundKey => {
                const fund = financial[fundKey] || {};
                const fundLabel = fundKey.charAt(0).toUpperCase() + fundKey.slice(1);
                
                html += `
                    <div class="mb-6 border border-gray-300 rounded p-4">
                        <h3 class="text-lg font-semibold mb-4 cursor-pointer hover:bg-gray-100 p-2 rounded" onclick="this.parentElement.querySelector('.fund-content').classList.toggle('hidden')">
                            ▼ Kas ${fundLabel}
                        </h3>
                        <div class="fund-content">
                            <form data-fund="${fundKey}" class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-semibold mb-1">Month/Year</label>
                                    <input type="text" name="month" class="w-full border border-gray-300 p-2 rounded" value="${fund.month || ''}" data-field="month">
                                </div>
                                <div>
                                    <label class="block text-sm font-semibold mb-1">Previous Balance</label>
                                    <input type="number" name="previousBalance" class="w-full border border-gray-300 p-2 rounded" value="${fund.previousBalance || 0}" data-field="previousBalance">
                                </div>
                                <div>
                                    <label class="block text-sm font-semibold mb-1">Income</label>
                                    <input type="number" name="income" class="w-full border border-gray-300 p-2 rounded" value="${fund.income || 0}" data-field="income">
                                </div>
                                <div>
                                    <label class="block text-sm font-semibold mb-1">Expenses</label>
                                    <input type="number" name="expenses" class="w-full border border-gray-300 p-2 rounded" value="${fund.expenses || 0}" data-field="expenses">
                                </div>
                                <div>
                                    <label class="block text-sm font-semibold mb-1">Current Balance (Auto)</label>
                                    <input type="number" name="currentBalance" class="w-full border border-gray-300 p-2 rounded bg-gray-100" value="${fund.currentBalance || 0}" readonly data-field="currentBalance">
                                </div>
                            </form>
                        </div>
                    </div>
                `;
            });

            container.innerHTML = html;

            // Add listeners for auto-calculation
            Object.keys({ pembangunan: {}, takmir: {}, sawah: {} }).forEach(fundKey => {
                const form = document.querySelector(`form[data-fund="${fundKey}"]`);
                if (form) {
                    const prevInput = form.querySelector('[name="previousBalance"]');
                    const incomeInput = form.querySelector('[name="income"]');
                    const expensesInput = form.querySelector('[name="expenses"]');
                    const currentInput = form.querySelector('[name="currentBalance"]');

                    const recalculate = () => {
                        const prev = parseInt(prevInput.value || 0);
                        const income = parseInt(incomeInput.value || 0);
                        const expenses = parseInt(expensesInput.value || 0);
                        currentInput.value = prev + income - expenses;
                        Settings.markChanged();
                    };

                    prevInput.addEventListener('change', recalculate);
                    incomeInput.addEventListener('change', recalculate);
                    expensesInput.addEventListener('change', recalculate);
                }
            });
        };

        return { render };
    })();

    // ========== Site Settings ==========
    const SiteSettings = (() => {
        const render = () => {
            const form = document.getElementById('site-form');
            if (!form) return;

            // Populate page title
            form.querySelector('[name="pageTitle"]').value = state.settings.pageTitle || '';

            // Populate content URLs
            const urlsList = document.getElementById('content-urls-list');
            urlsList.innerHTML = '';
            const urls = state.settings.contentUrls || [];
            urls.forEach((url, idx) => {
                const div = document.createElement('div');
                div.className = 'flex gap-2';
                div.innerHTML = `
                    <input type="text" class="flex-1 border border-gray-300 p-2 rounded" data-url-input value="${url}">
                    <button type="button" class="bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600" onclick="this.parentElement.remove(); AdminPanel.markChanged();">Delete</button>
                `;
                urlsList.appendChild(div);
            });

            form.addEventListener('change', () => AdminPanel.markChanged());
        };

        return { render };
    })();

    // ========== Prayer Settings ==========
    const PrayerSettings = (() => {
        const render = () => {
            const form = document.getElementById('prayer-form');
            if (!form) return;

            form.querySelector('[name="prayerApiCity"]').value = state.settings.prayerApiCity || '';
            form.querySelector('[name="prayerApiTune"]').value = state.settings.prayerApiTune || '';
            form.querySelector('[name="tarhimOffsetMinutes"]').value = state.settings.tarhimOffsetMinutes || 6;
            form.querySelector('[name="countdownSecondsThreshold"]').value = state.settings.countdownSecondsThreshold || 100;
            form.querySelector('[name="tarhimAudioFile"]').value = state.settings.tarhimAudioFile || '';
            form.querySelector('[name="beepAudioFile"]').value = state.settings.beepAudioFile || '';
            form.querySelector('[name="countdownHtmlFile"]').value = state.settings.countdownHtmlFile || '';

            form.addEventListener('change', () => AdminPanel.markChanged());
        };

        return { render };
    })();

    // ========== Audio Schedules ==========
    const AudioSchedules = (() => {
        const PRAYERS = ['imsak', 'subuh', 'dzuhur', 'ashar', 'maghrib', 'isya'];
        const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

        const render = () => {
            const container = document.getElementById('audio-schedules-container');
            const schedules = state.settings.audioSchedule || [];
            
            if (schedules.length === 0) {
                container.innerHTML = '<p class="text-gray-600">No audio schedules configured</p>';
                return;
            }

            let html = `
                <table class="w-full border-collapse border border-gray-300 text-sm">
                    <thead>
                        <tr class="bg-gray-200">
                            <th class="border border-gray-300 p-2">Day</th>
                            <th class="border border-gray-300 p-2">Prayer</th>
                            <th class="border border-gray-300 p-2">Audio File</th>
                            <th class="border border-gray-300 p-2">Offset (min)</th>
                            <th class="border border-gray-300 p-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            schedules.forEach((schedule, idx) => {
                const dayName = DAYS[schedule.dayofWeek] || 'Unknown';
                const prayerName = schedule.relativeToPrayer || '';
                
                html += `
                    <tr data-schedule-idx="${idx}">
                        <td class="border border-gray-300 p-2">${dayName}</td>
                        <td class="border border-gray-300 p-2">${prayerName}</td>
                        <td class="border border-gray-300 p-2">${schedule.audioFile}</td>
                        <td class="border border-gray-300 p-2">${schedule.timeOffsetMinutes}</td>
                        <td class="border border-gray-300 p-2">
                            <button type="button" class="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600 delete-schedule" data-idx="${idx}">Delete</button>
                        </td>
                    </tr>
                `;
            });

            html += `
                    </tbody>
                </table>
            `;

            container.innerHTML = html;

            document.querySelectorAll('.delete-schedule').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const idx = parseInt(e.target.dataset.idx);
                    if (confirm('Delete this schedule?')) {
                        state.settings.audioSchedule.splice(idx, 1);
                        AdminPanel.markChanged();
                        AudioSchedules.render();
                    }
                });
            });
        };

        return { render, PRAYERS, DAYS };
    })();

    // ========== Public Methods ==========
    const addContentUrl = () => {
        const urlsList = document.getElementById('content-urls-list');
        const div = document.createElement('div');
        div.className = 'flex gap-2';
        div.innerHTML = `
            <input type="text" class="flex-1 border border-gray-300 p-2 rounded" data-url-input placeholder="e.g., pages/welcome.html">
            <button type="button" class="bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600" onclick="this.parentElement.remove(); AdminPanel.markChanged();">Delete</button>
        `;
        urlsList.appendChild(div);
        AdminPanel.markChanged();
    };

    const addAudioSchedule = () => {
        const schedules = state.settings.audioSchedule || [];
        schedules.push({
            dayofWeek: 5,  // Friday
            audioFile: 'audio/new.mp3',
            timeOffsetMinutes: -30,
            relativeToPrayer: 'dzuhur'
        });
        state.settings.audioSchedule = schedules;
        AdminPanel.markChanged();
        AudioSchedules.render();
    };

    const markChanged = () => {
        Settings.markChanged();
    };
    const History = (() => {
        const load = async () => {
            try {
                const path = `/repos/${REPO_OWNER}/${REPO_NAME}/commits?path=setting.json&per_page=10`;
                const commits = await GitHubAPI.get(path);
                
                if (!commits) {
                    return;
                }

                render(commits);
            } catch (error) {
                console.error('Failed to load history:', error);
            }
        };

        const render = (commits) => {
            const container = document.getElementById('history-container');
            
            if (!commits || commits.length === 0) {
                container.innerHTML = '<p class="text-gray-600">No commits yet</p>';
                return;
            }

            let html = `
                <table class="w-full border-collapse border border-gray-300 text-sm">
                    <thead>
                        <tr class="bg-gray-200">
                            <th class="border border-gray-300 p-2">Date</th>
                            <th class="border border-gray-300 p-2">Author</th>
                            <th class="border border-gray-300 p-2">Message</th>
                            <th class="border border-gray-300 p-2">Hash</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            commits.forEach(commit => {
                const date = new Date(commit.commit.author.date).toLocaleString('id-ID');
                const author = commit.commit.author.name;
                const message = commit.commit.message.split('\n')[0];
                const hash = commit.sha.substring(0, 7);
                
                html += `
                    <tr>
                        <td class="border border-gray-300 p-2">${date}</td>
                        <td class="border border-gray-300 p-2">${author}</td>
                        <td class="border border-gray-300 p-2">${message}</td>
                        <td class="border border-gray-300 p-2 font-mono"><a href="${commit.html_url}" target="_blank" class="text-blue-500 hover:underline">${hash}</a></td>
                    </tr>
                `;
            });

            html += `
                    </tbody>
                </table>
            `;

            container.innerHTML = html;
        };

        return { load };
    })();

    // ========== Validation ==========
    const Validation = (() => {
        const validateAll = () => {
            let isValid = true;
            const errors = [];

            // Validate date format in marquee entries
            document.querySelectorAll('[data-field="date"]').forEach((input, idx) => {
                if (input.value && !input.value.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
                    input.classList.add('error');
                    errors.push(`Row ${idx + 1}: Invalid date format (use DD/MM/YYYY)`);
                    isValid = false;
                } else {
                    input.classList.remove('error');
                }
            });

            // Validate amounts are numbers
            document.querySelectorAll('[data-field="amount"]').forEach((input, idx) => {
                if (input.value && isNaN(input.value.replace(/\./g, ''))) {
                    input.classList.add('error');
                    errors.push(`Row ${idx + 1}: Amount must be a number`);
                    isValid = false;
                } else {
                    input.classList.remove('error');
                }
            });

            if (!isValid) {
                UI.showError(errors.join('; '));
            }

            return isValid;
        };

        return { validateAll };
    })();

    // ========== UI Functions ==========
    const UI = (() => {
        const showLoginScreen = () => {
            document.getElementById('login-screen').style.display = 'flex';
            document.getElementById('admin-panel').style.display = 'none';
        };

        const showAdminPanel = () => {
            document.getElementById('login-screen').style.display = 'none';
            document.getElementById('admin-panel').style.display = 'block';
        };

        const setLoading = (loading, message = '') => {
            state.isLoading = loading;
            const spinner = document.getElementById('loading-spinner');
            const msgEl = document.getElementById('loading-message');
            if (spinner) {
                spinner.style.display = loading ? 'flex' : 'none';
            }
            if (msgEl && message) {
                msgEl.textContent = message;
            }
            if (message) {
                updateValidationStatus(message);
            }
        };

        const showError = (message) => {
            console.error('Error:', message);
            const errorEl = document.getElementById('login-error') || document.getElementById('validation-status');
            if (errorEl) {
                errorEl.textContent = '❌ ' + message;
                errorEl.className = 'text-red-600';
            }
            alert(message);  // Fallback
        };

        const showSuccess = (message) => {
            console.log('Success:', message);
            const statusEl = document.getElementById('validation-status');
            if (statusEl) {
                statusEl.textContent = '✓ ' + message;
                statusEl.className = 'text-green-600';
            }
        };

        const updateValidationStatus = (message) => {
            const statusEl = document.getElementById('validation-status');
            if (statusEl) {
                statusEl.textContent = message;
                statusEl.className = 'text-gray-600';
            }
        };

        const setupEventListeners = () => {
            // Login
            document.getElementById('github-login-btn').addEventListener('click', () => {
                promptForToken();
            });

            // Logout
            document.getElementById('logout-btn').addEventListener('click', () => {
                UserManager.logout();
                UI.showLoginScreen();
            });

            // Tab switching
            document.querySelectorAll('.tab-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    switchTab(e.target.dataset.tab);
                });
            });

            // Save
            document.getElementById('save-btn').addEventListener('click', async () => {
                const message = document.getElementById('commit-message').value || undefined;
                await Settings.save(message);
                document.getElementById('commit-message').value = '';
            });

            // Add marquee entry
            document.getElementById('add-marquee-btn').addEventListener('click', () => {
                TransactionLedger.addNew();
                Settings.markChanged();
            });

            // Copy JSON
            document.getElementById('copy-json-btn').addEventListener('click', () => {
                const json = document.getElementById('raw-json').textContent;
                navigator.clipboard.writeText(json).then(() => {
                    showSuccess('JSON copied to clipboard');
                });
            });

            // Unsaved changes warning
            window.addEventListener('beforeunload', (e) => {
                if (state.unsavedChanges) {
                    e.preventDefault();
                    e.returnValue = '';
                }
            });
        };

        const switchTab = (tabName) => {
            document.querySelectorAll('.tab-content').forEach(tab => {
                tab.classList.remove('active');
            });
            document.querySelectorAll('.tab-btn').forEach(btn => {
                btn.classList.remove('active');
            });

            document.getElementById(`${tabName}-tab`).classList.add('active');
            document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
            state.currentTab = tabName;
        };

        return {
            showLoginScreen,
            showAdminPanel,
            setLoading,
            showError,
            showSuccess,
            updateValidationStatus,
            setupEventListeners,
            switchTab
        };
    })();

    // ========== Authentication Prompt ==========
    const promptForToken = async () => {
        const token = prompt('Enter your GitHub Personal Access Token:\n\n(Needs "repo" scope)\n\nSee GITHUB_OAUTH_SETUP.md for help');
        
        if (!token) return;

        UI.setLoading(true, 'Authenticating...');
        const result = await UserManager.login(token);

        if (result.success) {
            UI.showSuccess(`Logged in as ${result.user.name || result.user.login}`);
            document.getElementById('user-info').textContent = result.user.name || result.user.login;
            UI.showAdminPanel();
            
            // Load settings
            if (await Settings.load()) {
                TransactionLedger.render();
                FinancialSummary.render();
                SiteSettings.render();
                PrayerSettings.render();
                AudioSchedules.render();
                document.getElementById('raw-json').textContent = JSON.stringify(state.settings, null, 2);
                await History.load();
            }
        } else {
            UI.showError(result.error);
            UI.setLoading(false);
        }
    };

    // ========== Initialization ==========
    const init = async () => {
        UI.setupEventListeners();

        // Check if already authenticated
        if (TokenManager.isValid()) {
            document.getElementById('user-info').textContent = UserManager.getDisplayName();
            UI.showAdminPanel();
            
            // Load settings
            if (await Settings.load()) {
                TransactionLedger.render();
                FinancialSummary.render();
                SiteSettings.render();
                PrayerSettings.render();
                AudioSchedules.render();
                document.getElementById('raw-json').textContent = JSON.stringify(state.settings, null, 2);
                await History.load();
            }
        } else {
            UI.showLoginScreen();
        }
    };

    return {
        init,
        addContentUrl,
        addAudioSchedule,
        markChanged
    };
})();

// ============================================================================
// Initialize when DOM is ready
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
    AdminPanel.init();
});
