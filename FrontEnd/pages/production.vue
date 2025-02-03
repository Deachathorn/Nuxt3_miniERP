<template>
    <div>
        <div class="title">บันทึกการผลิต</div>
        <div class="p-4">
            <table class="table">
                <thead>
                    <tr>
                        <th class="text-left">สินค้า</th>
                        <th class="text-left">ประเภท</th>
                        <th class="text-left">บรรจุภัณฑ์</th>
                        <th class="text-right">จำนวน</th>
                        <th class="text-right">ผลิตได้ (ชิ้น)</th>
                        <th class="text-right">ผลิตได้ (%)</th>
                        <th class="text-center">สถานะ</th>
                        <th width="170px"></th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="productionPlan in productionPlans" :key="productionPlan.id">
                        <td>
                            <div>{{ productionPlan.Product?.name }}</div>
                            <div v-if="productionPlan.remark" class="text-red-500 text-sm">{{ productionPlan.remark }}</div>
                        </td>
                        <td>{{ productionPlan.Product.ProductType.name }}</td>
                        <td>{{ productionPlan.Product.Packaging.name }}</td>
                        <td class="text-right">{{ productionPlan.quantity }}</td>
                        <td class="text-right">{{ productionPlan.sumAmount }}</td>
                        <td class="text-right">{{ productionPlan.sumPercent.toFixed(2) }} %</td>
                        <td class="text-center">
                            <span v-if="productionPlan.sumPercent < 100" class="text-red-500 bg-rose-200 p-2 rounded-lg">
                                <font-awesome :icon="['fas', 'clock']" /> กำลังผลิต
                            </span>
                            <span v-else class="text-emerald-600 bg-green-200 p-2 rounded-lg">
                                <font-awesome :icon="['fas', 'check']" /> ผลิตเสร็จ
                            </span>
                        </td>
                        <td class="text-center">
                            <button class="btn mr-1" @click="opeenModal(productionPlan)">
                                <font-awesome :icon="['fas', 'plus']" />
                                บันทึกผล
                            </button>
                            <button class="btn btn-primary" @click="openModalProduction(productionPlan)">
                                <font-awesome :icon="['fas', 'pencil']" />
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <modal v-if="showModal" @close="closeModal()" title="บันทึกผลการผลิต">
            <div>สินค้า</div>
            <div class="bg-gray-200 p-2 rounded-lg">{{ productName }}</div>

            <div class="mt-3">จำนวน</div>
            <input type="number" v-model="state.quantity" class="form-control">
            <span v-if="v$.quantity.$error" class="text-sm text-red-500">{{ v$.quantity.$errors[0].$message }}</span>

            <div class="mt-3">หมายเหตุ</div>
            <input type="text" v-model="state.remark" class="form-control">
            <span v-if="v$.remark.$error" class="text-sm text-red-500">{{ v$.remark.$errors[0].$message }}</span>

            <button class="btn btn-primary mt-3" @click="save()">
                <font-awesome :icon="['fas', 'check']" />
                บันทึก
            </button>
        </modal>

        <modal v-if="showModalProduction" @close="closeModalProduction()" title="บันทึกผลการผลิต">
            <div class="mb-3 text-center font-bold text-gray-700">สินค้า {{ selectedProductName }}</div>
            <table class="table">
                <thead>
                    <tr>
                        <th class="text-left">วันที่</th>
                        <th class="text-right">จำนวน</th>
                        <th class="text-left">หมายเหตุ</th>
                        <th width="60px"></th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="production in productions" :key="production.id">
                        <td class="text-left">{{dayjs(production.createdAt).format('DD/MM/YYYY HH:mm') }}</td>
                        <td class="text-right">{{ production.quantity }}</td>
                        <td class="text-left">{{ production.remark }}</td>
                        <td class="text-center">
                            <button class="btn btn-danger" @click="removeProduction(production.id)">
                                <font-awesome :icon="['fas', 'times']" />
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </modal>
    </div>
</template>
<script setup>
    import axios from 'axios'
    import Swal from 'sweetalert2'
    import config from '@/config'
    import dayjs from 'dayjs'
    import modal from '~/components/modal.vue'
    import useVuelidate from '@vuelidate/core'
    import { required, helpers, minValue } from '@vuelidate/validators'

    definePageMeta({
        layout: 'admin'
    })

    const optional = (value) => {
        return !helpers.req(value) || value
    }

    const state = ref({
        quantity: '',
        remark: ''
    })

    const rules = computed(() => ({
        quantity: {
            required: helpers.withMessage("Quantity is required", required),
            minValue: minValue(0)
        },
        remark: {
            optional
        }
    }))

    const v$ = useVuelidate(rules, state)

    const productionPlans = ref([])
    const showModal = ref(false)
    const productionPlanId = ref('')
    const productName = ref('')
    const productId = ref('')

    //modal productions
    const showModalProduction = ref(false)
    const productions = ref([])
    const selectedProductionPlanId = ref('')
    const selectedProductName = ref('')

    onMounted(async () => {
        await fetchDataProductionPlan()
    })

    const opeenModal = (productionPlan) => {
        showModal.value = true
        productionPlanId.value = productionPlan.id
        productName.value = productionPlan.Product.name
        productId.value = productionPlan.Product.id
    }

    const closeModal = () => {
        showModal.value = false
    }

    const fetchDataProductionPlan = async () => {
        try {
            const res = await axios(`${config.apiServer}/api/productionPlan/list`)
            productionPlans.value = res.data.results

            //sum production amount
            for (const productionPlan of productionPlans.value) {
                let sum = 0

                for (const production of productionPlan.Production) {
                    sum += production.quantity
                }

                productionPlan.sumAmount = sum
                productionPlan.sumPercent = (sum / productionPlan.quantity) * 100
            }
        } catch (e) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: e.message
            })
        }
    }

    const save = async () => {
        try {
            await v$.value.$validate()
            if (!v$.value.$error) {
                const payload = {
                    productionPlanId: productionPlanId.value,
                    quantity: state.value.quantity,
                    remark: state.value.remark
                }

                await axios.post(`${config.apiServer}/api/production/create`, payload)

                Swal.fire({
                    icon: 'success',
                    title: 'success',
                    text: 'บันทึกข้อมูลสำเร็จ',
                    timer: 1000
                })

                v$.value.$reset()
                closeModal()
            }

            await fetchDataProductionPlan()
        } catch (e) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: e.response.data.error
            })
        }
    }

    const openModalProduction = async (productionPlan) => {
        showModalProduction.value = true
        selectedProductionPlanId.value = productionPlan.id
        selectedProductName.value = productionPlan.Product.name

        await fetchDataProduction()
    }

    const closeModalProduction = () => {
        showModalProduction.value = false
    }

    const fetchDataProduction = async () => {
        try {
            const res = await axios.get(`${config.apiServer}/api/production/list/${selectedProductionPlanId.value}`)
            productions.value = res.data.results
        } catch (e) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: e.message
            })
        }
    }

    const removeProduction = async (id) => {
        try {
            const button = await Swal.fire({
                icon: 'warning',
                title: 'ยืนยันการลบ',
                text: 'คุณต้องการลบข้อมูลบันทึกการผลิตนี้หรือไม่?',
                showCancelButton: true,
                showConfirmButton: true
            })

            if (button.isConfirmed) {
                await axios.delete(`${config.apiServer}/api/production/remove/${id}`)
                await fetchDataProduction()
                await fetchDataProductionPlan()
            }
        } catch (e) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: e.message
            })
        }
    }
</script>