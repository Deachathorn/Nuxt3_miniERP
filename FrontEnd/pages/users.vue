<template>
    <div>
        <div class="title">Users Management</div>
        <div class="p-4">
            <button class="btn" @click="openModal()">
                <font-awesome class="icon" :icon="['fas', 'plus']" />
                เพิ่มผู้ใช้งาน
            </button>

            <table class="table mt-3">
                <thead>
                    <tr>
                        <th class="text-left">ชื่อ</th>
                        <th class="text-left">username</th>
                        <th class="text-left">email</th>
                        <th class="text-left">ระดับสิทธิ์</th>
                        <th width="110"></th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="user in users" :key="user.id">
                        <td class="text-left">{{ user.name }}</td>
                        <td class="text-left">{{ user.username }}</td>
                        <td class="text-left">{{ user.email }}</td>
                        <td class="text-left">{{ user.level }}</td>
                        <td class="text-center">
                            <button class="btn btn-primary mr-1" @click="edit(user)">
                                <font-awesome :icon="['fas', 'pencil']" />
                            </button>
                            <button class="btn btn-danger" @click="remove(user.id)">
                                <font-awesome :icon="['fas', 'times']" />
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <modal v-if="showModal" @close="closeModal()" title="ผู้ใช้งาน">
            <div>ชื่อ</div>
            <input type="text" class="form-control" v-model="state.name">
            <span v-if="v$.name.$error" class="text-red-500 text-sm">{{ v$.name.$errors[0].$message }}</span>

            <div class="mt-3">Username</div>
            <input type="text" class="form-control" v-model="state.username">
            <span v-if="v$.username.$error" class="text-red-500 text-sm">{{ v$.username.$errors[0].$message }}</span>

            <div class="mt-3">Email</div>
            <input type="text" class="form-control" v-model="state.email">
            <span v-if="v$.email.$error" class="text-red-500 text-sm">{{ v$.email.$errors[0].$message }}</span>

            <div class="mt-3">Password</div>
            <input type="password" class="form-control" v-model="state.password">
            <span v-if="v$.password.$error" class="text-red-500 text-sm">{{ v$.password.$errors[0].$message }}</span>

            <div class="mt-3">Confirm Password</div>
            <input type="password" class="form-control" v-model="state.confirmPassword">
            <span v-if="v$.confirmPassword.$error" class="text-red-500 text-sm">{{ v$.confirmPassword.$errors[0].$message }}</span>

            <div class="mt-3">ระดับสิทธิ์</div>
            <select class="form-control" v-model="level">
                <option v-for="(item, index) in listLevel" :key="index" :value="item">
                    {{ item }}
                </option>
            </select>

            <button class="btn mt-3" @click="save()">
                <font-awesome class="icon" :icon="['fas', 'check']" />
                บันทึก
            </button>
        </modal>
    </div>
</template>
<script setup>
    import axios from 'axios'
    import Swal from 'sweetalert2'
    import config from '~/config'
    import modal from '~/components/modal.vue'
    import useVuelidate from '@vuelidate/core'
    import { required, helpers, minLength, sameAs, email } from '@vuelidate/validators'

    definePageMeta({
        layout: 'admin'
    })

    const comPlex = (value) => {
        if (!(value.match(/[a-z]/) && value.match(/[A-Z]/) && value.match(/[0-9]/))) {
            return false
        }
        return true
    }

    const state = ref({
        name: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    })

    const rules = computed(() => ({
        name: {
            required: helpers.withMessage("Name is required", required)
        },
        username: {
            required: helpers.withMessage("Username is required", required)
        },
        email: {
            required: helpers.withMessage("Email is required", required),
            email: helpers.withMessage("Email is invalid", email)
        },
        password: {
            required: helpers.withMessage("Password is required", required),
            minLength: helpers.withMessage("Password must be morethan 8 character", minLength(8)),
            comPlex: helpers.withMessage("Password too easy", comPlex)
        },
        confirmPassword: {
            required: helpers.withMessage("ConfirmPassword is required", required),
            sameAs: helpers.withMessage("Password did not match", sameAs(state.value.password))
        }
    }))

    const v$ = useVuelidate(rules, state)

    const showModal = ref(false)
    const users = ref([])
    const id = ref('')
    const level = ref('')
    const listLevel = ref (['admin', 'user'])

    onMounted(async () => {
        await fetchData()
    })

    const fetchData = async () => {
        try {
            const res = await axios.get(`${config.apiServer}/api/user/list`)
            users.value = res.data.results
        } catch (e) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: e.message
            })
        }
    }

    const openModal = () => {
        showModal.value = true
        id.value = ''
        state.value.name = ''
        state.value.username = ''
        state.value.email = ''
        state.value.password = ''
        state.value.confirmPassword = ''
        level.value = 'admin'
    }

    const closeModal = () => {
        showModal.value = false
    }

     const save = async () => {
        try {
            await v$.value.$validate()
            if (!v$.value.$error) {
                const payload = {
                    name: state.value.name,
                    username: state.value.username,
                    email: state.value.email,
                    password: state.value.password,
                    level: level.value
                }

                if (id.value === '') {
                    await axios.post(`${config.apiServer}/api/user/create`, payload)
                    Swal.fire({
                        icon: 'success',
                        title: 'Create user success',
                    })
                }
                else {
                    await axios.put(`${config.apiServer}/api/user/updateUser/${id.value}`, payload)
                    id.value = ''
                    Swal.fire({
                        icon: 'success',
                        title: 'Update user success',
                    })
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

     const edit = (user) => {
        id.value = user.id
        state.value.name = user.name,
        state.value.username = user.username,
        state.value.email = user.email
        level.value = user.level

        showModal.value = true
     }

     const remove = async (id) => {
        try {
            const button = await Swal.fire({
                icon: 'warning',
                title: 'ยืนยันการลบ',
                text: 'คุณต้องการลบข้อมูลนี้หรือไม่',
                showCancelButton: true,
                showConfirmButton: true
            })

            if (button.isConfirmed) {
                await axios.delete(`${config.apiServer}/api/user/remove/${id}`)
                await fetchData()
                Swal.fire({
                    icon: 'success',
                    title: 'Remove user success'
                })
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