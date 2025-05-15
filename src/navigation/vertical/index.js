import buyer from "@/navigation/vertical/buyer.js"
import seller from "@/navigation/vertical/seller.js"

const userData = useCookie('userData')
const role = userData?.value?.role?.slug

let arr = []

if (role === 'buyer') {
  arr = [...buyer]
} else {
  arr = [...seller]
}

export default arr


