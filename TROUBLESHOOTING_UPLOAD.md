# 🔍 Troubleshooting - Sistema de Upload de Imagens

## Como Testar a Edição de Tamer

### Passo a Passo:

1. **Acessar** `http://localhost:3000`
2. **Clicar** em qualquer tamer na lista
3. **Modal abre** com "✏️ Editar Tamer"
4. **Clicar** em "📁 Alterar Imagem"
5. **Selecionar** uma imagem do computador
6. **Cropper deve aparecer** em tela cheia com fundo escuro
7. **Ajustar** a posição e zoom
8. **Clicar** em "✂️ Recortar e Usar"
9. **Preview** aparece no modal
10. **Clicar** em "💾 Salvar"
11. **Imagem deve atualizar** na lista

### O Que Verificar no Console (F12):

#### Durante Upload:

```
📤 Fazendo upload da imagem...
📥 Resposta do upload: 200
✅ Imagem enviada com sucesso: /images/tamers/1728394856_image.png
```

#### Durante Salvamento:

```
💾 Atualizando tamer com dados: {name: "Nome", image: "/images/tamers/..."}
📥 Resposta da API: 200
✅ Tamer atualizado: {id: 15, name: "Nome", image: "/images/tamers/..."}
```

## Problemas Comuns

### 1. Cropper não aparece

**Causa**: Biblioteca react-easy-crop não instalada
**Solução**:

```bash
npm install react-easy-crop
```

### 2. Upload falha com erro 500

**Causa**: Diretório não existe
**Solução**:

```bash
mkdir -p public/images/tamers
```

### 3. Imagem salva mas não aparece

**Causa**: Cache do navegador ou helper function não funcionando
**Solução**:

- Limpar cache (Ctrl+Shift+R)
- Verificar se `getTamerImagePath()` está sendo usado

### 4. Erro "Campo obrigatório"

**Causa**: API requer name e image
**Solução**: Verificar se ambos estão sendo enviados no PUT

## Verificação do Banco de Dados

Para verificar se a imagem foi salva:

```bash
npm run export
cat src/data/tamers.json
```

Deve mostrar algo como:

```json
{
  "id": 15,
  "name": "Felipe S. Oliveira",
  "image": "/images/tamers/1728394856_avatar.png"
}
```

## Arquivos Importantes

- `src/app/components/EditTamerModal.tsx` - Modal de edição
- `src/app/components/ImageCropper.tsx` - Componente de crop
- `src/app/api/upload/route.ts` - API de upload
- `src/app/api/tamers/[id]/route.ts` - API de atualização
- `src/lib/image-utils.ts` - Helpers de imagem
- `src/lib/tamer-db.ts` - Funções do banco

## Debug Adicional

Adicione console.log em pontos estratégicos:

1. **Antes de abrir o cropper**
2. **Depois de recortar**
3. **Antes do upload**
4. **Depois do upload**
5. **Antes de salvar no banco**
6. **Depois de salvar**

## Testar API Diretamente

```bash
# Atualizar tamer
curl -X PUT http://localhost:3000/api/tamers/15 \
  -H "Content-Type: application/json" \
  -d '{"name":"Teste","image":"/images/tamers/01.png"}'
```
