import { type FrontXoHost, useXoHostCollection } from '@/modules/host/remote-resources/use-xo-host-collection.ts'
import { type BaseNetworkFormData, useNetworkFormBase } from '@/modules/network/form/use-network-form-base.ts'
import { usePrivateNetworkPifSelect } from '@/modules/network/form/use-private-network-pif-select.ts'
import type {
  NewPrivateNetworkPayload,
  PrivateNetworkEncapsulation,
} from '@/modules/network/jobs/xo-private-network-create.job.ts'
import { type FrontXoPif } from '@/modules/pif/remote-resources/use-xo-pif-collection.ts'
import { type FrontXoPool, useXoPoolCollection } from '@/modules/pool/remote-resources/use-xo-pool-collection.ts'
import { useFormBindings } from '@core/packages/form-bindings'
import { useFormSelect } from '@core/packages/form-select'
import { computed, type MaybeRefOrGetter, reactive, toRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'

export const PRIVATE_NETWORK_ENCAPSULATIONS: PrivateNetworkEncapsulation[] = ['gre', 'vxlan']

// Protocol names, not user-visible translatable text
const ENCAPSULATION_LABELS: Record<PrivateNetworkEncapsulation, string> = {
  gre: 'GRE',
  vxlan: 'VxLAN',
}

export type AdditionalPoolRow = {
  key: number
  poolId: FrontXoPool['id'] | undefined
  pifId: FrontXoPif['id'] | undefined
}

export type NewPrivateNetworkFormData = BaseNetworkFormData & {
  pifId: FrontXoPif['id'] | undefined
  encapsulation: PrivateNetworkEncapsulation
  encrypted: boolean
  preferredCenterId: FrontXoHost['id'] | undefined
}

export function useNewPrivateNetworkForm(_poolId: MaybeRefOrGetter<FrontXoPool['id'] | undefined>) {
  const formData = reactive<NewPrivateNetworkFormData>({
    pool: undefined,
    pifId: undefined,
    name: '',
    description: '',
    mtu: undefined,
    nbd: false,
    encapsulation: 'gre',
    encrypted: false,
    preferredCenterId: undefined,
  })

  const { t } = useI18n()

  const { useField, useSelect } = useFormBindings(formData)

  const {
    selectedPool,
    buildBasePayload,
    poolSelectBindings,
    nameInputBindings,
    descriptionInputBindings,
    mtuInputBindings,
  } = useNetworkFormBase(_poolId, formData)

  const { pifSelectId } = usePrivateNetworkPifSelect(selectedPool, toRef(formData, 'pifId'))

  const { id: encapsulationSelectId } = useFormSelect(PRIVATE_NETWORK_ENCAPSULATIONS, {
    searchable: false,
    required: true,
    model: toRef(formData, 'encapsulation'),
    option: {
      label: encapsulation => ENCAPSULATION_LABELS[encapsulation],
    },
  })

  const { pools } = useXoPoolCollection()
  const { hosts } = useXoHostCollection()

  const additionalPools = reactive<AdditionalPoolRow[]>([])
  let nextRowKey = 0

  function addPool() {
    additionalPools.push({ key: nextRowKey++, poolId: undefined, pifId: undefined })
  }

  function removePool(key: AdditionalPoolRow['key']) {
    const index = additionalPools.findIndex(row => row.key === key)

    if (index !== -1) {
      additionalPools.splice(index, 1)
    }
  }

  const canAddPool = computed(() => additionalPools.length < pools.value.length - 1)

  // The main pool select is not filtered, so selecting a pool already used by an additional row
  // would create the network twice on that pool: drop the now conflicting row
  watch(
    () => formData.pool,
    poolId => {
      const index = additionalPools.findIndex(row => row.poolId === poolId)

      if (index !== -1) {
        additionalPools.splice(index, 1)
      }
    }
  )

  function getExcludedPoolIds(rowKey: AdditionalPoolRow['key']) {
    return [formData.pool, ...additionalPools.filter(row => row.key !== rowKey).map(row => row.poolId)].filter(
      poolId => poolId !== undefined
    )
  }

  const selectedPoolIds = computed(() =>
    [formData.pool, ...additionalPools.map(row => row.poolId)].filter(poolId => poolId !== undefined)
  )

  const selectableHosts = computed(() => hosts.value.filter(host => selectedPoolIds.value.includes(host.$pool)))

  // The select does not reset its model when the selected host is removed from the options,
  // e.g. when its pool is deselected: a stale ID would make the creation fail on the backend
  watch(selectableHosts, selectableHosts => {
    if (
      formData.preferredCenterId !== undefined &&
      !selectableHosts.some(host => host.id === formData.preferredCenterId)
    ) {
      formData.preferredCenterId = undefined
    }
  })

  const { id: preferredCenterSelectId } = useFormSelect(selectableHosts, {
    searchable: true,
    model: toRef(formData, 'preferredCenterId'),
    emptyOption: {
      value: undefined,
      label: t('none'),
    },
    option: {
      label: 'name_label',
      value: 'id',
    },
  })

  function validateAndBuildPayload(): NewPrivateNetworkPayload {
    return {
      ...buildBasePayload(),
      // required fields are validated by the create job before running
      pifId: formData.pifId!,
      encapsulation: formData.encapsulation,
      ...(formData.encrypted && { encrypted: formData.encrypted }),
      ...(formData.preferredCenterId !== undefined && { preferredCenterId: formData.preferredCenterId }),
      ...(additionalPools.length > 0 && {
        additionalPools: additionalPools.map(row => ({
          // required fields are validated by the create job before running
          poolId: row.poolId!,
          pifId: row.pifId!,
        })),
      }),
    }
  }

  return {
    poolSelectBindings,
    nameInputBindings,
    descriptionInputBindings,
    mtuInputBindings,
    pifSelectBindings: useSelect(pifSelectId, () => ({ label: t('interface') })),
    encapsulationSelectBindings: useSelect(encapsulationSelectId, () => ({ label: t('encapsulation') })),
    encryptedCheckboxBindings: useField('encrypted'),
    preferredCenterSelectBindings: useSelect(preferredCenterSelectId, () => ({
      label: t('preferred-center'),
      info: t('new-network:preferred-center-tip'),
    })),
    additionalPools,
    addPool,
    removePool,
    canAddPool,
    getExcludedPoolIds,
    validateAndBuildPayload,
  }
}
