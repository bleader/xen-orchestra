<template>
  <VtsInputWrapper :label :message="messages">
    <VtsSelect :id accent="brand" />
  </VtsInputWrapper>
</template>

<script lang="ts" setup>
import type { InputWrapperMessage } from '@core/components/input-wrapper/VtsInputWrapper.vue'
import type { FormSelectId } from '@core/packages/form-select'
import VtsInputWrapper from '@core/components/input-wrapper/VtsInputWrapper.vue'
import VtsSelect from '@core/components/select/VtsSelect.vue'
import { toArray } from '@core/utils/to-array.utils.ts'
import { computed } from 'vue'

const { info, error } = defineProps<{
  id: FormSelectId
  label: string
  error?: InputWrapperMessage
  info?: string
}>()

const messages = computed<InputWrapperMessage>(() => [
  ...(info !== undefined ? [info] : []),
  ...(error !== undefined ? toArray(error) : []),
])
</script>
