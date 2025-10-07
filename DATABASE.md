# 📊 Sistema de Banco de Dados

## Como Funciona

Este projeto usa uma **estratégia híbrida** para o banco de dados:

### 🔧 Desenvolvimento (Local)

- **SQLite** com `better-sqlite3`
- Arquivo: `database.sqlite` (não versionado no git)
- Permite leitura e escrita para testes

### 🚀 Produção (Vercel)

- **JSON estático** para leitura
- Arquivos: `src/data/*.json` (versionados no git)
- Apenas leitura - ideal para catálogo de Digimons

## Scripts Disponíveis

```bash
# Exportar dados do SQLite para JSON
npm run export

# Popular o banco SQLite em desenvolvimento
npm run seed

# Build (exporta automaticamente antes de buildar)
npm run build
```

## Fluxo de Trabalho

1. **Desenvolvimento Local:**

   ```bash
   npm run seed      # Popular banco SQLite
   npm run dev       # Rodar em modo desenvolvimento
   ```

2. **Preparar para Deploy:**

   ```bash
   npm run export    # Exportar SQLite → JSON
   git add src/data/*.json
   git commit -m "Atualizar dados"
   git push
   ```

3. **Deploy na Vercel:**
   - O Vercel roda `npm run build`
   - Como não há SQLite na Vercel, usa os JSONs versionados no git
   - Em produção, lê dados dos arquivos JSON

## Adicionar Novos Dados

1. Edite o arquivo de seed: `scripts/seed-simple.ts`
2. Rode: `npm run seed`
3. Exporte: `npm run export`
4. Commit os arquivos JSON atualizados
5. Deploy!

## ⚠️ Importante

- **Produção é SOMENTE LEITURA** (JSON)
- Para alterar dados em prod: edite localmente → exporte → commit → deploy
- O arquivo `database.sqlite` NÃO vai para produção
- Os arquivos JSON são versionados e vão para produção
