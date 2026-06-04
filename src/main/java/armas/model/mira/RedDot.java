package armas.model.mira;

import jakarta.persistence.Entity;
import jakarta.validation.constraints.Positive;

@Entity
public class RedDot extends Mira {
    @Positive  (message = "Níveis de brilho devem ser maiores que zero")
    private int niveisBrilho;
    
    private double duracaoBateria;

    public RedDot() {
    }

    public int getNiveisBrilho() {
        return niveisBrilho;
    }

    public void setNiveisBrilho(int niveisBrilho) {
        this.niveisBrilho = niveisBrilho;
    }

    public double getDuracaoBateria() {
        return duracaoBateria;
    }

    public void setDuracaoBateria(double duracaoBateria) {
        this.duracaoBateria = duracaoBateria;
    }
}
