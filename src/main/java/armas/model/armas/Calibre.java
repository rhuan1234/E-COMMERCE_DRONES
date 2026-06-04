package armas.model.armas;

import java.util.ArrayList;

import com.fasterxml.jackson.annotation.JsonFormat;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToMany;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;
@JsonFormat(shape = JsonFormat.Shape.OBJECT)
@Entity
public class Calibre {
    @Id
    @GeneratedValue(strategy = jakarta.persistence.GenerationType.IDENTITY )
    private Long id;

    @NotBlank(message = "Nome do calibre é obrigatório")
    @Size(min = 2, max = 20, message = "Nome deve ter entre 2 e 20 caracteres")
    private String nome;

    @NotBlank(message = "Marca é obrigatória")
    @Size(min = 2, max = 50, message = "Marca deve ter entre 2 e 50 caracteres")
    private String marca;

    @ManyToMany(mappedBy = "calibres")
    private List<Fuzil> fuzis = new ArrayList<>();
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
    
    public List<Fuzil> getFuzis() {
        return fuzis;
    }

    public void setFuzis(List<Fuzil> fuzis) {
        this.fuzis = fuzis;
    }
    

    
}
