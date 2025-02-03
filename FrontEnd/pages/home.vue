<template>
    <div>
        <div class="title text-2xl font-bold">Dashboard</div>
        <div class="p-3">
            <div class="flex gap-2 items-center justify-center">
                <span>เดือน</span>
                <select v-model="selectedMonth" class="form-control-report w-40">
                    <option v-for="(month, index) in listMonths" :key="index" :value="index">
                        {{ month }}
                    </option>
                </select>

                <span>ปี</span>
                <select v-model="selectedYear" class="form-control-report w-40">
                    <option v-for="(year, index) in listYear" :key="index" :value="year">
                        {{ year }}
                    </option>
                </select>

                <button class="btn" @click="fetchData()">
                    <font-awesome class="icon" :icon="['fas', 'magnifying-glass']" />
                    แสดงรายการ
                </button>
            </div>

            <div class="flex justify-between gap-2 mt-4">
                <div class="rounded-xl w-full bg-gradient-to-b from-indigo-700 to-indigo-400">
                    <div class="text-white text-2xl px-8 py-5 rounded-t-xl">
                         แผนการผลิต (รายการ)
                    </div>
                    <div class="text-white text-5xl pt-3 pb-8 px-8 py-5 rounded-b-xl">
                        {{ sumProductionPlan.toLocaleString('th-TH') }}
                    </div>
                </div>

                <div class="rounded-xl w-full bg-gradient-to-b from-pink-700 to-pink-400">
                    <div class="text-white text-2xl px-8 py-5 rounded-t-xl">
                         ยอดการผลิต (รายการ)
                    </div>
                    <div class="text-white text-5xl pt-3 pb-8 px-8 py-5 rounded-b-xl">
                        {{ sumProduction.toLocaleString('th-TH') }}
                    </div>
                </div>

                <div class="rounded-xl w-full bg-gradient-to-b from-orange-700 to-orange-400">
                    <div class="text-white text-2xl px-8 py-5 rounded-t-xl">
                         สินค้ารอผลิต (รายการ)
                    </div>
                    <div class="text-white text-5xl pt-3 pb-8 px-8 py-5 rounded-b-xl">
                        {{ sumProductionWaiting.toLocaleString('th-TH') }}
                    </div>
                </div>

                <div class="rounded-xl w-full bg-gradient-to-b from-teal-700 to-teal-400">
                    <div class="text-white text-2xl px-8 py-5 rounded-t-xl">
                         ซื้อวัถตุดิบ (บาท)
                    </div>
                    <div class="text-white text-5xl pt-3 pb-8 px-8 py-5 rounded-b-xl">
                        {{ sumPurchase.toLocaleString('th-TH') }}
                    </div>
                </div>
            </div>
        </div>

        <div class="grid grid-cols-12 gap-2 mt-4">
            <div class="col-span-8">
                <div class="text-2xl text-center">ยอดการผลิตต่อเดือน</div>
                <canvas id="chartMonth" height="150"></canvas>
            </div>

            <div class="col-span-4">
                <div class="text-2xl text-center">ยอดการผลิตต่อเดือน</div>
                <canvas id="chartMonthDoughnut" height="80"></canvas>
            </div>
        </div>

        <div>
            <div class="mt-5 pb-10">
                <div class="pl-5 pr-5 w-full">
                    <div class="text-2xl text-center">ยอดการผลิตต่อวัน</div>
                    <canvas id="chartDay" height="100"></canvas>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup>
    import axios from 'axios'
    import Swal from 'sweetalert2'
    import config from '~/config'
    import dayjs from 'dayjs'
    import { Chart } from 'chart.js/auto'

    definePageMeta({
        layout: 'admin'
    })

    const listMonths = ref(["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"])
    const listDays = ref([])
    const listYear = ref([])
    const selectedMonth = ref(dayjs().month())
    const selectedYear = ref(dayjs().year())
    let sumProductionPerDays = ref([])
    const sumProductionPerMonth = ref([])
    const sumProductionPlan = ref(0)
    const sumProduction = ref(0)
    const sumProductionWaiting = ref(0)
    const sumPurchase = ref(0)

    const chartDay = ref(null)
    const chartMonth = ref(null)
    const chartMonthDoughnut = ref(null)

    onMounted(async () => {
        const totalDayInMonth = dayjs(`${selectedYear.value}-${selectedMonth.value}-01`).daysInMonth()
        listYear.value = Array.from({length: 5}, (_, i) => selectedYear.value - i)
        listDays.value = Array.from({length: totalDayInMonth}, (_, i) => i + 1)

        await fetchData()
    })

    const fetchData = async () => {
        sumProductionPerDays.value = []

        await fetchDataSumProductionPlan()
        await fetchDataSumProduction()
        await fetchDataSumPurchase()

        renderChartMonth()
        renderChartDay()
    }

    const fetchDataSumProductionPlan = async () => {
        try {
            const payload = {
                year: selectedYear.value,
                month: selectedMonth.value + 1
            }

            const res = await axios.post(`${config.apiServer}/api/report/sumProductionPlanPerYearAndMonth`, payload)
            sumProductionPlan.value = res.data.results
        } catch (e) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: e.message
            })
        }
    }

    const fetchDataSumProduction = async () => {
        try {
            const payload = {
                year: selectedYear.value,
                month: selectedMonth.value + 1
            }

            const res = await axios.post(`${config.apiServer}/api/report/sumProductionPerYearAndMonth`, payload)
            sumProduction.value = res.data.results

            sumProductionWaiting.value = sumProductionPlan.value - sumProduction.value < 0 ? 0 : sumProductionPlan.value - sumProduction.value
        } catch (e) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: e.message
            })
        }
    }

    const fetchDataSumPurchase = async () => {
        try {
            const payload = {
                year: selectedYear.value,
                month: selectedMonth.value + 1
            }

            const res = await axios.post(`${config.apiServer}/api/report/sumPriceStockMaterialPerYearAndMonth`, payload)
            sumPurchase.value = res.data.results
        } catch (e) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: e.message
            })
        }
    }

    const renderChartMonth = async () => {
        try {
            const payload = {
                year: selectedYear.value,
                month: selectedMonth.value + 1
            }

            const res = await axios.post(`${config.apiServer}/api/report/sumProductionPerYearAndMonth`, payload)
            sumProductionPerMonth.value = res.data.results

            if (chartMonth.value) {
                chartMonth.value.destroy()
            }

            chartMonth.value = new Chart(document.getElementById('chartMonth'), {
                type: 'bar',
                data: {
                    labels: listMonths.value,
                    datasets: [{
                        label: 'ProductionPerMonth',
                        data: sumProductionPerMonth.value
                    }]
                }
            })

            if (chartMonthDoughnut.value) {
                chartMonthDoughnut.value.destroy()
            }

            chartMonthDoughnut.value = new Chart(document.getElementById('chartMonthDoughnut'), {
                type: 'doughnut',
                data: {
                    labels: listMonths.value,
                    datasets: [{
                        label: 'ProductionPerMonth',
                        data: sumProductionPerMonth.value
                    }]
                }
            })
        } catch (e) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: e.message
            })
        }
    }

    const renderChartDay = async () => {
        try {
            const payload = {
                year: selectedYear.value,
                month: selectedMonth.value + 1
            }

            const res = await axios.post(`${config.apiServer}/api/report/sumProductionPerDayInMonthAndYear`, payload)
            sumProductionPerDays.value = res.data.results

            if (chartDay.value) {
                chartDay.value.destroy()
            }

            chartDay.value = new Chart(document.getElementById('chartDay'), {
                type: 'bar',
                data: {
                    labels: listDays.value,
                    datasets: [{
                        label: 'ProductionPerDay',
                        data: sumProductionPerDays.value
                    }]
                }
            })
        } catch (e) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: e.message
            })
        }
    }
</script>