<template>
    <div>
        <div class="title">ข้อมูลส่วนตัว</div>
        <div class="p-4">
            <div>
                <div>
                    <form @submit.prevent="save()">
                        <div class="form-group">
                            <div>Name</div>
                            <input type="text" class="form-control" v-model="state.name">
                            <span v-if="v$.name.$error" class="text-red-500 text-sm">{{ v$.name.$errors[0].$message }}</span>

                            <div class="mt-3">Username</div>
                            <input type="text" class="form-control" v-model="state.username">
                            <span v-if="v$.username.$error" class="text-red-500 text-sm">{{ v$.usernmae.$errors[0].$message }}</span>

                            <div class="mt-3">Email</div>
                            <input type="text" class="form-control" v-model="state.email">
                            <span v-if="v$.email.$error" class="text-red-500 text-sm">{{ v$.email.$errors[0].$message }}</span>

                            <div class="mt-3">Profile Picture</div>
                            <input type="file" class="w-full p-4 bg-cyan-200 rounded-lg" name="profile_img" id="" accept="image/png, image/jpeg" @change="fileChange">
                            <span v-if="v$.profile_img.$error" class="text-red-500 text-sm">{{ v$.profile_img.$errors[0].$message }}</span>

                            <div class="mt-3">Password <span class="text-red-500">(ถ้าต้องการเปลี่ยนกรุณากรอกข้อมูล)</span></div>
                            <input type="password" class="form-control" v-model="state.password">
                            <span v-if="v$.password.$error" class="text-red-500 text-sm">{{ v$.password.$errors[0].$message }}</span>

                            <div class="mt-3">Confirm Password <span class="text-red-500">(ถ้าต้องการเปลี่ยนกรุณากรอกข้อมูล)</span></div>
                            <input type="password" class="form-control" v-model="state.confirmPassword">
                            <span v-if="v$.confirmPassword.$error" class="text-red-500 text-sm">{{ v$.confirmPassword.$errors[0].$message }}</span>

                            <div class="mt-3">Login Access Rights</div>
                            <input type="radio" name="" id="admin" v-model="level" value="admin" class="me-2">
                            <label for="admin" class="me-2">Admin</label>

                            <input type="radio" name="" id="user" v-model="level" value="user" class="me-2">
                            <label for="user">User</label>

                            <div class="mt-3">
                                <button class="btn btn-primary">
                                    <font-awesome class="icon" :icon="['fa', 'check']"/>
                                    Save
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup>
    import config from '@/config';
    import axios from 'axios'
    import Swal from 'sweetalert2'
    import useVuelidate from '@vuelidate/core'
    import { required, helpers, sameAs, minLength, email, requiredIf } from '@vuelidate/validators'

    definePageMeta({
        layout: 'admin'
    })

    const comPlex = (value) => {
        if (!(value.match(/[a-z]/) && value.match(/[A-Z]/) && value.match(/[0-9]/))) {
            return false
        }
        return true
    }

    const fileLimit = (file) => helpers.withParams(
        {type: 'limit', value: file},
        (event) => {
            file = event.target.files[0]
            file.size / 1024 <= 2048
        }
    )

    const optional = (value) => {
        return !helpers.req(value) || value
    }

    const level = ref('admin')

    const state = ref({
        name: '',
        username: '',
        email: '',
        profile_img: null,
        password: '',
        confirmPassword: '',
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
        profile_img: {
            optional,
            fileLimit: helpers.withMessage("File size must less than 2MB", fileLimit)
        },
        password: { 
            optional,
            minLength: helpers.withMessage("Password must be morethan 8 character", minLength(8)),
            comPlex: helpers.withMessage("Password too easy", (value) => {
                if (!value) return true
                return comPlex(value)
            })
        },
        confirmPassword: { 
            requiredIf: helpers.withMessage("ConfirmPassword is required", requiredIf(state.value.password !== '')),
            sameAs: helpers.withMessage("Password didn't match", sameAs(state.value.password))
        },
    }))

    const v$ = useVuelidate(rules, state)

    onMounted(async () => {
        await fetchData()
    })

    const fetchData = async () => {
        try {
            const token = localStorage.getItem(config.token)
            const headers = {
                'Authorization': `Bearer ${token}`
            }

            const res = await axios.get(config.apiServer + '/api/user/info', { headers })

            state.value.name = res.data.result.name
            state.value.username = res.data.result.username
            state.value.email = res.data.result.email
            level.value = res.data.result.level

        } catch (e) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: e.message
            })
        }
    }

    const fileChange = (event) => {
        const file = event.target.files[0]
        state.value.profile_img = file
    }

    const save = async () => {
        try {
            const token = localStorage.getItem(config.token)
            const headers = {
                'Authorization': `Bearer ${token}`
            }

            await v$.value.$validate()
            if (!v$.value.$error) {
                const payload = {
                    name: state.value.name,
                    username: state.value.username,
                    email: state.value.email,
                    profile_img: state.value.profile_img,
                    password: state.value.password,
                    level: level.value
                }

                const formData = new FormData()
                Object.entries(payload).forEach(([key, value]) => formData.append(key, value))

                await axios.put(config.apiServer + '/api/user/update', formData, { headers })

                Swal.fire({
                    icon: 'success',
                    title: 'บันทึกข้อมูล',
                    text: 'บันทึกข้อมูลสำเร็จ',
                    timer: 1000
                })

                v$.value.$reset()

                setTimeout(() => {
                    state.value.password = ''
                    state.value.confirmPassword = ''
                }, 500)
            }

        } catch (e) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: e.response.data.error
            })
        }
    }
</script>