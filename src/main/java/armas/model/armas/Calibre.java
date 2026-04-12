package armas.model.armas;

import java.util.ArrayList;

import com.fasterxml.jackson.annotation.JsonFormat;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToMany;
import java.util.List;
@JsonFormat(shape = JsonFormat.Shape.OBJECT)
@Entity
public class Calibre {
    @Id
    @GeneratedValue(strategy = jakarta.persistence.GenerationType.IDENTITY )
    private Long id;

    private String nome;
    private String marca;
    @ManyToMany(mappedBy = "calibres")
    private List<Arma> armas = new ArrayList<>();
    public Calibre() {
    }

    public Calibre(String nome, String marca) {
        this.nome = nome;
        this.marca = marca;
    }

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
    
    public List<Arma> getArmas() {
        return armas;
    }

    public void setArmas(List<Arma> armas) {
        this.armas = armas;
    }
    

    
}
