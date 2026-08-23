package drones.model.drones;

import drones.model.fornecedor.Fornecedor;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Inheritance;
import jakarta.persistence.InheritanceType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;


@Entity
@Inheritance(strategy = InheritanceType.JOINED)
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

    @ManyToOne
    @JoinColumn(name = "fornecedor_id")
    public Fornecedor fornecedor;

    private int quantidadeDisponivel;
    

    public Drone() {
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
