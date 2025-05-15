import buyer from "@/navigation/vertical/buyer.js"
import seller from "@/navigation/vertical/seller.js"

const userData = useCookie('userData')
const role = userData?.value?.role?.slug

let arr = []

if (role === 'seller') {
  arr = [...seller]
} else {
  arr = [...buyer]
}

export default arr


