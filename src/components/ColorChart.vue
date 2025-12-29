<template>
  <Scatter :data="chartData" :options="options" />
</template>

<script setup>
import { Scatter } from 'vue-chartjs';
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(LinearScale, PointElement, Tooltip, Legend);

defineProps({
  chartData: {
    type: Object,
    required: true,
  },
  options: {
    type: Object,
    required: true,
  },
});
</script>
