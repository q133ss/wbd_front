import $api from '@/utils/api'

export default {
  async getAds(params = {}) {
    const token = useCookie('accessToken').value
    if (!token) return null

    return await $api('/seller/ads', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      },
      params
    })
  },

  async getAdById(adId) {
    const token = useCookie('accessToken').value
    if (!token) return null

    return await $api(`/seller/ads/${adId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
  },

  async createAd(adData) {
    const token = useCookie('accessToken').value
    if (!token) return null

    return await $api('/seller/ads', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(adData)
    })
  },

  async updateAd(adId, adData) {
    const token = useCookie('accessToken').value
    if (!token) return null

    return await $api(`/seller/ads/${adId}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(adData)
    })
  },

  async stopAds(adIds) {
    const token = useCookie('accessToken').value
    if (!token) return null

    return await $api('/seller/ads/stop', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ ad_ids: adIds })
    })
  },

  async archiveAds(adIds) {
    const token = useCookie('accessToken').value
    if (!token) return null

    return await $api('/seller/ads/archive', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ ad_ids: adIds })
    })
  },

  async duplicateAds(adIds) {
    const token = useCookie('accessToken').value
    if (!token) return null

    return await $api('/seller/ads/duplicate', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ ad_ids: adIds })
    })
  }
}
