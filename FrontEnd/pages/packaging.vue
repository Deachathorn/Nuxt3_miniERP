<template>
    <div>
        <div class="title">บรรจุภัณฑ์</div>
        <div class="p-4">
            <button class="btn" @click="showModalAddPackaging = true">
                <font-awesome class="icon" :icon="['fas', 'plus']"/>
                เพิ่มบรรจุภัณฑ์
            </button>

            <table class="table mt-3">
                <thead>
                    <tr>
                        <th width="200px" class="text-left">ชื่อบรรจุภัณฑ์</th>
                        <th class="text-left">หมายเหตุ</th>
                        <th width="110px"></th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="item in packaging" :key="item.id">
                        <td>{{ item.name }}</td>
                        <td>{{ item.remark }}</td>
                        <td>
                            <button class="btn btn-primary me-1" @click="edit(item)">
                                <font-awesome :icon="['fas', 'pencil']" />
                            </button>
                            <button class="btn btn-danger" @click="remove(item.id)">
                                <font-awesome :icon="['fas', 'times']" />
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <modal v-if="showModalAddPackaging" @close="closeModalAddPackaging" title="เพิ่มบรรจุภัณฑ์">
            <div>ชื่อบรรจุภัณฑ์</div>
            <input type="text" v-model="state.name" class="form-control">
            <span v-if="v$.name.$error" class="text-red-500 text-sm">{{ v$.name.$errors[0].$message }}</span>

            <div class="mt-3">หมายเหตุ</div>
            <input type="text" v-model="state.remark" class="form-control">
            <span v-if="v$.remark.$error" class="text-red-500 text-sm">{{ v$.remark.$errors[0].$message }}</span>

            <button class="btn btn-primary mt-3" @click="save()">
                <font-awesome class="icon" :icon="['fas', 'check']" />
                บันทึก
            </button>
        </modal>
    </div>
</template>
<script setup>
    import modal from '~/components/modal.vue'
    import axios from 'axios'
    import config from '@/config'
    import Swal from 'sweetalert2'
    import useVuelidate from '@vuelidate/core'
    import { required, helpers } from '@vuelidate/validators'

    definePageMeta({
        layout: 'admin'
    })

    const optional = (value) => {
        return !helpers.req(value) || value
    }

    const state = ref({
        name: '',
        remark: ''
    })

    const rules = computed(() => ({
        name: {
            required: helpers.withMessage("Name is required",  required)
        },
        remark: {
            optional
        }
    }))

    const v$ = useVuelidate(rules, state)

    const showModalAddPackaging = ref(false)
    const id = ref('')
    const packaging = ref([])

    onMounted(async () => {
        await fetchData()
    })

    const closeModalAddPackaging = () => {
        showModalAddPackaging.value = false
        state.value.name = ''
        state.value.remark = ''
    }

    const fetchData = async () => {
        try {
            const res = await axios.get(`${config.apiServer}/api/packaging/list`)
            packaging.value = res.data.results
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
                    name: state.value.name,
                    remark: state.value.remark
                }

                if (id.value === '') {
                    await axios.post(`${config.apiServer}/api/packaging/create`, payload)
                }
                else {
                    await axios.put(`${config.apiServer}/api/packaging/update/${id.value}`, payload)
                    id.value = ''
                }

                v$.value.$reset()
                closeModalAddPackaging()
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

    const edit = (packaging) => {
        id.value = packaging.id
        state.value.name = packaging.name
        state.value.remark = packaging.remark
        showModalAddPackaging.value = true
    }

    const remove = async (id) => {
        try {
            const button = await Swal.fire({
                icon: 'warning',
                title: 'ยืนยันการลบ',
                text: 'คุณต้องการลบบรรจุภัณฑ์นี้หรือไม่',
                showCancelButton: true,
                showConfirmButton: true
            })

            if (button.isConfirmed) {
                await axios.delete(`${config.apiServer}/api/packaging/remove/${id}`)
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