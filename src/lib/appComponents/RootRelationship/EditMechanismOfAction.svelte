<script>
	import Modal from '@components/Modal/Modal.svelte';
	import DynamicForm from '@components/DynamicForm/DynamicForm.svelte';
	import { COMPONENT_TYPES } from '@utils/constants.js';
	import { loader } from '@components/Loader/Loader.js';
	import { updateActiveIngredientMoA } from '@models/activeIngredient.js';
	import { toasts } from '@components/Toast/toasts.js';

	export let data = {}
	export let onClose;
	export let refreshMechanismOfActionTable = () => {};

	let selectedMechanismOfAction = {};

	$: config = [
		{
			type: COMPONENT_TYPES.TEXTAREA,
			props: {
				name: 'mechanism_of_action',
				label: 'Mechanism of Action',
				placeholder: 'Enter mechanism of action',
				value: data?.mechanism_of_action,
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
			await updateActiveIngredientMoA(data.active_ingredient_root_id, e.detail);
			await refreshMechanismOfActionTable();
			toasts.success('Active ingredient Mechanism of Action data updated successfully.');
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
	title={`Edit Mechanism of Action`}
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