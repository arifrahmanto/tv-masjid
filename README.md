# TV Masjid

Aplikasi TV Masjid ini adalah aplikasi yang digunakan sebagai penunjuk waktu shalat yang biasa dipasang di masjid. Source code aplikasi ini gratis, silakan untuk dipakai dan dimodifikasi. Aplikasi ini dibuat berdasarkan kebutuhan kami (Masjid At-Taqwa Banjarsari, Gajah, Demak) sehingga mungkin tidak sesuai dengan kebutuhan masjid pada umumnya. 

## Fitur
- Menampilkan waktu azan sesuai lokasi dan metode yang dipilih
- Memutar Tarhim sebelum waktu azan dimulai
- Menampilkan Tanggal Hijriah
- Memutar Qiro'/ Murottal sesuai jadwal
- Pengaturan (nama masjid, lokasi azan dll) mudah, tinggal edit file setting.json
- Management halaman yang ditampilkan cukup upload di folder pages lalu atur di setting.json
- Management file audio qiro'/murottal cukup upload di folder audio lalu atur di setting.json

## Cara Deployment
- Fork/Copy file di repository Anda
- Edit file setting.json sesuai dengan kebutuhan Masjid Anda
- Deploy dengan menggunakan github page sehingga aplikasi dideploy ke https://[akun_github].github.io/[nama_repo] atau gunakan custom domain Anda.

## Cara Menjalankan di SmartTV Masjid
- Install browser di SmartTV, disarankan memakai Fully Kiosk Browser sehingga nanti bisa diatur sedemikian rupa sehingga aplikasi bisa berjalan begitu TV dinyalakan.
- Set start URL di browser sesuai URL deployment https://[akun_github].github.io/[nama_repo] atau sesuai custom domain Anda
- Atur pengaturan browser sehingga bisa autostart saat TV dinyalakan
- Atur zoom pada browser. (biasanya diset ke 75%, tergantung jenis TV)
