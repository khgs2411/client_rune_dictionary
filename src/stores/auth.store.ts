import { useLocalStorage } from "@vueuse/core";
import { defineStore } from "pinia";
import { computed, Ref } from "vue";

export const useAuthStore = defineStore('auth', () => {
    const cookie: Ref<string | null> = useLocalStorage('auth_cookie', null);
    
    const isAuthenticated = computed(() => {
        return cookie.value !== null && cookie.value.length > 0;
    })

    function setCookie(newCookie: string | null) {
        cookie.value = newCookie;
    }

    return {
        // State
        cookie,
        isAuthenticated,

        // Actions
        setCookie,
    };
});