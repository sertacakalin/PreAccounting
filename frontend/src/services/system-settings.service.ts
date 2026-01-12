/**
 * System Settings API Service
 * Handles system configuration (Admin only)
 */

import api from './api'
import type { SystemSettings, UpdateSystemSettingsRequest } from '@/types/system-settings.types'

// System Settings service
export const systemSettingsService = {
  /**
   * Get current system settings
   */
  getSettings: async (): Promise<SystemSettings> => {
    const response = await api.get<SystemSettings>('/admin/settings')
    return response.data
  },

  /**
   * Update system settings
   */
  updateSettings: async (data: UpdateSystemSettingsRequest): Promise<SystemSettings> => {
    const response = await api.post<SystemSettings>('/admin/settings', data)
    return response.data
  },
}
