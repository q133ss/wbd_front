import $api from "@/utils/api.js"

export default {
  async getBuybackById(id) {
    const token = useCookie('accessToken').value
    if (!token) return null

    const response = await $api(`/seller/buybacks/${id}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    })

    return response
  }
}
