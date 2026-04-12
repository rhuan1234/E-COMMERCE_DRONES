package armas.model.armas;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Inheritance;
import jakarta.persistence.InheritanceType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;

import java.util.ArrayList;
import java.util.List;
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
    private double preco;
    private boolean ativa;
  

    @ManyToOne
    @JoinColumn(name = "fornecedor_id")
    public Fornecedor fornecedor;

    @OneToOne(cascade = jakarta.persistence.CascadeType.ALL) 
    @JoinColumn(name = "registro_id", unique = true)
    private Registro registro;

    @ManyToMany
    @JoinTable(
        name = "arma_calibre",
        joinColumns = @JoinColumn(name = "arma_id"),
        inverseJoinColumns = @JoinColumn(name = "calibre_id")
    )
    private List<Calibre> calibres = new ArrayList<>();



    

    // Constructors
    public Arma() {
        this.ativa = true;
    }

    public Arma(String nome, String marca, String modelo, String numeroSerie, double preco, List<Calibre> calibres, Fornecedor fornecedor) {
        this.nome = nome;
        this.marca = marca;
        this.modelo = modelo;
        this.preco = preco;
        this.calibres = calibres;
        
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

    public List<Calibre> getCalibres() {
        return calibres;
    }

    public void setCalibres(List<Calibre> calibres) {
        this.calibres = calibres;
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
