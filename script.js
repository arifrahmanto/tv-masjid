// script.js
document.addEventListener('DOMContentLoaded', () => {
    // --- KONFIGURASI & KONSTANTA ---
    const PRAYER_ORDER = ['imsak', 'subuh', 'dzuhur', 'ashar', 'maghrib', 'isya'];
    const HIGHLIGHT_BG_CLASS = 'bg-yellow-400';
    const HIGHLIGHT_TEXT_H2_CLASS = 'text-black';
    const HIGHLIGHT_TEXT_P_CLASS = 'text-black';
    const PRAYER_NAMES_ID = {
        imsak: 'Imsak', subuh: 'Subuh', dzuhur: 'Dzuhur',
        ashar: 'Ashar', maghrib: 'Maghrib', isya: 'Isya'
    };

    // Default settings, akan ditimpa oleh setting.json
    let settings = {
        pageTitle: "Judul Default Masjid",
        marqueeText: ["Selamat Datang"],
        prayerApiCity: 'Jakarta',
        prayerApiTune: '3,3,3,3,3,3,3,3,3',
        tarhimOffsetMinutes: 6,
        tarhimAudioFile: 'tarhim.mp3',
        beepAudioFile: 'beep.mp3',
        countdownSecondsThreshold: 100,
        countdownHtmlFile: 'countdown.html',
        contentUrls: ['welcome.html']
    };

    // --- ELEMEN DOM ---
    const currentTimeElement = document.getElementById('current-time');
    const currentDateElement = document.getElementById('current-date');
    const titleElement = document.getElementById('title');
    const marqueeElement = document.querySelector('.marquee');
    const mainContentElement = document.querySelector('main');
    const prayerTimeElements = {
        subuh: document.getElementById('subuh-time'),
        dzuhur: document.getElementById('dzuhur-time'),
        ashar: document.getElementById('ashar-time'),
        maghrib: document.getElementById('maghrib-time'),
        isya: document.getElementById('isya-time'),
        imsak: document.getElementById('imsak-time'),
    };

    // --- VARIABEL STATE ---
    const prayerItemOriginalClasses = {};
    let hijriDateString = '';
    let tarhimPlayedFor = {}; // Melacak Tarhim yang sudah diputar per sholat per hari
    let scheduledAudiosState = []; // Untuk melacak state audio terjadwal
    let isCountdownActive = false;
    let activeCountdownPrayerKey = null; // Kunci sholat yang sedang di-countdown    
    let previousMainContentHTML = '';
    let currentContentIndex = 0;
    let cycleContentIntervalId = null; // Untuk menyimpan ID interval cycleContent

    // --- FUNGSI PEMBARUAN UI & JAM ---
    function updateClock() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        currentTimeElement.textContent = `${hours}:${minutes}:${seconds}`;

        // Hitung hari pasaran Jawa
        const PASARAN = ['Legi', 'Pahing', 'Pon', 'Wage', 'Kliwon'];
        // Titik referensi: 1 Januari 1900 adalah Minggu Legi.
        // Dalam siklus 5 harian, Legi adalah hari ke-2 (indeks 1 jika 0-indexed)
        // Dalam siklus 7 harian, Minggu adalah hari ke-1 (indeks 0 jika 0-indexed)
        // Total hari sejak 1 Jan 1900 (UTC)
        const refDate = Date.UTC(1900, 0, 1); // 1 Januari 1900
        const currentDateUTC = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
        const diffDays = Math.floor((currentDateUTC - refDate) / (1000 * 60 * 60 * 24));

        // Indeks pasaran: (jumlah hari + offset pasaran referensi) % 5
        // 1 Jan 1900 adalah Legi (indeks 1). Jadi offsetnya adalah 1.
        const pasaranIndex = (diffDays + 1) % 5;
        const hariPasaran = PASARAN[pasaranIndex];

        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const gregorianDateFullString = now.toLocaleDateString('id-ID', options); // Hasilnya seperti "Senin, 1 Januari 2024"
        
        let formattedGregorianWithPasaran;
        // Pisahkan nama hari dari sisa tanggal berdasarkan koma
        const dateParts = gregorianDateFullString.split(', ');

        if (dateParts.length === 2) {
            const namaHari = dateParts[0]; // Bagian sebelum koma, misal "Senin"
            const sisaTanggal = dateParts[1]; // Bagian setelah koma, misal "1 Januari 2024"
            // Bentuk format baru: [nama hari] [pasaran jawa], [tanggal bulan tahun]
            formattedGregorianWithPasaran = `${namaHari} ${hariPasaran}, ${sisaTanggal}`;
        } else {
            // Fallback jika format dari toLocaleDateString tidak mengandung koma seperti yang diharapkan.
            // Dalam kasus ini, kita tambahkan pasaran di akhir string Masehi asli.
            console.warn(`Format tanggal dari toLocaleDateString ('${gregorianDateFullString}') tidak seperti yang diharapkan (tidak ada koma setelah nama hari). Menggunakan format fallback untuk penempatan pasaran.`);
            formattedGregorianWithPasaran = `${gregorianDateFullString} ${hariPasaran}`;
        }

        if (hijriDateString) {
            currentDateElement.textContent = `${formattedGregorianWithPasaran} / ${hijriDateString}`;
        } else {
            currentDateElement.textContent = formattedGregorianWithPasaran;
        }
    }

    function scheduleNextMidnightFetch() {
        const now = new Date();
        const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 500); // Pukul 00:00:00.500 hari berikutnya
        const msUntilMidnight = tomorrow.getTime() - now.getTime();

        setTimeout(async () => {
            console.log("Fetching prayer times at midnight...");
            await fetchAndDisplayPrayerTimes();
            AudioManager.stopAll(); // Hentikan semua audio yang mungkin masih berjalan
            // Reset status pemutaran untuk audio terjadwal di hari berikutnya
            scheduledAudiosState.forEach(state => state.playedThisSession = false);
            PRAYER_ORDER.forEach(key => tarhimPlayedFor[key] = false); // Reset status tarhim
            scheduleNextMidnightFetch(); // Jadwalkan lagi untuk tengah malam berikutnya
        }, msUntilMidnight);
    }

    // --- LOGIKA JADWAL SHOLAT ---
    // Helper untuk membuat kunci cache yang konsisten berdasarkan tanggal
    function getCacheKeyForDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `prayerTimes-${year}-${month}-${day}`;
    }

    // Fungsi terpisah untuk memperbarui elemen waktu sholat di DOM
    function displayPrayerTimes(scheduleData) {
        if (scheduleData && typeof scheduleData === 'object' && scheduleData.timings && scheduleData.date) {
            const timings = scheduleData.timings;
            prayerTimeElements.imsak.textContent = timings.Imsak ? timings.Imsak.split(' ')[0] : 'N/A';
            prayerTimeElements.subuh.textContent = timings.Fajr ? timings.Fajr.split(' ')[0] : 'N/A'; // Fajr adalah Subuh
            prayerTimeElements.dzuhur.textContent = timings.Dhuhr ? timings.Dhuhr.split(' ')[0] : 'N/A';
            prayerTimeElements.ashar.textContent = timings.Asr ? timings.Asr.split(' ')[0] : 'N/A';
            prayerTimeElements.maghrib.textContent = timings.Maghrib ? timings.Maghrib.split(' ')[0] : 'N/A';
            prayerTimeElements.isya.textContent = timings.Isha ? timings.Isha.split(' ')[0] : 'N/A';

            // Ambil dan format tanggal Hijriah
            const hijri = scheduleData.date.hijri;
            if (hijri && hijri.day && hijri.month && hijri.month.en && hijri.year) {
                hijriDateString = `${hijri.day} ${hijri.month.en} ${hijri.year} H`;
            } else {
                hijriDateString = ''; // Reset jika data Hijriah tidak lengkap
            }
            return true;
        } else {
            console.error("Data jadwal sholat tidak valid untuk ditampilkan:", scheduleData);
            Object.values(prayerTimeElements).forEach(el => el.textContent = 'Error');
            hijriDateString = ''; // Pastikan tanggal hijriah juga di-reset
            return false;
        }
    }

    async function fetchAndDisplayPrayerTimes() {
        // Reset status pemutaran tarhim untuk hari/fetch baru (jika diperlukan di sini)
        PRAYER_ORDER.forEach(key => {
            tarhimPlayedFor[key] = false;
        });

        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth() + 1; // Bulan dimulai dari 0
        const day = today.getDate();
        const country = 'ID'; // Asumsi negara tetap Indonesia
        // Metode kalkulasi bisa disesuaikan. Method 20 adalah Kemenag Indonesia.
        const method = 20; // Ganti dengan metode yang sesuai jika perlu
        const cacheKey = getCacheKeyForDate(today);

        try {
            // Menggunakan tanggal saat ini untuk URL API
            const response = await fetch(`https://api.aladhan.com/v1/timingsByCity?city=${settings.prayerApiCity}&country=${country}&method=${method}&month=${month}&year=${year}&tune=${settings.prayerApiTune}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            // Untuk method=20 (Kemenag), API Aladhan pada endpoint `timingsByCity` 
            // dengan parameter `month` dan `year` mengembalikan objek dalam `data.data` 
            // untuk hari saat ini pada bulan tersebut, bukan array untuk sebulan penuh.
            const dailyScheduleData = data.data;

            // Pastikan dailyScheduleData adalah objek yang valid, memiliki properti timings,
            // dan data tanggalnya sesuai dengan hari ini.
            if (dailyScheduleData && typeof dailyScheduleData === 'object' && dailyScheduleData.timings &&
                dailyScheduleData.date && dailyScheduleData.date.gregorian && parseInt(dailyScheduleData.date.gregorian.day) === day) {
                
                displayPrayerTimes(dailyScheduleData); // Tampilkan data yang baru diambil

                // Simpan data yang berhasil diambil ke cache
                try {
                    localStorage.setItem(cacheKey, JSON.stringify(dailyScheduleData));
                    console.log(`Jadwal sholat untuk ${cacheKey} berhasil disimpan di cache.`);
                } catch (e) {
                    console.error("Gagal menyimpan jadwal sholat ke cache:", e);
                }

            } else {
                throw new Error(`Jadwal untuk tanggal ${day}-${month}-${year} tidak ditemukan atau format data API tidak sesuai.`);
            }

        } catch (error) {
            console.error("Gagal mengambil jadwal sholat dari API:", error);
            console.log("Mencoba mengambil jadwal dari cache...");
            try {
                const cachedDataString = localStorage.getItem(cacheKey);
                if (cachedDataString) {
                    const cachedData = JSON.parse(cachedDataString);
                    console.log("Berhasil mengambil dan menampilkan jadwal sholat dari cache.");
                    displayPrayerTimes(cachedData);
                } else {
                    console.warn(`Tidak ada cache jadwal sholat untuk ${cacheKey}. Menampilkan error.`);
                    displayPrayerTimes(null); // Tampilkan error
                }
            } catch (cacheError) {
                console.error("Gagal mengambil atau mem-parsing data dari cache:", cacheError);
                displayPrayerTimes(null); // Tampilkan error
            }
        }
        highlightNextPrayer(); // Panggil highlight setelah mencoba fetch atau mengambil dari cache
    }

    function highlightNextPrayer() {
        const now = new Date();
        let nextPrayerKey = null;
        let minDiff = Infinity;

        // 1. Reset semua item ke gaya asli mereka
        PRAYER_ORDER.forEach(key => {
            const pElement = prayerTimeElements[key];
            if (pElement && prayerItemOriginalClasses[key]) {
                const itemDiv = pElement.parentElement;
                const h2Element = itemDiv.querySelector('h2');
                const original = prayerItemOriginalClasses[key];

                itemDiv.classList.remove(HIGHLIGHT_BG_CLASS);
                h2Element.classList.remove(HIGHLIGHT_TEXT_H2_CLASS);
                pElement.classList.remove(HIGHLIGHT_TEXT_P_CLASS);

                if (original.itemBg) itemDiv.classList.add(original.itemBg);
                if (original.h2Text) h2Element.classList.add(original.h2Text);
                if (original.pText) pElement.classList.add(original.pText);
                // Jika original.pText tidak ada, warna teks <p> akan kembali ke default/inherited
            }
        });

        // 2. Temukan waktu sholat berikutnya
        for (const key of PRAYER_ORDER) {
            const pElement = prayerTimeElements[key];
            if (!pElement || !pElement.textContent || pElement.textContent === 'N/A' || pElement.textContent === 'Error' || !pElement.textContent.includes(':')) {
                continue;
            }
            const timeStr = pElement.textContent;
            const [hours, minutes] = timeStr.split(':').map(Number);
            if (isNaN(hours) || isNaN(minutes)) continue;

            const prayerDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);

            if (prayerDate.getTime() > now.getTime()) {
                const diff = prayerDate.getTime() - now.getTime();
                if (diff < minDiff) {
                    minDiff = diff;
                    nextPrayerKey = key;
                }
            }
        }

        // 3. Terapkan highlight jika ditemukan waktu sholat berikutnya
        if (nextPrayerKey) {
            const pElementToHighlight = prayerTimeElements[nextPrayerKey];
            const itemDiv = pElementToHighlight.parentElement;
            const h2Element = itemDiv.querySelector('h2');
            const original = prayerItemOriginalClasses[nextPrayerKey];

            // Hapus kelas asli sebelum menambahkan kelas highlight
            if (original) {
                if (original.itemBg) itemDiv.classList.remove(original.itemBg);
                if (original.h2Text) h2Element.classList.remove(original.h2Text);
                if (original.pText) pElementToHighlight.classList.remove(original.pText);
            }

            itemDiv.classList.add(HIGHLIGHT_BG_CLASS);
            h2Element.classList.add(HIGHLIGHT_TEXT_H2_CLASS);
            pElementToHighlight.classList.add(HIGHLIGHT_TEXT_P_CLASS);
        }
    }

    // --- MANAJEMEN AUDIO ---
    const AudioManager = {
        _audios: {}, // Cache untuk elemen audio: { key: { element: HTMLAudioElement, src: '...' } }
        _contextUnlocked: false,
        _activeAudioKey: null,

        _createAudioElement(key, src, onEndedCallback) {
            const audio = new Audio(src);
            audio.preload = 'auto'; // Memberi tahu browser untuk mengunduh file audio sepenuhnya
            audio.onplay = () => {
                this._activeAudioKey = key;
                console.log(`Audio started: ${key}`);
            };
            audio.onpause = () => { // Dipicu oleh .pause() dan saat audio selesai secara alami
                if (this._activeAudioKey === key) {
                    this._activeAudioKey = null;
                }
                console.log(`Audio stopped/paused: ${key}`);
            };
            audio.onended = () => {
                console.log(`Audio finished: ${key}`);
                if (onEndedCallback) {
                    onEndedCallback();
                }
            };
            audio.onerror = () => {
                console.error(`Error loading audio: ${key} (${src})`);
                delete this._audios[key]; // Hapus dari cache agar bisa dicoba lagi
            };
            return audio;
        },

        _getAudio(key, src, onEndedCallback = null) {
            if (!this._audios[key] || this._audios[key].src !== src) {
                this._audios[key] = {
                    element: this._createAudioElement(key, src, onEndedCallback),
                    src: src
                };
            }
            return this._audios[key].element;
        },

        async play(key, src, options = {}) {
            const { onEnded, stopOthers = true } = options;

            if (stopOthers && this._activeAudioKey && this._activeAudioKey !== key) {
                console.log(`Stopping active audio (${this._activeAudioKey}) to play ${key}.`);
                this.stop(this._activeAudioKey);
            }

            if (this._activeAudioKey === key) return false; // Sudah diputar

            const audio = this._getAudio(key, src, onEnded);
            if (audio) {
                try {
                    await audio.play();
                    return true;
                } catch (e) {
                    if (e.name === 'NotAllowedError') {
                        console.warn(`Autoplay for ${key} was prevented. User interaction needed.`);
                    } else {
                        console.error(`Error playing audio ${key}:`, e);
                    }
                    return false;
                }
            }
            return false;
        },

        stop(key) {
            if (this._audios[key] && this._audios[key].element) {
                const audio = this._audios[key].element;
                if (!audio.paused) {
                    audio.pause();
                    audio.currentTime = 0;
                }
            }
        },

        stopAll() {
            console.log("Stopping all managed audio.");
            for (const key in this._audios) {
                this.stop(key);
            }
        },

        preload(key, src) {
            if (!this._audios[key] || this._audios[key].src !== src) {
                console.log(`Preloading audio: ${key} (${src})`);
                // Memanggil _getAudio akan membuat elemen dan browser akan mulai mengunduh/cache
                this._getAudio(key, src);
            }
        },

        init() {
            const unlockHandler = () => {
                if (this._contextUnlocked) return;
                const dummyAudio = new Audio();
                dummyAudio.muted = true;
                dummyAudio.play().then(() => {
                    dummyAudio.pause();
                    this._contextUnlocked = true;
                    console.log("Audio context unlocked by user interaction.");
                }).catch(() => {});
            };
            document.body.addEventListener('click', unlockHandler, { once: true });
            document.body.addEventListener('touchend', unlockHandler, { once: true });
        }
    };

    function checkAndPlayTarhim() {
        const now = new Date();
        const nowTime = now.getTime();

        PRAYER_ORDER.forEach(key => {
            if (key === 'imsak') {
                return; // Jangan putar tarhim untuk Imsak
            }

            // Cek apakah sudah diputar untuk sholat ini hari ini
            const pElement = prayerTimeElements[key];
            if (!pElement || !pElement.textContent || pElement.textContent === 'N/A' || pElement.textContent === 'Error' || !pElement.textContent.includes(':')) {
                return; // Lewati jika waktu tidak valid
            }
            const timeStr = pElement.textContent;
            const [hours, minutes] = timeStr.split(':').map(Number);
            if (isNaN(hours) || isNaN(minutes)) return;

            const prayerDateTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
            const prayerTimeMillis = prayerDateTime.getTime();

            // Hitung waktu mulai tarhim (X menit sebelum waktu sholat)
            const tarhimStartTimeMillis = prayerTimeMillis - (settings.tarhimOffsetMinutes * 60 * 1000);
            // Batas akhir untuk memulai pemutaran tarhim (misalnya, dalam 1 menit dari waktu mulai tarhim yang dijadwalkan)
            const tarhimPlayWindowEndMillis = tarhimStartTimeMillis + (60 * 1000);

            if (nowTime >= tarhimStartTimeMillis && nowTime < prayerTimeMillis && nowTime < tarhimPlayWindowEndMillis) {
                if (tarhimPlayedFor[key]) return; // Sudah diputar atau sedang diputar

                // Coba putar Tarhim. AudioManager akan menangani penghentian audio lain.
                AudioManager.play('tarhim', settings.tarhimAudioFile, {
                    onEnded: () => {
                        console.log(`Tarhim for ${key} finished.`);
                        // Jika Tarhim selesai, dan tidak ada countdown, coba lanjutkan siklus konten
                        if (!isCountdownActive && settings.contentUrls.length > 0 && cycleContentIntervalId === null) {
                            cycleContent();
                        }
                    }
                }).then(playedSuccessfully => {
                    if (playedSuccessfully) {
                        console.log(`Tarhim for ${key} started successfully.`);
                        tarhimPlayedFor[key] = true; // Tandai sudah diputar hanya jika berhasil
                    }
                    });
            }
        });
    }

    function checkAndPlayScheduledAudio() {
        if (!settings.audioSchedule || settings.audioSchedule.length === 0 || !scheduledAudiosState.length) return;

        const now = new Date();
        const currentDay = now.getDay(); // 0 = Minggu, ..., 5 = Jumat, 6 = Sabtu

        settings.audioSchedule.forEach((schedule, index) => {
            const state = scheduledAudiosState[index];
            if (!state) return; // Harusnya tidak terjadi jika inisialisasi benar

            // Gunakan schedule.dayofWeek (dari setting.json) bukan schedule.dayOfWeek
            if (schedule.dayofWeek !== currentDay || state.playedThisSession) {
                return;
            }

            const prayerTimeElement = prayerTimeElements[schedule.relativeToPrayer.toLowerCase()];
            if (!prayerTimeElement || !prayerTimeElement.textContent || prayerTimeElement.textContent === 'N/A' || prayerTimeElement.textContent === 'Error' || !prayerTimeElement.textContent.includes(':')) {
                return; // Waktu sholat acuan tidak tersedia
            }

            const [hours, minutes] = prayerTimeElement.textContent.split(':').map(Number);
            if (isNaN(hours) || isNaN(minutes)) return;

            const prayerDateTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
            const scheduledPlayTime = new Date(prayerDateTime.getTime() + (schedule.timeOffsetMinutes * 60 * 1000));

            // Mainkan jika waktu saat ini berada dalam jendela 1 menit dari waktu terjadwal
            if (now.getTime() >= scheduledPlayTime.getTime() && now.getTime() < scheduledPlayTime.getTime() + 60000) {
                if (state.playedThisSession) return;

                const audioKey = `scheduled-${index}`;
                AudioManager.play(audioKey, schedule.audioFile, {
                    onEnded: () => {
                        console.log(`Scheduled audio finished: ${schedule.audioFile}`);
                        // Jika audio selesai, dan tidak ada countdown, coba lanjutkan siklus konten
                        if (!isCountdownActive && settings.contentUrls.length > 0 && cycleContentIntervalId === null) {
                            cycleContent();
                        }
                    }
                }).then(playedSuccessfully => {
                    if (playedSuccessfully) {
                        state.playedThisSession = true; // Tandai sudah diputar untuk sesi ini
                    }
                });
            }
        });
    }

    // --- LOGIKA COUNTDOWN ---
    // Fungsi untuk memperbarui elemen DOM pada tampilan countdown
    function updateCountdownDOM(prayerKey, secondsLeft) {
        const prayerNameEl = document.getElementById('countdown-prayer-name');
        const secondsEl = document.getElementById('countdown-seconds');

        if (prayerNameEl) {
            prayerNameEl.textContent = PRAYER_NAMES_ID[prayerKey] || prayerKey.toUpperCase();
        }
        if (secondsEl) {
            secondsEl.textContent = String(secondsLeft).padStart(2, '0');
        }
    }

    // Fungsi untuk memeriksa dan mengatur tampilan countdown
    async function checkAndManageCountdown() {
        if (!mainContentElement) return;

        let prayerToCountdown = null;
        let secondsToPrayer = Infinity;
        const now = new Date();
        const nowTime = now.getTime();

        for (const key of PRAYER_ORDER) {
            // Anda bisa mengecualikan Imsak dari countdown jika diinginkan
            // if (key === 'imsak') continue; 

            const pElement = prayerTimeElements[key];
            if (!pElement || !pElement.textContent || pElement.textContent === 'N/A' || pElement.textContent === 'Error' || !pElement.textContent.includes(':')) {
                continue;
            }
            const timeStr = pElement.textContent;
            const [hours, minutes] = timeStr.split(':').map(Number);
            if (isNaN(hours) || isNaN(minutes)) continue;

            const prayerDateTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
            const prayerTimeMillis = prayerDateTime.getTime();
            const diffSeconds = Math.round((prayerTimeMillis - nowTime) / 1000);

            if (diffSeconds > 0 && diffSeconds <= settings.countdownSecondsThreshold) {
                if (diffSeconds < secondsToPrayer) { // Pilih sholat terdekat untuk countdown
                    secondsToPrayer = diffSeconds;
                    prayerToCountdown = key;
                }
            }
        }

        if (prayerToCountdown) { // Ada sholat dalam jendela countdown
            if (!isCountdownActive) { // Countdown belum aktif, mulai tampilkan
                isCountdownActive = true;
                activeCountdownPrayerKey = prayerToCountdown;
                previousMainContentHTML = mainContentElement.innerHTML;

                if (cycleContentIntervalId) {
                    clearInterval(cycleContentIntervalId);
                    cycleContentIntervalId = null; // Hentikan siklus konten
                }

                const loadedSuccessfully = await loadContentIntoMain(settings.countdownHtmlFile);
                if (loadedSuccessfully) {
                    updateCountdownDOM(activeCountdownPrayerKey, secondsToPrayer);
                } else { // Gagal memuat countdown.html, kembalikan state
                    isCountdownActive = false;
                    activeCountdownPrayerKey = null;
                    mainContentElement.innerHTML = previousMainContentHTML;
                    previousMainContentHTML = '';
                    if (settings.contentUrls.length > 0) cycleContent(); // Coba mulai lagi siklus konten
                    return;
                }
            } else if (activeCountdownPrayerKey === prayerToCountdown) { // Countdown sudah aktif untuk sholat ini
                updateCountdownDOM(activeCountdownPrayerKey, secondsToPrayer); // Update detik
            } else { // Countdown aktif untuk sholat lain, tapi ada yg lebih dekat/baru masuk window
                activeCountdownPrayerKey = prayerToCountdown; // Ganti ke sholat baru
                // Asumsikan loadContentIntoMain akan menimpa konten jika countdown.html sudah ada
                const loadedSuccessfully = await loadContentIntoMain(settings.countdownHtmlFile);
                if (loadedSuccessfully) updateCountdownDOM(activeCountdownPrayerKey, secondsToPrayer);
                // else: handle error loading, though less likely if already loaded once
            }
        } else { // Tidak ada sholat dalam jendela countdown
            if (isCountdownActive) { // Jika countdown sedang aktif, hentikan
                isCountdownActive = false;
                activeCountdownPrayerKey = null;
                await updateMainContent(previousMainContentHTML); // Gunakan fungsi baru untuk transisi halus
                previousMainContentHTML = '';
                // Putar beep. `stopOthers: false` memastikan tidak menghentikan audio lain.
                // AudioManager.play('beep', settings.beepAudioFile, { stopOthers: false });
                if (settings.contentUrls.length > 0) cycleContent(); // Mulai lagi siklus konten
            }
        }
    }

    // --- LOGIKA SIKLUS KONTEN ---
    async function updateMainContent(newHtml) {
        if (!mainContentElement) return;

        const FADE_DURATION_MS = 300; // Durasi animasi fade dalam milidetik (sesuaikan dengan CSS)

        // 1. Fade out dengan menambahkan class
        mainContentElement.classList.add('fade-out');

        // 2. Tunggu animasi fade-out selesai
        await new Promise(resolve => setTimeout(resolve, FADE_DURATION_MS));

        // 3. Ganti konten saat elemen tidak terlihat
        mainContentElement.innerHTML = newHtml;

        // 4. Fade in dengan menghapus class
        mainContentElement.classList.remove('fade-out');
    }

    async function loadContentIntoMain(url) {
        if (!mainContentElement) return false;
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Gagal memuat konten: ${response.status} ${response.statusText}`);
            }
            const htmlContent = await response.text();
            await updateMainContent(htmlContent); // Ganti konten dengan efek fade
            return true; // Berhasil
        } catch (error) {
            console.error("Error memuat konten ke main:", error);
            await updateMainContent(`<p class="text-red-500 text-center">Gagal memuat konten.</p>`);
            return false; // Gagal
        }
    }

    async function cycleContent() {
        if (isCountdownActive) return; // Jangan siklus konten jika countdown aktif

        if (settings.contentUrls.length === 0) {
            // console.log("Tidak ada URL konten untuk di-siklus.");
            return;
        }

        const urlToLoad = settings.contentUrls[currentContentIndex];
        // console.log(`Memuat konten: ${urlToLoad}`);
        await loadContentIntoMain(urlToLoad);

        // Pindahkan ke indeks berikutnya untuk siklus potensial berikutnya
        currentContentIndex = (currentContentIndex + 1) % settings.contentUrls.length;

        if (urlToLoad === 'video.html') {
            // Jika video YouTube ditampilkan, hentikan siklus
            if (cycleContentIntervalId !== null) {
                clearInterval(cycleContentIntervalId);
                cycleContentIntervalId = null;
                // console.log('Video YouTube ditampilkan, siklus konten dihentikan.');
            }
        } else {
            // Jika konten bukan video YouTube, dan siklus dihentikan, dan ada lebih dari satu item, mulai lagi
            if (cycleContentIntervalId === null && settings.contentUrls.length > 1) {
                // console.log('Melanjutkan siklus konten untuk konten non-video.');
                cycleContentIntervalId = setInterval(cycleContent, 10000); // Ganti konten setiap 10 detik
            } else if (cycleContentIntervalId === null && settings.contentUrls.length <= 1) {
                // Hanya satu item dan itu bukan kegiatan.html. Sudah dimuat. Tidak perlu interval.
                // console.log('Konten tunggal non-video ditampilkan. Tidak perlu siklus.');
            }
        }
    }

    /**
 * Memperbarui label waktu Dzuhur.
 * Mengubahnya menjadi "JUMAT" jika hari ini adalah hari Jumat.
 */
function updateDhuhrLabel() {
    const dhuhrLabel = document.getElementById('dzuhur-label');
    if (!dhuhrLabel) {
        return; // Keluar jika elemen tidak ditemukan
    }

    const today = new Date();
    const dayOfWeek = today.getDay(); // 0:Minggu, 1:Senin, ..., 5:Jumat, 6:Sabtu

    if (dayOfWeek === 5) {
        // Jika hari ini Jumat
        dhuhrLabel.textContent = 'JUMAT';
    } else {
        // Jika hari lain
        dhuhrLabel.textContent = 'DZUHUR';
    }
}

    // --- LOGIKA PENGATURAN ---
    async function loadSettings() {
        try {
            const response = await fetch('setting.json');
            if (!response.ok) {
                throw new Error(`Gagal memuat setting.json: ${response.status}`);
            }
            const loadedSettings = await response.json();

            // Gabungkan pengaturan yang dimuat dengan default, yang dimuat lebih diprioritaskan
            settings = { ...settings, ...loadedSettings };

            // Terapkan pengaturan yang mungkin tidak ada di objek 'settings' awal
            if (settings.pageTitle && titleElement) { // 'pageTitle' sudah ada di 'settings' awal jika file gagal dimuat
                titleElement.textContent = settings.pageTitle;
            }
            if (marqueeElement) { // marqueeElement selalu ada
                if (Array.isArray(settings.marqueeText)) {
                    // Jika marqueeText adalah array, gabungkan elemen-elemennya
                    marqueeElement.textContent = settings.marqueeText.join(" .:. ");
                } else if (typeof settings.marqueeText === 'string') { // Jika string (misalnya dari default atau file lama)
                    marqueeElement.textContent = settings.marqueeText; // Jika masih string (untuk backward compatibility)
                } else {
                    marqueeElement.textContent = ""; // Kosongkan jika tidak ada atau tipe salah
                }
            }

            // Inisialisasi state untuk audio terjadwal dari settings
            if (settings.audioSchedule && Array.isArray(settings.audioSchedule)) {
                // Hanya perlu melacak status 'played' untuk setiap jadwal.
                // Detail jadwal akan diakses langsung dari `settings.audioSchedule`.
                scheduledAudiosState = settings.audioSchedule.map(() => ({
                    playedThisSession: false,
                }));
            } else { scheduledAudiosState = []; }
        } catch (error) {
            console.error("Error memuat atau menerapkan pengaturan:", error);
        }
    }

    // --- INISIALISASI ---
    function storeOriginalPrayerItemClasses() {
        // Regex untuk mengidentifikasi class ukuran font dari Tailwind agar tidak salah dianggap sebagai class warna.
        const nonColorTextClasses = /text-(xs|sm|base|lg|xl|[2-9]xl)/;

        PRAYER_ORDER.forEach(key => {
            const pElement = prayerTimeElements[key];
            if (pElement) {
                const itemDiv = pElement.parentElement;
                const h2Element = itemDiv.querySelector('h2');

                // Cari class warna yang sebenarnya dengan mengabaikan class ukuran font.
                const h2ColorClass = Array.from(h2Element.classList).find(c => c.startsWith('text-') && !nonColorTextClasses.test(c));
                const pColorClass = Array.from(pElement.classList).find(c => c.startsWith('text-') && !nonColorTextClasses.test(c));

                prayerItemOriginalClasses[key] = {
                    itemBg: Array.from(itemDiv.classList).find(c => c.startsWith('bg-')),
                    h2Text: h2ColorClass, // Akan menjadi undefined jika tidak ada class warna
                    pText: pColorClass
                };
            }
        });
    }

    async function initializeApp() {
        await loadSettings(); // Muat pengaturan terlebih dahulu
        AudioManager.init(); // Siapkan AudioManager untuk menangani interaksi audio

        // Preload audio penting setelah pengaturan dimuat untuk memastikan pemutaran cepat
        if (settings.tarhimAudioFile) {
            AudioManager.preload('tarhim', settings.tarhimAudioFile);
        }
        // if (settings.beepAudioFile) {
        //     AudioManager.preload('beep', settings.beepAudioFile);
        // }
        if (settings.audioSchedule && Array.isArray(settings.audioSchedule)) {
            settings.audioSchedule.forEach((schedule, index) => {
                if (schedule.audioFile) {
                    AudioManager.preload(`scheduled-${index}`, schedule.audioFile);
                }
            });
        }
        storeOriginalPrayerItemClasses(); // Simpan kelas asli setelah DOM siap

        // Tambahkan prefix 'pages/' ke contentUrls setelah dimuat dari settings
        if (settings.contentUrls && Array.isArray(settings.contentUrls)) {
            settings.contentUrls = settings.contentUrls.map(url => {
                // Hanya tambahkan prefix jika belum ada untuk menghindari pages/pages/
                return url.startsWith('pages/') ? url : `pages/${url}`;
            });
        }
        PRAYER_ORDER.forEach(key => tarhimPlayedFor[key] = false); // Inisialisasi status tarhim

        updateClock(); // Panggil sekali untuk tampilan awal
        fetchAndDisplayPrayerTimes(); // Ambil jadwal sholat awal
        updateDhuhrLabel(); // Perbarui label Dzuhur jika hari ini Jumat

        if (settings.contentUrls && settings.contentUrls.length > 0) {
            cycleContent(); // Mulai siklus konten
        }

        scheduleNextMidnightFetch(); // Jadwalkan pembaruan jadwal tengah malam

        // Atur interval untuk pembaruan rutin
        setInterval(updateClock, 1000);
        setInterval(highlightNextPrayer, 30000);
        setInterval(checkAndPlayTarhim, 1000);
        setInterval(checkAndPlayScheduledAudio, 15000);
        setInterval(checkAndManageCountdown, 1000);
    }

    // Mulai aplikasi
    initializeApp();

});
