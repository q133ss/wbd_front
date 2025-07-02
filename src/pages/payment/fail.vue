<script setup>
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

onMounted(() => {
  // Логика для аналитики или обработки ошибки
  console.log('Ошибка оплаты:', route.query);
});
</script>

<template>
  <div class="payment-fail-container">
    <div class="card fail-card">
      <div class="card-body text-center p-5">
        <div class="fail-icon mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="#dc3545" viewBox="0 0 16 16">
            <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z"/>
          </svg>
        </div>

        <h2 class="mb-3 fw-bold">Оплата не прошла</h2>

        <div class="alert alert-warning mb-4" role="alert">
          <i class="bi bi-exclamation-triangle-fill me-2"></i>
          Платеж не был завершен. Пожалуйста, попробуйте еще раз.
        </div>

        <div class="payment-details mb-4" v-if="route.query.Description">
          <div class="detail-item">
            <span class="detail-label">Попытка оплаты:</span>
            <span class="detail-value">{{ decodeURIComponent(route.query.Description) }}</span>
          </div>
          <div class="detail-item" v-if="route.query.Amount">
            <span class="detail-label">Сумма:</span>
            <span class="detail-value">{{ route.query.Amount }} {{ route.query.Currency }}</span>
          </div>
        </div>

        <div class="possible-reasons mb-4">
          <h5 class="mb-3 reason-title">Возможные причины:</h5>
          <ul class="text-start reason-ul">
            <li>Недостаточно средств на карте</li>
            <li>Банк отклонил операцию</li>
            <li>Истек срок действия карты</li>
            <li>Техническая ошибка</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.payment-fail-container {
  max-width: 600px;
  margin: 2rem auto;
  padding: 0 1rem;
}

.fail-card {
  border-radius: 12px;
  border: none;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
}

.fail-icon {
  color: #dc3545;
  animation: shake 0.5s;
}

.payment-details {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
  text-align: left;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;

  &:last-child {
    margin-bottom: 0;
  }
}

.detail-label {
  font-weight: 500;
  color: #6c757d;
}

.detail-value {
  font-weight: 600;
  color: #212529;
}

.reason-title{
  color: #212529;
}

.possible-reasons {
  background: #fff8f8;
  border-left: 4px solid #dc3545;
  padding: 1rem;
  border-radius: 0 8px 8px 0;
  text-align: left;
  color: #6c757d;
}

.reason-ul{
  list-style: none;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-5px); }
  40%, 80% { transform: translateX(5px); }
}
</style>
