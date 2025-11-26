<script lang="ts">
  import { page } from '$app/stores';

</script>

<main class="h-full flex items-center justify-center px-4 overflow-hidden pt-[100px]">
  <div class="max-w-5xl mx-auto text-center">
    <p class="text-sm font-medium tracking-wide text-red-500 mb-3">
      {$page.status === 404
        ? "404. Not found"
        : `${$page.status || "Error"}. Not available`}
    </p>
    <h1
      class="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-gray-900 mb-4"
    >
      Page Not Available
    </h1>
    <div
      class="text-sm sm:text-base text-gray-500 mb-6 max-w-xl mx-auto space-y-2"
    >
      <p>Halaman yang kamu cari tidak tersedia atau sudah dipindahkan.</p>
      <p>Silakan periksa kembali URL atau kembali ke halaman utama.</p>
    </div>

    <div class="flex flex-col sm:flex-row items-center justify-center gap-3">
      <a
        href="/"
        class="inline-flex items-center justify-center px-6 py-3 rounded-full bg-red-600 text-white font-semibold shadow-lg hover:bg-red-700 hover:shadow-xl transition-all duration-200"
      >
        Kembali ke Beranda
      </a>
      <a
        href="/competitions"
        class="text-sm font-medium text-gray-600 hover:text-red-600 transition-colors duration-200"
      >
        Lihat Kompetisi
      </a>
    </div>
  </div>
</main>
