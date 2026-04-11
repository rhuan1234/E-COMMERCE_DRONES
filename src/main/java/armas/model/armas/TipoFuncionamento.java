package armas.model.armas;

public enum TipoFuncionamento {
    FERROLHO(1L, "Ferrolho"),
    ALAVANCA(2L, "Alavanca"),
    SEMI_AUTOMATICO(3L, "Semi-Automático");

    private final Long ID;
    private final String TIPO;
    TipoFuncionamento(Long id, String tipo){
        this.ID = id;
        this.TIPO = tipo;
    }

    public Long getID() {
        return ID;
    }
    public String getTIPO() {
        return TIPO;
    }

     public static TipoFuncionamento fromTipo(String tipo) {
        for (TipoFuncionamento t : values()) {
            if (t.TIPO.equalsIgnoreCase(tipo)) {
                return t;
            }
        }
        throw new IllegalArgumentException("Tipo de funcionamento inválido: " + tipo);
    }

}
