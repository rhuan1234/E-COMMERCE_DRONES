package drones.services;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

import org.jboss.resteasy.reactive.multipart.FileUpload;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.api.io.TempDir;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import drones.exception.ValidationException;
import jakarta.ws.rs.NotFoundException;
import software.amazon.awssdk.core.ResponseInputStream;
import software.amazon.awssdk.core.exception.SdkClientException;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.http.AbortableInputStream;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.CreateBucketRequest;
import software.amazon.awssdk.services.s3.model.CreateBucketResponse;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;
import software.amazon.awssdk.services.s3.model.HeadBucketRequest;
import software.amazon.awssdk.services.s3.model.HeadBucketResponse;
import software.amazon.awssdk.services.s3.model.NoSuchBucketException;
import software.amazon.awssdk.services.s3.model.NoSuchKeyException;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectResponse;

@ExtendWith(MockitoExtension.class)
class S3DroneImageStorageTest {

    private static final String BUCKET = "drones-imagens-teste";
    private static final byte[] PNG_VALIDO = new byte[] {
            (byte) 0x89, 'P', 'N', 'G', 0x0d, 0x0a, 0x1a, 0x0a, 1, 2, 3, 4
    };

    @Mock
    S3Client s3Client;

    @TempDir
    Path tempDir;

    S3DroneImageStorage storage;

    @BeforeEach
    void setUp() {
        storage = new S3DroneImageStorage(s3Client, BUCKET);
    }

    @Test
    void deveCriarBucketAutomaticamenteQuandoAusenteNaInicializacao() {
        when(s3Client.headBucket(any(HeadBucketRequest.class)))
                .thenThrow(NoSuchBucketException.builder().message("ausente").build());
        when(s3Client.createBucket(any(CreateBucketRequest.class)))
                .thenReturn(CreateBucketResponse.builder().build());

        storage.inicializar();

        ArgumentCaptor<CreateBucketRequest> captor = ArgumentCaptor.forClass(CreateBucketRequest.class);
        verify(s3Client).createBucket(captor.capture());
        assertEquals(BUCKET, captor.getValue().bucket());
    }

    @Test
    void deveIgnorarErroDeConexaoNaInicializacaoSemFalharAplicacao() {
        when(s3Client.headBucket(any(HeadBucketRequest.class)))
                .thenThrow(SdkClientException.create("emulador desligado"));

        storage.inicializar();

        verify(s3Client).headBucket(any(HeadBucketRequest.class));
    }

    @Test
    void naoDeveRecriarBucketQuandoJaExisteNaInicializacao() {
        when(s3Client.headBucket(any(HeadBucketRequest.class)))
                .thenReturn(HeadBucketResponse.builder().build());

        storage.inicializar();

        verify(s3Client, times(0)).createBucket(any(CreateBucketRequest.class));
    }

    @Test
    void deveEnviarImagemValidaParaS3ComChaveEstruturadaEMetadados() throws IOException {
        FileUpload upload = criarUpload("foto.png", "image/png", PNG_VALIDO);
        when(s3Client.putObject(any(PutObjectRequest.class), any(RequestBody.class)))
                .thenReturn(PutObjectResponse.builder().build());

        String chave = storage.salvar(7L, upload);

        assertTrue(chave.matches("^drones/7/[0-9a-fA-F-]+\\.png$"));
        ArgumentCaptor<PutObjectRequest> captor = ArgumentCaptor.forClass(PutObjectRequest.class);
        verify(s3Client).putObject(captor.capture(), any(RequestBody.class));
        assertEquals(BUCKET, captor.getValue().bucket());
        assertEquals(chave, captor.getValue().key());
        assertEquals("image/png", captor.getValue().contentType());
        assertEquals(PNG_VALIDO.length, captor.getValue().contentLength());
    }

    @Test
    void deveCriarBucketEReenviarQuandoPutObjectRetornarNoSuchBucket() throws IOException {
        FileUpload upload = criarUpload("foto.png", "image/png", PNG_VALIDO);
        when(s3Client.putObject(any(PutObjectRequest.class), any(RequestBody.class)))
                .thenThrow(NoSuchBucketException.builder().message("bucket ausente").build())
                .thenReturn(PutObjectResponse.builder().build());

        String chave = storage.salvar(12L, upload);

        assertTrue(chave.startsWith("drones/12/"));
        verify(s3Client).createBucket(any(CreateBucketRequest.class));
        verify(s3Client, times(2)).putObject(any(PutObjectRequest.class), any(RequestBody.class));
    }

    @Test
    void deveRejeitarArquivoComAssinaturaInvalida() throws IOException {
        FileUpload upload = criarUpload("falso.png", "image/png", new byte[] { 1, 2, 3, 4, 5 });

        assertThrows(ValidationException.class, () -> storage.salvar(1L, upload));
        verify(s3Client, times(0)).putObject(any(PutObjectRequest.class), any(RequestBody.class));
    }

    @Test
    void deveRejeitarArquivoVazio() throws IOException {
        FileUpload upload = criarUpload("vazio.png", "image/png", new byte[0]);

        assertThrows(ValidationException.class, () -> storage.salvar(1L, upload));
    }

    @Test
    void deveRetornarConteudoEContentTypeQuandoBuscarObjetoExistente() throws IOException {
        GetObjectResponse resposta = GetObjectResponse.builder()
                .contentType("image/png")
                .contentLength((long) PNG_VALIDO.length)
                .build();
        ResponseInputStream<GetObjectResponse> stream = new ResponseInputStream<>(
                resposta,
                AbortableInputStream.create(new ByteArrayInputStream(PNG_VALIDO)));
        when(s3Client.getObject(any(GetObjectRequest.class))).thenReturn(stream);

        try (var conteudo = storage.buscar("drones/1/foto.png")) {
            assertEquals("image/png", conteudo.contentType());
            assertEquals(PNG_VALIDO.length, conteudo.contentLength());
            assertArrayEquals(PNG_VALIDO, conteudo.stream().readAllBytes());
        }
    }

    @Test
    void deveLancarNotFoundExceptionQuandoObjetoNaoExistirNoS3() {
        when(s3Client.getObject(any(GetObjectRequest.class)))
                .thenThrow(NoSuchKeyException.builder().message("nao encontrado").build());

        assertThrows(NotFoundException.class, () -> storage.buscar("drones/1/ausente.png"));
    }

    @Test
    void deveExcluirObjetoIdempotentementeMesmoQuandoAusenteNoS3() {
        when(s3Client.deleteObject(any(DeleteObjectRequest.class)))
                .thenThrow(NoSuchKeyException.builder().message("ausente").build());

        storage.deletar("drones/1/ausente.png");

        verify(s3Client).deleteObject(any(DeleteObjectRequest.class));
    }

    @Test
    void deveRejeitarChaveComPathTraversal() {
        assertThrows(ValidationException.class, () -> storage.buscar("../segredo.png"));
        assertThrows(ValidationException.class, () -> storage.deletar("/drones/1/foto.png"));
        assertThrows(ValidationException.class, () -> storage.buscar("drones/../1/foto.png"));
    }

    private FileUpload criarUpload(String nome, String contentType, byte[] bytes) throws IOException {
        Path arquivo = tempDir.resolve(nome);
        Files.write(arquivo, bytes);

        FileUpload upload = mock(FileUpload.class);
        when(upload.uploadedFile()).thenReturn(arquivo);
        if (bytes.length > 0 && bytes.length <= DroneImageValidator.MAX_FILE_SIZE) {
            when(upload.contentType()).thenReturn(contentType);
        }
        return upload;
    }
}
