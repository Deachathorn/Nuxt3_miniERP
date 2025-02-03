<template>
    <div>
        <div class="title">รายงานการผลิต</div>
        <div class="p-4">
            <div class="flex items-center justify-center">
                <span class="from-date">จากวันที่</span>
                <input type="date" v-model="fromDate" class="form-control-report">

                <span class="to-date">ถึงวันที่</span>
                <input type="date" v-model="toDate" class="form-control-report">

                <button class="btn ml-3" @click="search()">
                    <font-awesome class="icon" :icon="['fas', 'search']" /> ค้นหา
                </button>
            </div>

            <table class="table mt-3">
                <thead>
                    <tr>
                        <th class="text-left" width="150">วันที่</th>
                        <th class="text-left">ชื่อสินค้า</th>
                        <th class="text-right" width="150">จำนวนการผลิต</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="production in productions" :key="production.id">
                        <td class="text-left">{{ dayjs(production.createdAt).format('DD/MM/YYYY HH:mm') }}</td>
                        <td class="text-left">{{ production.ProductionPlan.Product.name }}</td>
                        <td class="text-right">{{ production.quantity }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>
<script setup>
    import axios from 'axios'
    import config from '~/config';
    import Swal from 'sweetalert2'
    import dayjs from 'dayjs'

    definePageMeta({
        layout: 'admin'
    })

    const fromDate = ref(dayjs().format('YYYY-MM-DD'))
    const toDate = ref(ref(dayjs().format('YYYY-MM-DD')))
    const productions = ref([])

    onMounted(async () => {
        await search()
    })

    const search = async () => {
        try {
            const payload = {
                fromDate: fromDate.value,
                toDate: toDate.value
            }

            const res = await axios.post(`${config.apiServer}/api/report/production`, payload)
            productions.value = res.data.results
        } catch (e) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: e.message
            })
        }
    }
</script>