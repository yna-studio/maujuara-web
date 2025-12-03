<script lang="ts">
	import { goto } from '$app/navigation';

	export let data;

	let openDropdownId: string | null = null;
	let searchTerm = '';
	let organizers = data.organizers || [];
	let loading = false;

	function toggleDropdown(id: string) {
		openDropdownId = openDropdownId === id ? null : id;
	}

	function closeDropdown() {
		openDropdownId = null;
	}

	function handleEdit(org: any) {
		goto(`/super/organizers/edit/${org._id}`);
		closeDropdown();
	}

	function handleDelete(org: any) {
		// TODO: confirm and delete via API
		if (confirm(`Are you sure you want to delete "${org.name}"?`)) {
			console.log('Delete organizer:', org);
			// await fetch(`/api/organizers/${org._id}`, { method: 'DELETE' });
			// then reload data or redirect
		}
		closeDropdown();
	}

	async function searchOrganizers() {
		if (searchTerm.trim() === '') {
			organizers = data.organizers || [];
			return;
		}

		loading = true;
		try {
			const response = await fetch(`/api/organizers?search=${encodeURIComponent(searchTerm.trim())}&limit=100`);
			if (response.ok) {
				const result = await response.json();
				organizers = result.data || [];
				console.log('Search results:', organizers.length, 'organizers found');
			} else {
				console.error('Search failed:', response.statusText);
				organizers = [];
			}
		} catch (error) {
			console.error('Search error:', error);
			organizers = [];
		} finally {
			loading = false;
		}
	}

	function handleFilterSubmit(event: Event) {
		event.preventDefault();
		searchOrganizers();
	}

	function clearSearch() {
		searchTerm = '';
		organizers = data.organizers || [];
	}
</script>

<section class="space-y-4">
	<!-- Click overlay to close dropdowns -->
	{#if openDropdownId}
		<div 
			class="fixed inset-0 z-0" 
			on:click={closeDropdown}
			on:keydown={(e) => { if (e.key === 'Escape') closeDropdown(); }}
			aria-hidden="true"
		></div>
	{/if}
	<div class="flex items-center justify-between">
		<h2 class="text-2xl font-bold text-gray-900">All Organizers</h2>
		<div class="flex items-center gap-3">
			<!-- Search Form -->
			<form on:submit={handleFilterSubmit} class="flex items-center gap-2">
				<div class="relative">
					<input
						style="padding-left:38px"
						type="text"
						bind:value={searchTerm}
						placeholder="Search organizers..."
						class="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
						disabled={loading}
					/>
					<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
						{#if loading}
							<div class="animate-spin h-4 w-4 border-2 border-red-600 border-t-transparent rounded-full"></div>
						{:else}
							<svg class="h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
							</svg>
						{/if}
					</div>
				</div>
				<button
					type="submit"
					class="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
					disabled={loading}
				>
					{loading ? 'Searching...' : 'Filter'}
				</button>
				{#if searchTerm}
					<button
						type="button"
						on:click={clearSearch}
						class="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
					>
						Clear
					</button>
				{/if}
			</form>
			<a
				href="/super/organizers/create"
				class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
			>
				Create Organizer
			</a>
		</div>
	</div>

	{#if organizers.length > 0}
		<div class="mb-4 text-sm text-gray-600">
			{searchTerm ? `Found ${organizers.length} organizer${organizers.length !== 1 ? 's' : ''} matching "${searchTerm}"` : `Showing all ${data.organizers.length} organizer${data.organizers.length !== 1 ? 's' : ''}`}
		</div>
		<div class="bg-white border border-gray-200 rounded-lg overflow-hidden">
			<div class="overflow-x-auto">
				<table class="min-w-full divide-y divide-gray-200">
					<thead class="bg-gray-50">
						<tr>
							<th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Organizer
							</th>
							<th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								ID
							</th>
							<th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Created
							</th>
							<th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Updated
							</th>
							<th style="width:50px" class="sticky right-0 bg-gray-50 px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border-l border-gray-200">
							</th>
						</tr>
					</thead>
				<tbody class="bg-white divide-y divide-gray-200">
					{#each organizers as org}
						<tr>
							<td class="px-4 py-4 whitespace-nowrap">
								<div class="flex gap-2 items-center">
									{#if org.avatar}
										<img 
											src={org.avatar} 
											alt={org.name} 
											class="h-6 w-6 rounded-full object-cover"
											on:error={(e) => {
												const target = e.target as HTMLImageElement;
												if (target) {
													target.style.display = 'none';
													const nextElement = target.nextElementSibling as HTMLElement;
													if (nextElement) {
														nextElement.style.display = 'flex';
													}
												}
											}}
										/>
										
										<div class="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-medium text-xs" style="display:none;">
											{org.name.charAt(0).toUpperCase()}
										</div>
									{:else}
										<div class="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-medium text-xs">
											{org.name.charAt(0).toUpperCase()}
										</div>
									{/if}
									<div class="text-sm font-medium text-gray-900">
										{org.name}
									</div>
								</div>
							</td>
							<td class="px-4 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
								{org._id || org.id || '-'}
							</td>
							<td class="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
								{org.created_at ? new Date(org.created_at).toLocaleDateString() : '-'}
							</td>
							<td class="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
								{org.updated_at ? new Date(org.updated_at).toLocaleDateString() : '-'}
							</td>
							<td class="sticky right-0 bg-white px-4 py-4 whitespace-nowrap text-right text-sm font-medium border-l border-gray-200">
								<div class="relative inline-block text-left">
									<button
										type="button"
										class="inline-flex justify-center items-center w-full rounded-md border border-gray-300 shadow-sm p-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
										aria-label="Actions for {org.name}"
										on:click|stopPropagation={() => toggleDropdown(org._id)}
									>
										<svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
											<path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
										</svg>
									</button>

									{#if openDropdownId === org._id}
										<div
											class="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
											role="menu"
											aria-orientation="vertical"
											aria-labelledby="menu-button-{org._id}"
											tabindex="-1"
											on:click|stopPropagation
											on:keydown={(e) => { if (e.key === 'Escape') closeDropdown(); }}
										>
											<div class="py-1" role="none">
												<button
													class="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100 w-full text-left"
													role="menuitem"
													tabindex="-1"
													on:click={() => handleEdit(org)}
												>
													Edit
												</button>
												<button
													class="text-red-600 block px-4 py-2 text-sm hover:bg-red-50 w-full text-left"
													role="menuitem"
													tabindex="-1"
													on:click={() => handleDelete(org)}
												>
													Delete
												</button>
											</div>
										</div>
									{/if}
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
	{:else}
		<div class="text-sm text-gray-500 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
			{searchTerm ? `No organizers found matching "${searchTerm}"` : 'No organizers found.'}
		</div>
	{/if}
</section>
