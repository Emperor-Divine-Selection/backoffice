<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import type { FormInst, FormRules } from 'naive-ui'
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

async function handleSubmit() {
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
        router.push('/applications')
    } catch (error) {
        message.error(error instanceof Error ? error.message : '登录失败')
    } finally {
        submitting.value = false
    }
}
</script>

<template>
    <div class="flex min-h-screen items-center justify-center bg-gray-100">
        <div class="w-80 rounded-lg bg-white p-8 shadow">
            <h1 class="mb-6 text-xl font-semibold">后台管理</h1>
            <n-form ref="formRef" :model="form" :rules="rules" @submit.prevent="handleSubmit">
                <n-form-item label="用户名" path="username">
                    <n-input v-model:value="form.username" placeholder="请输入用户名" />
                </n-form-item>
                <n-form-item label="密码" path="password">
                    <n-input v-model:value="form.password" type="password" show-password-on="click"
                        placeholder="请输入密码" />
                </n-form-item>
                <n-button type="primary" block attr-type="submit" :loading="submitting">登录</n-button>
            </n-form>
        </div>
    </div>
</template>
