<template>
  <div>
    <h1>Trading Signals</h1>
    <p>SMA Result: {{ smaResult }}</p>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { calculateSMA } from '../utils/tradingSignals';

export default defineComponent({
  data() {
    return {
      smaResult: '',
    };
  },
  mounted() {
    const data = [40, 30, 20];
    this.smaResult = calculateSMA(data, 3); // Calculate SMA with period of 3
  },
});
</script>
