import buyer from "@/navigation/vertical/buyer.js"
import seller from "@/navigation/vertical/seller.js"
import noauth from "@/navigation/vertical/noauth.js"

const userData = useCookie('userData')
const role = userData?.value?.role?.slug


let arr = []
if(role){
  if (role === 'seller') {
    arr = [...seller]
  } else {
    arr = [...buyer]
  }
}else{
  arr = [...noauth]
}

export default arr


