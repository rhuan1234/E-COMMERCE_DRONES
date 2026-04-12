package armas.model.armas;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Inheritance;
import jakarta.persistence.InheritanceType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import armas.model.fornecedor.Fornecedor;
import armas.model.registro.Registro;


@Entity
@Inheritance(strategy = InheritanceType.JOINED)
public abstract class Arma {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome;
    private String marca;
    private String modelo;
    private String numeroSerie;
    private double preco;
    private boolean ativa;
    private Calibre calibre;

    @ManyToOne
    @JoinColumn(name = "fornecedor_id")
    public Fornecedor fornecedor;

    @OneToOne(cascade = jakarta.persistence.CascadeType.ALL) 
    @JoinColumn(name = "registro_id", unique = true)
    private Registro registro;



    

    // Constructors
    public Arma() {
        this.ativa = true;
    }

    public Arma(String nome, String marca, String modelo, String numeroSerie, double preco, Calibre calibre, Fornecedor fornecedor) {
        this.nome = nome;
        this.marca = marca;
        this.modelo = modelo;
        this.numeroSerie = numeroSerie;
        this.preco = preco;
        this.calibre = calibre;
        
        this.ativa = true;
        this.fornecedor = fornecedor;
    }

    

  

    // Getters and Setters

    

    public Long getId() {
        return id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getMarca() {
        return marca;
    }

    public void setMarca(String marca) {
        this.marca = marca;
    }

    public String getModelo() {
        return modelo;
    }

    public void setModelo(String modelo) {
        this.modelo = modelo;
    }

    public String getNumeroSerie() {
        return numeroSerie;
    }

    public void setNumeroSerie(String numeroSerie) {
        this.numeroSerie = numeroSerie;
    }

    public double getPreco() {
        return preco;
    }

    public void setPreco(double preco) {
        this.preco = preco;
    }

 
    public boolean isAtiva() {
        return ativa;
    }

    public void setAtiva(boolean ativa) {
        this.ativa = ativa;
    }

    public Calibre getCalibre() {
        return calibre;
    }

    public void setCalibre(Calibre calibre) {
        this.calibre = calibre;
    }

    public Fornecedor getFornecedor() {
        return fornecedor;
    }

    public void setFornecedor(Fornecedor fornecedor) {
        this.fornecedor = fornecedor;
    }

    

    public void setRegistro(Registro registro) {
        this.registro = registro;
    }

    public Registro getRegistro() {
        return registro;
    }

    
}
