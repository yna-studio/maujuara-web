<div class="fixed inset-0 bg-gray-50 flex items-center justify-center z-50">
	<div class="flex flex-col items-center space-y-4">
		<!-- Spinner -->
		<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
		
		<!-- Loading text -->
		<p class="text-gray-600 text-sm font-medium">Checking session...</p>
	</div>
</div>

<style>
	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
	
	.animate-spin {
		animation: spin 1s linear infinite;
	}
</style>
