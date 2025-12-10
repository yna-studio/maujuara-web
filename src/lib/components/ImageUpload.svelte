<script lang="ts">
	export let value: string = ''; // base64 string or URL
	export let label: string = 'Image';
	export let id: string = 'image-upload';
	export let required: boolean = false;
	export let accept: string = 'image/*';
	export let previewSize: string = 'w-20 h-20';
	export let showOldImage: boolean = true;
	export let oldImageUrl: string = '';

	let fileInput: HTMLInputElement;
	let previewUrl: string = '';
	let fileName: string = '';
	let isDragging: boolean = false;

	// Initialize preview URL
	$: if (value) {
		if (value.startsWith('data:')) {
			previewUrl = value;
		} else {
			previewUrl = value;
		}
	} else if (oldImageUrl && showOldImage) {
		previewUrl = oldImageUrl;
	} else {
		previewUrl = '';
	}

	function handleFileSelect(files: FileList | null) {
		if (!files || files.length === 0) return;

		const file = files[0];
		if (!file.type.startsWith('image/')) {
			alert('Please select an image file');
			return;
		}

		// Check file size (max 5MB)
		if (file.size > 5 * 1024 * 1024) {
			alert('Image size must be less than 5MB');
			return;
		}

		fileName = file.name;

		const reader = new FileReader();
		reader.onload = (e) => {
			const result = e.target?.result as string;
			value = result; // Set base64 value
			previewUrl = result;
		};
		reader.readAsDataURL(file);
	}

	function handleInputChange(event: Event) {
		const target = event.target as HTMLInputElement;
		handleFileSelect(target.files);
	}

	function handleDrop(event: DragEvent) {
		event.preventDefault();
		isDragging = false;
		handleFileSelect(event.dataTransfer?.files);
	}

	function handleDragOver(event: DragEvent) {
		event.preventDefault();
		isDragging = true;
	}

	function handleDragLeave() {
		isDragging = false;
	}

	function triggerFileInput() {
		fileInput.click();
	}

	function removeImage() {
		value = '';
		previewUrl = '';
		fileName = '';
		if (fileInput) {
			fileInput.value = '';
		}
	}

	function useOldImage() {
		if (oldImageUrl) {
			value = oldImageUrl;
			previewUrl = oldImageUrl;
		}
	}
</script>

<div class="space-y-4">
	<label for={id} class="block text-sm font-medium text-gray-700">
		{label} {required ? '*' : ''}
	</label>

	<!-- File Input (hidden) -->
	<input
		type="file"
		bind:this={fileInput}
		id={id}
		accept={accept}
		on:change={handleInputChange}
		class="hidden"
		required={required && !value}
	/>

	<!-- Upload Area -->
	<div
		class="relative border-2 border-dashed rounded-lg p-6 text-center transition-colors {isDragging
			? 'border-red-500 bg-red-50'
			: 'border-gray-300 hover:border-gray-400'}"
		on:drop={handleDrop}
		on:dragover={handleDragOver}
		on:dragleave={handleDragLeave}
		role="button"
		tabindex="0"
		on:click={triggerFileInput}
		on:keydown={(e) => { if (e.key === 'Enter' || e.key === ' ') triggerFileInput(); }}
	>
		<div class="space-y-2">
			<!-- Upload Icon -->
			<div class="flex justify-center">
				<svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
				</svg>
			</div>

			<div class="text-sm text-gray-600">
				<p class="font-medium">Click to upload or drag and drop</p>
				<p class="text-xs">PNG, JPG, GIF up to 5MB</p>
			</div>

			{#if fileName}
				<div class="text-sm text-green-600 font-medium">
					Selected: {fileName}
				</div>
			{/if}
		</div>
	</div>

	<!-- Preview Section -->
	{#if previewUrl}
		<div class="flex items-center space-x-4">
			<div class="flex-shrink-0">
				<img
					src={previewUrl}
					alt="Image preview"
					class="{previewSize} object-cover rounded-md border border-gray-200"
					on:error={(e) => {
						const target = e.target as HTMLImageElement;
						if (target) {
							target.style.display = 'none';
						}
					}}
				/>
			</div>
			
			<div class="flex-1 space-y-2">
				<div class="text-sm text-gray-600">
					{value.startsWith('data:') ? 'New image selected' : 'Current image'}
				</div>
				
				<div class="flex space-x-2">
					<button
						type="button"
						on:click={removeImage}
						class="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
					>
						Remove
					</button>
					
					{#if oldImageUrl && showOldImage && value !== oldImageUrl}
						<button
							type="button"
							on:click={useOldImage}
							class="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
						>
							Use Original
						</button>
					{/if}
				</div>
			</div>
		</div>
	{:else if oldImageUrl && showOldImage}
		<div class="flex items-center space-x-4">
			<div class="flex-shrink-0">
				<img
					src={oldImageUrl}
					alt="Current image"
					class="{previewSize} object-cover rounded-md border border-gray-200"
					on:error={(e) => {
						const target = e.target as HTMLImageElement;
						if (target) {
							target.style.display = 'none';
						}
					}}
				/>
			</div>
			
			<div class="flex-1">
				<div class="text-sm text-gray-600">Current image</div>
			</div>
		</div>
	{:else}
		<div class="text-sm text-gray-400">No image selected</div>
	{/if}

	<!-- Hidden validation for required field -->
	{#if required && !value}
		<input
			type="text"
			class="hidden"
			required
			on:invalid={(e) => {
				e.preventDefault();
				alert(`${label} is required`);
			}}
		/>
	{/if}
</div>
