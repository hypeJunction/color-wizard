<script>
import {
  Scatter,
  mixins,
} from 'vue-chartjs';

const { reactiveProp } = mixins;

export default {
  extends: Scatter,
  mixins: [reactiveProp],
  props: ['options'],
  mounted() {
    this.renderChart(this.chartData, this.options);
  },
};
</script>
