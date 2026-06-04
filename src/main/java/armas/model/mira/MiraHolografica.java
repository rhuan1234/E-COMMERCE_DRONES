package armas.model.mira;

import jakarta.persistence.Entity;
import jakarta.validation.constraints.Positive;

@Entity
public class MiraHolografica extends Mira {
    @Positive(message = "Alcance do laser deve ser maior que zero")
    private int alcanceLaser;
    private boolean visaoNoturna;

    public MiraHolografica() {
    }

    public int getAlcanceLaser() {
        return alcanceLaser;
    }

    public void setAlcanceLaser(int alcanceLaser) {
        this.alcanceLaser = alcanceLaser;
    }

    public boolean isVisaoNoturna() {
        return visaoNoturna;
    }

    public void setVisaoNoturna(boolean visaoNoturna) {
        this.visaoNoturna = visaoNoturna;
    }
}
