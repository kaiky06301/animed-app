# 🐾 Animed — App Mobile (Challenge FIAP 2026)

App mobile do **Animed** — solução para o Challenge da empresa parceira **Clyvo VET**.

O Animed é voltado ao **TUTOR** e transforma o cuidado com o pet numa jornada **gamificada**: cada ação de cuidado (vacina, consulta, check-up, atualização de peso, compra em parceiro…) vira pontos que sobem o nível do tutor e desbloqueiam **descontos** em pet shops parceiros.

Entrega da disciplina **Mobile Application Development** — Sprint 1/2.

---

## 👥 Squad Animed

| Integrante | RM |
|------------|------|
| **Kaiky de Oliveira Silva (líder)** | 566067 |
| Erick Bernardes Bradaschia | 565733 |
| Gabriel Santos Claudino | 564054 |
| Jonathan Moreira Gomes | 565060 |
| Lucas Fortes de Lima | 559523 |

---

## 🎮 Sistema de gamificação

### Como o tutor ganha pontos

| Categoria | Ações | Pontos |
|-----------|-------|--------|
| 📝 **Onboarding** | Cadastrar pet · informar raça · idade · peso · histórico de saúde · perfil completo (bônus) | +10 a +50 |
| 🔄 **Atualizações** | Atualizar peso · registrar vacina · registrar medicação · registrar consulta | +5 a +25 |
| 🩺 **Cuidado** | Check-up · agendamento · uso diário do app | +1 a +30 |
| 🛍️ **Consumo** | Compra em parceiro · check-in em parceiro | +5 a +20 |

### Níveis e desconto

| Nível | Faixa | Desconto em parceiros |
|-------|-------|-----------------------|
| 🥉 **Básico** | 0–99 pts | 0% |
| 🥈 **Cuidador** | 100–499 pts | 5% |
| 🥇 **Tutor Premium** | 500+ pts | 15% |

O desconto é aplicado **automaticamente** no preço dos produtos da tela **Recompensas**.

---

## 💰 Monetização

### B2C — 3 planos

| Plano | Preço | Inclui |
|-------|-------|--------|
| 🆓 **Gratuito** | R$ 0 | Cadastro do pet, lembretes básicos, pontuação inicial |
| 💼 **Intermediário** | R$ 14,90/mês | Relatórios personalizados, gamificação completa, alertas inteligentes |
| 👑 **Premium** | R$ 29,90/mês | Telemedicina (futuro), IA personalizada, suporte prioritário |

### B2B (pet shops) — modelo híbrido

- **Taxa base** (valor fixo pequeno) → pet shop entra na plataforma sem risco.
- **Comissão por performance** → Animed ganha % sobre as vendas geradas pelo app.

---

## 📱 Telas (8)

1. **Início** — dashboard com pontos, nível, progresso e atalhos
2. **Cadastro do Pet** — formulário com `useState` (cada campo gera pontos)
3. **Cuidados** — registrar vacina, medicação, consulta, check-up, peso, agendamento
4. **Comunidade** — feed de tutores com dicas por raça (diferencial)
5. **Recompensas** — catálogo de produtos parceiros com desconto aplicado pelo nível
6. **Histórico** — log persistido de todas as pontuações recebidas
7. **Perfil** — dados do tutor + pet, plano atual, atalhos pra Planos e Histórico
8. **Planos** — escolha entre Gratuito, Intermediário e Premium

---

## ✅ Requisitos da disciplina atendidos

| Requisito (Sprint 1) | Implementação | Pontos |
|----------------------|---------------|-------:|
| **Navegação entre telas** (mín. 5 rotas) | React Navigation: Bottom Tabs (5) + Native Stack (3) = **8 rotas** | 20 |
| **Protótipo visual funcional** | Tema escuro consistente, paleta verde-menta + laranja + dourado, fluxo lógico | 30 |
| **Formulário com manipulação de estado** | `CadastroPetScreen` usa `useState` em todos os campos com feedback dinâmico | 20 |
| **Armazenamento local (AsyncStorage)** | `AnimedContext` persiste pet, pontos, plano, histórico e ações já contabilizadas | 20 |
| **Vídeo narrado** | A gravar (até 5 min, em dispositivo físico/emulador) | 10 |

---

## 🧰 Stack

- **React Native** 0.85 + **Expo** SDK 56
- **TypeScript** 6
- **React Navigation** (`@react-navigation/native`, `bottom-tabs`, `native-stack`)
- **AsyncStorage** (`@react-native-async-storage/async-storage`)
- **Expo Vector Icons** (Ionicons)

---

## ▶️ Como executar

```bash
# instalar dependências
npm install

# rodar no dispositivo físico (Expo Go)
npx expo start
# leia o QR Code com o app Expo Go

# emuladores
npm run android
npm run ios

# preview no navegador (não vale como entrega — usar dispositivo/emulador)
npm run web
```

---

## 🗂️ Estrutura

```
animed-app/
├── App.tsx                          # provider + navegação raiz
├── src/
│   ├── components/                  # Botao, Cartao (reutilizáveis)
│   ├── data/                        # mocks (parceiros, comunidade)
│   ├── navigation/                  # RaizNavigator, AbasNavigator, tipos
│   ├── screens/                     # 8 telas
│   ├── state/                       # AnimedContext + AsyncStorage + tipos
│   ├── theme/                       # paleta, espaçamentos, raios
│   └── utils/                       # regras de pontos, níveis e desconto
└── package.json
```

---

## 🌐 Posicionamento

> **Animed** — solução para o Challenge da empresa parceira **Clyvo VET**.

A Clyvo VET propôs transformar a jornada do pet de **episódica → contínua, preventiva e inteligente**. O Animed ataca a parte de **continuidade e engajamento**: gamifica cada ação de cuidado, recompensa com desconto real em parceiros e cria comunidade entre tutores.
