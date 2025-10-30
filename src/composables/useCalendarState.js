// src/composables/useCalendarState.js
import { ref } from "vue";

export const currentView = ref("week");
export const currentDate = ref(new Date());
