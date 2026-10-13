// ===== DAFTAR LAGU =====
// Taruh 3 file mp3 di repo (sejajar index.html), lalu samakan nama file di sini.
const lagu = [
  { judul: "Lagu 1", file: "lagu1.mp3.mpeg" },
  { judul: "Lagu 2", file: "lagu2.mp3.mpeg" },
  { judul: "Lagu 3", file: "lagu3.mp3.mpeg" },
];

// ===== PEMUTAR =====
const $ = (id) => document.getElementById(id);
const overlay = $("overlay");
const btnPlay = $("btn-play");
const label = $("judul-lagu");
const progres = $("progres");
const audio = new Audio();

// penyimpanan aman (tidak error kalau browser memblokir)
const ambil = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } };
const simpan = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };
const sudahMasuk = () => { try { return sessionStorage.getItem("masuk"); } catch (e) { return null; } };
const tandaiMasuk = () => { try { sessionStorage.setItem("masuk", "1"); } catch (e) {} };

let index = parseInt(ambil("laguIndex")) || 0;
if (index >= lagu.length) index = 0;
let waktu = parseFloat(ambil("laguWaktu")) || 0;
let dijeda = ambil("laguDijeda") === "1";

function muat(i, mulai = 0) {
  index = (i + lagu.length) % lagu.length;
  audio.src = lagu[index].file;
  label.textContent = lagu[index].judul;
  progres.value = 0;
  simpan("laguIndex", index);
  if (mulai > 0) {
    audio.addEventListener("loadedmetadata", () => { audio.currentTime = mulai; }, { once: true });
  }
}

const putar = () => audio.play();
const coba = () => putar().catch(() => {}); // error file ditampilkan oleh event "error" di bawah

// tombol berubah sesuai keadaan lagu yang sebenarnya
audio.addEventListener("play", () => { btnPlay.textContent = "⏸"; dijeda = false; simpan("laguDijeda", "0"); });
audio.addEventListener("pause", () => { btnPlay.textContent = "▶"; });

// kalau mp3 tidak ketemu, nama file yang dicari tampil di pemutar
audio.addEventListener("error", () => {
  label.textContent = "⚠ " + lagu[index].file + " tidak ketemu";
});

audio.addEventListener("timeupdate", () => {
  simpan("laguWaktu", audio.currentTime);
  if (audio.duration) progres.value = (audio.currentTime / audio.duration) * 100;
});
audio.addEventListener("ended", () => { muat(index + 1); coba(); });

progres.addEventListener("input", () => {
  if (audio.duration) audio.currentTime = (progres.value / 100) * audio.duration;
});

btnPlay.onclick = () => {
  if (audio.paused) coba();
  else { audio.pause(); dijeda = true; simpan("laguDijeda", "1"); }
};
$("btn-next").onclick = () => { muat(index + 1); coba(); };
$("btn-prev").onclick = () => { muat(index - 1); coba(); };

// Tombol "Masuk" (browser wajib ada klik dulu sebelum suara boleh jalan)
$("btn-masuk").onclick = () => {
  tandaiMasuk();
  overlay.style.display = "none";
  coba();
};

// ===== SAAT HALAMAN DIBUKA =====
muat(index, waktu);

if (!dijeda) {
  if (sudahMasuk()) {
    // sudah pernah klik "Masuk": lanjut otomatis, kalau diblokir tampilkan layar masuk lagi
    putar().catch(() => { overlay.style.display = "flex"; });
  } else {
    overlay.style.display = "flex";
  }
}

// ===== HALAMAN DESAIN: klik kotak warna untuk salin kode =====
document.querySelectorAll(".warna").forEach((kotak) => {
  const kode = kotak.querySelector("code");
  const hex = kode.textContent;
  kotak.addEventListener("click", () => {
    if (navigator.clipboard) navigator.clipboard.writeText(hex);
    kode.textContent = "Tersalin!";
    setTimeout(() => { kode.textContent = hex; }, 1000);
  });
});
