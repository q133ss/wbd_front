import categoriesApi from './categories'
import productsApi from './products'
import reviewsApi from './reviews'
import sellerApi from './seller'
import favoriteApi from './favorite'
import authApi from './auth'
import profileApi from "@/api/profile"
import userApi from "@/api/user"
import adsApi from "@/api/ads"
import balanceApi from "@/api/balance"
import templateApi from "@/api/template"
import promocodeApi from "@/api/promocode"
import tariffApi from "@/api/tariff"

export default {
  products: productsApi,
  categories: categoriesApi,
  reviews: reviewsApi,
  seller: sellerApi,
  favorite: favoriteApi,
  auth: authApi,
  profile: profileApi,
  user: userApi,
  ads: adsApi,
  balance: balanceApi,
  template: templateApi,
  promocode: promocodeApi,
  tariff: tariffApi
}
