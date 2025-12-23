const axios = require('axios');

async function testarAPI() {
  console.log('\n🧪 Testando API de Atualizações\n');
  
  try {
    console.log('📡 Buscando atualizações...');
    const resposta = await axios.get('http://localhost:3000/api/atualizacoes');
    
    console.log('✅ Sucesso!');
    console.log(`📊 Total de atualizações: ${resposta.data.total}`);
    console.log('\n📋 Primeiras 3 atualizações:');
    
    resposta.data.atualizacoes.slice(0, 3).forEach((atualizacao, index) => {
      console.log(`\n${index + 1}. ${atualizacao.title}`);
      console.log(`   Versão: ${atualizacao.version}`);
      console.log(`   Conteúdo: ${atualizacao.content.substring(0, 50)}...`);
    });
    
  } catch (erro) {
    console.error('❌ Erro ao buscar atualizações:');
    console.error(erro.response?.data || erro.message);
  }
  
  console.log('\n');
}

async function testarExportacao() {
  console.log('📦 Testando exportação de dados...');
  
  try {
    const resposta = await axios.get('http://localhost:3000/api/exportar');
    
    console.log('✅ Exportação bem-sucedida!');
    console.log(`📊 Total de registros: ${resposta.data.total}`);
    console.log(`🕐 Exportado em: ${resposta.data.exportadoEm}`);
    
  } catch (erro) {
    console.error('❌ Erro na exportação:');
    console.error(erro.response?.data || erro.message);
  }
  
  console.log('\n');
}

async function testarEstatisticas() {
  console.log('📈 Testando estatísticas...');
  
  try {
    const resposta = await axios.get('http://localhost:3000/api/estatisticas');
    
    console.log('✅ Estatísticas obtidas!');
    console.log(`📊 Total: ${resposta.data.estatisticas.total}`);
    console.log('📋 Por prefixo:');
    
    Object.entries(resposta.data.estatisticas.porPrefixo).forEach(([prefixo, quantidade]) => {
      console.log(`   ${prefixo}: ${quantidade}`);
    });
    
  } catch (erro) {
    console.error('❌ Erro ao obter estatísticas:');
    console.error(erro.response?.data || erro.message);
  }
  
  console.log('\n');
}

async function executarTestes() {
  console.log('═══════════════════════════════════════════');
  console.log('  TESTE DA API DE ATUALIZAÇÕES');
  console.log('═══════════════════════════════════════════');
  
  await testarAPI();
  await testarExportacao();
  await testarEstatisticas();
  
  console.log('═══════════════════════════════════════════');
  console.log('  TESTES CONCLUÍDOS');
  console.log('═══════════════════════════════════════════\n');
}

executarTestes();

