package drones.services;

import drones.exception.ValidationException;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.jboss.resteasy.reactive.multipart.FileUpload;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;

@ApplicationScoped
public class DroneImageStorageService {

    private static final long MAX_FILE_SIZE = 8 * 1024 * 1024;

    @Inject
    @ConfigProperty(name = "app.uploads.directory", defaultValue = "uploads")
    String uploadDirectory;

    public Path salvar(FileUpload arquivo) {
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
            Path diretorio = diretorioUploads();
            Files.createDirectories(diretorio);
            Path destino = diretorio.resolve(UUID.randomUUID() + extensao);
            Files.copy(temporario, destino);
            return destino;
        } catch (IOException e) {
            throw new UncheckedIOException("Não foi possível salvar a imagem enviada", e);
        }
    }

    public void deletar(String nomeArquivo) {
        Path caminho = resolverArquivo(nomeArquivo);
        try {
            Files.deleteIfExists(caminho);
        } catch (IOException e) {
            throw new UncheckedIOException("Não foi possível excluir o arquivo da imagem", e);
        }
    }

    public Path buscar(String nomeArquivo) {
        Path caminho = resolverArquivo(nomeArquivo);
        if (!Files.isRegularFile(caminho)) {
            throw new jakarta.ws.rs.NotFoundException("Arquivo da imagem não encontrado");
        }
        return caminho;
    }

    public String obterTipoConteudo(String nomeArquivo) {
        if (nomeArquivo.endsWith(".jpg")) {
            return "image/jpeg";
        }
        if (nomeArquivo.endsWith(".png")) {
            return "image/png";
        }
        if (nomeArquivo.endsWith(".gif")) {
            return "image/gif";
        }
        return "image/webp";
    }

    private String obterExtensao(String tipoConteudo, Path arquivo) throws IOException {
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

    private Path diretorioUploads() {
        return Path.of(uploadDirectory).toAbsolutePath().normalize();
    }

    private Path resolverArquivo(String nomeArquivo) {
        if (nomeArquivo == null || nomeArquivo.isBlank()
                || !Path.of(nomeArquivo).getFileName().toString().equals(nomeArquivo)) {
            throw new ValidationException("Caminho de imagem inválido", "caminho");
        }
        Path caminho = diretorioUploads().resolve(nomeArquivo).normalize();
        if (!caminho.getParent().equals(diretorioUploads())) {
            throw new ValidationException("Caminho de imagem inválido", "caminho");
        }
        return caminho;
    }
}
