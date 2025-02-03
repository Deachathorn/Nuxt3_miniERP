<template>
    <div>
        <div class="title">แผนการผลิต</div>
        <div class="p-4">
            <button class="btn" @click="openModal()">
                <font-awesome class="icon" :icon="['fas', 'plus']" />
                เพิ่มแผนการผลิต
            </button>

            <table class="table mt-3">
                <thead>
                    <tr>
                        <th width="200px" class="text-left">สินค้า</th>
                        <th width="220px" class="text-right">จำนวน</th>
                        <th class="text-left">หมายเหตุ</th>
                        <th width="110px"></th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="productionPlan in productionPlans" :key="productionPlan.id">
                        <td>{{ productionPlan.Product.name }}</td>
                        <td class="text-right">{{ productionPlan.quantity.toLocaleString('th-TH') }}</td>
                        <td>{{ productionPlan.remark }}</td>
                        <td class="text-center">
                            <button class="btn btn-primary mr-1" @click="editProductionPlan(productionPlan)">
                                <font-awesome :icon="['fas', 'pencil']" />
                            </button>
                            <button class="btn btn-danger" @click="deleteProductionPlan(productionPlan.id)">
                                <font-awesome :icon="['fas', 'times']" />
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <modal v-if="showModal" title="แผนการผลิต" @close="closeModal()">
            <div>สินค้า</div>
            <select v-model="selectedProductId" class="form-control">
                <option v-for="product in products" :key="product.id" :value="product.id">
                    {{ product.name }}
                </option>
            </select>

            <div class="mt-3">จำนวน</div>
            <input type="number" v-model="state.quantity" class="form-control">
            <span v-if="v$.quantity.$error" class="text-red-500 text-sm">{{ v$.quantity.$errors[0].$message }}</span>

            <div class="mt-3">หมายเหตุ</div>
            <input type="text" v-model="state.remark" class="form-control">
            <span v-if="v$.remark.$error" class="text-red-500 text-sm">{{ v$.remark.$errors[0].$message }}</span>

            <button class="btn mt-3" @click="saveProductionPlan()">
                <font-awesome :icon="['fas', 'check']" />
                บันทึก
            </button>
        </modal>
    </div>
</template>
<script setup>
    import modal from '~/components/modal.vue'
    import Swal from 'sweetalert2'
    import axios from 'axios'
    import config from '@/config'
    import useVuelidate from '@vuelidate/core'
    import { required, helpers, minValue } from '@vuelidate/validators'

    definePageMeta({
        layout: 'admin'
    })

    const optional = (value) => {
        return !helpers.req(value) || value
    }

    const state = ref({
        quantity: 0,
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
    const id = ref('')
    const products = ref([])
    const showModal = ref(false)
    const selectedProductId = ref('')

    onMounted(async () => {
        await fetchDataProductionPlan()
    })

    const openModal = () => {
        showModal.value = true
        fetchDataProduct()
    }

    const closeModal = () => {
        showModal.value = false
        selectedProductId.value = ''
        state.value.quantity = 0
        state.value.remark = ''
    }

    const fetchDataProductionPlan = async () => {
        try {
            const res = await axios.get(`${config.apiServer}/api/productionPlan/list`)
            productionPlans.value = res.data.results
        } catch (e) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: e.message
            })
        }
    }

    const fetchDataProduct = async () => {
        try {
            if (products.value.length === 0) {
                const res = await axios.get(`${config.apiServer}/api/product/list`)
                products.value = res.data.results
                selectedProductId.value = products.value[0].id
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: e.message
            })
        }
    }

    const saveProductionPlan = async () => {
        try {
            await v$.value.$validate()
            if (!v$.value.$error) {
                const payload = {
                    productId: selectedProductId.value,
                    quantity: state.value.quantity,
                    remark: state.value.remark
                }

                if (id.value === '') {
                    await axios.post(`${config.apiServer}/api/productionPlan/create`, payload)
                }
                else {
                    await axios.put(`${config.apiServer}/api/productionPlan/update/${id.value}`, payload)
                    id.value = ''
                }
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

    const editProductionPlan = (productionPlan) => {
        id.value = productionPlan.id
        selectedProductId.value = productionPlan.productId
        state.value.quantity = productionPlan.quantity
        state.value.remark = productionPlan.remark

        openModal()
    }

    const deleteProductionPlan = async (id) => {
        try {
            const button = await Swal.fire({
                icon: 'warning',
                title: 'ยืนยันการลบ',
                text: 'คุณต้องการลบแผนการผลิตนี้หรือไม่',
                showCancelButton: true,
                showConfirmButton: true
            })

            if (button.isConfirmed) {
                await axios.delete(`${config.apiServer}/api/productionPlan/remove/${id}`)
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