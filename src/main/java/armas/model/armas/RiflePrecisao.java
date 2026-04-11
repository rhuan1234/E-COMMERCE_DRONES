package armas.model.armas;

import armas.model.fornecedor.Fornecedor;
import jakarta.persistence.Entity;

@Entity
public class RiflePrecisao extends Arma {
    private double comprimentoCano;
    private boolean possuiMiraTelescopica;
    private double alcanceEfetivo;
    private TipoFuncionamento tipoFuncionamento;

    public RiflePrecisao() {
    }

    public RiflePrecisao(String nome, String marca, String modelo, String numeroSerie, double preco, int estoque,
            Calibre calibre, Fornecedor fornecedor, double comprimentoCano, boolean possuiMiraTelescopica, double alcanceEfetivo,
            TipoFuncionamento tipoFuncionamento) {
        super(nome, marca, modelo, numeroSerie, preco, calibre, fornecedor);
        this.comprimentoCano = comprimentoCano;
        this.possuiMiraTelescopica = possuiMiraTelescopica;
        this.alcanceEfetivo = alcanceEfetivo;
        this.tipoFuncionamento = tipoFuncionamento;
    }

    public double getComprimentoCano() {
        return comprimentoCano;
    }

    public void setComprimentoCano(double comprimentoCano) {
        this.comprimentoCano = comprimentoCano;
    }

    public boolean isPossuiMiraTelescopica() {
        return possuiMiraTelescopica;
    }

    public void setPossuiMiraTelescopica(boolean possuiMiraTelescopica) {
        this.possuiMiraTelescopica = possuiMiraTelescopica;
    }

    public double getAlcanceEfetivo() {
        return alcanceEfetivo;
    }

    public void setAlcanceEfetivo(double alcanceEfetivo) {
        this.alcanceEfetivo = alcanceEfetivo;
    }

    public TipoFuncionamento getTipoFuncionamento() {
        return tipoFuncionamento;
    }

    public void setTipoFuncionamento(TipoFuncionamento tipoFuncionamento) {
        this.tipoFuncionamento = tipoFuncionamento;
    }

    

    
}
