package drones.resources;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.hasSize;
import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import drones.model.drones.Drone;
import drones.model.drones.DroneImage;
import drones.repository.DroneImageRepository;
import drones.repository.DroneRepository;
import drones.repository.FornecedorRepository;
import drones.repository.MarcaRepository;
import drones.repository.ModeloRepository;
import drones.services.InMemoryDroneImageStorage;
import io.quarkus.narayana.jta.QuarkusTransaction;
import io.quarkus.test.junit.QuarkusTest;
import io.quarkus.test.security.TestSecurity;
import jakarta.inject.Inject;

@QuarkusTest
class DroneImageResourceTest {

    private static final byte[] PNG_VALIDO = new byte[] {
            (byte) 0x89, 'P', 'N', 'G', 0x0d, 0x0a, 0x1a, 0x0a, 10, 20, 30, 40
    };

    @Inject
    DroneRepository droneRepository;

    @Inject
    DroneImageRepository droneImageRepository;

    @Inject
    MarcaRepository marcaRepository;

    @Inject
    ModeloRepository modeloRepository;

    @Inject
    FornecedorRepository fornecedorRepository;

    @Inject
    InMemoryDroneImageStorage imageStorage;

    private Long droneTesteId;

    @BeforeEach
    void prepararDroneDeTeste() {
        imageStorage.limpar();
        droneTesteId = QuarkusTransaction.requiringNew().call(() -> {
            Drone drone = new Drone();
            drone.setNome("Drone Imagem Teste");
            drone.setMarca(marcaRepository.findById(1L));
            drone.setModelo(modeloRepository.findById(5L));
            drone.setFornecedor(fornecedorRepository.findById(1L));
            drone.setPreco(5000.0);
            drone.setQuantidadeDisponivel(5);
            drone.setAtiva(true);
            drone.setTempoVooPratico(30);
            drone.setPesoDecolagem(250.0);
            drone.setAltitudeMaxima(4000);
            drone.setVelocidadeMaxima(60);
            drone.setAlcanceTransmissao(10000);
            drone.setPossuiCamera(false);
            drone.setQuantidadeMotores(4);
            drone.setComControleRemoto(true);
            drone.setControladoPorAplicativo(true);
            drone.setQuantidadeBaterias(2);
            drone.setDuracaoBateria("30");
            drone.setFrequenciaWifi("2.4");
            drone.setPossuiGPS(true);
            droneRepository.persist(drone);
            return drone.getId();
        });
    }

    @AfterEach
    void limparDroneDeTeste() {
        if (droneTesteId != null) {
            QuarkusTransaction.requiringNew().run(() -> droneRepository.deleteById(droneTesteId));
        }
        imageStorage.limpar();
    }

    @Test
    @TestSecurity(user = "rhuan", roles = "ADMIN")
    void deveEnviarListarViaStreamingEExcluirImagemDoDrone() {
        Number imagemIdNumero = given()
                .multiPart("arquivo", "drone.png", PNG_VALIDO, "image/png")
                .multiPart("principal", "true")
                .multiPart("ordem", "0")
        .when()
                .post("/drones/admin/{id}/imagens", droneTesteId)
        .then()
                .statusCode(201)
                .body("imagens", hasSize(1))
                .body("imagens[0].principal", equalTo(true))
                .extract()
                .path("imagens[0].id");

        Long imagemId = imagemIdNumero.longValue();
        String chaveSalva = droneImageRepository.findById(imagemId).getCaminho();
        assertTrue(chaveSalva.startsWith("drones/" + droneTesteId + "/"));
        assertTrue(imageStorage.contem(chaveSalva));

        byte[] bytesRetornados = given()
        .when()
                .get("/drones/imagens/{imagemId}/arquivo", imagemId)
        .then()
                .statusCode(200)
                .contentType("image/png")
                .header("Content-Disposition", "inline")
                .extract()
                .asByteArray();

        assertArrayEquals(PNG_VALIDO, bytesRetornados);

        given()
        .when()
                .delete("/drones/admin/{droneId}/imagens/{imagemId}", droneTesteId, imagemId)
        .then()
                .statusCode(204);

        assertFalse(imageStorage.contem(chaveSalva));

        given()
        .when()
                .get("/drones/imagens/{imagemId}/arquivo", imagemId)
        .then()
                .statusCode(422);
    }

    @Test
    @TestSecurity(user = "rhuan", roles = "ADMIN")
    void deveRetornar404QuandoObjetoNaoExistirNoStorageAoServirArquivo() {
        Number imagemIdNumero = given()
                .multiPart("arquivo", "drone.png", PNG_VALIDO, "image/png")
                .multiPart("principal", "true")
                .multiPart("ordem", "0")
        .when()
                .post("/drones/admin/{id}/imagens", droneTesteId)
        .then()
                .statusCode(201)
                .extract()
                .path("imagens[0].id");

        Long imagemId = imagemIdNumero.longValue();
        imageStorage.limpar();

        given()
        .when()
                .get("/drones/imagens/{imagemId}/arquivo", imagemId)
        .then()
                .statusCode(404);
    }

    @Test
    @TestSecurity(user = "rhuan", roles = "ADMIN")
    void deveRejeitarMaisDeCincoImagensPorDrone() {
        for (int i = 0; i < 5; i++) {
            given()
                    .multiPart("arquivo", "drone-" + i + ".png", PNG_VALIDO, "image/png")
                    .multiPart("principal", i == 0 ? "true" : "false")
                    .multiPart("ordem", String.valueOf(i))
            .when()
                    .post("/drones/admin/{id}/imagens", droneTesteId)
            .then()
                    .statusCode(201);
        }

        given()
                .multiPart("arquivo", "drone-6.png", PNG_VALIDO, "image/png")
                .multiPart("principal", "false")
                .multiPart("ordem", "5")
        .when()
                .post("/drones/admin/{id}/imagens", droneTesteId)
        .then()
                .statusCode(422);
    }

    @Test
    @TestSecurity(user = "rhuan", roles = "ADMIN")
    void deveRejeitarArquivoInvalidoNoUpload() {
        given()
                .multiPart("arquivo", "falso.png", "nao-e-imagem".getBytes(), "image/png")
                .multiPart("principal", "true")
                .multiPart("ordem", "0")
        .when()
                .post("/drones/admin/{id}/imagens", droneTesteId)
        .then()
                .statusCode(422);
    }

    @Test
    void deveExigirAutenticacaoParaUploadDeImagem() {
        given()
                .multiPart("arquivo", "drone.png", PNG_VALIDO, "image/png")
                .multiPart("principal", "true")
                .multiPart("ordem", "0")
        .when()
                .post("/drones/admin/{id}/imagens", droneTesteId)
        .then()
                .statusCode(401);
    }

    @Test
    void deveServirImagemPublicamenteSemAutenticacao() throws java.io.IOException {
        java.nio.file.Path arquivoTemp = java.nio.file.Files.createTempFile("drone-public-", ".png");
        String chave;
        try {
            java.nio.file.Files.write(arquivoTemp, PNG_VALIDO);
            org.jboss.resteasy.reactive.multipart.FileUpload upload =
                    org.mockito.Mockito.mock(org.jboss.resteasy.reactive.multipart.FileUpload.class);
            org.mockito.Mockito.when(upload.uploadedFile()).thenReturn(arquivoTemp);
            org.mockito.Mockito.when(upload.contentType()).thenReturn("image/png");
            chave = imageStorage.salvar(droneTesteId, upload);
        } finally {
            java.nio.file.Files.deleteIfExists(arquivoTemp);
        }
        Long imagemId = QuarkusTransaction.requiringNew().call(() -> {
            Drone drone = droneRepository.findById(droneTesteId);
            DroneImage imagem = new DroneImage();
            imagem.setCaminho(chave);
            imagem.setPrincipal(true);
            imagem.setOrdem(0);
            drone.adicionarImagem(imagem);
            droneImageRepository.persist(imagem);
            return imagem.getId();
        });

        byte[] bytesRetornados = given()
        .when()
                .get("/drones/imagens/{imagemId}/arquivo", imagemId)
        .then()
                .statusCode(200)
                .contentType("image/png")
                .extract()
                .asByteArray();

        assertArrayEquals(PNG_VALIDO, bytesRetornados);
    }

    @Test
    @TestSecurity(user = "rhuan", roles = "ADMIN")
    void deveExcluirObjetosDoStorageQuandoDeletarDrone() {
        Number imagemIdNumero = given()
                .multiPart("arquivo", "drone.png", PNG_VALIDO, "image/png")
                .multiPart("principal", "true")
                .multiPart("ordem", "0")
        .when()
                .post("/drones/admin/{id}/imagens", droneTesteId)
        .then()
                .statusCode(201)
                .extract()
                .path("imagens[0].id");

        String chave = droneImageRepository.findById(imagemIdNumero.longValue()).getCaminho();
        assertTrue(imageStorage.contem(chave));

        given()
        .when()
                .delete("/drones/admin/{id}", droneTesteId)
        .then()
                .statusCode(204);

        assertFalse(imageStorage.contem(chave));
        droneTesteId = null;
    }

    @Test
    @TestSecurity(user = "cliente", roles = "CLIENTE")
    void deveBloquearUploadDeImagemParaPerfilCliente() {
        given()
                .multiPart("arquivo", "drone.png", PNG_VALIDO, "image/png")
                .multiPart("principal", "true")
                .multiPart("ordem", "0")
        .when()
                .post("/drones/admin/{id}/imagens", droneTesteId)
        .then()
                .statusCode(403);
    }
}
