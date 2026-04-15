let chart;

// ===== Utils =====
function formatarMoeda(input) {
  let valor = input.value.replace(/\D/g, '');

  if (!valor) {
    input.value = '';
    return;
  }

  valor = parseInt(valor, 10) / 100;

  input.value = valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}

function parseValor(valor) {
  return parseFloat(valor.replace(/\D/g, '')) / 100 || 0;
}

function validarCampos() {
  const salarioInput = document.getElementById('salario');
  const fixosInput = document.getElementById('fixos');

  let valido = true;

  // limpa erros anteriores
  document.querySelectorAll('.error-message').forEach(e => e.remove());
  document.querySelectorAll('.input-error').forEach(e => e.classList.remove('input-error'));

  function mostrarErro(input, mensagem) {
    input.classList.add('input-error');

    const erro = document.createElement('div');
    erro.className = 'error-message';
    erro.textContent = mensagem;

    input.parentNode.appendChild(erro);
  }

  if (!salarioInput.value) {
    mostrarErro(salarioInput, 'Informe seu salário');
    valido = false;
  }

  if (!fixosInput.value) {
    mostrarErro(fixosInput, 'Informe seus gastos fixos');
    valido = false;
  }

  return valido;
}

// ===== UI Components =====
function criarCenterText(comprometido, cor) {
  const container = document.getElementById('centerText');
  container.replaceChildren(); // mais moderno que innerHTML = ''

  const label = document.createElement('span');
  label.textContent = 'Comprometido:';

  const value = document.createElement('strong');
  value.textContent = ` ${comprometido}%`;
  value.style.color = cor;

  container.append(label, value);
}

function criarSugestao(valorInvest) {
  const container = document.getElementById('sugestao');
  container.replaceChildren();

  const box = document.createElement('div');
  box.className = 'suggestion';

  const linha = document.createElement('div');
  linha.textContent = '💡 Sugestão de investimento: ';

  const valor = document.createElement('strong');
  valor.textContent = valorInvest.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });

  linha.appendChild(valor);

  const desc = document.createElement('div');
  desc.textContent = '(Base: 20% da renda ou sua sobra disponível)';
  desc.className = 'suggestion-desc'; // melhor que style inline

  box.append(linha, desc);
  container.appendChild(box);
}

// ===== Chart =====
function criarGrafico() {
  return new Chart(document.getElementById('grafico'), {
    type: 'doughnut',
    data: {
      labels: ['Fixos', 'Variáveis', 'Sobra'],
      datasets: [{
        data: [0, 0, 0],
        backgroundColor: ['#ef4444', '#f59e0b', '#3b82f6'],
        borderWidth: 0,
        hoverOffset: 14,
        spacing: 2
      }]
    },
    options: {
      onHover: (event, elements) => {
        event.native.target.style.cursor = elements.length ? 'pointer' : 'default';
      },
      animation: {
        duration: 1000,
        easing: 'easeOutCubic'
      },
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: '#e5e7eb',
            padding: 25,
            boxWidth: 12
          }
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const value = context.raw || 0;
              return `${context.label}: ${value.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              })}`;
            }
          }
        }
      },
      layout: {
        padding: {
          top: 30,
          bottom: 10
        }
      },
      cutout: '70%'
    }
  });
}

// ===== Main =====
function gerarGrafico() {
  if (!validarCampos()) return;
  const salario = parseValor(document.getElementById('salario').value);
  const fixos = parseValor(document.getElementById('fixos').value);
  const variaveis = parseValor(document.getElementById('variaveis').value);

  const totalGastos = fixos + variaveis;
  const sobra = Math.max(salario - totalGastos, 0);

  const sugestaoIdeal = salario * 0.2;
  const sugestaoInvest = Math.min(sugestaoIdeal, sobra);

  const comprometido = salario
    ? ((totalGastos / salario) * 100).toFixed(0)
    : 0;

  let cor = '#34d399';
  if (comprometido > 90) cor = '#f87171';
  else if (comprometido > 80) cor = '#fbbf24';

  criarCenterText(comprometido, cor);
  criarSugestao(sugestaoInvest);

  if (!chart) {
    chart = criarGrafico();
  }

  chart.data.datasets[0].data = [fixos, variaveis, sobra];
  chart.update();
}

document.querySelectorAll('input').forEach(input => {
  input.addEventListener('input', () => {
    input.classList.remove('input-error');
    const erro = input.parentNode.querySelector('.error-message');
    if (erro) erro.remove();
  });
});
