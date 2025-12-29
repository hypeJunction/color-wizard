<template>
  <div class="mini-palette">
    <div
        v-for="(row, rowIndex) in swatches"
        :key="rowIndex"
        class="palette-row"
    >
      <div
          v-for="(swatch, colIndex) in row"
          :key="colIndex"
          class="color-box"
          :class="{ negative: swatch.contrast < contrast }"
          :style="{ backgroundColor: swatch.toHslString(), color: swatch.text }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Swatch {
  toHslString: () => string;
  text: string;
  contrast: number;
}

defineProps<{
  swatches: Swatch[][];
  contrast: number;
}>();
</script>

<style scoped>
.mini-palette {
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: 2px;
  padding: 12px;
}

.palette-row {
  overflow: hidden;
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  grid-gap: 2px;
}

.color-box {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
}

.color-box.negative::after {
  content: "\00d7";
  font-size: 1em;
}
</style>
