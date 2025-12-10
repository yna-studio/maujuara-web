<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import ImageUpload from './ImageUpload.svelte';

	export let organizer: any = null;
	export let form: any = null;

	let loading = false;
	let avatarBase64: string = '';

	async function handleSubmit() {
		loading = true;
		
		try {
			const payload = {
				name: (document.getElementById('name') as HTMLInputElement)?.value?.trim(),
				avatar: avatarBase64 || organizer?.avatar || ''
			};
			
			// Validate required fields
			if (!payload.name) {
				loading = false;
				alert('Organizer name is required');
				return;
			}
			
			if (!payload.avatar) {
				loading = false;
				alert('Avatar image is required');
				return;
			}
			
			console.log('Form payload:', payload);
			
			if (organizer) {
				// Update existing organizer
				const response = await fetch(`/api/organizers/${organizer._id}`, {
					method: 'PUT',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify(payload)
				});
				
				const result = await response.json();
				
				if (response.ok) {
					console.log('Organizer updated successfully:', result);
					goto('/super/organizers');
				} else {
					console.error('Failed to update organizer:', result);
					alert(`Error: ${result.error || 'Failed to update organizer'}`);
					loading = false;
				}
			} else {
				// Create new organizer
				const response = await fetch('/api/organizers', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify(payload)
				});
				
				const result = await response.json();
				
				if (response.ok) {
					console.log('Organizer created successfully:', result);
					goto('/super/organizers');
				} else {
					console.error('Failed to create organizer:', result);
					alert(`Error: ${result.error || 'Failed to create organizer'}`);
					loading = false;
				}
			}
		} catch (error) {
			console.error('Error saving organizer:', error);
			alert('Error saving organizer. Please try again.');
			loading = false;
		}
	}
</script>

<section class="space-y-6">
	{#if organizer}
		<div class="flex items-center justify-between">
			<h1 class="text-2xl font-bold text-gray-900">Edit Organizer</h1>
			<a
				href="/super/organizers"
				class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
			>
				← Back to organizers
			</a>
		</div>
	{:else}
		<div class="flex items-center justify-between">
			<h1 class="text-2xl font-bold text-gray-900">Create Organizer</h1>
			<a
				href="/super/organizers"
				class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
			>
				← Back to organizers
			</a>
		</div>
	{/if}

	{#if form?.success}
		<div class="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md">
			{form.success}
		</div>
	{/if}

	{#if form?.error}
		<div class="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md">
			{form.error}
		</div>
	{/if}

	<form
		class="bg-white border border-gray-200 rounded-lg p-6 space-y-6"
		on:submit|preventDefault={handleSubmit}
	>
		<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
			<div>
				<label for="name" class="block text-sm font-medium text-gray-700 mb-1">Organizer Name</label>
				<input
					type="text"
					id="name"
					name="name"
					value={organizer?.name || ''}
					class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
					required
				/>
			</div>

			<div class="md:col-span-2">
				<ImageUpload
					id="avatar"
					label="Avatar Image"
					bind:value={avatarBase64}
					oldImageUrl={organizer?.avatar || ''}
					showOldImage={!!organizer?.avatar}
					previewSize="w-24 h-24"
					required={!organizer?.avatar}
					accept="image/*"
				/>
			</div>
		</div>

		<div class="flex justify-end space-x-3 pt-6 border-t border-gray-200">
			<a
				href="/super/organizers"
				class="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
			>
				Cancel
			</a>
			<button
				type="submit"
				disabled={loading}
				class="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
			>
				{loading ? 'Saving...' : (organizer ? 'Update Organizer' : 'Create Organizer')}
			</button>
		</div>
	</form>
</section>
