import type { BaseNetworkPayload } from '@/modules/network/form/use-network-form-base.ts'
import { useXoTaskUtils } from '@/shared/composables/xo-task-utils.composable'
import { fetchPost } from '@/shared/utils/fetch.util'
import { defineJob, defineJobArg, JobError, JobRunningError } from '@core/packages/job'
import type { XoHost, XoPif, XoPool, XoTask } from '@vates/types'
import { useI18n } from 'vue-i18n'

export type PrivateNetworkEncapsulation = 'gre' | 'vxlan'

// Payload that the REST API expects
export type NewPrivateNetworkPayload = Omit<BaseNetworkPayload, 'nbd'> & {
  pifId: XoPif['id']
  encapsulation: PrivateNetworkEncapsulation
  encrypted?: boolean
  preferredCenterId?: XoHost['id']
  additionalPools?: {
    poolId: XoPool['id']
    pifId: XoPif['id']
  }[]
}

const payloadsArg = defineJobArg<NewPrivateNetworkPayload>({
  identify: payload => payload.poolId,
  toArray: true,
})

export const useXoPrivateNetworkCreateJob = defineJob('private-network.create', [payloadsArg], () => {
  const { monitorTask } = useXoTaskUtils()
  const { t } = useI18n()

  return {
    run(payloads): Promise<PromiseSettledResult<void>[]> {
      return Promise.allSettled(
        payloads.map(async payload => {
          const { poolId, ...rest } = payload
          const { taskId } = await fetchPost<{ taskId: XoTask['id'] }>(
            `plugins/sdn-controller/pools/${poolId}/actions/create_private_network`,
            rest
          )

          // The task does not return the created network IDs
          await monitorTask(taskId)
        })
      )
    },

    validate(isRunning, payloads) {
      if (isRunning) {
        throw new JobRunningError(t('job:create:in-progress'))
      }

      if (payloads.length === 0) {
        throw new JobError(t('job:arg:missing-payload'))
      }

      payloads.forEach(payload => {
        if (payload.poolId === undefined) {
          throw new JobError(t('job:arg:pool-id-required'))
        }

        if (payload.name.length === 0) {
          throw new JobError(t('job:arg:name-required'))
        }

        if (payload.pifId === undefined) {
          throw new JobError(t('job:arg:pif-id-required'))
        }

        if (payload.encapsulation === undefined) {
          throw new JobError(t('job:arg:encapsulation-required'))
        }

        payload.additionalPools?.forEach(additionalPool => {
          if (additionalPool.poolId === undefined) {
            throw new JobError(t('job:arg:pool-id-required'))
          }

          if (additionalPool.pifId === undefined) {
            throw new JobError(t('job:arg:pif-id-required'))
          }
        })
      })
    },
  }
})
