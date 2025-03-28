<script>
    import DynamicForm from '@components/DynamicForm/DynamicForm.svelte';
    import Modal from '@components/Modal/Modal.svelte';
    import { COMPONENT_TYPES } from '@utils/constants';
    import { BULK_EVENT, BULK_EVENT_ROUTE, BULK_SAMPLE_FILE } from '@models/bulkOperations.js';
    import { loader } from '@components/Loader/Loader.js';
    import { runBulkOperation } from '@models/bulkOperations.js';
    import { toasts } from '@components/Toast/toasts.js';
    import { downloadFile } from '@utils/api.js';

    export let onClose;
    export let onFileUpload = () => {};

    let selectedBulkOperation = null;
    let sampleFileName = '';

    const handleBulkOperationSelect = (event) => {
        const selectedValue = event.detail.value;
        selectedBulkOperation = selectedValue;
        sampleFileName = BULK_SAMPLE_FILE[Object.keys(BULK_EVENT).find(key => BULK_EVENT[key] === selectedValue)];
    };

    const handleBulkOperationClear = () => {
        selectedBulkOperation = null;
        sampleFileName = '';
    }

    const handleDownload = async () => {
        await downloadFile(`/background_process/download_file`, {
            file_name: sampleFileName,
            is_cloud_file: false
        })
    }

    $: config = [
        {
            type: COMPONENT_TYPES.SELECT_BOX,
            props: {
                name: 'bulk_event',
                label: 'Bulk Operation',
                placeholder: 'Select Bulk Operation',
                items: Object.values(BULK_EVENT),
                required: true,
                value: selectedBulkOperation,
                onSelect: handleBulkOperationSelect,
                onClear: handleBulkOperationClear,
                clearable: true,
            },
        },
        {
            type: COMPONENT_TYPES.BUTTON,
            props: [
                {
                    name:  sampleFileName,
                    type: 'link',
                    value: sampleFileName,
                    onClick: handleDownload
                },
            ],
        },
		{
			type: COMPONENT_TYPES.INPUT,
			props: {
                name: 'file_upload',
				label: 'Upload CSV',
				required: true,
                type: 'file',
                additionalProps: {
                    accept: '.csv',
                    multiple: false
                },
			},
		},
		{
			type: COMPONENT_TYPES.BUTTON,
			props: [
				{
					buttonType: 'submit',
					type: 'primary',
					name: 'RUN',
				},
			],
		},
	];

    async function onSubmit(e) {
        try {
            loader.show();
            const data = { ...e.detail };

            const formData = new FormData();
            formData.append('file', data.file_upload);

            let route = Object.keys(BULK_EVENT).find(key => BULK_EVENT[key] === selectedBulkOperation);
            let response = await runBulkOperation(BULK_EVENT_ROUTE[route], formData);
            
            onFileUpload();
            toasts.success(response);
            onClose();
        } catch (error) {
            toasts.error(error.message || 'An unexpected error occurred.');
        } finally {
            loader.hide();
        }
    }

</script>

<Modal title="Upload File" showModal={true} {onClose}>
    <svelte:fragment slot="content">
        <DynamicForm {config} on:submit={onSubmit} />
    </svelte:fragment>
</Modal>