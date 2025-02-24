const axios = require('axios');
const cron = require('node-cron');

// Agendamento: executa a cada 1 minuto
cron.schedule('*/10 * * * * *', async () => {
  console.log(`Chamando a API em: ${new Date().toLocaleString()}`);
  try {
    const response = await axios.get('http://localhost:3000/api/cron');
    console.log('Resposta da API:', response.data);
  } catch (error) {
    console.error('Erro ao chamar a API:', error);
  }
});

console.log('Simulador de agendamento iniciado...');
