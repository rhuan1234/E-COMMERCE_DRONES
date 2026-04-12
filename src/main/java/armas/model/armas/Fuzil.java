package armas.model.armas;

import armas.model.fornecedor.Fornecedor;
import jakarta.persistence.Entity;
import java.util.List;
@Entity
public class Fuzil extends Arma {
    private ModoDisparo modoDisparo;
    private int capacidadeCarregador;
    private double alcanceEfetivo;
    private boolean possuiTrilhoTatico;

    public Fuzil() {
    }

    public Fuzil(String nome, String marca, String modelo, String numeroSerie, double preco, int estoque,
            List<Calibre> calibres, Fornecedor fornecedor, ModoDisparo modoDisparo, int capacidadeCarregador, double alcanceEfetivo,
            boolean possuiTrilhoTatico) {
        super(nome, marca, modelo, numeroSerie, preco, calibres, fornecedor);
        this.modoDisparo = modoDisparo;
        this.capacidadeCarregador = capacidadeCarregador;
        this.alcanceEfetivo = alcanceEfetivo;
        this.possuiTrilhoTatico = possuiTrilhoTatico;
    }

    public ModoDisparo getModoDisparo() {
        return modoDisparo;
    }

    public void setModoDisparo(ModoDisparo modoDisparo) {
        this.modoDisparo = modoDisparo;
    }

    public int getCapacidadeCarregador() {
        return capacidadeCarregador;
    }

    public void setCapacidadeCarregador(int capacidadeCarregador) {
        this.capacidadeCarregador = capacidadeCarregador;
    }

    public double getAlcanceEfetivo() {
        return alcanceEfetivo;
    }

    public void setAlcanceEfetivo(double alcanceEfetivo) {
        this.alcanceEfetivo = alcanceEfetivo;
    }

    public boolean isPossuiTrilhoTatico() {
        return possuiTrilhoTatico;
    }

    public void setPossuiTrilhoTatico(boolean possuiTrilhoTatico) {
        this.possuiTrilhoTatico = possuiTrilhoTatico;
    }

  

    


}
