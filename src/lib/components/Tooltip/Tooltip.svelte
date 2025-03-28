<script>
	import { tick } from 'svelte';

	export let title = '';
	export let disabled = false;
	export let showPointer = true;
	export let className = '';

	let isHovered = false;
	let tooltipElement;
	let tooltipContainerElement;
	let x, y;
	let showTimeout;
	let xMarkerPos = 'center';
	let yMarkerPos = 'above';

	const calculateTooltipDimension = () => {
		let children = tooltipContainerElement.children[0];
		const rect = children.getBoundingClientRect();
		if (rect.top > window.innerHeight - rect.bottom) {
			x = -(tooltipElement.clientHeight + 5);
			yMarkerPos = 'above';
		} else {
			x = children.clientHeight + 5;
			yMarkerPos = 'below';
		}

		if (
			tooltipElement.clientWidth / 2 <
				rect.left + children.clientWidth / 2 &&
			tooltipElement.clientWidth / 2 <
				rect.right + children.clientWidth / 2
		) {
			y = Math.round(tooltipContainerElement.clientWidth / 2);
			xMarkerPos = 'center';
		} else if (
			tooltipElement.clientWidth / 2 <
			rect.left + children.clientWidth / 2
		) {
			y = Math.round(-(tooltipElement.clientWidth / 2)) + 5;
			xMarkerPos = 'start';
		} else {
			y = Math.round(tooltipElement.clientWidth / 2) + 5;
			xMarkerPos = 'end';
		}
	};

	function mouseEnter() {
		showTimeout = setTimeout(async () => {
			isHovered = true;
			await tick();
			calculateTooltipDimension();
		});
	}
	function mouseLeave() {
		clearTimeout(showTimeout);

		setTimeout(() => {
			isHovered = false;
		}, 500);
	}
</script>

<div
	on:mouseenter={mouseEnter}
	on:mouseleave={mouseLeave}
	bind:this={tooltipContainerElement}
	class="tooltip-container"
>
	<slot />
	{#if !disabled}
		<div
			class="tooltip {className || ''}"
			style="top: {x}px;left: {y}px"
			class:show-pointer={showPointer}
			class:tooltip--hidden={!isHovered}
			class:x-pos--start={xMarkerPos === 'start'}
			class:x-pos--center={xMarkerPos === 'center'}
			class:x-pos--end={xMarkerPos === 'end'}
			class:y-pos--above={yMarkerPos === 'above'}
			class:y-pos--below={yMarkerPos === 'below'}
			bind:this={tooltipElement}
		>
			{@html title}
		</div>
	{/if}
</div>

<style src="./style.scss"></style>
