<script lang="ts">
	import { browser } from '$app/environment';
	
	export let options: Array<{ id: string; name: string }> = [];
	export let value = '';
	export let placeholder = 'Pilih opsi...';
	export let disabled = false;
	
	let isOpen = false;
	let searchQuery = '';
	let filteredOptions = options;
	let selectedOption: { id: string; name: string } | null = null;
	
	// Find selected option when value changes
	$: {
		selectedOption = options.find(opt => opt.id === value) || null;
		searchQuery = selectedOption?.name || '';
	}
	
	// Filter options based on search query
	$: {
		if (isOpen) {
			filteredOptions = searchQuery
				? options.filter(opt => 
					opt.name.toLowerCase().includes(searchQuery.toLowerCase())
				)
				: options;
		}
	}
	
	function toggleDropdown() {
		if (!disabled) {
			isOpen = !isOpen;
			if (isOpen && browser) {
				// Focus the input when dropdown opens
				setTimeout(() => {
					const input = document.querySelector('input[type="search"]') as HTMLInputElement;
					if (input) input.focus();
				}, 0);
			}
		}
	}
	
	function selectOption(option: { id: string; name: string }) {
		value = option.id;
		searchQuery = option.name;
		isOpen = false;
	}
	
	function handleKeydown(event: KeyboardEvent) {
		if (!isOpen) return;
		
		if (event.key === 'Escape') {
			isOpen = false;
		} else if (event.key === 'Enter') {
			event.preventDefault();
			if (filteredOptions.length > 0) {
				selectOption(filteredOptions[0]);
			}
		}
	}
	
	function handleClickOutside(event: MouseEvent) {
		if (!browser) return;
		
		const dropdown = document.querySelector('[data-dropdown="searchable-select"]') as HTMLElement;
		if (dropdown && !dropdown.contains(event.target as Node)) {
			isOpen = false;
		}
	}
	
	// Add click outside listener (browser only)
	$: if (isOpen && browser) {
		setTimeout(() => {
			document.addEventListener('click', handleClickOutside);
		}, 0);
	} else if (browser) {
		document.removeEventListener('click', handleClickOutside);
	}
</script>

<div 
	class="relative" 
	data-dropdown="searchable-select"
	role="combobox"
	aria-expanded={isOpen}
	aria-haspopup="listbox"
	aria-controls="options-listbox"
	tabindex="0"
	on:keydown={handleKeydown}
>
	<div class="relative">
		<input
			type="search"
			bind:value={searchQuery}
			on:focus={toggleDropdown}
			on:input={() => { if (!isOpen) isOpen = true; }}
			placeholder={placeholder}
			disabled={disabled}
			class="w-full rounded-lg px-4 py-3 bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm h-12 pr-10"
		/>
		
		<!-- Dropdown arrow -->
		<div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
			<svg 
				class="w-4 h-4 text-gray-400 transition-transform {isOpen ? 'rotate-180' : ''}" 
				fill="none" 
				viewBox="0 0 24 24" 
				stroke="currentColor"
			>
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
			</svg>
		</div>
	</div>
	
	<!-- Dropdown options -->
	{#if isOpen}
		<div 
			id="options-listbox"
			class="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto"
			role="listbox"
		>
			{#if filteredOptions.length === 0}
				<div class="px-4 py-3 text-sm text-gray-500 text-center">
					Tidak ada hasil ditemukan
				</div>
			{:else}
				{#each filteredOptions as option}
					<button
						type="button"
						class="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0"
						role="option"
						on:click={() => selectOption(option)}
					>
						<span class="font-medium">{option.name}</span>
					</button>
				{/each}
			{/if}
		</div>
	{/if}
</div>
