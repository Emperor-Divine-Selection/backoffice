<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { NIcon, useMessage } from 'naive-ui'
import type { FormInst, FormRules } from 'naive-ui'
import { LockClosedOutline, PersonOutline, StorefrontOutline } from '@vicons/ionicons5'
import { request } from '@/api/http'
import { setToken } from '@/api/token'

interface LoginResponse {
    token: string
}

const router = useRouter()
const message = useMessage()

const formRef = ref<FormInst | null>(null)
const submitting = ref(false)

const form = reactive({
    username: '',
    password: '',
})

const rules: FormRules = {
    username: { required: true, message: '请输入用户名', trigger: ['blur', 'input'] },
    password: { required: true, message: '请输入密码', trigger: ['blur', 'input'] },
}

const handleSubmit = async () => {
    try {
        await formRef.value?.validate()
    } catch {
        return
    }

    submitting.value = true
    try {
        const data = await request<LoginResponse>('/backoffice/auth/login', {
            method: 'POST',
            body: JSON.stringify(form),
        })
        if (!data) { message.error('登录响应异常'); return }
        setToken(data.token)
        message.success('登录成功')
        router.push({ name: 'applications' })
    } catch (error) {
        message.error(error instanceof Error ? error.message : '登录失败')
    } finally {
        submitting.value = false
    }
}
</script>

<template>
    <div class="flex h-dvh overflow-hidden bg-[#f6f7f9]">
        <!-- 左侧品牌区（窄屏隐藏） -->
        <aside class="relative hidden w-[44%] max-w-155 flex-col justify-between bg-[#0f172a] p-12 lg:flex">
            <div class="flex items-center gap-2.5">
                <n-icon :size="22" color="#60a5fa">
                    <StorefrontOutline />
                </n-icon>
                <span class="text-base font-semibold tracking-wide text-white">RuneShop</span>
            </div>

            <div class="max-w-sm">
                <h2 class="text-2xl font-semibold leading-snug text-white">
                    运营后台
                </h2>
                <p class="mt-3 text-sm leading-6 text-slate-400">
                    审核商户申请、管理店铺与订单。<br />
                    所有操作均留痕，可追溯到审核人。
                </p>
            </div>

            <p class="text-xs text-slate-600">© 2026 RuneShop</p>
        </aside>

        <!-- 右侧登录区 -->
        <main class="flex flex-1 items-center justify-center px-6">
            <div class="w-full max-w-90">
                <div class="mb-8 lg:hidden">
                    <div class="flex items-center gap-2">
                        <n-icon :size="20" color="#2563eb">
                            <StorefrontOutline />
                        </n-icon>
                        <span class="text-sm font-semibold text-slate-900">RuneShop</span>
                    </div>
                </div>

                <h1 class="text-xl font-semibold text-slate-900">登录</h1>
                <p class="mt-1.5 text-[13px] text-slate-500">请使用后台账号登录运营系统</p>

                <n-form ref="formRef" class="mt-8" :model="form" :rules="rules" size="large"
                    @submit.prevent="handleSubmit">
                    <n-form-item label="用户名" path="username">
                        <n-input v-model:value="form.username" placeholder="请输入用户名"
                            :input-props="{ autocomplete: 'off' }">
                            <template #prefix>
                                <n-icon :component="PersonOutline" class="text-slate-400" />
                            </template>
                        </n-input>
                    </n-form-item>

                    <n-form-item label="密码" path="password">
                        <n-input v-model:value="form.password" type="password" show-password-on="click"
                            placeholder="请输入密码" :input-props="{ autocomplete: 'new-password' }">
                            <template #prefix>
                                <n-icon :component="LockClosedOutline" class="text-slate-400" />
                            </template>
                        </n-input>
                    </n-form-item>

                    <n-button class="mt-2" block size="large" attr-type="submit" :loading="submitting"
                        style="--n-color: #0f172a; --n-color-hover: #1e293b; --n-color-pressed: #020617; --n-color-focus: #1e293b; --n-text-color: #ffffff; --n-text-color-hover: #ffffff;">
                        登录
                    </n-button>
                </n-form>

                <p class="mt-6 text-center text-xs text-slate-400">
                    仅限授权人员访问 · 会话有效期 24 小时
                </p>
            </div>
        </main>
    </div>
</template>
