<template>
  <div>
    <div class="ui top attached tabular menu">
      <a
        v-for="tab in tabs"
        :key="tab.id"
        :class="{ item: true, active: selected === tab.id }"
        @click.prevent="selected = tab.id"
      >
        {{ tab.label }}
      </a>
    </div>

    <div class="ui bottom attached active tab segment">
      <slot :name="selected" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface Tab {
  id: string;
  label: string;
  selected?: boolean;
}

const props = defineProps<{
  tabs: Tab[];
}>();

const initialTab = props.tabs.find((tab) => tab.selected);
const selected = ref(initialTab ? initialTab.id : props.tabs[0].id);
</script>
