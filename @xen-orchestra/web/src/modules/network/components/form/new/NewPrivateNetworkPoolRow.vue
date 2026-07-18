<template>
  <div class="new-private-network-pool-row">
    <NetworkFormSelect v-bind="poolSelectBindings" />
    <NetworkFormSelect v-bind="pifSelectBindings" />
    <UiButtonIcon
      icon="fa:trash"
      accent="danger"
      size="medium"
      class="remove-button"
      :aria-label="t('action:delete')"
      @click="emit('remove')"
    />
  </div>
</template>

<script lang="ts" setup>
import NetworkFormSelect from '@/modules/network/components/form/new/inputs/NetworkFormSelect.vue'
import { usePrivateNetworkPifSelect } from '@/modules/network/form/use-private-network-pif-select.ts'
import { type FrontXoPif } from '@/modules/pif/remote-resources/use-xo-pif-collection.ts'
import { type FrontXoPool, useXoPoolCollection } from '@/modules/pool/remote-resources/use-xo-pool-collection.ts'
import UiButtonIcon from '@core/components/ui/button-icon/UiButtonIcon.vue'
import { useFormSelect } from '@core/packages/form-select'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { excludedPoolIds } = defineProps<{
  excludedPoolIds: FrontXoPool['id'][]
}>()

const emit = defineEmits<{
  remove: []
}>()

const poolId = defineModel<FrontXoPool['id'] | undefined>('poolId', { required: true })
const pifId = defineModel<FrontXoPif['id'] | undefined>('pifId', { required: true })

const { t } = useI18n()

const { pools, useGetPoolById } = useXoPoolCollection()

const selectablePools = computed(() =>
  pools.value.filter(pool => pool.id === poolId.value || !excludedPoolIds.includes(pool.id))
)

const { id: poolSelectId } = useFormSelect(selectablePools, {
  searchable: true,
  required: true,
  model: poolId,
  option: {
    label: 'name_label',
    value: 'id',
  },
})

const selectedPool = useGetPoolById(() => poolId.value)

const { pifSelectId } = usePrivateNetworkPifSelect(selectedPool, pifId)

const poolSelectBindings = computed(() => ({ id: poolSelectId, label: t('pool') }))
const pifSelectBindings = computed(() => ({ id: pifSelectId, label: t('interface') }))
</script>

<style lang="postcss" scoped>
.new-private-network-pool-row {
  display: flex;
  align-items: start;
  flex-direction: column;
  gap: 2.4rem;

  & > * {
    width: 100%;
    min-width: 0;
  }

  @media (--medium-or-large) {
    flex-direction: row;
    gap: 8rem;
    max-width: 88rem;
  }

  .remove-button {
    align-self: center;
    width: auto;

    @media (--medium-or-large) {
      margin-block-start: 2.4rem;
    }
  }
}
</style>
