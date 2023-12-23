<script lang="ts">
  import { Button, Modal } from "$lib"
  let showModal = false;
</script>
  
<h1>Zemljopis</h1>
<Button on:click={() => (showModal = true)} text="Napravi Sobu"></Button>
<Button text="Pridruzi Se Sobi"></Button>
<Button text="Random Soba"></Button>

<Modal bind:showModal>
  <h2 slot="header">
		Napravi Sobu
	</h2>
  <h1>Test1</h1>
	<h1>Test2</h1>
</Modal>