<script setup lang="ts">
import { dateZhCN, zhCN } from 'naive-ui'
import type { GlobalThemeOverrides } from 'naive-ui'

const themeOverrides: GlobalThemeOverrides = {
    common: {
        primaryColor: '#2563eb',
        primaryColorHover: '#1d4ed8',
        primaryColorPressed: '#1e40af',
        primaryColorSuppl: '#3b82f6',
        borderRadius: '8px',
        fontSize: '14px',
    },
    DataTable: {
        thColor: '#f9fafb',
        thTextColor: '#6b7280',
        thFontWeight: '500',
        tdColorHover: '#f9fafb',
        borderColor: '#eef0f3',
    },
    Button: {
        borderRadiusTiny: '6px',
        borderRadiusSmall: '6px',
    },
    Menu: {
        color: 'transparent',
        itemHeight: '38px',
        borderRadius: '4px',
        itemColorHover: 'rgba(255, 255, 255, 0.05)',
        itemColorActive: 'rgba(37, 99, 235, 0.16)',
        itemColorActiveHover: 'rgba(37, 99, 235, 0.22)',
        itemTextColor: '#94a3b8',
        itemTextColorHover: '#e2e8f0',
        itemTextColorActive: '#ffffff',
        itemTextColorActiveHover: '#ffffff',
        itemIconColor: '#94a3b8',
        itemIconColorHover: '#e2e8f0',
        itemIconColorActive: '#60a5fa',
    },
}
</script>

<template>
    <n-config-provider :theme-overrides="themeOverrides" :locale="zhCN" :date-locale="dateZhCN">
        <n-message-provider>
            <router-view />
        </n-message-provider>
    </n-config-provider>
</template>
