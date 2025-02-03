<template>
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-t from-blue-900 to-blue-100">

        <div class="w-full max-w-md p-8 space-y-6 bg-white shadow-lg rounded-lg">

            <h2 class="text-3xl font-bold text-gary-900 text-center">
                Sign Into Nuxt ERP
            </h2>

            <form class="mt-8 space-y-6" @submit.prevent="handleSubmit()">

                <div class="rounded-md shadow-sm -space-y-px">
                    <div>
                        <div class="font-bold">Email</div>
                        <input type="text" v-model="state.email" class="form-control" placeholder="Email">
                        <span v-if="v$.email.$error" class="text-red-500 text-sm">{{ v$.email.$errors[0].$message }}</span>
                    </div>
                    <div class="pt-5">
                        <div class="font-bold">Password</div>
                        <input type="password" v-model="state.password" class="form-control" placeholder="Password">
                        <span v-if="v$.password.$error" class="text-red-500 text-sm">{{ v$.password.$errors[0].$message }}</span>
                    </div>
                </div>

                <div class="flex items-center justify-between">
                    <div  class="flex">
                        <input type="checkbox" id="remember-me" class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 rounded">
                        <label for="remember-me" class="ml-2 block text-sm text-gray-900">Remember me</label>
                    </div>

                    <div>
                        <a href="#" class="font-medium text-indigo-700 hover:text-indigo-400">Forgot Your Password?</a>
                    </div>
                </div>

                <div>
                    <button type="submit" class="btn-full">
                        Sign In
                    </button>
                </div>

            </form>

        </div>

    </div>
</template>
<script setup>
    import axios from 'axios'
    import Swal from 'sweetalert2'
    import config from '@/config'
    import useVuelidate from '@vuelidate/core'
    import { required, email, helpers } from '@vuelidate/validators'

    const state = ref({
        email: '',
        password: ''
    })

    const rules = computed(() => ({
        email: {
            required: helpers.withMessage("Email is required", required),
            email: helpers.withMessage("Invalid email address", email)
        },
        password: {
            required: helpers.withMessage("Password is required", required)
        }
    }))

    const v$ = useVuelidate(rules, state)

    const handleSubmit = async () => {
        try {
            await v$.value.$validate()
            if (!v$.value.$error) {
                const res = await axios.post(`${config.apiServer}/api/user/signIn`, {
                    email: state.value.email,
                    password: state.value.password
                })

                if(res.status === 200){
                    localStorage.setItem(config.token, res.data.token)
                    localStorage.setItem('nuxt_erp_user_id', res.data.id)
                    navigateTo('/home')
                }
                else{
                    Swal.fire({
                      icon: 'error',
                      title: 'Error',
                      text: 'Invalid email or password'
                    })
                }

                v$.value.$reset()
            }
        }
        catch (e) {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: e.response.data.error
            })
        }
    }
</script>