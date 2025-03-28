<script>
	import { loader } from '@components/Loader/Loader';
	import Button from '@components/Button/Button.svelte';
	import { push } from 'svelte-spa-router';
	import { is_logout } from '@stores/auth.store';
	import fermaSvg from '@svg/ferma.svg';
	import Alert from '@components/Alert/Alert.svelte';
	import { login } from '@models/user';

	const authenticate = async () => {
		try {
			loader.show();
			is_logout.remove();
			await login();
			push('/roots');
		} finally {
			loader.hide();
		}
    }
</script>


<div class="login">
	<div class="login__container">
		<section class="login__header">
			<img src={fermaSvg} alt="ferma logo" />
			Support Portal
		</section>
		<p>
			You have been logged out. Click the button below to log in again.
		</p>
		<section class="login__details">
						<div class="login__login-btn">
				<Button
					type="primary"
					name="Login"
					onClick={() => {
						authenticate();
					}}
				/>
				
			</div>
			<Alert
				name = "Login Alert"
				severity="warning" 
				message="If you’re new to the Support Portal, contact the development team to request access" />

		</section>
		
	</div>
</div>

<style src="./style.scss"></style>
