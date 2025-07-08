import { computed } from 'vue'
import buyer from "@/navigation/vertical/buyer.js"
import seller from "@/navigation/vertical/seller.js"
import noauth from "@/navigation/vertical/noauth.js"

export default computed(() => {
  const userData = useCookie('userData')
  const role = userData?.value?.role?.slug

  if (role) {
    return role === 'seller' ? seller.value : buyer
  }

  return noauth
})
