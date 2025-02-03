<template>
    <div>
        <div class="title">วัสดุ, ส่วนผสม</div>
        <div class="p-4">
            <button class="btn me-1" @click="showModal = true">
                <font-awesome class="icon" :icon="['fa', 'plus']"/> เพิ่มวัสดุ, ส่วนผสม
            </button>
            <button class="btn me-1" @click="openModalStockMaterial()">
                <font-awesome class="icon" :icon="['fa', 'arrow-circle-down']"/> รับเข้า Stock กลาง
            </button>
            <button class="btn me-1" @click="showModalStockMaterialHistory = true">
                <font-awesome class="icon" :icon="['fa', 'history']"/> ประวัติการรับเข้า Stock กลาง
            </button>

            <table class="table mt-3">
                <thead>
                    <tr>
                        <th class="text-left">ชื่อ</th>
                        <th class="text-left">หมายเหตุ</th>
                        <th class="text-right">คงเหลือ</th>
                        <th class="text-left">หน่วย</th>
                        <th class="text-right">ราคา</th>
                        <th>วันที่เข้ารับวัสดุล่าสุด</th>
                        <th width="110px"></th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="material in materials" :key="material.id">
                        <td>{{ material.name }}</td>
                        <td>{{ material.remark }}</td>
                        <td class="text-right">{{ material.balance }}</td>
                        <td>{{ material.unit }}</td>
                        <td class="text-right">{{ material.price.toLocaleString('th-TH') }}</td>
                        <td class="text-center">18/10/2025 16:00</td>
                        <td>
                            <button class="btn btn-primary me-1" @click="update(material)">
                                <font-awesome :icon="['fa', 'pencil']"/>
                            </button>
                            <button class="btn btn-danger me-1" @click="remove(material.id)">
                                <font-awesome :icon="['fa', 'trash']"/>
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <modal v-if="showModal" title="วัสดุ, ส่วนผสม" @close="closeModal">
            <div>ชื่อ</div>
            <input type="text" class="form-control" v-model="state.name">
            <span v-if="v$.name.$error" class="text-red-500 text-sm">{{ v$.name.$errors[0].$message }}</span>

            <div class="mt-3">หน่วยเรียก</div>
            <input type="text" class="form-control" v-model="state.unit">
            <span v-if="v$.unit.$error" class="text-red-500 text-sm">{{ v$.unit.$errors[0].$message }}</span>

            <div class="mt-3">ราคา</div>
            <input type="number" class="form-control" v-model="state.price">
            <span v-if="v$.price.$error" class="text-red-500 text-sm">{{ v$.price.$errors[0].$message }}</span>

            <div class="mt-3">หมายเหตุ</div>
            <input type="text" class="form-control" v-model="state.remark">
            <span v-if="v$.remark.$error" class="text-red-500 text-sm">{{ v$.remark.$errors[0].$message }}</span>

            <button class="btn mt-3" @click="save(['name', 'unit', 'price', 'remark'])">
                <font-awesome class="icon" :icon="['fas', 'save']"/>
                บันทึก
            </button>
        </modal>

        <modal v-if="showModalStockMaterial" title="รับเข้า Stock" @close="closeModalStockMaterial">
            <div>วัสดุ, ส่วนผสม</div>
            <select v-model="stockMaterialMaterialId" class="form-control" @change="selectedStockMaterial()">
                <option v-for="material in materials" :key="material.id" :value="material.id">
                    {{ material.name }}
                </option>
            </select>

            <div class="mt-3">จำนวน</div>
            <input type="number" class="form-control" v-model="state.stockMaterialQuantity">
            <span v-if="v$.stockMaterialQuantity.$error" class="text-red-500 text-sm">{{ v$.stockMaterialQuantity.$errors[0].$message }}</span>

            <div class="mt-3">ราคา</div>
            <input type="number" class="form-control" v-model="state.stockMaterialPrice">
            <span v-if="v$.stockMaterialPrice.$error" class="text-red-500 text-sm">{{ v$.stockMaterialPrice.$errors[0].$message }}</span>

            <div class="mt-3">หมายเหตุ</div>
            <input type="text" class="form-control" v-model="state.stockMaterialRemark">
            <span v-if="v$.stockMaterialRemark.$error" class="text-red-500 text-sm">{{ v$.stockMaterialRemark.$errors[0].$message }}</span>

            <button class="btn mt-3" @click="saveStockMaterial(['stockMaterialQuantity', 'stockMaterialPrice', 'stockMaterialRemark'])">
                <font-awesome class="icon" :icon="['fas', 'check']"/>
                บันทึก
            </button>
        </modal>

        <modal v-if="showModalStockMaterialHistory" title="ประวัติรับเข้า Stock กลาง" @close="closeModalStockMaterialHistory" size="xl">
            <table class="table mt-3">
                <thead>
                    <tr>
                        <th width="200px" class="text-left">วัสดุ, ส่วนผสม</th>
                        <th width="100px" class="text-right">จำนวน</th>
                        <th width="100px" class="text-right">ราคา</th>
                        <th width="150px">วันที่รับเข้า</th>
                        <th width="55px"></th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="stockMaterial in listStockMaterials" :key="stockMaterial.id">
                        <td>
                            <div>{{ stockMaterial.Material.name }}</div>
                            <div v-if="stockMaterial.remark" class="text-red-500">
                                {{ stockMaterial.remark }}
                            </div>
                        </td>
                        <td class="text-right">{{ stockMaterial.quantity }}</td>
                        <td class="text-right">{{ stockMaterial.price.toLocaleString('th-TH') }}</td>
                        <td class="text-center">{{ dayjs(stockMaterial.created_at).format('DD/MM/YYYY HH:mm') }}</td>
                        <td class="text-center">
                            <button class="btn btn-sm btn-danger" @click="removeStockMaterial(stockMaterial.id)">
                                <font-awesome :icon="['fas', 'times']"/>
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </modal>
    </div>
</template>
<script setup>
    import modal from '~/components/modal.vue'
    import Swal from 'sweetalert2'
    import axios from 'axios'
    import config from '@/config'
    import dayjs from 'dayjs'
    import useVuelidate from '@vuelidate/core'
    import { required, minValue, helpers } from '@vuelidate/validators'

    definePageMeta({
        layout: 'admin'
    })

    const optional = (value) => {
        return !helpers.req(value) || value
    }

    const state = ref({
        name: '',
        unit: '',
        price: 0,
        remark: '',
        stockMaterialQuantity: 0,
        stockMaterialPrice: 0,
        stockMaterialRemark: ''
    })

    const rules = computed(() => ({
        name: {
            required: helpers.withMessage("Name is required", required)
        },
        unit: {
            required: helpers.withMessage("Unit is required", required)
        },
        price: {
            required: helpers.withMessage("Price is required", required),
            minValue: minValue(0)
        },
        remark: {
            optional
        },
        stockMaterialQuantity: {
            required: helpers.withMessage("Quantity is required", required),
            minValue: minValue(0)
        },
        stockMaterialPrice: {
            required: helpers.withMessage("Price is required", required),
            minValue: minValue(0)
        },
        stockMaterialRemark: {
            optional
        }
    }))

    const v$ = useVuelidate(rules, state)

    const showModal = ref(false)
    const materials = ref([])
    const id = ref('')

    //modal stock material
    const showModalStockMaterial = ref(false)
    const stockMaterialMaterialId = ref('')
    const listMaterial = ref([])
    const stockMaterialId = ref('')

    //modal stock material history
    const showModalStockMaterialHistory = ref(false)
    const listStockMaterials = ref([])

    onMounted(async () => {
        await fetchData()
        await fetchDataStockMaterial()
    })

    const openModalStockMaterial = async (material) => {
        showModalStockMaterial.value = true
        try {
            const res = await axios.get(`${config.apiServer}/api/material/list`)
            listMaterial.value = res.data.results
            stockMaterialMaterialId.value = materials.value[0].id
        } catch (e) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: e.message
            })
        }
    }

    const closeModalStockMaterialHistory = () => {
        showModalStockMaterialHistory.value = false
    }

    const closeModalStockMaterial = () => {
        showModalStockMaterial.value = false
        state.value.stockMaterialQuantity = ''
        state.value.stockMaterialPrice = ''
        state.value.stockMaterialRemark = ''
        stockMaterialId.value = ''
    }

    const closeModal = () => {
        showModal.value = false
        state.value.name = ''
        state.value.unit = ''
        state.value.price = 0
        state.value.remark = ''
    }

    const fetchData = async () => {
        try {
            const res = await axios.get(`${config.apiServer}/api/material/list`)
            
            for (const material of res.data.results) {
                material.balance = 0

                for (const stockMaterial of material.StockMaterial) {
                    material.balance += stockMaterial.quantity
                }
            }

            materials.value = res.data.results
        } catch (e) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: e.message
            })
        }
    }

    const save = async (validate) => {
        try {
            await v$.value.$validate()
            const hasError = validate.some((field) => v$.value[field].$error)
            if (!hasError) {
                const payload = {
                    name: state.value.name,
                    unit: state.value.unit,
                    price: state.value.price,
                    remark: state.value.remark
                }

                if (id.value === "") {
                    await axios.post(`${config.apiServer}/api/material/create`, payload)
                } else {
                    await axios.put(`${config.apiServer}/api/material/update/${id.value}`, payload)
                    id.value = ''
                }

                v$.value.$reset()
                closeModal()
            }

            await fetchData()
        } catch (e) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: e.response.data.error
            })
        }
    }

    const update = (material) => {
        id.value = material.id
        state.value.name = material.name
        state.value.unit = material.unit
        state.value.price = material.price
        state.value.remark = material.remark
        showModal.value = true
    }

    const remove = async (id) => {
        try {
            const button = await Swal.fire({
                icon: 'warning',
                title: 'ยันการลบ',
                text: 'คุณต้องการลบรายการวัสดุนี้หรือไม่?',
                showCancelButton: true,
                showConfirmButton: true
            })

            if(button.isConfirmed){
                await axios.delete(`${config.apiServer}/api/material/remove/${id}`)
                await fetchData()
            }
        } catch (e) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: e.message
            })
        }
    }

    const saveStockMaterial = async (validate) => {
        try {
            await v$.value.$validate()
            const hasError = validate.some((field) => v$.value[field].$error)
            if (!hasError) {
                const payload = {
                    material_id: stockMaterialId.value,
                    quantity: state.value.stockMaterialQuantity,
                    price: state.value.stockMaterialPrice,
                    remark: state.value.stockMaterialRemark
                }

                await axios.post(`${config.apiServer}/api/stockMaterial/create`, payload)

                v$.value.$reset()
                closeModalStockMaterial()
            }

            await fetchData()
            await fetchDataStockMaterial()
        } catch (e) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: e.response.data.error
            })
        }
    }

    const selectedStockMaterial = () => {
        const material = listMaterial.value.find(m => m.id === stockMaterialMaterialId.value)
        state.value.stockMaterialPrice = material.price
        stockMaterialId.value = material.id
    }

    const fetchDataStockMaterial = async () => {
        try {
            const res = await axios.get(`${config.apiServer}/api/stockMaterial/list`)
            listStockMaterials.value = res.data.results
        } catch (e) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: e.message
            })
        }
    }

    const removeStockMaterial = async (id) => {
        try {
            const button = await Swal.fire({
                icon: 'warning',
                title: 'ยืนยันการลบ',
                text: 'คุณต้องการลบการรับเข้า Stock นี้หรือไม่',
                showCancelButton: true,
                showConfirmButton: true
            })
            if (button.isConfirmed) {
                await axios.delete(`${config.apiServer}/api/stockMaterial/remove/${id}`)
                fetchDataStockMaterial()
                fetchData()
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