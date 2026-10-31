<script lang="ts" setup>
import { computed, h, onMounted, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { NIcon, useMessage } from 'naive-ui';
import type { DropdownOption, MenuOption } from 'naive-ui'
import { DocumentTextOutline, LogOutOutline, StorefrontOutline } from '@vicons/ionicons5'
import { request } from '@/api/http';
import { clearToken } from '@/api/token';
import {
    NLayout,
    NLayoutSider,
    NLayoutHeader,
    NLayoutContent,
    NMenu,
    NBreadcrumb,
    NBreadcrumbItem,
    NDropdown,
    NAvatar,
} from 'naive-ui'


interface BackofficeUser {
    id: string,
    username: string,
    email: string,
    create_time: string
}

const route = useRoute()
const router = useRouter()
const message = useMessage()

// ---- 侧边栏菜单 ----
// label 用 h(RouterLink) 而不是字符串：这样它是真 <a>，能中键新开标签页
const menuOptions: MenuOption[] = [
    {
        key: 'applications',
        icon: () => h(NIcon, { size: 16 }, { default: () => h(DocumentTextOutline) }),
        label: () => h(RouterLink, { to: { name: 'applications' } }, { default: () => '商户申请' })
    },
]

// ---- 面包屑 ----
const currentTitle = computed(() => (route.meta.title as string | undefined) ?? '')

// ---- 当前用户 ----
const username = ref('管理员')

const avatarText = computed(() => {
    const first = username.value.trim().slice(0, 1)
    return first ? first.toUpperCase() : 'S'
})

const getProfile = async () => {
    try {
        const user = await request<BackofficeUser>('/backoffice/me')
        username.value = user.username
    } catch {
        // 401 由 http.ts 统一处理；其他错误保持兜底文案，别让壳崩掉
    }
}

// ---- 用户菜单 / 登出 ----
const userMenuOptions: DropdownOption[] = [{ label: '退出登录', key: 'logout' }]

const handleLogout = async () => {
    try {
        // 必须先告诉后端删 token，否则它在 Valkey 里还能活 24 小时
        await request('/auth/logout', { method: 'POST' })
    } catch {
        message.warning('服务端会话可能未注销')
    } finally {
        clearToken()
        router.push({ name: 'login' })
    }
}

const handleUserMenuSelect = (key: string) => {
    if (key === 'logout') {
        handleLogout()
    }
}

onMounted(async () => {
    await getProfile()
})

</script>


<template>
    <n-layout has-sider class="h-dvh">
        <n-layout-sider width="216" :bordered="false" :native-scrollbar="false"
            content-style="height: 100%; display: flex; flex-direction: column; background: #0f172a">
            <div class="flex h-14 shrink-0 items-center gap-2 border-b border-white/6 px-4">
                <n-icon :size="18" color="#60a5fa">
                    <StorefrontOutline />
                </n-icon>
                <span class="text-sm font-semibold tracking-wide text-white">RuneShop</span>
            </div>

            <n-menu class="flex-1 px-2 py-2" :value="String(route.name ?? '')" :options="menuOptions" />

            <div class="mt-auto shrink-0 border-t border-white/6 p-2">
                <n-dropdown trigger="click" placement="top-start" :options="userMenuOptions"
                    @select="handleUserMenuSelect">
                    <div
                        class="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 transition-colors hover:bg-white/5">
                        <n-avatar round :size="26" class="bg-blue-600 text-[11px]">{{ avatarText }}</n-avatar>
                        <span class="min-w-0 flex-1 truncate text-[13px] text-slate-300">{{ username }}</span>
                        <n-icon :component="LogOutOutline" :size="15" class="text-slate-500" />
                    </div>
                </n-dropdown>
            </div>
        </n-layout-sider>

        <n-layout>
            <n-layout-header :bordered="false"
                style="height: 56px; background: #ffffff; border-bottom: 1px solid #eef0f3">
                <div class="flex h-full items-center justify-between px-6">
                    <n-breadcrumb>
                        <n-breadcrumb-item>
                            <span class="text-[13px] text-gray-400">运营后台</span>
                        </n-breadcrumb-item>
                        <n-breadcrumb-item v-if="currentTitle">
                            <span class="text-[13px] text-gray-700">{{ currentTitle }}</span>
                        </n-breadcrumb-item>
                    </n-breadcrumb>
                </div>
            </n-layout-header>

            <n-layout-content content-style="background: #f6f7f9; padding: 24px" :native-scrollbar="false">
                <router-view></router-view>
            </n-layout-content>
        </n-layout>
    </n-layout>
</template>
