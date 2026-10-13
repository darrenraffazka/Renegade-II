// ===== DAFTAR LAGU =====
// Taruh 3 file mp3 di folder "lagu" di repo, lalu samakan nama file di sini.
const lagu = [
  { judul: "Lagu 1", file: "lagu1.mp3" },
  { judul: "Lagu 2", file: "lagu2.mp3" },
  { judul: "Lagu 3", file: "lagu3.mp3" },
];

const audio = new Audio();
const overlay = document.getElementById("overlay");
const tombolPlay = document.getElementById("btn-play");
const labelLagu = document.getElementById("judul-lagu");

// Posisi lagu disimpan, jadi pindah halaman tidak mengulang dari awal
let index = parseInt(localStorage.getItem("laguIndex")) || 0;
let waktu = parseFloat(localStorage.getItem("laguWaktu")) || 0;
let dijeda = localStorage.getItem("laguDijeda") === "1";

function muat(i, mulaiDari = 0) {
  index = (i + lagu.length) % lagu.length;
  audio.src = lagu[index].file;
  audio.currentTime = mulaiDari;
  labelLagu.textContent = lagu[index].judul;
  localStorage.setItem("laguIndex", index);
}

function putar() {
  return audio.play().then(() => {
    dijeda = false;
    localStorage.setItem("laguDijeda", "0");
    tombolPlay.textContent = "⏸";
  });
}

function jeda() {
  audio.pause();
  dijeda = true;
  localStorage.setItem("laguDijeda", "1");
  tombolPlay.textContent = "▶";
}

tombolPlay.onclick = () => (audio.paused ? putar() : jeda());
document.getElementById("btn-next").onclick = () => { muat(index + 1); putar(); };
document.getElementById("btn-prev").onclick = () => { muat(index - 1); putar(); };
audio.onended = () => { muat(index + 1); putar(); };

// Simpan posisi lagu tiap detik
setInterval(() => localStorage.setItem("laguWaktu", audio.currentTime), 1000);

// Tombol "Masuk" (browser wajib ada klik dulu sebelum suara boleh jalan)
document.getElementById("btn-masuk").onclick = () => {
  sessionStorage.setItem("masuk", "1");
  overlay.style.display = "none";
  putar();
};

// ===== SAAT HALAMAN DIBUKA =====
muat(index, waktu);
tombolPlay.textContent = "▶";

if (!dijeda) {
  if (sessionStorage.getItem("masuk")) {
    // sudah pernah klik "Masuk": coba lanjut otomatis, kalau diblokir tampilkan overlay lagi
    putar().catch(() => (overlay.style.display = "flex"));
  } else {
    overlay.style.display = "flex";
  }
}
