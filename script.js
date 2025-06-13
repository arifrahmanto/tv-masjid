// script.js
document.addEventListener('DOMContentLoaded', () => {
    const currentTimeElement = document.getElementById('current-time');
    const currentDateElement = document.getElementById('current-date');
    const prayerTimeElements = {
        subuh: document.getElementById('subuh-time'),
        dzuhur: document.getElementById('dzuhur-time'),
        ashar: document.getElementById('ashar-time'),
        maghrib: document.getElementById('maghrib-time'),
        isya: document.getElementById('isya-time'),
        imsak: document.getElementById('imsak-time'),
    };

    const PRAYER_ORDER = ['imsak', 'subuh', 'dzuhur', 'ashar', 'maghrib', 'isya'];
    const HIGHLIGHT_BG_CLASS = 'bg-yellow-400'; // Warna latar highlight (Tailwind class)
    const HIGHLIGHT_TEXT_H2_CLASS = 'text-black'; // Warna teks judul highlight
    const HIGHLIGHT_TEXT_P_CLASS = 'text-black';   // Warna teks waktu highlight

    const prayerItemOriginalClasses = {};
    let hijriDateString = ''; // Variabel untuk menyimpan tanggal Hijriah

    const mainContentElement = document.querySelector('main');
    const contentUrls = ['welcome.html', 'keuangan.html', 'takmir.html', 'kegiatan.html', 'pengumuman.html'];
    // const contentUrls = ['video.html'];
    let currentContentIndex = 0;
    let cycleContentIntervalId = null; // Untuk menyimpan ID interval cycleContent

    // Simpan kelas warna asli saat halaman dimuat
    PRAYER_ORDER.forEach(key => {
        const pElement = prayerTimeElements[key]; // Ini adalah elemen <p> untuk waktu
        if (pElement) {
            const itemDiv = pElement.parentElement; // Ini adalah div .prayer-time-item
            const h2Element = itemDiv.querySelector('h2');

            prayerItemOriginalClasses[key] = {
                itemBg: Array.from(itemDiv.classList).find(c => c.startsWith('bg-')),
                h2Text: Array.from(h2Element.classList).find(c => c.startsWith('text-')),
                // Untuk elemen <p> waktu, warna teks mungkin diwariskan atau spesifik
                pText: Array.from(pElement.classList).find(c => c.startsWith('text-'))
            };
        }
    });

    function updateClock() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        currentTimeElement.textContent = `${hours}:${minutes}:${seconds}`;

        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        let gregorianDateText = now.toLocaleDateString('id-ID', options);
        if (hijriDateString) {
            currentDateElement.textContent = `${gregorianDateText} / ${hijriDateString}`;
        } else {
            currentDateElement.textContent = gregorianDateText;
        }
    }

    // Fungsi untuk mengambil dan menampilkan jadwal sholat
    // Untuk contoh ini, kita akan menggunakan data statis.
    // Dalam aplikasi nyata, Anda akan mengambil data ini dari API.
    async function fetchAndDisplayPrayerTimes() {
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth() + 1; // Bulan dimulai dari 0
        const day = today.getDate();
        // Ganti dengan kota yang diinginkan atau implementasikan deteksi lokasi
        const city = 'Demak'; 
        const country = 'ID';
        const tune = '3,3,3,3,3,3,3,3,3'; // Ini adalah contoh untuk Indonesia, bisa disesuaikan dengan kebutuhan
        // Metode kalkulasi bisa disesuaikan. Method 20 adalah Kemenag Indonesia.
        const method = 20; // Ganti dengan metode yang sesuai jika perlu

        try {
            // Menggunakan tanggal saat ini untuk URL API
            const response = await fetch(`https://api.aladhan.com/v1/timingsByCity?city=${city}&country=${country}&method=${method}&month=${month}&year=${year}&tune=${tune}`);
            
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
                dailyScheduleData.date && dailyScheduleData.date.gregorian &&
                parseInt(dailyScheduleData.date.gregorian.day) === day) {
                const timings = dailyScheduleData.timings;
                prayerTimeElements.imsak.textContent = timings.Imsak ? timings.Imsak.split(' ')[0] : 'N/A';
                prayerTimeElements.subuh.textContent = timings.Fajr ? timings.Fajr.split(' ')[0] : 'N/A'; // Fajr adalah Subuh
                prayerTimeElements.dzuhur.textContent = timings.Dhuhr ? timings.Dhuhr.split(' ')[0] : 'N/A';
                prayerTimeElements.ashar.textContent = timings.Asr ? timings.Asr.split(' ')[0] : 'N/A';
                prayerTimeElements.maghrib.textContent = timings.Maghrib ? timings.Maghrib.split(' ')[0] : 'N/A';
                prayerTimeElements.isya.textContent = timings.Isha ? timings.Isha.split(' ')[0] : 'N/A';

                // Ambil dan format tanggal Hijriah
                const hijri = dailyScheduleData.date.hijri;
                if (hijri && hijri.day && hijri.month && hijri.month.en && hijri.year) {
                    hijriDateString = `${hijri.day} ${hijri.month.en} ${hijri.year} H`;
                } else {
                    hijriDateString = ''; // Reset jika data Hijriah tidak lengkap
                }
            } else {
                console.error("Struktur respons API tidak diharapkan atau data untuk hari yang salah:", dailyScheduleData);
                Object.values(prayerTimeElements).forEach(el => el.textContent = 'Error');
                // throw new Error(`Jadwal untuk tanggal ${day}-${month}-${year} tidak ditemukan atau format data API tidak sesuai.`);
            }

        } catch (error) {
            console.error("Gagal mengambil jadwal sholat:", error);
            Object.values(prayerTimeElements).forEach(el => el.textContent = 'Error');
        }
        highlightNextPrayer(); // Panggil highlight setelah mencoba fetch
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

    async function loadContentIntoMain(url) {
        if (!mainContentElement) return;
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Gagal memuat konten: ${response.status} ${response.statusText}`);
            }
            const htmlContent = await response.text();
            mainContentElement.innerHTML = htmlContent;
        } catch (error) {
            console.error("Error memuat konten ke main:", error);
            mainContentElement.innerHTML = `<p class="text-red-500 text-center">Gagal memuat konten.</p>`;
        }
    }

    async function cycleContent() {
        if (contentUrls.length === 0) {
            // console.log("Tidak ada URL konten untuk di-siklus.");
            return;
        }

        const urlToLoad = contentUrls[currentContentIndex];
        // console.log(`Memuat konten: ${urlToLoad}`);
        await loadContentIntoMain(urlToLoad);

        // Pindahkan ke indeks berikutnya untuk siklus potensial berikutnya
        currentContentIndex = (currentContentIndex + 1) % contentUrls.length;

        if (urlToLoad === 'video.html') {
            // Jika video YouTube ditampilkan, hentikan siklus
            if (cycleContentIntervalId !== null) {
                clearInterval(cycleContentIntervalId);
                cycleContentIntervalId = null;
                // console.log('Video YouTube ditampilkan, siklus konten dihentikan.');
            }
        } else {
            // Jika konten bukan video YouTube, dan siklus dihentikan, dan ada lebih dari satu item, mulai lagi
            if (cycleContentIntervalId === null && contentUrls.length > 1) {
                // console.log('Melanjutkan siklus konten untuk konten non-video.');
                cycleContentIntervalId = setInterval(cycleContent, 10000); // Ganti konten setiap 10 detik
            } else if (cycleContentIntervalId === null && contentUrls.length <= 1) {
                // Hanya satu item dan itu bukan kegiatan.html. Sudah dimuat. Tidak perlu interval.
                // console.log('Konten tunggal non-video ditampilkan. Tidak perlu siklus.');
            }
        }
    }

    function scheduleNextMidnightFetch() {
        const now = new Date();
        const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 500); // Pukul 00:00:00.500 hari berikutnya
        const msUntilMidnight = tomorrow.getTime() - now.getTime();

        setTimeout(async () => {
            console.log("Fetching prayer times at midnight...");
            await fetchAndDisplayPrayerTimes();
            scheduleNextMidnightFetch(); // Jadwalkan lagi untuk tengah malam berikutnya
        }, msUntilMidnight);
    }

    // Panggil fungsi saat halaman dimuat
    updateClock();
    fetchAndDisplayPrayerTimes();
    if (contentUrls.length > 0) {
        cycleContent(); // Muat konten pertama kali, fungsi ini akan mengatur interval jika perlu
    }
    scheduleNextMidnightFetch(); // Jadwalkan fetch pertama pada tengah malam berikutnya

    // Perbarui jam setiap detik
    setInterval(updateClock, 1000);
    // Menjadwalkan secara spesifik untuk 00:00
    setInterval(highlightNextPrayer, 30000); // Perbarui highlight setiap 30 detik
});
