package armas.model.pedido;

import armas.model.armas.Fuzil;
import jakarta.persistence.*;

@Entity
public class ItemPedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private int quantidade;

    private double precoUnitario;

    @ManyToOne
    @JoinColumn(name = "fuzil_id")
    private Fuzil fuzil;

    @ManyToOne
    @JoinColumn(name = "pedido_id")
    private Pedido pedido;

    public double getSubtotal() {
        return quantidade * precoUnitario;
    }

    public int getQuantidade() {
        return quantidade;
    }

    public void setQuantidade(int quantidade) {
        this.quantidade = quantidade;
    }

    public double getPrecoUnitario() {
        return precoUnitario;
    }

    public void setPrecoUnitario(double precoUnitario) {
        this.precoUnitario = precoUnitario;
    }

    public Fuzil getFuzil() {
        return fuzil;
    }

    public void setFuzil(Fuzil fuzil) {
        this.fuzil = fuzil;
    }

    public Pedido getPedido() {
        return pedido;
    }

    public void setPedido(Pedido pedido) {
        this.pedido = pedido;
    }

    public Long getId() {
        return id;
    }


    
}