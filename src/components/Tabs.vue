<template>
  <div>
    <div class="ui top attached tabular menu">
      <a
        v-for="tab in tabs"
        :key="tab.id"
        :class="{item: true, active: selected === tab.id}"
        @click.prevent="selected = tab.id"
      >
        {{ tab.label }}
      </a>
    </div>

    <div class="ui bottom attached active tab segment" :key="selected">
      <slot :name="selected"></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Tabs',
  props: {
    tabs: {
      type: Array,
      required: true,
    },
  },
  data() {
    const selected = this.tabs.find((tab) => tab.selected);

    return {
      selected: selected ? selected.id : this.tabs[0].id,
    };
  },
};
</script>

<style scoped>

</style>
