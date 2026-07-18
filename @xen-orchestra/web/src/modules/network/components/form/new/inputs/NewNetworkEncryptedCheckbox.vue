<template>
  <div class="new-network-encrypted-checkbox">
    <UiCheckbox v-model="model" accent="brand">
      {{ t('encrypted') }}
    </UiCheckbox>
    <UiInfo accent="warning">{{ t('new-network:encryption-warning') }}</UiInfo>
  </div>
</template>

<script lang="ts" setup>
import UiCheckbox from '@core/components/ui/checkbox/UiCheckbox.vue'
import UiInfo from '@core/components/ui/info/UiInfo.vue'
import { useI18n } from 'vue-i18n'

const model = defineModel<boolean>({ required: true })

const { t } = useI18n()
</script>

<style lang="postcss" scoped>
.new-network-encrypted-checkbox {
  display: flex;
  flex-direction: column;
  align-items: start;
  gap: 1.6rem;
}
</style>
