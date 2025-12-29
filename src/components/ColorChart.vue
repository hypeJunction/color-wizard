<template>
  <Scatter
    :data="chartData"
    :options="options"
  />
</template>

<script setup lang="ts">
import { Scatter } from 'vue-chartjs';
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  type ChartData,
  type ChartOptions,
} from 'chart.js';

ChartJS.register(LinearScale, PointElement, Tooltip, Legend);

defineProps<{
  chartData: ChartData<'scatter'>;
  options: ChartOptions<'scatter'>;
}>();
</script>
