import FullView from '@components/FullView/FullView.svelte';

export const rootSynonymItemFilter = (label, filterText, option) => {
	return (
		label.toLowerCase().includes(filterText.toLowerCase()) ||
		option?.additionalLabel
			?.toLowerCase()
			?.includes(filterText.toLowerCase())
	);
};

export const getRootLinkComponentConfig = () => {
	return {
		renderFullViewComponent: {
			component: FullView,
			props: {
				hrefPrefix: '#/roots/',
			},
		},
	};
};

export const getRootLinkCellConfig = (cell) => {
	const items = cell.getValue();
	if (!items) return '-';

	return items.map(Object.values).flat();
};
