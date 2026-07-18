<template>
  <form class="new-private-network-form" @submit.prevent="onSubmit()">
    <div class="row">
      <NetworkFormSelect v-bind="poolSelectBindings" />
      <NetworkFormSelect v-bind="pifSelectBindings" />
    </div>
    <div class="row">
      <div class="column">
        <NetworkFormTextInput v-bind="nameInputBindings" />
        <NetworkFormNumberInput v-bind="mtuInputBindings" />
      </div>
      <NewNetworkDescriptionTextarea v-bind="descriptionInputBindings" />
    </div>
    <div class="row">
      <NetworkFormSelect v-bind="encapsulationSelectBindings" />
      <NetworkFormSelect v-bind="preferredCenterSelectBindings" />
    </div>
    <div class="encrypted">
      <NewNetworkEncryptedCheckbox v-bind="encryptedCheckboxBindings" />
    </div>
    <div class="additional-pools">
      <NewPrivateNetworkPoolRow
        v-for="row in additionalPools"
        :key="row.key"
        v-model:pool-id="row.poolId"
        v-model:pif-id="row.pifId"
        :excluded-pool-ids="getExcludedPoolIds(row.key)"
        @remove="removePool(row.key)"
      />
      <UiButton
        variant="secondary"
        accent="brand"
        size="medium"
        left-icon="fa:plus"
        :disabled="!canAddPool"
        @click.prevent="addPool()"
      >
        {{ t('action:add-pool') }}
      </UiButton>
    </div>
    <NewNetworkButtonsSection :cancel-to :submit-label="t('action:create-private-network')" />
  </form>
</template>

<script lang="ts" setup>
import NetworkFormNumberInput from '@/modules/network/components/form/new/inputs/NetworkFormNumberInput.vue'
import NetworkFormSelect from '@/modules/network/components/form/new/inputs/NetworkFormSelect.vue'
import NetworkFormTextInput from '@/modules/network/components/form/new/inputs/NetworkFormTextInput.vue'
import NewNetworkDescriptionTextarea from '@/modules/network/components/form/new/inputs/NewNetworkDescriptionTextarea.vue'
import NewNetworkEncryptedCheckbox from '@/modules/network/components/form/new/inputs/NewNetworkEncryptedCheckbox.vue'
import NewNetworkButtonsSection from '@/modules/network/components/form/new/NewNetworkButtonsSection.vue'
import NewPrivateNetworkPoolRow from '@/modules/network/components/form/new/NewPrivateNetworkPoolRow.vue'
import { useNewPrivateNetworkForm } from '@/modules/network/form/new-private/use-new-private-network-form.ts'
import type { NewPrivateNetworkPayload } from '@/modules/network/jobs/xo-private-network-create.job.ts'
import type { FrontXoPool } from '@/modules/pool/remote-resources/use-xo-pool-collection.ts'
import UiButton from '@core/components/ui/button/UiButton.vue'
import { useI18n } from 'vue-i18n'
import type { RouteLocationRaw } from 'vue-router'

const { poolId, cancelTo } = defineProps<{
  poolId?: FrontXoPool['id']
  cancelTo: RouteLocationRaw
}>()

const emit = defineEmits<{
  create: [data: NewPrivateNetworkPayload]
}>()

const { t } = useI18n()

const {
  poolSelectBindings,
  pifSelectBindings,
  nameInputBindings,
  mtuInputBindings,
  descriptionInputBindings,
  encapsulationSelectBindings,
  encryptedCheckboxBindings,
  preferredCenterSelectBindings,
  additionalPools,
  addPool,
  removePool,
  canAddPool,
  getExcludedPoolIds,
  validateAndBuildPayload,
} = useNewPrivateNetworkForm(() => poolId)

function onSubmit() {
  emit('create', validateAndBuildPayload())
}
</script>

<style lang="postcss" scoped>
.new-private-network-form {
  .row {
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

    &:not(:first-child) {
      margin-block-start: 2.4rem;
    }

    .column {
      display: flex;
      flex-direction: column;
      gap: 2.4rem;
    }
  }

  .encrypted,
  .additional-pools {
    display: flex;
    flex-direction: column;
    align-items: start;
    gap: 1.6rem;
    margin-block-start: 2.4rem;
  }

  .additional-pools {
    gap: 2.4rem;

    & > * {
      width: 100%;
      min-width: 0;
    }

    & > button {
      width: auto;
    }
  }
}
</style>
