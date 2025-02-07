<template>
    <div>

        <div class="sidebar-title">NuxtERP 2024</div>

        <div class="sidebar-avatar">
            <img :src="profilePic ? `${config.apiServer}/uploads/` + profilePic : 'https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_1280.png'" alt="avatar" class="w-10 h-10 rounded-full mx-auto object-cover" >
            <div class="text-center text-white text-sm mt-3">{{level}} : {{name}}</div>
            <div class="text-center mt-3 flex justify-center gap-2">
                <button class="btn btn-danger text-xs" @click="signOut()">
                    <font-awesome class="icon" :icon="['fa', 'sign-out']"/> Sign Out
                </button>
                <button class="btn btn-primary text-xs" @click="navigateTo('/userProfile')">
                    <font-awesome class="icon" :icon="['fa', 'user']"/> Profile
                </button>
            </div>
        </div>

        <div class="sidebar-menu">
            <nuxt-link class="nav-link" :class="{'active': activeMenu === 'home'}" to="/home" @click="toggleMenu('home')">
                <font-awesome class="nav-link-i" :icon="['fas', 'house']" />
                Dashboard
            </nuxt-link>
            <nuxt-link class="nav-link" :class="{'active': activeMenu === 'production'}" to="/production" @click="toggleMenu('production')">
                <font-awesome class="nav-link-i" :icon="['far', 'folder-open']"/>
                บันทึกการผลิต
            </nuxt-link>
            <nuxt-link class="nav-link" :class="{'active': activeMenu === 'productType'}" to="/productType" @click="toggleMenu('productType')">
                <font-awesome class="nav-link-i" :icon="['fas', 'file-lines']"/>
                ประเภทสินค้า
            </nuxt-link>
            <nuxt-link class="nav-link" :class="{'active': activeMenu === 'product'}" to="/product" @click="toggleMenu('product')">
                <font-awesome class="nav-link-i" :icon="['fas', 'box']"/>
                สินค้า
            </nuxt-link>
            <nuxt-link class="nav-link" :class="{'active': activeMenu === 'material'}" to="/material" @click="toggleMenu('material')">
                <font-awesome class="nav-link-i" :icon="['fas', 'cogs']"/>
                วัสดุ, ส่วนผสม
            </nuxt-link>
            <nuxt-link class="nav-link" :class="{'active': activeMenu === 'packaging'}" to="/packaging" @click="toggleMenu('packaging')">
                <font-awesome class="nav-link-i" :icon="['fas', 'box']"/>
                บรรจุภัณฑ์
            </nuxt-link>
            <nuxt-link class="nav-link" :class="{'active': activeMenu === 'productionPlan'}" to="/productionPlan" @click="toggleMenu('productionPlan')">
                <font-awesome class="nav-link-i" :icon="['fas', 'map']"/>
                แผนการผลิต
            </nuxt-link>
            <nuxt-link class="nav-link" :class="{'active': activeMenu === 'report'}" to="/report" @click="toggleMenu('report')">
                <font-awesome class="nav-link-i" :icon="['fas', 'chart-line']"/>
                รายงานการผลิต
            </nuxt-link>
            <nuxt-link class="nav-link" :class="{'active': activeMenu === 'costAccounting'}" to="/costAccounting" @click="toggleMenu('costAccounting')">
                <font-awesome class="nav-link-i" :icon="['fas', 'dollar-sign']"/>
                บัญชีต้นทุน
            </nuxt-link>
            <nuxt-link class="nav-link" :class="{'active': activeMenu === 'users'}" to="/users" @click="toggleMenu('users')">
                <font-awesome class="nav-link-i" :icon="['fas', 'users']"/>
                ผู้ใช้งาน
            </nuxt-link>
        </div>

    </div>
</template>
<script setup>
    import Swal from 'sweetalert2'
    import config from '@/config';
    import axios from 'axios'

    const activeMenu = ref('')
    const name = ref('')
    const level = ref('')
    const profilePic = ref('')

    onMounted(async () => {
        await fetchData()
    })

    const toggleMenu = (menu) => {
        activeMenu.value = menu
    }

    const fetchData = async () => {
        try {
            const headers = {
                Authorization: `Bearer ${localStorage.getItem(config.token)}`
            }

            const res = await axios.get(`${config.apiServer}/api/user/info`, {headers})
            name.value = res.data.result.name,
            level.value = res.data.result.level
            profilePic.value = res.data.result.profilePic
        } catch (e) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: e.message
            })
        }
    }

    const signOut = async () => {
        const button = await Swal.fire({
            icon: 'warning',
            title: 'ยืนยันการออกจากระบบ',
            showCancelButton: true,
            showConfirmButton: true
        })

        if(button.isConfirmed){
            localStorage.removeItem(config.token)
            localStorage.removeItem('nuxt_erp_user_id')
            navigateTo('/')
        }
    }
</script>