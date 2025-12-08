<script lang="ts">
	import { goto } from '$app/navigation';
	import { enhance } from '$app/forms';

	let formData = {
		name: ''
	};
	let errors = {
		name: ''
	};
	let isSubmitting = false;
	let submitMessage = '';

	function validateForm() {
		errors.name = '';
		
		if (!formData.name.trim()) {
			errors.name = 'Category name is required';
			return false;
		}
		
		if (formData.name.trim().length < 2) {
			errors.name = 'Category name must be at least 2 characters';
			return false;
		}
		
		if (formData.name.trim().length > 50) {
			errors.name = 'Category name must be less than 50 characters';
			return false;
		}
		
		return true;
	}

	function handleNameInput() {
		if (errors.name && formData.name.trim()) {
			errors.name = '';
		}
	}

	function resetForm() {
		formData.name = '';
		errors.name = '';
		submitMessage = '';
	}
</script>

<section class="space-y-6">
	<div class="flex items-center justify-between">
		<h2 class="text-2xl font-bold text-gray-900">Create Category</h2>
		<a
			href="/super/categories"
			class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
		>
			Back to Categories
		</a>
	</div>

	<div class="bg-white border border-gray-200 rounded-lg p-6">
		<form
			method="POST"
			action="/api/categories"
			use:enhance={() => {
				return async ({ submitter, formData, cancel }) => {
					if (!validateForm()) {
						cancel();
						return;
					}
					
					isSubmitting = true;
					submitMessage = '';
					
					// Create JSON body from form data
					const jsonBody = JSON.stringify({
						name: formData.get('name')
					});
					
					try {
						const response = await fetch('/api/categories', {
							method: 'POST',
							headers: {
								'Content-Type': 'application/json'
							},
							body: jsonBody
						});
						
						const result = await response.json();
						
						if (response.ok) {
							isSubmitting = false;
							submitMessage = 'Category created successfully!';
							resetForm();
							// Redirect after a short delay
							setTimeout(() => {
								goto('/super/categories');
							}, 1500);
						} else {
							isSubmitting = false;
							if (result.error) {
								if (result.error.includes('name')) {
									errors.name = result.error;
								} else {
									submitMessage = result.error || 'Failed to create category';
								}
							}
						}
					} catch (error) {
						console.error('Submit error:', error);
						isSubmitting = false;
						submitMessage = 'Failed to create category. Please try again.';
					}
					
					return;
				};
			}}
			on:submit={() => {
				if (!validateForm()) {
					return;
				}
				isSubmitting = true;
				submitMessage = '';
			}}
		>
			<div class="space-y-4">
				<div>
					<label for="name" class="block text-sm font-medium text-gray-700 mb-1">
						Category Name <span class="text-red-500">*</span>
					</label>
					<input
						id="name"
						name="name"
						type="text"
						bind:value={formData.name}
						on:input={handleNameInput}
						class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 sm:text-sm"
						placeholder="Enter category name"
						maxlength="50"
						disabled={isSubmitting}
						required
					/>
					{#if errors.name}
						<p class="mt-1 text-sm text-red-600">{errors.name}</p>
					{/if}
					<p class="mt-1 text-xs text-gray-500">
						{formData.name.trim().length}/50 characters
					</p>
				</div>

				{#if submitMessage}
					<div class="rounded-md p-3 {submitMessage.includes('success') ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}">
						<p class="text-sm">{submitMessage}</p>
					</div>
				{/if}

				<div class="flex justify-end gap-3 pt-4">
					<a
						href="/super/categories"
						class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
					>
						Cancel
					</a>
					<button
						type="submit"
						disabled={isSubmitting || !formData.name.trim()}
						class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{#if isSubmitting}
							<div class="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
							Creating...
						{:else}
							Create Category
						{/if}
					</button>
				</div>
			</div>
		</form>
	</div>
</section>
