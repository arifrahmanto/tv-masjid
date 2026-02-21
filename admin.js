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

        // ========== Feature Detection ==========
        const checkImportSupport = () => {
            const hasFileReader = typeof FileReader !== 'undefined';
            const hasXLSX = typeof XLSX !== 'undefined';
            return hasFileReader && hasXLSX;
        };

        // ========== Import Functions ==========
        let importData = { validRows: [], invalidRows: [], fileName: '' };

        const triggerImport = () => {
            if (!checkImportSupport()) {
                alert('Import feature is not available. Please check your browser or internet connection.');
                return;
            }
            const fileInput = document.getElementById('excel-file-input');
            fileInput.click();
        };

        const handleFileSelect = (event) => {
            const file = event.target.files[0];
            if (!file) return;

            // Reset file input
            event.target.value = '';

            // Validate file size (5MB max)
            const maxSize = 5 * 1024 * 1024;
            if (file.size > maxSize) {
                showError('File too large (max 5MB)');
                return;
            }

            // Validate file format
            const validExtensions = ['.xlsx', '.xls'];
            const fileName = file.name.toLowerCase();
            const isValidFormat = validExtensions.some(ext => fileName.endsWith(ext));
            if (!isValidFormat) {
                showError('Invalid file format. Please upload .xlsx or .xls file');
                return;
            }

            // Show modal with loading
            showModal();
            showLoading(true);
            hideError();
            hidePreviewContent();

            // Read file
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    parseExcelFile(e.target.result, file.name);
                } catch (error) {
                    showError('Unable to read file. Please check the file is not corrupted');
                    showLoading(false);
                }
            };
            reader.onerror = () => {
                showError('Error reading file. Please try again.');
                showLoading(false);
            };
            reader.readAsBinaryString(file);
        };

        const parseExcelFile = (binaryString, fileName) => {
            try {
                // Parse workbook
                const workbook = XLSX.read(binaryString, { type: 'binary' });
                
                console.log('Workbook parsed successfully. Sheets:', workbook.SheetNames);
                
                // Get first sheet
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                
                // Convert to JSON with headers
                const rawData = XLSX.utils.sheet_to_json(sheet, { 
                    header: 1,
                    raw: false,
                    defval: ''
                });

                console.log('Raw data rows:', rawData.length);
                if (rawData.length > 0) {
                    console.log('Header row:', rawData[0]);
                }

                if (rawData.length === 0) {
                    showError('No data found in Excel file');
                    showLoading(false);
                    return;
                }

                // Detect columns from header row
                const headers = rawData[0];
                const columnMap = detectColumns(headers);
                
                if (!columnMap) {
                    const foundHeaders = headers.map(h => String(h).toLowerCase().trim()).join(', ');
                    showError(`Missing required columns.\n\nFound: ${foundHeaders}\n\nExpected: Date (Tanggal/Tgl), Description (Keterangan/Desc), Amount (Jumlah/Value)`);
                    showLoading(false);
                    return;
                }

                // Validate rows
                const validRows = [];
                const invalidRows = [];

                for (let i = 1; i < rawData.length; i++) {
                    const row = rawData[i];
                    
                    // Skip completely empty rows
                    if (!row || row.every(cell => !cell || String(cell).trim() === '')) {
                        continue;
                    }

                    const validation = validateRow(row, columnMap);
                    
                    if (validation.valid) {
                        validRows.push({
                            date: validation.date,
                            description: validation.description,
                            amount: validation.amount
                        });
                    } else {
                        invalidRows.push({
                            rowNum: i + 1,
                            error: validation.error
                        });
                        // Log first few failures for debugging
                        if (invalidRows.length <= 3) {
                            console.warn(`Row ${i + 1} validation failed:`, row, validation.error);
                        }
                    }
                }

                console.log(`Validation complete: ${validRows.length} valid, ${invalidRows.length} invalid`);

                if (validRows.length === 0) {
                    showError(`No valid transactions found.\n\nFirst invalid row error: ${invalidRows.length > 0 ? invalidRows[0].error : 'Unknown'}\n\nPlease check file format.`);
                    showLoading(false);
                    return;
                }

                // Store import data
                importData = { validRows, invalidRows, fileName };

                // Show preview
                showLoading(false);
                showPreview(validRows, invalidRows, fileName);

            } catch (error) {
                console.error('Parse error:', error);
                showError('Unable to parse Excel file. Please check the file format.');
                showLoading(false);
            }
        };

        const detectColumns = (headers) => {
            const dateAliases = ['date', 'tanggal', 'tgl'];
            const descAliases = ['description', 'desc', 'keterangan', 'ket', 'deskripsi'];
            const amountAliases = ['amount', 'jumlah', 'value', 'nominal', 'nilai'];

            let dateCol = -1;
            let descCol = -1;
            let amountCol = -1;

            headers.forEach((header, idx) => {
                const h = String(header).toLowerCase().trim();
                if (dateAliases.includes(h)) dateCol = idx;
                if (descAliases.includes(h)) descCol = idx;
                if (amountAliases.includes(h)) amountCol = idx;
            });

            if (dateCol === -1 || descCol === -1 || amountCol === -1) {
                // Provide more detailed error message
                const foundHeaders = headers.map(h => String(h).toLowerCase().trim()).join(', ');
                const missing = [];
                if (dateCol === -1) missing.push('Date (try: Date, Tanggal, Tgl)');
                if (descCol === -1) missing.push('Description (try: Description, Desc, Keterangan, Ket, Deskripsi)');
                if (amountCol === -1) missing.push('Amount (try: Amount, Jumlah, Value, Nominal, Nilai)');
                const detailMsg = `\nFound headers: ${foundHeaders}\nMissing: ${missing.join(', ')}`;
                
                // Store for console debugging
                console.warn('Column detection failed:', { headers, dateCol, descCol, amountCol, foundHeaders });
                
                return null;
            }

            return { dateCol, descCol, amountCol };
        };

        // ========== Excel Date Conversion Helper ==========
        const excelDateToString = (excelDate) => {
            // Excel epoch is January 1, 1900
            // Excel has a bug where it considers 1900 as a leap year
            const excelEpoch = new Date(1900, 0, 1);
            
            // Adjust for Excel's leap year bug
            let dateNum = excelDate;
            if (dateNum > 59) {
                dateNum -= 1;
            }
            
            // Create date by adding days to epoch
            const resultDate = new Date(excelEpoch.getTime() + (dateNum - 1) * 24 * 60 * 60 * 1000);
            
            // Format as DD/MM/YYYY
            const day = String(resultDate.getDate()).padStart(2, '0');
            const month = String(resultDate.getMonth() + 1).padStart(2, '0');
            const year = resultDate.getFullYear();
            
            return `${day}/${month}/${year}`;
        };

        const validateRow = (row, columnMap) => {
            const { dateCol, descCol, amountCol } = columnMap;

            // Extract values
            let dateValue = row[dateCol];
            let description = String(row[descCol] || '').trim();
            let amountValue = row[amountCol];

            // Validate description
            if (!description) {
                return { valid: false, error: 'Description cannot be empty' };
            }

            // Parse date
            let dateStr = '';
            if (typeof dateValue === 'number') {
                // Excel serial date
                try {
                    dateStr = excelDateToString(dateValue);
                } catch (e) {
                    console.error('Date conversion error:', e, 'for value:', dateValue);
                    return { valid: false, error: 'Invalid date format (use DD/MM/YYYY)' };
                }
            } else {
                // Text date
                dateStr = String(dateValue || '').trim();
                
                // Normalize date format (pad single digits)
                const dateParts = dateStr.split('/');
                if (dateParts.length === 3) {
                    const day = dateParts[0].padStart(2, '0');
                    const month = dateParts[1].padStart(2, '0');
                    const year = dateParts[2];
                    dateStr = `${day}/${month}/${year}`;
                }
            }

            // Validate date format
            const datePattern = /^\d{2}\/\d{2}\/\d{4}$/;
            if (!datePattern.test(dateStr)) {
                return { valid: false, error: 'Invalid date format (use DD/MM/YYYY)' };
            }

            // Parse amount
            let amountStr = String(amountValue || '').trim();
            
            // Remove thousand separators (both comma and dot)
            amountStr = amountStr.replace(/[,.]/g, (match, offset, str) => {
                // Keep decimal point if it's followed by 1-2 digits at the end
                const remaining = str.substring(offset + 1);
                if (match === '.' && /^\d{1,2}$/.test(remaining)) {
                    return '.';
                }
                return '';
            });

            // Check if numeric
            const amount = parseFloat(amountStr);
            if (isNaN(amount)) {
                return { valid: false, error: 'Amount must be a number' };
            }

            // Format amount with Indonesian thousand separators
            const formattedAmount = formatAmount(amount);

            return {
                valid: true,
                date: dateStr,
                description: description,
                amount: formattedAmount
            };
        };

        const formatAmount = (value) => {
            const num = parseFloat(value);
            const isNegative = num < 0;
            const absNum = Math.abs(num);
            
            // Split into integer and decimal parts
            const parts = absNum.toString().split('.');
            const intPart = parts[0];
            const decPart = parts[1] ? ',' + parts[1] : '';
            
            // Add thousand separators (dots)
            const formatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
            
            return (isNegative ? '-' : '') + formatted + decPart;
        };

        const showPreview = (validRows, invalidRows, fileName) => {
            const currentCount = state.settings.marqueeText?.length || 0;
            
            // Show preview content
            hideError();
            showPreviewContent();

            // File info
            document.getElementById('import-file-info').innerHTML = `
                <strong>File:</strong> ${fileName} &nbsp;|&nbsp; 
                <strong>Total Rows:</strong> ${validRows.length + invalidRows.length}
            `;

            // Validation summary
            const summaryEl = document.getElementById('import-validation-summary');
            if (invalidRows.length === 0) {
                summaryEl.className = 'mb-6 p-4 rounded bg-green-50 border-l-4 border-green-500';
                summaryEl.innerHTML = `
                    <p class="text-green-800 font-semibold">
                        ✓ ${validRows.length} valid transactions
                    </p>
                `;
            } else {
                summaryEl.className = 'mb-6 p-4 rounded bg-yellow-50 border-l-4 border-yellow-500';
                summaryEl.innerHTML = `
                    <p class="text-yellow-800 font-semibold">
                        ${validRows.length} valid, ${invalidRows.length} invalid
                    </p>
                `;
            }

            // Preview table
            let tableHtml = `
                <thead>
                    <tr class="bg-gray-200">
                        <th class="border border-gray-300 p-2">Date</th>
                        <th class="border border-gray-300 p-2">Description</th>
                        <th class="border border-gray-300 p-2">Amount</th>
                    </tr>
                </thead>
                <tbody>
            `;

            const previewRows = validRows.slice(0, 10);
            previewRows.forEach(row => {
                tableHtml += `
                    <tr>
                        <td class="border border-gray-300 p-2">${row.date}</td>
                        <td class="border border-gray-300 p-2">${row.description}</td>
                        <td class="border border-gray-300 p-2 text-right">${row.amount}</td>
                    </tr>
                `;
            });

            tableHtml += '</tbody>';
            document.getElementById('import-preview-table').innerHTML = tableHtml;

            // Error list
            if (invalidRows.length > 0) {
                const errorListContainer = document.getElementById('import-error-list-container');
                errorListContainer.classList.remove('hidden');
                document.getElementById('error-count').textContent = invalidRows.length;

                let errorHtml = '<ul class="list-disc list-inside space-y-1">';
                invalidRows.forEach(err => {
                    errorHtml += `<li class="text-sm text-red-700">Row ${err.rowNum}: ${err.error}</li>`;
                });
                errorHtml += '</ul>';
                document.getElementById('import-error-list').innerHTML = errorHtml;
            } else {
                document.getElementById('import-error-list-container').classList.add('hidden');
            }

            // Replace warning
            document.getElementById('current-transaction-count').textContent = currentCount;

            // Enable/disable confirm button
            document.getElementById('confirm-import-btn').disabled = validRows.length === 0;
        };

        const downloadBackup = () => {
            const currentData = state.settings.marqueeText || [];
            const json = JSON.stringify(currentData, null, 2);
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const today = new Date();
            const dateStr = today.toISOString().split('T')[0];
            const filename = `transactions-backup-${dateStr}.json`;
            
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        };

        const confirmReplace = () => {
            const { validRows } = importData;
            
            if (validRows.length === 0) return;

            // Download backup first
            downloadBackup();

            // Small delay to ensure download starts
            setTimeout(() => {
                // Transform to marqueeText format
                const newTransactions = validRows.map(row => 
                    `(${row.date}) ${row.description} : ${row.amount}`
                );

                // Replace all transactions
                state.settings.marqueeText = newTransactions;

                // Mark as changed
                Settings.markChanged();

                // Refresh display
                render();

                // Close modal
                hideModal();

                alert(`Successfully imported ${validRows.length} transactions!`);
            }, 100);
        };

        // ========== Modal Helpers ==========
        const showModal = () => {
            document.getElementById('import-preview-modal').classList.remove('hidden');
            document.getElementById('import-preview-modal').classList.add('flex');
        };

        const hideModal = () => {
            document.getElementById('import-preview-modal').classList.add('hidden');
            document.getElementById('import-preview-modal').classList.remove('flex');
        };

        const showLoading = (show) => {
            const loadingEl = document.getElementById('import-loading');
            if (show) {
                loadingEl.classList.remove('hidden');
            } else {
                loadingEl.classList.add('hidden');
            }
        };

        const showError = (message) => {
            const errorDisplay = document.getElementById('import-error-display');
            const errorMessage = document.getElementById('import-error-message');
            errorDisplay.classList.remove('hidden');
            errorMessage.textContent = message;
        };

        const hideError = () => {
            document.getElementById('import-error-display').classList.add('hidden');
        };

        const showPreviewContent = () => {
            document.getElementById('import-preview-content').classList.remove('hidden');
        };

        const hidePreviewContent = () => {
            document.getElementById('import-preview-content').classList.add('hidden');
        };

        return { render, addNew, triggerImport, handleFileSelect, confirmReplace, hideModal, checkImportSupport };
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

            // Import from Excel
            document.getElementById('import-excel-btn').addEventListener('click', () => {
                TransactionLedger.triggerImport();
            });

            // File input change
            document.getElementById('excel-file-input').addEventListener('change', (e) => {
                TransactionLedger.handleFileSelect(e);
            });

            // Import modal buttons
            document.getElementById('close-preview-modal').addEventListener('click', () => {
                TransactionLedger.hideModal();
            });

            document.getElementById('cancel-import-btn').addEventListener('click', () => {
                TransactionLedger.hideModal();
            });

            document.getElementById('confirm-import-btn').addEventListener('click', () => {
                TransactionLedger.confirmReplace();
            });

            // Modal escape key
            document.getElementById('import-preview-modal').addEventListener('click', (e) => {
                if (e.target.id === 'import-preview-modal') {
                    TransactionLedger.hideModal();
                }
            });

            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    const modal = document.getElementById('import-preview-modal');
                    if (!modal.classList.contains('hidden')) {
                        TransactionLedger.hideModal();
                    }
                }
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
                
                // Check import feature availability
                const importBtn = document.getElementById('import-excel-btn');
                if (!TransactionLedger.checkImportSupport || !TransactionLedger.checkImportSupport()) {
                    importBtn.disabled = true;
                    importBtn.classList.add('opacity-50', 'cursor-not-allowed');
                    importBtn.title = 'Import feature unavailable. Check browser compatibility or internet connection.';
                }
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
