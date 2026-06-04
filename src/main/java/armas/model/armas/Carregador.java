package armas.model.armas;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;

@Entity
public class Carregador {
    @Id
    @GeneratedValue(strategy = jakarta.persistence.GenerationType.IDENTITY)
    Long id;

    String modelo;
    int qtdMunicao;
    String marca;

    @OneToMany(mappedBy = "carregador")
    private List<Fuzil> fuzis = new ArrayList<>();

    public Carregador(){

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

    public int getQtdMunicao() {
        return qtdMunicao;
    }

    public void setQtdMunicao(int qtdMunicao) {
        this.qtdMunicao = qtdMunicao;
    }

    public String getMarca() {
        return marca;
    }

    public void setMarca(String marca) {
        this.marca = marca;
    }
    
}
