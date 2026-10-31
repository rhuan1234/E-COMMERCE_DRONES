package drones.model.drones;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

@Entity
public class Camera {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "modelo_id")
    private Modelo modelo;

    @ManyToOne
    @JoinColumn(name = "marca_id")
    private Marca marca;

    private String resolucao;
    private int zoom;
    private boolean estabilizacao;
    private String fps;
    
    
    public Camera() {
    }
    public Modelo getModelo() {
        return modelo;
    }
    public void setModelo(Modelo modelo) {
        this.modelo = modelo;
    }
    public Marca getMarca() {
        return marca;
    }
    public void setMarca(Marca marca) {
        this.marca = marca;
    }
    public String getResolucao() {
        return resolucao;
    }
    public void setResolucao(String resolucao) {
        this.resolucao = resolucao;
    }
    public int getZoom() {
        return zoom;
    }
    public void setZoom(int zoom) {
        this.zoom = zoom;
    }
    public boolean isEstabilizacao() {
        return estabilizacao;
    }
    public void setEstabilizacao(boolean estabilizacao) {
        this.estabilizacao = estabilizacao;
    }
    public String getFps() {
        return fps;
    }
    public void setFps(String fps) {
        this.fps = fps;
    }
    public Long getId() {
        return id;
    }

    
}
