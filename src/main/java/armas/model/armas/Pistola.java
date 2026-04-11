package armas.model.armas;

import armas.model.fornecedor.Fornecedor;
import jakarta.persistence.Entity;

@Entity
public class Pistola extends Arma{
    private int capacidadeCarregador;
    private TipoAcao tipoAcao;
    private boolean possuiTravaSeguranca;
    private boolean possuiTrilho;
    
    public Pistola() {
    }

    public Pistola(String nome, String marca, String modelo, String numeroSerie, double preco, int estoque,
             Calibre calibre, Fornecedor fornecedor, int capacidadeCarregador, TipoAcao tipoAcao, boolean possuiTravaSeguranca, boolean possuiTrilho) {
        super(nome, marca, modelo, numeroSerie, preco, calibre, fornecedor);
        this.capacidadeCarregador = capacidadeCarregador;
        this.tipoAcao = tipoAcao;
        this.possuiTravaSeguranca = possuiTravaSeguranca;
        this.possuiTrilho = possuiTrilho;
    }

    
    public int getCapacidadeCarregador() {
        return capacidadeCarregador;
    }

    public void setCapacidadeCarregador(int capacidadeCarregador) {
        this.capacidadeCarregador = capacidadeCarregador;
    }

    public TipoAcao getTipoAcao() {
        return tipoAcao;
    }

    public void setTipoAcao(TipoAcao tipoAcao) {
        this.tipoAcao = tipoAcao;
    }

    public boolean isPossuiTravaSeguranca() {
        return possuiTravaSeguranca;
    }

    public void setPossuiTravaSeguranca(boolean possuiTravaSeguranca) {
        this.possuiTravaSeguranca = possuiTravaSeguranca;
    }

    public boolean isPossuiTrilho() {
        return possuiTrilho;
    }

    public void setPossuiTrilho(boolean possuiTrilho) {
        this.possuiTrilho = possuiTrilho;
    }


  

}
