<script>
	import Button from '@components/Button/Button.svelte';
	import Modal from '@components/Modal/Modal.svelte';
	import {
		transformSnakeToCapitalized,
		transformToTitleCase,
	} from '@utils/utility.js';
	import { diffWords } from 'diff';

	export let onClose = () => {};
	export let editedData = [];
	export let onSubmit = () => {};

	function getKeys(obj) {
		return obj ? Object.keys(obj) : [];
	}

	function isPlainObject(val) {
		return val && typeof val === 'object';
	}

	function flattenDiffData(entity) {
		const results = {};
		const entityHeader = entity.label;
		const entityHeaderKeys = new Set([
			...Object.keys(entity.original ?? {}),
			...Object.keys(entity.edited ?? {}),
		]);

		function walk(path, origVal, editVal) {
			if (isPlainObject(origVal) && isPlainObject(editVal)) {
				const allKeys = new Set([
					...getKeys(origVal),
					...getKeys(editVal),
				]);
				for (const key of allKeys) {
					walk(`${path} ${key}`, origVal?.[key], editVal?.[key]);
				}
			} else if (isPlainObject(origVal) || isPlainObject(editVal)) {
				const allKeys = new Set([
					...getKeys(origVal),
					...getKeys(editVal),
				]);
				for (const key of allKeys) {
					walk(`${path} ${key}`, origVal?.[key], editVal?.[key]);
				}
			} else {
				if (origVal !== editVal) {
					const words = diffWords(origVal ?? '', editVal ?? '');
					const hasChanges = words.some((w) => w.added || w.removed);
					if (hasChanges) {
						let parts = path
							.replace(entityHeader, '')
							.trim()
							.split(' ');

						let headerKey = '';
						if (
							parts.length > 0 &&
							entityHeaderKeys.has(parts[0])
						) {
							headerKey = parts.shift();
						}

						const entry = parts.find((part) => !isNaN(part));
						const field = parts
							.slice(parts.indexOf(entry) + 1)
							.join(' ');

						if (!results[entityHeader]) {
							results[entityHeader] = {};
						}
						if (!results[entityHeader][headerKey]) {
							results[entityHeader][headerKey] = {};
						}

						const entryKey = entry || '#None';
						if (!results[entityHeader][headerKey][entryKey]) {
							results[entityHeader][headerKey][entryKey] = [];
						}

						results[entityHeader][headerKey][entryKey].push({
							field,
							words,
						});
					}
				}
			}
		}

		walk(entity.label || '', entity.original, entity.edited);

		return results;
	}
</script>

<Modal title="Edited values" showModal={true} {onClose}>
	<div slot="content" class="edited-values">
		<p>Are you sure you want to save these changes?</p>
		{#each editedData as entity, i}
			{#if entity.showDiff}
				{@const diffItems = flattenDiffData(entity)}
				{#each Object.entries(diffItems) as [section, entries]}
					<div class="edited-values__section">
						<div class="edited-values__title">
							{`${i + 1}. ${transformToTitleCase(transformSnakeToCapitalized(section))}`}
						</div>

						{#each Object.entries(entries) as [entry, entryValues]}
							<div class="edited-values__section_label">
								{transformToTitleCase(
									transformSnakeToCapitalized(entry)
								)}
							</div>

							{#each Object.entries(entryValues) as [index, changes]}
								{#if index !== '#None'}
									<div class="edited-values__header_label">
										Entry {parseInt(index) + 1}
									</div>
								{/if}

								{#each changes as diff}
									<div class="edited-values__container">
										<div class="edited-values__label">
											{transformToTitleCase(
												transformSnakeToCapitalized(
													diff.field
												)
											)}
										</div>
										<div class="edited-values__value">
											{#each diff.words as word}
												{#if word.added}
													<ins class="inserted"
														>{word.value}</ins
													>
												{:else if word.removed}
													<del class="deleted"
														>{word.value}</del
													>
												{:else}
													{word.value}
												{/if}
											{/each}
										</div>
									</div>
								{/each}
							{/each}
						{/each}
					</div>
				{/each}
			{:else}
				<div class="edited-values__label">
					{`${i + 1}. ${transformToTitleCase(transformSnakeToCapitalized(entity.label))} -`}
				</div>
				<div class="edited-values__value">
					<del class="deleted">
						{entity.original || 'NA'}
					</del>
					&rarr;
					<ins class="inserted">
						{entity.edited || 'NA'}
					</ins>
				</div>
			{/if}
		{/each}

		<div class="edited-values__actions">
			<Button onClick={onClose} type="secondary">Cancel</Button>
			<Button
				type="primary"
				onClick={() => {
					onSubmit();
					onClose();
				}}
			>
				Save
			</Button>
		</div>
	</div>
</Modal>

<style src="./style.scss"></style>
