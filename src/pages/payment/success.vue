<script setup>
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

// Можно добавить логику обработки параметров
onMounted(() => {
  console.log('Параметры оплаты:', route.query);
});
</script>

<template>
  <div class="payment-success-container">
    <div class="card success-card">
      <div class="card-body text-center p-5">
        <div class="success-icon mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="#28a745" viewBox="0 0 16 16">
            <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
          </svg>
        </div>

        <h2 class="mb-3 fw-bold">Оплата прошла успешно!</h2>

        <div class="payment-details mb-4">
          <div class="detail-item">
            <span class="detail-label">Сумма:</span>
            <span class="detail-value">{{ route.query.Amount }} {{ route.query.Currency }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Номер транзакции:</span>
            <span class="detail-value">{{ route.query.TransactionId }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Описание:</span>
            <span class="detail-value">{{ decodeURIComponent(route.query.Description) }}</span>
          </div>
        </div>

        <p class="mb-4">Спасибо за ваш платеж! Чек отправлен на {{ route.query.Email }}</p>

        <div class="actions">
          <router-link to="/" class="btn btn-primary me-2">
            Вернуться на главную
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.payment-success-container {
  max-width: 600px;
  margin: 2rem auto;
  padding: 0 1rem;
}

.success-card {
  border-radius: 12px;
  border: none;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
}

.success-icon {
  color: #28a745;
  animation: bounce 1s;
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

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-20px);
  }
  60% {
    transform: translateY(-10px);
  }
}
</style>
