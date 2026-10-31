<script setup lang="ts">
import { h, onMounted, ref, reactive } from 'vue';
import { NButton, NIcon, NInput, NTag, useMessage } from 'naive-ui'
import { CheckmarkOutline, CloseOutline, RefreshOutline, SearchOutline } from '@vicons/ionicons5'
import type { DataTableColumns } from 'naive-ui'
import {
    approveApplication,
    listApplications,
    rejectApplication,
    type ApplicationStatus,
    type MerchantApplication
} from '@/api/application'

const message = useMessage()
const keyword = ref('')
const loading = ref(false)
const rows = ref<MerchantApplication[]>([])
const status = ref<ApplicationStatus | undefined>(undefined)
const pagination = reactive({ page: 1, pageSize: 10, itemCount: 0 })

const reviewVisible = ref(false)
const reviewMode = ref<'approve' | 'reject'>('approve')
const reviewTarget = ref<MerchantApplication | null>(null)
const reviewRemark = ref('')
const submitting = ref(false)

const statusOptions = [
    { label: '待审核', value: 'pending' },
    { label: '已通过', value: 'approved' },
    { label: '已驳回', value: 'rejected' },
]

const STATUS_MAP = {
    pending: { text: '待审核', type: 'warning' as const },
    approved: { text: '已通过', type: 'success' as const },
    rejected: { text: '已驳回', type: 'error' as const },
}

const formatTime = (iso: string) => {
    const date = new Date(iso)
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

const loadApplications = async () => {
    loading.value = true
    try {
        const data = await listApplications({
            status: status.value,
            keyword: keyword.value,
            page: pagination.page,
            page_size: pagination.pageSize
        })
        rows.value = data.items
        pagination.itemCount = data.total
    } catch (error) {
        message.error(error instanceof Error ? error.message : '数据加载失败')
    } finally {
        loading.value = false
    }
}

const handleFilterChange = (value: ApplicationStatus | null) => {
    status.value = value ?? undefined
    pagination.page = 1
    loadApplications()
}

const handlePageChange = (value: number) => {
    pagination.page = value
    loadApplications()
}

const handleKeyWordChange = (value: string) => {
    keyword.value = value
    pagination.page = 1
    loadApplications()
}

const openReview = (row: MerchantApplication, mode: 'approve' | 'reject') => {
    reviewTarget.value = row
    reviewMode.value = mode
    reviewRemark.value = ''
    reviewVisible.value = true
}

const submitReview = async () => {
    const target = reviewTarget.value
    if (!target) {
        return
    }

    const remark = reviewRemark.value.trim()
    if (reviewMode.value === 'reject' && !remark) {
        message.warning('请填写驳回理由')
        return
    }

    submitting.value = true
    try {
        if (reviewMode.value === 'approve') {
            await approveApplication(target.id, remark)
            message.success('已通过')
        } else {
            await rejectApplication(target.id, remark)
            message.success('已驳回')
        }
        reviewVisible.value = false
        await loadApplications()
    } catch (error) {
        message.error(error instanceof Error ? error.message : '操作失败')
    } finally {
        submitting.value = false
    }
}

const renderActions = (row: MerchantApplication) => {
    if (row.status !== 'pending') {
        return h('span', { class: 'text-gray-300' }, '—')
    }

    return h('div', { class: 'flex items-center gap-1' }, [
        h(
            NButton,
            { size: 'small', type: 'primary', text: true, onClick: () => openReview(row, 'approve') },
            {
                icon: () => h(NIcon, null, { default: () => h(CheckmarkOutline) }),
                default: () => '通过'
            }
        ),
        h(
            NButton,
            { size: 'small', type: 'error', text: true, onClick: () => openReview(row, 'reject') },
            {
                icon: () => h(NIcon, null, { default: () => h(CloseOutline) }),
                default: () => '驳回'
            }
        ),
    ])
}

const columns: DataTableColumns<MerchantApplication> = [
    { title: '店铺名', key: 'shop_name', ellipsis: { tooltip: true }, minWidth: 180 },
    { title: '申请人', key: 'username', width: 160, ellipsis: { tooltip: true } },
    {
        title: '状态',
        key: 'status',
        width: 110,
        render: (row) => {
            const item = STATUS_MAP[row.status]
            return h(NTag, { type: item.type, size: 'small', round: true, bordered: false }, { default: () => item.text })
        },
    },
    {
        title: '提交时间',
        key: 'create_time',
        width: 170,
        render: (row) => h('span', { class: 'text-gray-500' }, formatTime(row.create_time)),
    },
    {
        title: '审核',
        key: 'reviewed_at',
        width: 200,
        render: (row) => {
            if (!row.reviewed_at) {
                return h('span', { class: 'text-gray-400' }, '—')
            }
            return h('span', { class: 'text-gray-500' }, `${row.reviewer_name ?? '—'} · ${formatTime(row.reviewed_at)}`)
        },
    },
    { title: '操作', key: 'actions', width: 170, render: renderActions },
]

onMounted(loadApplications)

</script>

<template>
    <div class="space-y-4">
        <header class="flex flex-wrap items-end justify-between gap-3">
            <div>
                <h1 class="text-xl font-semibold text-gray-900">商户申请</h1>
                <p class="mt-1 text-[13px] text-gray-500">审核用户提交的开店申请，通过后自动创建商户</p>
            </div>
            <n-button secondary :loading="loading" @click="loadApplications">
                <template #icon><n-icon>
                        <RefreshOutline />
                    </n-icon></template>
                刷新
            </n-button>
        </header>

        <section class="rounded-[10px] border border-[#e9ebef] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
            <div class="flex flex-wrap items-center gap-3 border-b border-gray-100 px-4 py-3">
                <n-select :value="status ?? null" clearable placeholder="全部状态" :options="statusOptions"
                    style="width: 140px" @update:value="handleFilterChange" />
                <n-input v-model:value="keyword" clearable placeholder="搜索店铺名，回车确认" style="width: 260px"
                    @keyup.enter="handleKeyWordChange(keyword)" @clear="handleKeyWordChange('')">
                    <template #prefix>
                        <n-icon :component="SearchOutline" class="text-gray-400" />
                    </template>
                </n-input>
            </div>

            <n-data-table remote :bordered="false" :columns="columns" :data="rows" :loading="loading"
                :pagination="pagination" :row-key="(row: MerchantApplication) => row.id"
                @update:page="handlePageChange" />
        </section>

        <n-modal v-model:show="reviewVisible" preset="card" style="width: 460px"
            :title="reviewMode === 'approve' ? '通过申请' : '驳回申请'">
            <div class="space-y-4">
                <div class="rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-600">
                    <div>店铺名：{{ reviewTarget?.shop_name }}</div>
                    <div>申请人：{{ reviewTarget?.username ?? '—' }}</div>
                </div>

                <div>
                    <div class="mb-2 text-sm text-gray-700">
                        审核意见
                        <span v-if="reviewMode === 'reject'" class="text-red-500">（必填）</span>
                        <span v-else class="text-gray-400">（选填）</span>
                    </div>
                    <n-input v-model:value="reviewRemark" type="textarea" :rows="3" maxlength="200" show-count
                        :placeholder="reviewMode === 'approve' ? '可以留一句通过说明' : '请说明驳回原因，商户能看到'" />
                </div>
            </div>

            <template #footer>
                <div class="flex justify-end gap-2">
                    <n-button :disabled="submitting" @click="reviewVisible = false">取消</n-button>
                    <n-button :type="reviewMode === 'approve' ? 'primary' : 'error'" :loading="submitting"
                        @click="submitReview">
                        {{ reviewMode === 'approve' ? '确认通过' : '确认驳回' }}
                    </n-button>
                </div>
            </template>
        </n-modal>
    </div>
</template>
