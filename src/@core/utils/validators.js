import { isEmpty, isEmptyArray, isNullOrUndefined } from './helpers'

// 👉 Required Validator
export const requiredValidator = value => {
  if (isNullOrUndefined(value) || isEmptyArray(value) || value === false)
    return 'Это поле обязательное'
  
  return !!String(value).trim().length || 'Это поле обязательное'
}

// 👉 Email Validator
export const emailValidator = value => {
  if (isEmpty(value))
    return true
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  if (Array.isArray(value))
    return value.every(val => re.test(String(val))) || 'Укажите корректный email'
  
  return re.test(String(value)) || 'Укажите корректный email'
}

export const phoneValidator = phone => {
  const regExp = /^\+7\(\d{3}\)\d{3}-\d{2}-\d{2}$/
  const validPhone = regExp.test(phone)

  return validPhone || 'Введите номер в формате +7(999)999-99-99'
}


// 👉 Password Validator
export const passwordValidator = password => {
  const regExp = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%&*()]).{8,}/
  const validPassword = regExp.test(password)
  
  return validPassword || 'Поле должно содержать как минимум один прописной, строчный, специальный символ и цифру, минимум 8 символов'
}

// 👉 Confirm Password Validator
export const confirmedValidator = (value, target) => value === target || 'Пароли не совпадают'

// 👉 Between Validator
export const betweenValidator = (value, min, max) => {
  const valueAsNumber = Number(value)
  
  return (Number(min) <= valueAsNumber && Number(max) >= valueAsNumber) || `Введите число между ${min} и ${max}`
}

// 👉 Integer Validator
export const integerValidator = value => {
  if (isEmpty(value))
    return true
  if (Array.isArray(value))
    return value.every(val => /^-?[0-9]+$/.test(String(val))) || 'Это поле должно быть целым числом'
  
  return /^-?[0-9]+$/.test(String(value)) || 'Это поле должно быть целым числом'
}

// 👉 Regex Validator
export const regexValidator = (value, regex) => {
  if (isEmpty(value))
    return true
  let regeX = regex
  if (typeof regeX === 'string')
    regeX = new RegExp(regeX)
  if (Array.isArray(value))
    return value.every(val => regexValidator(val, regeX))
  
  return regeX.test(String(value)) || 'Формат поля Regex недопустим'
}

// 👉 Alpha Validator
export const alphaValidator = value => {
  if (isEmpty(value))
    return true
  
  return /^[A-Z]*$/i.test(String(value)) || 'Поле Alpha может содержать только алфавитные символы'
}

// 👉 URL Validator
export const urlValidator = value => {
  if (isEmpty(value))
    return true
  const re = /^(https?):\/\/[^\s$.?#].[^\s]*$/
  
  return re.test(String(value)) || 'URL недействителен'
}

// 👉 Length Validator
export const lengthValidator = (value, length) => {
  if (isEmpty(value))
    return true
  
  return String(value).length === length || `Поле должно содержать не менее ${length} символов`
}

// 👉 Alpha-dash Validator
export const alphaDashValidator = value => {
  if (isEmpty(value))
    return true
  const valueAsString = String(value)
  
  return /^[0-9A-Z_-]*$/i.test(valueAsString) || 'Все символы не действительны'
}
