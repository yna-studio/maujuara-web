<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	export let competition: any = null;
	export let categories: any[] = [];
	export let organizers: any[] = [];
	export let form: any = null;

	let loading = false;
	let posterUrl = competition?.poster || '';
	let descriptionContent = competition?.desc || '';
	let prizeDescriptionContent = competition?.prize_desc || '';

	let descriptionEditor: HTMLDivElement;
	let prizeDescriptionEditor: HTMLDivElement;

	// Searchable select state
	let organizerSearch = competition?.organizer?.name || '';
	let organizerDropdownOpen = false;
	let selectedOrganizer: any = null;
	let searchResults: any[] = [];
	let searching = false;

	// Initialize with all organizers for display
	$: filteredOrganizers = searchResults.length > 0 ? searchResults : organizers;

	// Initialize selected organizer
	$: if (competition?.organizer && !selectedOrganizer) {
		if (typeof competition.organizer === 'object') {
			selectedOrganizer = competition.organizer;
			organizerSearch = competition.organizer.name || '';
		} else {
			// Find organizer by ID
			selectedOrganizer = organizers?.find((org: any) => 
				org._id === competition.organizer || 
				org.id === competition.organizer
			);
			if (selectedOrganizer) {
				organizerSearch = selectedOrganizer.name || '';
			}
		}
	}

	function selectOrganizer(org: any) {
		selectedOrganizer = org;
		organizerDropdownOpen = false;
		organizerSearch = org.name || '';
	}

	function clearOrganizer() {
		selectedOrganizer = null;
		organizerSearch = '';
		searchResults = [];
	}

	// Backend search function
	async function searchOrganizers(query: string) {
		if (!query.trim()) {
			searchResults = [];
			return;
		}

		try {
			searching = true;
			const response = await fetch(`/api/organizers?search=${encodeURIComponent(query.trim())}&limit=20`);
			if (response.ok) {
				const data = await response.json();
				searchResults = data.data || [];
			}
		} catch (error) {
			console.error('Error searching organizers:', error);
			searchResults = [];
		} finally {
			searching = false;
		}
	}

	// Debounced search
	let searchTimeout: NodeJS.Timeout;
	function handleOrganizerSearch() {
		clearTimeout(searchTimeout);
		if (organizerSearch.trim()) {
			searchTimeout = setTimeout(() => {
				searchOrganizers(organizerSearch);
			}, 300);
		} else {
			searchResults = [];
		}
	}

	function formatDateForInput(dateStr?: string) {
		if (!dateStr) return '';
		const d = new Date(dateStr);
		return d.toISOString().split('T')[0];
	}

	function execCommand(command: string, value?: string) {
		document.execCommand(command, false, value);
	}

	function formatHeading(level: number) {
		execCommand('formatBlock', `h${level}`);
	}

	function addLink() {
		const url = prompt('Enter URL:');
		if (url) {
			execCommand('createLink', url);
		}
	}

	// Update content variables when editors change
	function updateDescriptionContent() {
		if (descriptionEditor) {
			descriptionContent = descriptionEditor.innerHTML;
		}
	}

	function updatePrizeDescriptionContent() {
		if (prizeDescriptionEditor) {
			prizeDescriptionContent = prizeDescriptionEditor.innerHTML;
		}
	}

	onMount(() => {
		// Set initial HTML content for editors with a delay to ensure DOM is ready
		setTimeout(() => {
			if (descriptionEditor && descriptionContent) {
				descriptionEditor.innerHTML = descriptionContent;
			}
			if (prizeDescriptionEditor && prizeDescriptionContent) {
				prizeDescriptionEditor.innerHTML = prizeDescriptionContent;
			}
		}, 0);
	});

	async function handleSubmit() {
		loading = true;
		
		try {
			// Validate required fields for create
			if (!competition) {
				const title = document.getElementById('title')?.value?.trim();
				const organizerId = selectedOrganizer?._id || selectedOrganizer?.id;
				const categoryId = document.getElementById('category')?.value;
				
				if (!title) {
					loading = false;
					alert('Title is required');
					return;
				}
				
				if (!organizerId) {
					loading = false;
					alert('Organizer is required');
					return;
				}
				
				if (!categoryId) {
					loading = false;
					alert('Category is required');
					return;
				}
			}
			
			// Build custom payload
			const payload = {
				title: document.getElementById('title')?.value,
				poster: document.getElementById('poster_url')?.value || '',
				deadline_date: document.getElementById('deadline_date')?.value ? new Date(document.getElementById('deadline_date')?.value).toISOString() : null,
				announcement_date: document.getElementById('announcement_date')?.value ? new Date(document.getElementById('announcement_date')?.value).toISOString() : null,
				organizer: selectedOrganizer?._id || selectedOrganizer?.id,
				prize_desc: prizeDescriptionContent || '',
				prize_estimate: document.getElementById('prize_estimation')?.value ? Number(document.getElementById('prize_estimation')?.value) : 0,
				desc: descriptionContent || '',
				contacts: document.getElementById('contact')?.value ? JSON.parse(document.getElementById('contact')?.value) : [],
				link_join: document.getElementById('join_link')?.value || '',
				category: document.getElementById('category')?.value
			};
			
			console.log('Form payload:', payload);
			
			if (competition) {
				// Update existing competition
				const response = await fetch(`/api/competitions/${competition._id}`, {
					method: 'PUT',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify(payload)
				});
				
				const result = await response.json();
				
				if (response.ok) {
					console.log('Competition updated successfully:', result);
					goto('/super/competitions');
				} else {
					console.error('Failed to update competition:', result);
					alert(`Error: ${result.error || 'Failed to update competition'}`);
					loading = false;
				}
			} else {
				// Create new competition
				const response = await fetch('/api/competitions', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify(payload)
				});
				
				const result = await response.json();
				
				if (response.ok) {
					console.log('Competition created successfully:', result);
					goto('/super/competitions');
				} else {
					console.error('Failed to create competition:', result);
					alert(`Error: ${result.error || 'Failed to create competition'}`);
					loading = false;
				}
			}
		} catch (error) {
			console.error('Error saving competition:', error);
			alert('Error saving competition. Please try again.');
			loading = false;
		}
	}
</script>

<section class="space-y-6">
	<div class="flex items-center justify-between">
		<h1 class="text-2xl font-bold text-gray-900">
			{competition ? 'Edit Competition' : 'Add Competition'}
		</h1>
		<a
			href="/super/competitions"
			class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
		>
			← Back to Competitions
		</a>
	</div>

	{#if form?.error}
		<div class="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md">
			{form.error}
		</div>
	{/if}

	<form class="bg-white border border-gray-200 rounded-lg p-6 space-y-6" on:submit|preventDefault={handleSubmit}>
		<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
			<div>
				<label for="title" class="block text-sm font-medium text-gray-700 mb-1">Title</label>
				<input
					type="text"
					id="title"
					name="title"
					value={competition?.title || competition?.name || ''}
					class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
					required
				/>
			</div>

			<div>
				<label for="category" class="block text-sm font-medium text-gray-700 mb-1">Category</label>
				<select
					id="category"
					name="category"
					class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
				>
					<option value="">Select a category</option>
					{#each categories as category}
						<option 
							value={category._id || category.id || category.name}
							selected={(category._id || category.id || category.name) === (competition?.category?._id || competition?.category?.id || competition?.category)}
						>
							{category.name}
						</option>
					{/each}
				</select>
			</div>

			<div>
				<label for="deadline_date" class="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
				<input
					type="date"
					id="deadline_date"
					name="deadline_date"
					value={formatDateForInput(competition?.deadline_date)}
					class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
				/>
			</div>

			<div>
				<label for="announcement_date" class="block text-sm font-medium text-gray-700 mb-1">Announcement</label>
				<input
					type="date"
					id="announcement_date"
					name="announcement_date"
					value={formatDateForInput(competition?.announcement_date)}
					class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
				/>
			</div>

			<div>
				<label for="organizer" class="block text-sm font-medium text-gray-700 mb-1">Organizer</label>
				<div class="relative">
					<input
						type="text"
						id="organizer"
						name="organizer"
						bind:value={organizerSearch}
						on:focus={() => organizerDropdownOpen = true}
						on:input={handleOrganizerSearch}
						on:keydown={(e) => {
							if (e.key === 'Escape') {
								organizerDropdownOpen = false;
							}
						}}
						placeholder="Search organizer..."
						class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
					/>
					{#if organizerSearch}
						<button
							type="button"
							on:click={clearOrganizer}
							class="absolute right-8 top-2.5 text-gray-400 hover:text-gray-600"
						>
							✕
						</button>
					{/if}
					<button
						type="button"
						on:click={() => organizerDropdownOpen = !organizerDropdownOpen}
						class="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600"
					>
						▼
					</button>
					
					{#if organizerDropdownOpen && (searching || filteredOrganizers.length > 0)}
						<div class="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
							{#if searching}
								<div class="px-3 py-2 text-gray-500 text-sm">Searching...</div>
							{:else}
								{#each filteredOrganizers as org}
									<button
										type="button"
										on:click={() => selectOrganizer(org)}
										class="w-full px-3 py-2 text-left hover:bg-gray-100 flex flex-col"
									>
										<span class="font-medium">{org.name}</span>
										{#if org.email}
											<span class="text-sm text-gray-500">{org.email}</span>
										{/if}
									</button>
								{/each}
							{/if}
						</div>
					{:else if organizerDropdownOpen && organizerSearch && !searching && filteredOrganizers.length === 0}
						<div class="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg">
							<div class="px-3 py-2 text-gray-500">No organizers found</div>
						</div>
					{/if}
				</div>
				<input type="hidden" name="organizer" value={selectedOrganizer?._id || selectedOrganizer?.id || selectedOrganizer?.name || ''} />
			</div>

			<div>
				<label for="prize_estimation" class="block text-sm font-medium text-gray-700 mb-1">Prize Estimation (IDR)</label>
				<input
					type="number"
					id="prize_estimation"
					name="prize_estimation"
					value={competition?.prize_estimate || ''}
					class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
				/>
			</div>

			<div>
				<label for="join_link" class="block text-sm font-medium text-gray-700 mb-1">Join Link</label>
				<input
					type="url"
					id="join_link"
					name="join_link"
					value={competition?.link_join || ''}
					placeholder="https://example.com/join"
					class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
				/>
			</div>

			<div class="md:col-span-2">
				<label class="block text-sm font-medium text-gray-700 mb-1">Prize Description</label>
				
				<!-- Toolbar -->
				<div class="flex flex-wrap gap-1 p-2 border border-gray-300 rounded-t-md bg-gray-50">
					<button
						type="button"
						class="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
						on:click={() => formatHeading(2)}
						title="Heading 2"
					>
						H2
					</button>
					<button
						type="button"
						class="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
						on:click={() => formatHeading(3)}
						title="Heading 3"
					>
						H3
					</button>
					<button
						type="button"
						class="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
						on:click={() => formatHeading(4)}
						title="Heading 4"
					>
						H4
					</button>
					<div class="w-px bg-gray-300 mx-1"></div>
					<button
						type="button"
						class="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
						on:click={() => execCommand('bold')}
						title="Bold"
					>
						<strong>B</strong>
					</button>
					<button
						type="button"
						class="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
						on:click={() => execCommand('italic')}
						title="Italic"
					>
						<em>I</em>
					</button>
					<button
						type="button"
						class="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
						on:click={() => execCommand('underline')}
						title="Underline"
					>
						<u>U</u>
					</button>
					<div class="w-px bg-gray-300 mx-1"></div>
					<button
						type="button"
						class="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
						on:click={() => execCommand('insertUnorderedList')}
						title="Bullet List"
					>
						• List
					</button>
					<button
						type="button"
						class="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
						on:click={() => execCommand('insertOrderedList')}
						title="Numbered List"
					>
						1. List
					</button>
					<div class="w-px bg-gray-300 mx-1"></div>
					<button
						type="button"
						class="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
						on:click={addLink}
						title="Add Link"
					>
						Link
					</button>
					<button
						type="button"
						class="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
						on:click={() => execCommand('removeFormat')}
						title="Clear Formatting"
					>
						Clear
					</button>
				</div>
				
				<!-- Editor -->
				<div
					contenteditable="true"
					bind:this={prizeDescriptionEditor}
					on:input={updatePrizeDescriptionContent}
					on:blur={updatePrizeDescriptionContent}
					class="mt-0 min-h-[150px] p-3 border border-gray-300 border-t-0 rounded-b-md shadow-sm focus:ring-red-500 focus:border-red-500 bg-white"
					placeholder="Describe the prizes..."
				></div>
				
				<input type="hidden" name="prize_description" bind:value={prizeDescriptionContent} />
			</div>

			<div class="md:col-span-2">
				<label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
				
				<!-- Toolbar -->
				<div class="flex flex-wrap gap-1 p-2 border border-gray-300 rounded-t-md bg-gray-50">
					<button
						type="button"
						class="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
						on:click={() => formatHeading(2)}
						title="Heading 2"
					>
						H2
					</button>
					<button
						type="button"
						class="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
						on:click={() => formatHeading(3)}
						title="Heading 3"
					>
						H3
					</button>
					<button
						type="button"
						class="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
						on:click={() => formatHeading(4)}
						title="Heading 4"
					>
						H4
					</button>
					<div class="w-px bg-gray-300 mx-1"></div>
					<button
						type="button"
						class="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
						on:click={() => execCommand('bold')}
						title="Bold"
					>
						<strong>B</strong>
					</button>
					<button
						type="button"
						class="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
						on:click={() => execCommand('italic')}
						title="Italic"
					>
						<em>I</em>
					</button>
					<button
						type="button"
						class="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
						on:click={() => execCommand('underline')}
						title="Underline"
					>
						<u>U</u>
					</button>
					<div class="w-px bg-gray-300 mx-1"></div>
					<button
						type="button"
						class="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
						on:click={() => execCommand('insertUnorderedList')}
						title="Bullet List"
					>
						• List
					</button>
					<button
						type="button"
						class="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
						on:click={() => execCommand('insertOrderedList')}
						title="Numbered List"
					>
						1. List
					</button>
					<div class="w-px bg-gray-300 mx-1"></div>
					<button
						type="button"
						class="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
						on:click={addLink}
						title="Add Link"
					>
						Link
					</button>
					<button
						type="button"
						class="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
						on:click={() => execCommand('removeFormat')}
						title="Clear Formatting"
					>
						Clear
					</button>
				</div>
				
				<!-- Editor -->
				<div
					contenteditable="true"
					bind:this={descriptionEditor}
					on:input={updateDescriptionContent}
					on:blur={updateDescriptionContent}
					class="mt-0 min-h-[200px] p-3 border border-gray-300 border-t-0 rounded-b-md shadow-sm focus:ring-red-500 focus:border-red-500 bg-white"
					placeholder="Start writing your competition description..."
				></div>
				
				<input type="hidden" name="description" bind:value={descriptionContent} />
			</div>

			<div class="md:col-span-2">
				<label for="poster_url" class="block text-sm font-medium text-gray-700 mb-1">Poster URL</label>
				<input
					type="url"
					id="poster_url"
					name="poster_url"
					bind:value={posterUrl}
					placeholder="https://example.com/poster.jpg"
					class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
				/>
				
				{#if posterUrl}
					<div class="mt-2">
						<p class="text-sm text-gray-600 mb-1">Poster Preview:</p>
						<img 
							src={posterUrl} 
							alt="Poster preview" 
							class="max-w-[300px] w-full h-auto rounded border border-gray-200"
							on:error={(e) => {
								e.currentTarget.style.display = 'none';
							}}
						/>
					</div>
				{/if}
			</div>

			<div class="md:col-span-2">
				<label for="contact" class="block text-sm font-medium text-gray-700 mb-1">Contact (JSON)</label>
				<textarea
					id="contact"
					name="contact"
					rows="4"
					class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
				>{competition?.contacts ? JSON.stringify(competition.contacts, null, 2) : ''}</textarea>
			</div>
		</div>

		<div class="flex justify-end space-x-3 pt-6 border-t border-gray-200">
			<a
				href="/super/competitions"
				class="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
			>
				Cancel
			</a>
			<button
				type="submit"
				disabled={loading}
				class="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
			>
				{loading ? 'Saving...' : (competition ? 'Update Competition' : 'Create Competition')}
			</button>
		</div>
	</form>
</section>
