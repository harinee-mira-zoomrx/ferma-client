<script>
	import Button from '@components/Button/Button.svelte';
	import Modal from '@components/Modal/Modal.svelte';
	import SegmentPill from '@components/SegmentPill/SegmentPill.svelte';
	import { VERIFICATION_STATUS } from '@utils/constants.js';
	import { transformSnakeToCapitalized } from '@utils/utility';

	export let onClose;
	export let onUpdateStatus = (verificationStatus) => {};

	let verificationStatus;
	let verificationStatusItems = [VERIFICATION_STATUS.NOT_VERIFIED, VERIFICATION_STATUS.VERIFIED];

</script>

<Modal showModal={true} showClose={false} {onClose}>
	<div slot="content" class="verification">
		<div class="verification__toggle">
			<slot name="message"></slot>
			<SegmentPill
				name="verificationStatus"
				bind:value={verificationStatus}
				items={verificationStatusItems.map((key) => {
						return {
							label: transformSnakeToCapitalized(key),
							value: key,
						};
					})
				}
			/>
		</div>
		<div class="verification__action">
			<Button type="secondary" onClick={onClose}>Cancel</Button>
			<Button type="primary" onClick={() => onUpdateStatus(verificationStatus.value)}>Confirm</Button>
		</div>
	</div>
</Modal>

<style lang="scss">
  .verification {
    display: flex;
    flex-direction: column;
    gap: 10px;

    &__toggle {
      display: flex;
      flex-direction: column;
      row-gap: 10px;
    }

    &__action {
      display: flex;
      margin-top: 10px;
      justify-content: flex-end;
      gap: 20px;
    }
  }
</style>
