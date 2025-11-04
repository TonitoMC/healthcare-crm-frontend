import { api } from "@/services/api.js";

export const ScheduleService = {
  /**
   * Get default working hours for Monday–Sunday.
   */
  async getWorkingHours() {
    const { data } = await api.get("/schedule/working-hours");
    return data;
  },

  /**
   * Get special-day schedules within a range (e.g. holidays or overrides).
   * @param {String} start - YYYY-MM-DD
   * @param {String} end   - YYYY-MM-DD
   */
  async getSpecialHours(start, end) {
    const { data } = await api.get("/schedule/special-hours", {
      params: { start, end },
    });
    return data;
  },

  /**
   * Get effective schedule for a single day (merged working + special hours).
   * @param {String} date - YYYY-MM-DD
   */
  async getEffectiveDay(date) {
    const { data } = await api.get(`/schedule/effective/day/${date}`);
    return data;
  },

  /**
   * Get effective schedules for all days in a range.
   * @param {String} start - YYYY-MM-DD
   * @param {String} end   - YYYY-MM-DD
   */
  async getEffectiveRange(start, end) {
    const { data } = await api.get("/schedule/effective/range", {
      params: { start, end },
    });
    return data;
  },

  /**
   * Update the regular working hours for a specific day of the week.
   * Overwrites all ranges for that day.
   * @param {Object} payload
   * {
   *   day_of_week: Number (1–7),
   *   ranges: [ { start: "09:00", end: "17:00" } ]
   * }
   */
  async setWorkingHours(payload) {
    const { data } = await api.post("/schedule/working-hours", payload);
    return data;
  },

  /**
   * Create or update special hours for a specific date.
   * Send empty `ranges` to mark as a day off.
   * @param {Object} payload
   * {
   *   date: "2025-12-24",
   *   ranges: [ { start: "09:00", end: "12:00" } ]
   * }
   */
  async setSpecialHours(payload) {
    const { data } = await api.post("/schedule/special-hours", payload);
    return data;
  },

  /**
   * Delete a special-day schedule for a specific date.
   * @param {String} date - YYYY-MM-DD
   */
  async deleteSpecialHours(date) {
    const { data } = await api.delete(`/schedule/special-hours/${date}`);
    return data;
  },
};
