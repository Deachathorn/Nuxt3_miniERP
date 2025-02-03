<template>
    <div>
        <div class="title">ประเภทสินค้า</div>
        <div class="p-4">
            <button class="btn" @click="showModal = true">
                <font-awesome class="icon" :icon="['fas', 'plus']"/>
                เพิ่มประเภทสินค้า
            </button>

            <table class="table mt-3">
                <thead>
                    <tr>
                        <th class="text-left">ชื่อ</th>
                        <th class="text-left">หมายเหตุ</th>
                        <th width="110px"></th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="productType in productTypes" :key="productType.id">
                        <td>{{ productType.name }}</td>
                        <td>{{ productType.remark }}</td>
                        <td class="text-center">
                            <button class="btn btn-primary me-1" @click="update(productType)">
                                <font-awesome :icon="['fa', 'pencil']"/>
                            </button>
                            <button class="btn btn-danger" @click="remove(productType.id)">
                                <font-awesome :icon="['fa', 'trash']"/>
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <modal v-if="showModal" title="เพิ่มประเภทสินค้า" @close="closeModal()">
            <div>ชื่อ</div>
            <input type="text" v-model="state.name" class="form-control">
            <span v-if="v$.name.$error" class="text-red-500 text-sm">{{ v$.name.$errors[0].$message }}</span>

            <div class="mt-3">หมายเหตุ</div>
            <input type="text" v-model="state.remark" class="form-control">
            <span v-if="v$.remark.$error" class="text-red-500 text-sm">{{ v$.remark.$errors[0].$message }}</span>

            <button class="btn mt-3" @click="save()">
                <font-awesome class="icon" :icon="['fa', 'check']"/> บันทึก
            </button>
        </modal>
    </div>
</template>
<script setup>
    import modal from '~/components/modal.vue';
    import config from '~/config';
    import axios from 'axios'
    import Swal from 'sweetalert2'
    import useVuelidate from '@vuelidate/core'
    import { helpers, required } from '@vuelidate/validators'

    definePageMeta({
        layout: 'admin'
    })

    const optional = (value) => {
        return !helpers.req(value) || value
    }

    const state = ref({
        name: '',
        remark: '',
    })

    const rules = computed(() => ({
        name: { required: helpers.withMessage("Name is required", required) },
        remark: { optional }
    }))

    const v$ = useVuelidate(rules, state)

    const showModal = ref(false)
    const id = ref('')
    const productTypes = ref([])

    const closeModal = () => {
        showModal.value = false
        state.value.name = ''
        state.value.remark = ''
    }

    onMounted(async () => {
        await fecthData()
    })

    const fecthData = async () => {
        try {
            const res = await axios.get(config.apiServer + '/api/productType/list')
            productTypes.value = res.data.results
        } catch (e) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: e.message
            })
        }
    }

    //save
    const save = async () => {
        try {
            await v$.value.$validate()
            if (!v$.value.$error) {
                const payload = {
                    name: state.value.name,
                    remark: state.value.remark
                }

                if (id.value === '') {
                    await axios.post(config.apiServer + '/api/productType/create', payload)
                } else {
                    await axios.put(config.apiServer + '/api/productType/update/' + id.value, payload)
                    id.value = ''
                }

                v$.value.$reset()
            }
            else{
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: v$.value.name.$errors[0].$message
                })
            }

            await fecthData()
            closeModal()
        } catch (e) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: e.response.data.error
            })
        }
    }

    const update = (productType) => {
        id.value = productType.id
        state.value.name = productType.name
        state.value.remark = productType.remark
        showModal.value = true
    }

    const remove = async (id) => {
        try {
            const button = await Swal.fire({
                icon: 'warning',
                title: 'ยืนยันการลบ',
                text: 'คุณต้องการลบประเภทสินค้านี้หรือไม่?',
                showCancelButton: true,
                showConfirmButton: true
            })

            if (button.isConfirmed) {
                await axios.delete(config.apiServer + '/api/productType/remove/' + id)
                await fecthData()
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