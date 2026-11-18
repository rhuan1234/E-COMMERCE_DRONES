package drones.services;

import java.util.UUID;

import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.jboss.logging.Logger;
import org.jboss.resteasy.reactive.multipart.FileUpload;

import drones.exception.ValidationException;
import drones.model.drones.DroneImageStorage;
import drones.services.DroneImageValidator.ValidatedImage;
import io.quarkus.arc.DefaultBean;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;
import software.amazon.awssdk.core.ResponseInputStream;
import software.amazon.awssdk.core.exception.SdkException;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.BucketAlreadyExistsException;
import software.amazon.awssdk.services.s3.model.BucketAlreadyOwnedByYouException;
import software.amazon.awssdk.services.s3.model.CreateBucketRequest;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;
import software.amazon.awssdk.services.s3.model.HeadBucketRequest;
import software.amazon.awssdk.services.s3.model.NoSuchBucketException;
import software.amazon.awssdk.services.s3.model.NoSuchKeyException;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.S3Exception;

/**
 * Armazenamento de imagens de drones em bucket Amazon S3 (compatível com AWS Emulator).
 */
@ApplicationScoped
@DefaultBean
public class S3DroneImageStorage implements DroneImageStorage {

    private static final Logger LOG = Logger.getLogger(S3DroneImageStorage.class);

    private final S3Client s3Client;
    private final String bucketName;

    @Inject
    public S3DroneImageStorage(
            S3Client s3Client,
            @ConfigProperty(name = "app.s3.bucket", defaultValue = "drones-imagens") String bucketName) {
        this.s3Client = s3Client;
        this.bucketName = bucketName;
    }

    @Override
    public void inicializar() {
        try {
            garantirBucketExiste();
        } catch (SdkException e) {
            LOG.warnf(e, "Não foi possível verificar/criar o bucket S3 '%s' na inicialização.", bucketName);
        }
    }

    @Override
    public String salvar(Long droneId, FileUpload arquivo) {
        if (droneId == null || droneId <= 0) {
            throw new ValidationException("Id do drone é inválido", "id");
        }
        ValidatedImage imagemValidada = DroneImageValidator.validarUpload(arquivo);
        String chave = "drones/" + droneId + "/" + UUID.randomUUID() + imagemValidada.extension();

        try {
            enviarObjeto(chave, imagemValidada);
        } catch (S3Exception e) {
            if (!isBucketMissing(e)) {
                throw e;
            }
            criarBucketSeAusente();
            enviarObjeto(chave, imagemValidada);
        }
        return chave;
    }

    @Override
    public void deletar(String chave) {
        DroneImageValidator.validarChave(chave);
        try {
            s3Client.deleteObject(DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(chave)
                    .build());
        } catch (S3Exception e) {
            if (!isNotFound(e)) {
                throw e;
            }
        }
    }

    @Override
    public ImagemConteudo buscar(String chave) {
        DroneImageValidator.validarChave(chave);
        try {
            ResponseInputStream<GetObjectResponse> resposta = s3Client.getObject(GetObjectRequest.builder()
                    .bucket(bucketName)
                    .key(chave)
                    .build());
            GetObjectResponse metadata = resposta.response();
            String contentType = metadata.contentType();
            if (contentType == null || contentType.isBlank()) {
                contentType = obterTipoConteudo(chave);
            }
            long contentLength = metadata.contentLength() != null ? metadata.contentLength() : -1L;
            return new ImagemConteudo(resposta, contentType, contentLength);
        } catch (S3Exception e) {
            if (isNotFound(e)) {
                throw new NotFoundException("Arquivo da imagem não encontrado");
            }
            throw e;
        }
    }

    @Override
    public String obterTipoConteudo(String chave) {
        return DroneImageValidator.obterTipoConteudo(chave);
    }

    void garantirBucketExiste() {
        try {
            s3Client.headBucket(HeadBucketRequest.builder().bucket(bucketName).build());
        } catch (S3Exception e) {
            if (isNotFound(e)) {
                criarBucketSeAusente();
            } else {
                throw e;
            }
        }
    }

    private void criarBucketSeAusente() {
        try {
            s3Client.createBucket(CreateBucketRequest.builder().bucket(bucketName).build());
            LOG.infof("Bucket S3 '%s' criado automaticamente.", bucketName);
        } catch (BucketAlreadyOwnedByYouException | BucketAlreadyExistsException ignored) {
            // Outro processo ou chamada concorrente já criou o bucket.
        } catch (S3Exception e) {
            if (e.statusCode() != 409) {
                throw e;
            }
        }
    }

    private void enviarObjeto(String chave, ValidatedImage imagemValidada) {
        PutObjectRequest request = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(chave)
                .contentType(imagemValidada.contentType())
                .contentLength(imagemValidada.contentLength())
                .build();
        s3Client.putObject(request, RequestBody.fromFile(imagemValidada.file()));
    }

    private static boolean isBucketMissing(S3Exception e) {
        if (e instanceof NoSuchBucketException) {
            return true;
        }
        String code = e.awsErrorDetails() != null ? e.awsErrorDetails().errorCode() : null;
        return "NoSuchBucket".equals(code) || (e.statusCode() == 404 && !"NoSuchKey".equals(code));
    }

    private static boolean isNotFound(S3Exception e) {
        return e instanceof NoSuchKeyException
                || e instanceof NoSuchBucketException
                || e.statusCode() == 404;
    }
}
