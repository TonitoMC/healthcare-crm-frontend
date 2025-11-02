// src/composables/useCalendarState.js
import { ref } from "vue";

export const currentView = ref("month");
export const currentDate = ref(new Date());
export const selectedDate = ref(null);
export const dayDialogVisible = ref(false);
