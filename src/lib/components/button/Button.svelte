<script lang="ts">
  export let text: string;
  export let autofocus: boolean = false
</script>
<!-- svelte-ignore a11y-autofocus -->
<button on:click autofocus>{text}</button>

