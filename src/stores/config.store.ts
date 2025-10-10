import { defineStore } from "pinia";
import { ref } from "vue";

export const useConfigStore = defineStore('config', () => { 

    const characterMoveSpeed = ref(10);

    return {
        characterMoveSpeed,
    }
});