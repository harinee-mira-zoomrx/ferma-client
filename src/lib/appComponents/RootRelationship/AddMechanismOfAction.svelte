<script>
	import Modal from '@components/Modal/Modal.svelte';
	import DynamicForm from '@components/DynamicForm/DynamicForm.svelte';
	import { COMPONENT_TYPES } from '@utils/constants.js';
	import { loader } from '@components/Loader/Loader.js';
	import { createActiveIngredientMoA } from '@models/activeIngredient.js';
	import { toasts } from '@components/Toast/toasts.js';

	export let root = {};
	export let onClose;
	export let refreshMechanismOfActionTable = () => {};

	let mechanismOfAction = null;

	$: config = [
		{
			type: COMPONENT_TYPES.TEXTAREA,
			props: {
				name: 'mechanism_of_action',
				label: 'Mechanism of Action',
				placeholder: 'Enter mechanism of action',
				value: mechanismOfAction,
				width: '100%',
			},
		},
		{
			type: COMPONENT_TYPES.BUTTON,
			props: [
				{
					name: 'Save',
					type: 'primary',
					buttonType: 'submit',
				},
			],
		},
	];

	const onSubmit = async (e) => {
		try {
			loader.show();
			await createActiveIngredientMoA({
				...e.detail,
				active_ingredient_root_id: root.id,
			});
			await refreshMechanismOfActionTable();
			toasts.success('Active ingredient Mechanism of Action data created successfully.');
			onClose();
		} catch (error) {
			config = config;
			toasts.error(error.message || 'An unexpected error occurred.');
		} finally {
			loader.hide();
		}
	};
</script>

<Modal
	title={`Add Mechanism of Action`}
	showModal={true}
	{onClose}
>
	<svelte:fragment slot="content">
		<DynamicForm
			{config}
			fullWidth={true}
			columns={3}
			showEditedValues={true}
			on:submit={onSubmit}
		/>
	</svelte:fragment>
</Modal>