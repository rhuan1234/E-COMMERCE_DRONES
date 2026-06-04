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
import armas.model.mira.Mira;
import armas.model.registro.Registro;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.NotNull;

@Entity
@Inheritance(strategy = InheritanceType.JOINED)
public class Fuzil {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Nome é obrigatório")
    @Size(min = 3, max = 100, message = "Nome deve ter entre 3 e 100 caracteres")
    private String nome;

    @NotBlank(message = "Marca é obrigatória")
    @Size(min = 2, max = 50, message = "Marca deve ter entre 2 e 50 caracteres")
    private String marca;

    @NotBlank(message = "Modelo é obrigatório")
    @Size(min = 2, max = 50, message = "Modelo deve ter entre 2 e 50 caracteres")
    private String modelo;

    @Positive(message = "Preço deve ser maior que zero")

    private double preco;
    private boolean ativa;

    private ModoDisparo modoDisparo;

    @Positive(message = "Alcance efetivo deve ser maior que zero")
    @Max(value = 10000, message = "Alcance efetivo muito alto")
    private double alcanceEfetivo;

    @NotNull(message = "Informação sobre trilho tático é obrigatória")
    private boolean possuiTrilhoTatico;
  

    @ManyToOne
    @JoinColumn(name = "fornecedor_id")
    public Fornecedor fornecedor;

    @OneToOne(cascade = jakarta.persistence.CascadeType.ALL) 
    @JoinColumn(name = "registro_id", unique = true)
    private Registro registro;

    @ManyToMany
    @JoinTable(
        name = "fuzil_calibre",
        joinColumns = @JoinColumn(name = "fuzil_id"),
        inverseJoinColumns = @JoinColumn(name = "calibre_id")
    )
    private List<Calibre> calibres = new ArrayList<>();

    @ManyToOne
    @JoinColumn(name = "carregador_id")
    private Carregador carregador;

    @ManyToMany
    @JoinTable(
    name = "fuzil_mira",
    joinColumns = @JoinColumn(name = "fuzil_id"),
    inverseJoinColumns = @JoinColumn(name = "mira_id"))
    private List<Mira> miras = new ArrayList<>();

    @PositiveOrZero(message = "Quantidade disponível deve ser zero ou maior")
    private int quantidadeDisponivel;
    

    public Fuzil() {
    }

    public Fuzil(String nome, String marca, String modelo, String numeroSerie, double preco, List<Calibre> calibres, Fornecedor fornecedor) {
        this.nome = nome;
        this.marca = marca;
        this.modelo = modelo;
        this.preco = preco;
        this.calibres = calibres;
        this.fornecedor = fornecedor;
    }

    

    public Carregador getCarregador() {
        return carregador;
    }

    public void setCarregador(Carregador carregador) {
        this.carregador = carregador;
    }

    public List<Mira> getMiras() {
        return miras;
    }

    public void setMiras(List<Mira> miras) {
        this.miras = miras;
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

    public void setModoDisparo(ModoDisparo modoDisparo) {
        this.modoDisparo = modoDisparo;
    }



    public void setAlcanceEfetivo(double alcanceEfetivo) {
        this.alcanceEfetivo = alcanceEfetivo;
    }

    public void setPossuiTrilhoTatico(boolean possuiTrilhoTatico) {
        this.possuiTrilhoTatico = possuiTrilhoTatico;
    }

    public void setFornecedor(Fornecedor fornecedor) {
        this.fornecedor = fornecedor;
    }

    public void setRegistro(Registro registro) {
        this.registro = registro;
    }

    public void setCalibres(List<Calibre> calibres) {
        this.calibres = calibres;
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

    public ModoDisparo getModoDisparo() {
        return modoDisparo;
    }

    public double getAlcanceEfetivo() {
        return alcanceEfetivo;
    }

    public boolean isPossuiTrilhoTatico() {
        return possuiTrilhoTatico;
    }

    public Fornecedor getFornecedor() {
        return fornecedor;
    }

    public Registro getRegistro() {
        return registro;
    }

    public List<Calibre> getCalibres() {
        return calibres;
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
    
}
