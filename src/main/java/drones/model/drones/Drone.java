package drones.model.drones;

import drones.model.fornecedor.Fornecedor;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;


@Entity
public class Drone {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String nome;
    private String marca;
    private String modelo;
    private double preco;
    private boolean ativa;
    private int tempoVooPratico;
    private double pesoDecolagem;
    private int altitudeMaxima;
    private int velocidadeMaxima;
    private int alcanceTransmissao;
    private boolean possuiCamera;
    private int quantidadeMotores;
    private boolean comControleRemoto;
    private boolean controladoPorAplicativo;
    private int quantidadeBaterias;
    private String duracaoBateria;
    private String frequenciaWifi;
    private boolean possuiGPS;

    @ManyToOne
    @JoinColumn(name = "fornecedor_id")
    public Fornecedor fornecedor;

    private int quantidadeDisponivel;
    

    public Drone() {
    }

    public int getQuantidadeMotores() {
        return quantidadeMotores;
    }

    public void setQuantidadeMotores(int quantidadeMotores) {
        this.quantidadeMotores = quantidadeMotores;
    }

    public boolean isComControleRemoto() {
        return comControleRemoto;
    }

    public void setComControleRemoto(boolean comControleRemoto) {
        this.comControleRemoto = comControleRemoto;
    }

    public boolean isControladoPorAplicativo() {
        return controladoPorAplicativo;
    }

    public void setControladoPorAplicativo(boolean controladoPorAplicativo) {
        this.controladoPorAplicativo = controladoPorAplicativo;
    }

    public int getQuantidadeBaterias() {
        return quantidadeBaterias;
    }

    public void setQuantidadeBaterias(int quantidadeBaterias) {
        this.quantidadeBaterias = quantidadeBaterias;
    }

    public String getDuracaoBateria() {
        return duracaoBateria;
    }

    public void setDuracaoBateria(String duracaoBateria) {
        this.duracaoBateria = duracaoBateria;
    }

    public String getFrequenciaWifi() {
        return frequenciaWifi;
    }

    public void setFrequenciaWifi(String frequenciaWifi) {
        this.frequenciaWifi = frequenciaWifi;
    }

    public boolean isPossuiGPS() {
        return possuiGPS;
    }

    public void setPossuiGPS(boolean possuiGPS) {
        this.possuiGPS = possuiGPS;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public void setMarca(String marca) {
        this.marca = marca;
    }

    public void setModelo(String modelo) {
        this.modelo = modelo;
    }

    public void setPreco(double preco) {
        this.preco = preco;
    }

    public void setAtiva(boolean ativa) {
        this.ativa = ativa;
    }

    public void setFornecedor(Fornecedor fornecedor) {
        this.fornecedor = fornecedor;
    }

    public String getNome() {
        return nome;
    }

    public String getMarca() {
        return marca;
    }

    public String getModelo() {
        return modelo;
    }

    public double getPreco() {
        return preco;
    }

    public boolean isAtiva() {
        return ativa;
    }

    public Fornecedor getFornecedor() {
        return fornecedor;
    }

    public Long getId() {
        return id;
    }

    public int getQuantidadeDisponivel() {
        return quantidadeDisponivel;
    }

    public void setQuantidadeDisponivel(int quantidadeDisponivel) {
        this.quantidadeDisponivel = quantidadeDisponivel;
    }

    public int getTempoVooPratico() {
        return tempoVooPratico;
    }

    public void setTempoVooPratico(int tempoVooPratico) {
        this.tempoVooPratico = tempoVooPratico;
    }

    public double getPesoDecolagem() {
        return pesoDecolagem;
    }

    public void setPesoDecolagem(double pesoDecolagem) {
        this.pesoDecolagem = pesoDecolagem;
    }

    public int getAltitudeMaxima() {
        return altitudeMaxima;
    }

    public void setAltitudeMaxima(int altitudeMaxima) {
        this.altitudeMaxima = altitudeMaxima;
    }

    public int getVelocidadeMaxima() {
        return velocidadeMaxima;
    }

    public void setVelocidadeMaxima(int velocidadeMaxima) {
        this.velocidadeMaxima = velocidadeMaxima;
    }

    public int getAlcanceTransmissao() {
        return alcanceTransmissao;
    }

    public void setAlcanceTransmissao(int alcanceTransmissao) {
        this.alcanceTransmissao = alcanceTransmissao;
    }

    public boolean isPossuiCamera() {
        return possuiCamera;
    }

    public void setPossuiCamera(boolean possuiCamera) {
        this.possuiCamera = possuiCamera;
    }
    
}
