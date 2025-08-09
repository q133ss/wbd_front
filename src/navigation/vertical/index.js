import { useBuyerNavigation } from "@/navigation/vertical/buyer.js"
import noauth from "@/navigation/vertical/noauth.js"
import seller from "@/navigation/vertical/seller.js"
import { computed } from 'vue'

const { buyerNavItem } = useBuyerNavigation()

export default computed(() => {
  const userData = useCookie('userData')
  const role = userData?.value?.role?.slug

  if (role) {
    return role === 'seller' ? seller.value : buyerNavItem.value
  }

  return noauth
})
