<template>
  <div class="mini-palette">
    <div
        v-for="(row, rowIndex) in swatches"
        :key="rowIndex"
        class="palette-row"
        :style="{ '--columns': levelCount }"
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
import { computed } from 'vue';

interface Swatch {
  toHslString: () => string;
  text: string;
  contrast: number;
}

const props = defineProps<{
  swatches: Swatch[][];
  contrast: number;
}>();

const levelCount = computed(() => props.swatches[0]?.length ?? 10);
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
  grid-template-columns: repeat(var(--columns), 1fr);
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
  font-size: calc(100% - 2px);
  line-height: 0;
}
</style>
