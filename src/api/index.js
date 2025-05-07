import categoriesApi from './categories'
import productsApi from './products'
import reviewsApi from './reviews'
import sellerApi from './seller'
import favoriteApi from './favorite'
import authApi from './auth'

export default {
  products: productsApi,
  categories: categoriesApi,
  reviews: reviewsApi,
  seller: sellerApi,
  favorite: favoriteApi,
  auth: authApi,
}
