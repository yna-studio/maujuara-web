<script lang="ts">
  export let text: string;
  export let subtext: string = '';
</script>

<div class="w-full bg-gray-50 border border-gray-200 rounded-xl px-6 py-5 text-center">
  <p class="text-base sm:text-lg font-semibold text-gray-900 mb-1">{text}</p>
  {#if subtext}
    <p class="text-xs sm:text-sm text-gray-600">{subtext}</p>
  {/if}
</div>
