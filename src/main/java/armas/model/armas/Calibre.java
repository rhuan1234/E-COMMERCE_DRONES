package armas.model.armas;

import com.fasterxml.jackson.annotation.JsonFormat;

@JsonFormat(shape = JsonFormat.Shape.OBJECT)
public enum Calibre {
    CAL_9MM(1L, "9mm"),
    CAL_380(2L, "380"),
    CAL_40(3L, "40mm"),
    CAL_556MM(4L, "556mm"),
    CAL_762MM(5L, "762mm");

    private final Long ID;
    private final String DESCRICAO;

    Calibre(Long id, String descricao) {
        this.ID = id;
        this.DESCRICAO = descricao;
    }
    
    public Long getID() {
        return ID;
    }

    public String getDESCRICAO() {
        return DESCRICAO;
    }

     public static Calibre fromDescricao(String descricao) {
        for (Calibre c : values()) {
            if (c.DESCRICAO.equalsIgnoreCase(descricao)) {
                return c;
            }
        }
        throw new IllegalArgumentException("Calibre inválido: " + descricao);
    }
}
