package drones.model.fornecedor;


import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

@Entity
public class Telefone {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Número é obrigatório")
    @Pattern(
        regexp = "^\\(?\\d{2}\\)?\\s?9?\\d{4}-?\\d{4}$",
        message = "Número inválido (ex: (63) 99999-9999 ou 63999999999)"
    )
    private String numero;


    public Telefone() {
    }

    public Telefone( String numero) {

        this.numero = numero;
    }

 
    public String getNumero() {
        return numero;
    }

    public void setNumero(String numero) {
        this.numero = numero;
    }

    public Long getId() {
        return id;
    }

 
    
    
    
}

    