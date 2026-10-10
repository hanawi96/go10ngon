<script lang="ts">
  let count = $state(0);
</script>

<section>
  <h2>Kiểm tra Svelte 5</h2>

  <p>Đã nhấn: {count} lần</p>

  <button type="button" onclick={() => (count += 1)}> Nhấn để kiểm tra </button>
</section>
