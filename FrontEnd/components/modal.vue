<template>
    <div class="fixed inset-0 bg-gray-300 bg-opacity-30 flex items-center justify-center shadow-lg">

        <div :class="`w-full ${modalWidth}`">

            <div class="modal-title bg-gray-700 text-gray-100 p-4 rounded-tl-xl rounded-tr-xl shadow-lg flex justify-between items-center">
                <span class="text-lg font-bold">{{ title }}</span>
                <button class="btn bg-white text-gray-900 border-2 border-gray-300 shadow-none px-2 py-1" @click="closeModal()">
                    <font-awesome :icon="['fa', 'times']"/>
                </button>
            </div>

            <div class="modal-body bg-white p-4 rounded-bl-xl rounded-br-xl shadow-lg">
                <slot />
            </div>

        </div>

    </div>
</template>
<script setup>
    const emit = defineEmits(['close'])

    const props = defineProps({
        title: String,
        size: {
            type: String,
            default: 'md'
        }
    })

    const modalWidth = computed(() => {
        switch (props.size) {
            case 'lg': return 'max-w-2xl'; //for lg
            case 'xl': return 'max-w-4xl'; //for xl
            case 'md':
            default: return 'max-w-lg' //for md
        }
    })

    //close modal
    const closeModal = () => {
        emit('close')
    }

    //ESC close modal
    const escCloseModal = (event) => {
        if(event.key === 'Escape'){
            closeModal()
        }
    }

    onMounted(() => {
        window.addEventListener('keydown', escCloseModal)
    })
</script>