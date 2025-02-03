<template>
    <div>
        <div class="title">สินค้า</div>
        <div class="p-4">
            <button class="btn" @click="showModalProduct = true">
                <font-awesome class="icon" :icon="['fas', 'plus']" />
                เพิ่มสินค้า
            </button>

            <table class="table mt-3">
                <thead>
                    <tr>
                        <th class="text-left" width="200px">ชื่อ</th>
                        <th class="text-left">บรรจุภัณฑ์</th>
                        <th class="text-left">ประเภทสินค้า</th>
                        <th width="170px"></th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="product in products" :key="product.id">
                        <td class="text-left">
                            <div>{{ product.name }}</div>
                            <div v-if="product.remark" class="text-sm text-red-500">{{ product.remark }}</div>
                        </td>
                        <td class="text-left">{{ product.Packaging?.name }}</td>
                        <td class="text-left">{{ product.ProductType?.name }}</td>
                        <td>
                            <button class="btn mr-1" @click="openModalProdcutFormular(product.id)">
                                <font-awesome :icon="['fas', 'paperclip']" /> สูตร
                            </button>
                            <button class="btn btn-primary mr-1" @click="edit(product)">
                                <font-awesome :icon="['fas', 'pencil']" />
                            </button>
                            <button class="btn btn-danger" @click="remove(product.id)">
                                <font-awesome :icon="['fas', 'times']" />
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <modal v-if="showModalProduct" title="เพิ่มสินค้า" @close="closeModalProduct()">
            <div>ชื่อ</div>
            <input type="text" v-model="state.name" class="form-control">
            <span v-if="v$.name.$error" class="text-red-500 text-sm">{{ v$.name.$errors[0].$message }}</span>

            <div class="mt-3">หมายเหตุ</div>
            <input type="text" v-model="state.remark" class="form-control">
            <span v-if="v$.remark.$error" class="text-red-500 text-sm">{{ v$.remark.$errors[0].$message }}</span>

            <div class="mt-3">ประเภทสินค้า</div>
            <select v-model="selectedProductTypeId" class="form-control">
                <option v-for="productType in productTypes" :key="productType.id" :value="productType.id">
                    {{ productType.name }}
                </option>
            </select>

            <div class="mt-3">บรรจุภัณฑ์</div>
            <select v-model="selectedPackagingId" class="form-control">
                <option v-for="packaging in packagings" :key="packaging.id" :value="packaging.id">
                    {{ packaging.name }}
                </option>
            </select>

            <button class="mt-3 btn btn-primary" @click="save(['name', 'remark'])">
                <font-awesome class="icon" :icon="['fas', 'check']" />
                บันทึก
            </button>
        </modal>

        <modal v-if="showModalProductFormular" :title="`สูตรสินค้า : ${selectedProductName}`" @close="closeModalProductFormular()">
            <div>ส่วนผสม</div>
            <select v-model="materialId" class="form-control">
                <option v-for="material in materials" :key="material.id" :value="material.id">
                    {{ material.name }}
                </option>
            </select>

            <div class="mt-3">จำนวน</div>
            <input type="number" v-model="state.quantity" class="form-control">
            <span v-if="v$.quantity.$error" class="text-red-500 text-sm">{{ v$.quantity.$errors[0].$message }}</span>

            <div class="mt-3">หมายเหตุ</div>
            <input type="text" v-model="state.remarkFormular" class="form-control">
            <span v-if="v$.remarkFormular.$error" class="text-red-500 text-sm">{{ v$.remarkFormular.$errors[0].$message }}</span>

            <button class="btn btn-primary mt-3" @click="saveFormular(['quantity', 'remarkFormular'])">
                <font-awesome class="icon" :icon="['fas', 'check']" />
                บันทึก
            </button>

            <table class="table mt-3" v-if="formulars.length > 0">
                <thead>
                    <tr>
                        <th class="text-left">ส่วนผสม</th>
                        <th class="text-right">จำนวน</th>
                        <th class="text-left">หมายเหตุ</th>
                        <th width="110px"></th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="formular in formulars" :key="formular.id">
                        <td>{{ formular.Material.name }}</td>
                        <td class="text-right">{{ formular.quantity }}</td>
                        <td>{{ formular.remark }}</td>
                        <td class="text-center">
                            <button class="btn btn-primary mr-1" @click="editProductFormular(formular)">
                                <font-awesome :icon="['fas', 'pencil']" />
                            </button>
                            <button class="btn btn-danger" @click="removeFormular(formular.id)">
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
    import modal from '~/components/modal.vue';
    import Swal from 'sweetalert2';
    import axios from 'axios';
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
        name: '',
        remark: '',
        remarkFormular: '',
        quantity: 0
    })

    const rules = computed(() => ({
        name: {required: helpers.withMessage("Product name is required", required)},
        remark : { optional },
        remarkFormular: { optional },
        quantity: {
            required: helpers.withMessage("Quantity is required", required),
            minValue: minValue(0)
        }
    }))

    const v$ = useVuelidate(rules, state)

    const showModalProduct = ref(false)
    const id = ref('')
    const products = ref([])
    const packagings = ref([])
    const productTypes = ref([])
    const selectedPackagingId = ref('')
    const selectedProductTypeId = ref('')

    //modal formular
    const showModalProductFormular = ref(false)
    const materialId = ref('')
    const selectedProductName = ref('')
    const selectedProductId = ref('')
    const selectedFormularId = ref('')
    const materials = ref([])
    const formulars = ref([])

    onMounted(async () => {
        await fetchData()
    })

    const openModalProdcutFormular = async (productId) => {
        showModalProductFormular.value = true
        selectedProductName.value = products.value.find(p => p.id === productId).name
        selectedProductId.value = productId
        fetchDataFormular(productId)

        if (materials.value.length > 0) return

        try {
            const res = await axios.get(`${config.apiServer}/api/material/list`)
            materials.value = res.data.results
            materialId.value = materials.value[0].id
        } catch (e) {
            Swal.fire({
                icon: 'error',
                title: "Error",
                text: e.message
            })
        }
    }

    const closeModalProductFormular = () => {
        showModalProductFormular.value = false
    }

    const closeModalProduct = () => {
        showModalProduct.value = false
        id.value = ''
        state.value.name = ''
        state.value.remark = ''
    }

    const fetchDataFormular = async (productId) => {
        try {
            const res = await axios.get(`${config.apiServer}/api/productFormular/list/${productId}`)
            formulars.value = res.data.results
        } catch (e) {
            Swal.fire({
                icon: 'error',
                title: "Error",
                text: e.message
            })
        }
    }

    const fetchData = async () => {
        try {
            const res = await axios.get(`${config.apiServer}/api/product/list`)
            products.value = res.data.results

            if (packagings.value.length === 0) {
                const res = await axios.get(`${config.apiServer}/api/packaging/list`)
                packagings.value = res.data.results
                selectedPackagingId.value = packagings.value[0].id
            }

            if (productTypes.value.length === 0) {
                const res = await axios.get(`${config.apiServer}/api/productType/list`)
                productTypes.value = res.data.results
                selectedProductTypeId.value = productTypes.value[0].id
            }
        } catch (e) {
            Swal.fire({
                icon: 'error',
                title: "Error",
                text: e.message
            })
        }
    }

    const save = async (validate) => {
        try {
            await v$.value.$validate()
            const hasErrors = validate.some((field) => v$.value[field].$error)

            if (!hasErrors) {
                const payload = {
                    name: state.value.name,
                    remark: state.value.remark,
                    packagingId: selectedPackagingId.value,
                    productTypeId: selectedProductTypeId.value
                }

                if (id.value === '') {
                    await axios.post(`${config.apiServer}/api/product/create`, payload)
                }
                else {
                    await axios.put(`${config.apiServer}/api/product/update/${id.value}`, payload)
                    id.value = ''
                }
                v$.value.$reset()
                closeModalProduct()
            }

            await fetchData()
        } catch (e) {
            Swal.fire({
                icon: 'error',
                title: "Error",
                text: e.response.data.error
            })
        }
    }

    const edit = (product) => {
        showModalProduct.value = true
        state.value.name = product.name
        state.value.remark = product.remark
        id.value = product.id
    }

    const remove = async (id) => {
        try {
            const button = await Swal.fire({
                icon: 'warning',
                title: 'ยืนยันการลบ',
                text: 'คุณต้องการลบสินค้าตัวนี้ใช่หรือไม่',
                showCancelButton: true,
                showConfirmButton: true
            })

            if (button.isConfirmed) {
                await axios.delete(`${config.apiServer}/api/product/remove/${id}`)
                fetchData()
            }
        } catch (e) {
            Swal.fire({
                icon: 'error',
                title: "Error",
                text: e.message
            })
        }
    }

    const saveFormular = async (validate) => {
        try {
            await v$.value.$validate()
            const hasErrors = validate.some((field) => v$.value[field].$error)

            if (!hasErrors) {
                const payload = {
                    materialId: materialId.value,
                    quantity: state.value.quantity,
                    remark: state.value.remarkFormular,
                    productId: selectedProductId.value
                }

                if (selectedFormularId.value === '') {
                    await axios.post(`${config.apiServer}/api/productFormular/create`, payload)
                }
                else {
                    await axios.put(`${config.apiServer}/api/productFormular/update/${selectedFormularId.value}`, payload)
                    selectedFormularId.value = ''
                }

                state.value.quantity = 0
                state.value.remarkFormular = ''
                materialId.value = materials.value[0].id
                v$.value.$reset()
            }

            await fetchDataFormular(selectedProductId.value)
        } catch (e) {
            Swal.fire({
                icon: 'error',
                title: "Error",
                text: e.response.data.error
            })
        }
    }

    const editProductFormular = (formular) => {
        selectedFormularId.value = formular.id
        materialId.value = formular.materialId
        state.value.quantity = formular.quantity
        state.value.remarkFormular = formular.remark
    }

    const removeFormular = async (formularId) => {
        try {
            const button = await Swal.fire({
                icon: 'warning',
                title: 'ยืนยันการลบ',
                text: 'คุณต้องการลบสูตรนี้หรือไม่?',
                showCancelButton: true,
                showConfirmButton: true
            })

            if (button.isConfirmed) {
                await axios.delete(`${config.apiServer}/api/productFormular/remove/${formularId}`)
                await fetchDataFormular(selectedProductId.value)
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