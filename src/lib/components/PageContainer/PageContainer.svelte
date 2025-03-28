<script>
	export let title = '';
</script>

<main class="page-container">
	{#if title}
		<header class="page-container__header">
			<h2 class="page-container__header-title">{@html title}</h2>
			<slot name="header" />
		</header>
	{/if}
	<section class="page-container__content">
		<slot name="content" />
	</section>
</main>

<style lang="scss">
	.page-container {
		display: flex;
		flex-direction: column;
		height: 100vh;
		width: 100%;
		overflow-x: hidden;
		overflow-y: auto;

		&__header {
			background: #fff;
			padding: 20px 20px 15px;
		}
		&__header-title {
			font-size: 25px;
			font-weight: 400;
			color: #565656;
			text-transform: capitalize;
		}
		&__content {
			flex-grow: 1;
			background: #f4f4f4;
			padding: 25px;
		}
	}
</style>
