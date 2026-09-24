# Meu Painel de Gestão

Painel privado para gestão integrada de negócios, clientes, finanças, investimentos, vendas, cobranças, produtos, estoque, tarefas, agenda, projetos, metas, ideias, fornecedores, dívidas, links e campanhas de e-mail/WhatsApp.

## Segurança
- O projeto usa Supabase Auth e RLS.
- Nunca coloque service_role, senhas SMTP ou tokens da Meta no frontend/repositório.
- Segredos de provedores devem ficar em variáveis/segredos do servidor.

## Desenvolvimento
1. Copie `.env.example` para `.env.local`.
2. Informe URL e chave publicável do projeto Supabase **Meu Painel de Gestão**.
3. Rode `npm install` e `npm run dev`.

## Campanhas
O banco suporta grupos ilimitados, contatos em vários grupos, múltiplos perfis remetentes e filas por campanha. A função Supabase `prepare-campaign` prepara os destinatários. Entrega externa só deve ser ativada após configurar SMTP e/ou WhatsApp Business Platform com credenciais em ambiente seguro.
