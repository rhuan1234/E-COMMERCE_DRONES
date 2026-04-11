package armas.model.armas;

import com.fasterxml.jackson.annotation.JsonFormat.Shape;

import com.fasterxml.jackson.annotation.JsonFormat;

@JsonFormat(shape = Shape.OBJECT)
public enum TipoAcao {
    SIMPLES(1L, "Simples"),
    HIBRIDO(2L, "Híbrido"),
    STRIKER(3L, "Striker"),
    DUPLO(4L, "Duplo");

    private final Long ID;
    private final String TIPO;

    TipoAcao(Long id, String tipo){
        this.ID = id;
        this.TIPO = tipo;
    }
    public Long getID() {
        return ID;
    }
    public String getTIPO() {
        return TIPO;
    }

     public static TipoAcao fromTipo(String tipo) {
        for (TipoAcao t : values()) {
            if (t.TIPO.equalsIgnoreCase(tipo)) {
                return t;
            }
        }
        throw new IllegalArgumentException("Tipo de ação inválido: " + tipo);
    }
}
