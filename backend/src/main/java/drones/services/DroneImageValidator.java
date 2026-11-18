package drones.services;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;

import drones.exception.ValidationException;
import org.jboss.resteasy.reactive.multipart.FileUpload;

/**
 * Utilitário compartilhado para validação de upload, chaves e tipos MIME de imagens.
 */
final class DroneImageValidator {

    static final long MAX_FILE_SIZE = 8 * 1024 * 1024;

    record ValidatedImage(Path file, String extension, String contentType, long contentLength) {
    }

    private DroneImageValidator() {
    }

    static ValidatedImage validarUpload(FileUpload arquivo) {
        if (arquivo == null || arquivo.uploadedFile() == null) {
            throw new ValidationException("O arquivo da imagem é obrigatório", "arquivo");
        }

        Path temporario = arquivo.uploadedFile();
        try {
            long tamanho = Files.size(temporario);
            if (tamanho == 0 || tamanho > MAX_FILE_SIZE) {
                throw new ValidationException("A imagem deve ter entre 1 byte e 8 MB", "arquivo");
            }

            String extensao = obterExtensao(arquivo.contentType(), temporario);
            return new ValidatedImage(temporario, extensao, tipoConteudoPorExtensao(extensao), tamanho);
        } catch (IOException e) {
            throw new UncheckedIOException("Não foi possível ler a imagem enviada", e);
        }
    }

    static void validarChave(String chave) {
        if (chave == null || chave.isBlank() || chave.startsWith("/") || chave.contains("\\")) {
            throw new ValidationException("Caminho de imagem inválido", "caminho");
        }
        for (int i = 0; i < chave.length(); i++) {
            if (chave.charAt(i) < 32) {
                throw new ValidationException("Caminho de imagem inválido", "caminho");
            }
        }
        for (String segmento : chave.split("/", -1)) {
            if (segmento.isEmpty() || "..".equals(segmento) || ".".equals(segmento)) {
                throw new ValidationException("Caminho de imagem inválido", "caminho");
            }
        }
    }

    static String obterTipoConteudo(String chave) {
        validarChave(chave);
        if (chave.endsWith(".jpg") || chave.endsWith(".jpeg")) {
            return "image/jpeg";
        }
        if (chave.endsWith(".png")) {
            return "image/png";
        }
        if (chave.endsWith(".gif")) {
            return "image/gif";
        }
        return "image/webp";
    }

    private static String tipoConteudoPorExtensao(String extensao) {
        return switch (extensao) {
            case ".jpg" -> "image/jpeg";
            case ".png" -> "image/png";
            case ".gif" -> "image/gif";
            default -> "image/webp";
        };
    }

    private static String obterExtensao(String tipoConteudo, Path arquivo) throws IOException {
        byte[] assinatura = new byte[12];
        int bytesLidos;
        try (var entrada = Files.newInputStream(arquivo)) {
            bytesLidos = entrada.read(assinatura);
        }

        if ("image/jpeg".equals(tipoConteudo)
                && bytesLidos >= 3
                && (assinatura[0] & 0xff) == 0xff
                && (assinatura[1] & 0xff) == 0xd8
                && (assinatura[2] & 0xff) == 0xff) {
            return ".jpg";
        }
        if ("image/png".equals(tipoConteudo)
                && bytesLidos >= 8
                && (assinatura[0] & 0xff) == 0x89
                && assinatura[1] == 'P'
                && assinatura[2] == 'N'
                && assinatura[3] == 'G'
                && (assinatura[4] & 0xff) == 0x0d
                && (assinatura[5] & 0xff) == 0x0a
                && (assinatura[6] & 0xff) == 0x1a
                && (assinatura[7] & 0xff) == 0x0a) {
            return ".png";
        }
        if ("image/gif".equals(tipoConteudo)
                && bytesLidos >= 6
                && assinatura[0] == 'G'
                && assinatura[1] == 'I'
                && assinatura[2] == 'F'
                && assinatura[3] == '8'
                && (assinatura[4] == '7' || assinatura[4] == '9')
                && assinatura[5] == 'a') {
            return ".gif";
        }
        if ("image/webp".equals(tipoConteudo)
                && bytesLidos >= 12
                && assinatura[0] == 'R'
                && assinatura[1] == 'I'
                && assinatura[2] == 'F'
                && assinatura[3] == 'F'
                && assinatura[8] == 'W'
                && assinatura[9] == 'E'
                && assinatura[10] == 'B'
                && assinatura[11] == 'P') {
            return ".webp";
        }

        throw new ValidationException("Formato inválido. Envie uma imagem JPEG, PNG, GIF ou WebP", "arquivo");
    }
}
