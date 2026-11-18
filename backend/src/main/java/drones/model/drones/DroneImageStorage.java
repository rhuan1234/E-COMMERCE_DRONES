package drones.model.drones;

import java.io.IOException;
import java.io.InputStream;

import org.jboss.resteasy.reactive.multipart.FileUpload;

/**
 * Contrato para armazenamento, leitura e remoção de imagens de drones.
 */
public interface DroneImageStorage {

    /**
     * Conteúdo da imagem recuperado do provedor de armazenamento.
     */
    record ImagemConteudo(InputStream stream, String contentType, long contentLength) implements AutoCloseable {
        @Override
        public void close() throws IOException {
            if (stream != null) {
                stream.close();
            }
        }
    }

    default void inicializar() {
    }

    String salvar(Long droneId, FileUpload arquivo);

    void deletar(String chave);

    ImagemConteudo buscar(String chave);

    String obterTipoConteudo(String chave);
}
