<script lang="ts">
	import { goto } from '$app/navigation';

	export let data;

	function formatDate(dateStr?: string) {
		return dateStr ? new Date(dateStr).toLocaleDateString() : '-';
	}

	let openDropdownId: string | null = null;

	function toggleDropdown(id: string) {
		openDropdownId = openDropdownId === id ? null : id;
	}

	function closeDropdown() {
		openDropdownId = null;
	}

	function handleEdit(comp: any) {
		goto(`/super/competitions/edit/${comp._id}`);
		closeDropdown();
	}

	async function handleDelete(comp: any) {
		// TODO: confirm and delete via API
		if (confirm(`Are you sure you want to delete "${comp.title || comp.name}"?`)) {
			console.log('Delete competition:', comp);
			// await fetch(`/api/competitions/${comp._id}`, { method: 'DELETE' });
			// then reload data or redirect
		}
		closeDropdown();
	}
</script>

<section class="space-y-4" on:click={closeDropdown}>
	<div class="flex items-center justify-between">
		<h2 class="text-2xl font-bold text-gray-900">All Competitions</h2>
		<a
			href="/super/competitions/create"
			class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
		>
			Create Competition
		</a>
	</div>

	{#if data.competitions && data.competitions.length > 0}
		<div class="bg-white border border-gray-200 rounded-lg overflow-x-auto">
			<table class="min-w-full divide-y divide-gray-200">
				<thead class="bg-gray-50">
					<tr>
						<th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
							Title
						</th>
						<th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
							Category
						</th>
						<th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
							Created
						</th>
						<th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
							Updated
						</th>
						<th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
							Deadline
						</th>
						<th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
							Announcement
						</th>
						<th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
							Organizers
						</th>
						<th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
							Actions
						</th>
					</tr>
				</thead>
				<tbody class="bg-white divide-y divide-gray-200">
					{#each data.competitions as comp}
						<tr>
							<td class="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
								{comp.title || comp.name || '-'}
							</td>
							<td class="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
								{comp.category?.name || comp.category || '-'}
							</td>
							<td class="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
								{formatDate(comp.created_date)}
							</td>
							<td class="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
								{formatDate(comp.updated_date)}
							</td>
							<td class="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
								{formatDate(comp.deadline_date)}
							</td>
							<td class="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
								{formatDate(comp.announcement_date)}
							</td>
							<td class="px-4 py-4 text-sm text-gray-500">
								{comp.organizer?.name || comp.organizer || '-'}
							</td>
							<td class="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
								<div class="relative inline-block text-left">
									<button
										type="button"
										class="inline-flex justify-center items-center w-full rounded-md border border-gray-300 shadow-sm p-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
										on:click|stopPropagation={() => toggleDropdown(comp._id)}
									>
										<svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
											<path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
										</svg>
									</button>

									{#if openDropdownId === comp._id}
										<div
											class="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
											role="menu"
											aria-orientation="vertical"
											aria-labelledby="menu-button-{comp._id}"
											tabindex="-1"
											on:click|stopPropagation
										>
											<div class="py-1" role="none">
												<button
													class="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100 w-full text-left"
													role="menuitem"
													tabindex="-1"
													on:click={() => handleEdit(comp)}
												>
													Edit
												</button>
												<button
													class="text-red-600 block px-4 py-2 text-sm hover:bg-red-50 w-full text-left"
													role="menuitem"
													tabindex="-1"
													on:click={() => handleDelete(comp)}
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
	{:else}
		<div class="text-sm text-gray-500 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
			No competitions found.
		</div>
	{/if}
</section>
