package armas.model.mira;

import java.util.ArrayList;
import java.util.List;

import armas.model.armas.Fuzil;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Inheritance;
import jakarta.persistence.InheritanceType;
import jakarta.persistence.ManyToMany;
import jakarta.validation.constraints.Positive;

@Entity
@Inheritance(strategy = InheritanceType.JOINED)
public abstract class Mira {
    @Id
    @GeneratedValue(strategy = jakarta.persistence.GenerationType.IDENTITY)
    Long id;

    String modelo;
    String marca;
    @Positive(message = "Aumento máximo deve ser maior que zero")
    
    int aumentoMaximo;

    @ManyToMany(mappedBy = "miras")
    private List<Fuzil> fuzis = new ArrayList<>();

    public Mira(){

    }
    

    public List<Fuzil> getFuzis() {
        return fuzis;
    }


    public void setFuzis(List<Fuzil> fuzis) {
        this.fuzis = fuzis;
    }


    public Long getId() {
        return id;
    }

    public String getModelo() {
        return modelo;
    }

    public void setModelo(String modelo) {
        this.modelo = modelo;
    }

    public String getMarca() {
        return marca;
    }

    public void setMarca(String marca) {
        this.marca = marca;
    }

    public int getAumentoMaximo() {
        return aumentoMaximo;
    }

    public void setAumentoMaximo(int aumentoMaximo) {
        this.aumentoMaximo = aumentoMaximo;
    }

    
}
