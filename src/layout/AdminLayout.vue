<script lang="ts" setup>
import { computed, h, onMounted, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useMessage } from 'naive-ui';
import type { DropdownOption, MenuOption } from 'naive-ui'
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
        <n-layout-sider width="300" bordered>
            <div class='px-5 py-4 text-base font-semibold text-center'>RuneShop</div>
            <n-menu :value="String(route.name ?? '')" :options="menuOptions"></n-menu>
        </n-layout-sider>

        <n-layout>
            <n-layout-header bordered class='flex h-14 items-center justify-between px-6'>
                <n-breadcrumb>
                    <n-breadcrumb-item>运营后台</n-breadcrumb-item>
                    <n-breadcrumb-item v-if="currentTitle">{{ currentTitle }}</n-breadcrumb-item>
                </n-breadcrumb>
                <n-dropdown trigger="click" :options="userMenuOptions" @select="handleUserMenuSelect">
                    <div class='flex cursor-pointer items-center gap-2'>
                        <span class='text-sm text-gray-600'>{{ username }}</span>
                        <n-avatar round size="small">{{ avatarText }}</n-avatar>
                    </div>
                </n-dropdown>
            </n-layout-header>

            <n-layout-content class='bg-gray-50 p-6' :native-scrollbar="false">
                <router-view></router-view>
            </n-layout-content>
        </n-layout>
    </n-layout>
</template>
