import { NextRequest, NextResponse } from "next/server";
import { writeFile, unlink } from "fs/promises";
import path from "path";
import fs from "fs";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const type = (formData.get("type") as string) || "item"; // "item" ou "digimon" ou "tamer"
    const oldImage = formData.get("oldImage") as string | null; // Imagem anterior para deletar

    if (!file) {
      return NextResponse.json(
        { error: "Nenhum arquivo enviado" },
        { status: 400 }
      );
    }

    // Validar tipo de arquivo
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Apenas imagens são permitidas" },
        { status: 400 }
      );
    }

    // Criar nome único para o arquivo
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Gerar nome único usando timestamp
    const timestamp = Date.now();
    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const fileName = `${timestamp}_image.${extension}`;

    // Determinar diretório baseado no tipo
    let directory = "items";
    if (type === "digimon") {
      directory = "digimons";
    } else if (type === "tamer") {
      directory = "tamers";
    } else if (type === "boss") {
      directory = "bosses";
    }

    // Salvar em public/images/{directory}/
    const publicPath = path.join(
      process.cwd(),
      "public",
      "images",
      directory,
      fileName
    );
    await writeFile(publicPath, buffer);

    // Deletar imagem antiga se foi fornecida e for um upload customizado (não as padrão)
    if (oldImage && oldImage.startsWith("/images/")) {
      const oldFileName = path.basename(oldImage);

      // Só deletar se for arquivo de upload (contém timestamp)
      if (oldFileName.match(/^\d+_/)) {
        const oldImagePath = path.join(
          process.cwd(),
          "public",
          oldImage.substring(1) // Remove a barra inicial
        );

        try {
          if (fs.existsSync(oldImagePath)) {
            await unlink(oldImagePath);
            console.log(
              `✅ [UPLOAD] Imagem antiga removida automaticamente: ${oldImage}`
            );
          } else {
            console.log(
              `⚠️  [UPLOAD] Imagem antiga não encontrada: ${oldImage}`
            );
          }
        } catch (error) {
          console.error(
            `❌ [UPLOAD] Erro ao remover imagem antiga: ${oldImage}`,
            error
          );
          // Não falhar o upload se a remoção falhar
        }
      } else {
        console.log(
          `ℹ️  [UPLOAD] Imagem antiga é padrão, não será removida: ${oldImage}`
        );
      }
    }

    // Retornar caminho relativo
    const relativePath = `/images/${directory}/${fileName}`;

    return NextResponse.json({ path: relativePath });
  } catch (error) {
    console.error("Erro no upload:", error);
    return NextResponse.json(
      { error: "Erro ao fazer upload do arquivo" },
      { status: 500 }
    );
  }
}
