package drones.services;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import drones.exception.ValidationException;
import drones.model.drones.DroneImageStorage;
import drones.services.DroneImageValidator.ValidatedImage;
import jakarta.annotation.Priority;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.inject.Alternative;
import jakarta.ws.rs.NotFoundException;
import org.jboss.resteasy.reactive.multipart.FileUpload;

/**
 * Stub em memória de {@link DroneImageStorage} para os testes de integração ({@code %test}).
 */
@Alternative
@Priority(1)
@ApplicationScoped
public class InMemoryDroneImageStorage implements DroneImageStorage {

    private record StoredObject(byte[] bytes, String contentType) {
    }

    private final Map<String, StoredObject> objetos = new ConcurrentHashMap<>();

    @Override
    public String salvar(Long droneId, FileUpload arquivo) {
        if (droneId == null || droneId <= 0) {
            throw new ValidationException("Id do drone é inválido", "id");
        }
        ValidatedImage validada = DroneImageValidator.validarUpload(arquivo);
        String chave = "drones/" + droneId + "/" + UUID.randomUUID() + validada.extension();
        try {
            byte[] bytes = Files.readAllBytes(validada.file());
            objetos.put(chave, new StoredObject(bytes, validada.contentType()));
            return chave;
        } catch (IOException e) {
            throw new UncheckedIOException("Não foi possível ler o arquivo enviado no teste", e);
        }
    }

    @Override
    public void deletar(String chave) {
        DroneImageValidator.validarChave(chave);
        objetos.remove(chave);
    }

    @Override
    public ImagemConteudo buscar(String chave) {
        DroneImageValidator.validarChave(chave);
        StoredObject objeto = objetos.get(chave);
        if (objeto == null) {
            throw new NotFoundException("Arquivo da imagem não encontrado");
        }
        return new ImagemConteudo(
                new ByteArrayInputStream(objeto.bytes()),
                objeto.contentType(),
                objeto.bytes().length);
    }

    @Override
    public String obterTipoConteudo(String chave) {
        return DroneImageValidator.obterTipoConteudo(chave);
    }

    public boolean contem(String chave) {
        return objetos.containsKey(chave);
    }

    public void limpar() {
        objetos.clear();
    }
}
