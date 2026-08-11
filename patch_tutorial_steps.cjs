const fs = require('fs');
let code = fs.readFileSync('src/components/Tutorial.tsx', 'utf-8');

const newSteps = `setSteps([
      {
        target: 'body',
        content: 'Bem-vindo ao Suíno DashPro! Vamos fazer um tour para entender como funciona o aplicativo.',
        placement: 'center',
        disableBeacon: true,
      },
      {
        target: '#sidebar-item-prioridades',
        content: 'Fila de Prioridades: Esta tela lista os lotes que exigem mais atenção. Lotes com alto desvio de consumo ou alta mortalidade aparecem no topo.',
        placement: 'right',
      },
      {
        target: '#sidebar-item-dashboard',
        content: 'Visão Geral (Dashboard): Aqui você acompanha os gráficos de crescimento e KPIs de toda a integração. Mostra Total de Lotes, Alertas (desvio > 5kg), Mortalidade Média e Desvio Médio de consumo.',
        placement: 'right',
      },
      {
        target: '#sidebar-item-visitas',
        content: 'Lançamento de Visitas: Aqui é onde a coleta de dados acontece. Você registrará a idade do lote, os animais alojados/mortos e as entregas de ração.',
        placement: 'right',
      },
      {
        target: '#sidebar-item-integrados',
        content: 'Gestão de Lotes: Cadastre os produtores, vincule dados importantes e defina se um lote está em andamento ou foi fechado.',
        placement: 'right',
      },
      {
        target: '#sidebar-item-curva',
        content: 'Curva de Referência: São os parâmetros ideais de consumo. Os dados são comparados contra esta tabela para saber se o lote está dentro do esperado.',
        placement: 'right',
      },
      {
        target: 'body',
        content: 'Tudo pronto! O app funciona offline, então caso não tenha internet no campo, os dados serão salvos localmente e sincronizados na próxima conexão.',
        placement: 'center',
      }
    ]);`;

code = code.replace(/setSteps\(\[[\s\S]*?\]\);/, newSteps);

fs.writeFileSync('src/components/Tutorial.tsx', code);
console.log('patched Tutorial steps');
