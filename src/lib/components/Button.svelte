<script lang="ts">
	export let text: string;
	export let type: 'button' | 'link' = 'button';
	export let variant: 'large' | 'medium' | 'small' = 'medium';
	export let size: 'full' | 'auto' = 'auto';
	export let color: 'red' | 'white' | 'gray' | 'green' | 'blue' | 'yellow' = 'red';
	export let href = '#';
	export let target = '';
	export let rel = '';
	export let className = ""

	const colorClasses = 
		color === 'white' 
			? 'bg-white text-gray-900 border border-gray-300 shadow-md hover:bg-gray-50 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-500'
			: color === 'gray'
				? 'bg-gray-600 text-white shadow-lg hover:bg-gray-700 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-500'
				: color === 'green'
					? 'bg-green-600 text-white shadow-lg hover:bg-green-700 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-green-500'
					: color === 'blue'
						? 'bg-blue-600 text-white shadow-lg hover:bg-blue-700 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500'
						: color === 'yellow'
							? 'bg-yellow-500 text-white shadow-lg hover:bg-yellow-600 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-yellow-500'
							: 'bg-red-600 text-white shadow-lg hover:bg-red-700 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-500';

	const baseClasses = 
		`inline-flex items-center justify-center gap-2 rounded-full font-semibold text-center transition-all duration-200 ${colorClasses}`;

	const variantClasses =
		variant === 'large'
			? 'text-lg px-8 py-4'
			: variant === 'medium'
				? 'text-base px-6 py-3'
				: 'text-sm px-4 py-2';

	const sizeClasses = size === 'full' ? 'w-full justify-center' : 'w-auto';

	const classes = `${baseClasses} ${variantClasses} ${sizeClasses}`;
</script>

{#if type === 'link'}
	<a href={href} {target} {rel} class={classes + ' ' + className} on:click>
		{text}
	</a>
{:else}
	<button type="button" class={classes + ' ' + className} on:click>
		{text}
	</button>
{/if}


