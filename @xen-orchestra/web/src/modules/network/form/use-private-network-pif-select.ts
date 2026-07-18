import { useXoNetworkCollection } from '@/modules/network/remote-resources/use-xo-network-collection.ts'
import { type FrontXoPif, useXoPifCollection } from '@/modules/pif/remote-resources/use-xo-pif-collection.ts'
import { type FrontXoPool } from '@/modules/pool/remote-resources/use-xo-pool-collection.ts'
import { useFormSelect } from '@core/packages/form-select'
import { useArrayFilter } from '@vueuse/shared'
import { type Ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

export function canSupportPrivateNetwork(pool: FrontXoPool | undefined, pif: FrontXoPif) {
  return (
    (pif.isBondMaster || pif.physical || pif.vlan !== -1) &&
    pif.mode !== 'None' &&
    !pif.isBondSlave &&
    pif.$host === pool?.master
  )
}

export function usePrivateNetworkPifSelect(
  selectedPool: Ref<FrontXoPool | undefined>,
  model: Ref<FrontXoPif['id'] | undefined>
) {
  const { t } = useI18n()
  const { pifs } = useXoPifCollection()
  const { getNetworkById } = useXoNetworkCollection()

  const usablePifs = useArrayFilter(pifs, pif => canSupportPrivateNetwork(selectedPool.value, pif))

  const { id: pifSelectId } = useFormSelect(usablePifs, {
    searchable: true,
    required: true,
    placeholder: t('new-network:select-interface'),
    model,
    option: {
      label: pif => getNetworkById(pif.$network)?.name_label ?? pif.device,
      value: 'id',
    },
  })

  watch(
    () => selectedPool.value?.id,
    () => {
      model.value = undefined
    }
  )

  return { pifSelectId }
}
