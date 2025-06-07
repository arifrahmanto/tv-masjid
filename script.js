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
        currentDateElement.textContent = now.toLocaleDateString('id-ID', options);
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
        // Metode kalkulasi bisa disesuaikan. Method 2 adalah ISNA (Islamic Society of North America).
        // Kemenag biasanya menggunakan method 99 atau method khusus, 
        // namun Aladhan API mungkin tidak secara langsung mendukungnya dengan nomor spesifik.
        // Anda bisa merujuk ke dokumentasi Aladhan untuk metode yang paling sesuai untuk Indonesia.
        // Untuk Indonesia, seringkali method 3 (Muslim World League) atau 4 (Umm Al-Qura University, Makkah) juga digunakan.
        // Atau method 20 untuk Kemenag jika tersedia di API yang Anda gunakan.
        // Untuk Aladhan, method 5 (Egyptian General Authority of Survey) juga umum.
        // Mari kita coba method 3 sebagai contoh umum.
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

    // Panggil fungsi saat halaman dimuat
    updateClock();
    fetchAndDisplayPrayerTimes();

    // Perbarui jam setiap detik
    setInterval(updateClock, 1000);

    // Anda mungkin ingin memperbarui jadwal sholat setiap hari atau sesuai kebutuhan
    // Untuk memastikan jadwal selalu update setiap hari pada tengah malam:
    // setInterval(fetchAndDisplayPrayerTimes, 24 * 60 * 60 * 1000); // Setiap 24 jam
    setInterval(highlightNextPrayer, 30000); // Perbarui highlight setiap 30 detik
});
