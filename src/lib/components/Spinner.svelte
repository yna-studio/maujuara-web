<script lang="ts">
	export let size: 'small' | 'medium' | 'large' = 'medium';
	export let color: 'primary' | 'secondary' | 'white' = 'primary';
</script>

<div class="flex justify-center items-center">
	<div 
		class="animate-spin rounded-full border-2 border-gray-300 border-t-current"
		class:h-4={size === 'small'}
		class:h-8={size === 'medium'}
		class:h-12={size === 'large'}
		class:w-4={size === 'small'}
		class:w-8={size === 'medium'}
		class:w-12={size === 'large'}
		class:border-t-red-600={color === 'primary'}
		class:border-t-gray-600={color === 'secondary'}
		class:border-t-white={color === 'white'}
	></div>
</div>
