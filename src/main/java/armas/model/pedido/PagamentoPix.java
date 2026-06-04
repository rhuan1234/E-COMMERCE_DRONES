package armas.model.pedido;

import jakarta.persistence.Entity;

@Entity
public class PagamentoPix extends Pagamento {
    private String chavePix;

    public String getChavePix() {
        return chavePix;
    }

    public void setChavePix(String chavePix) {
        this.chavePix = chavePix;
    }

}
