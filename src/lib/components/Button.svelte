<script lang="ts">
	export let text: string;
	export let type: 'button' | 'link' = 'button';
	export let variant: 'large' | 'medium' | 'small' = 'medium';
	export let size: 'full' | 'auto' = 'auto';
	export let href = '#';
	export let className = ""

	const baseClasses =
		'inline-flex items-center justify-center gap-2 rounded-full bg-red-600 text-white font-semibold text-center shadow-lg transition-all duration-200 hover:bg-red-700 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-500';

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
	<a href={href} class={classes + ' ' + className}>
		{text}
	</a>
{:else}
	<button type="button" class={classes + ' ' + className}>
		{text}
	</button>
{/if}


