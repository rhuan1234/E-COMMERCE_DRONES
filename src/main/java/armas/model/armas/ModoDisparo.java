package armas.model.armas;

public enum ModoDisparo {
    SEMIAUTOMATICO(1L, "Semiautomatico"),
    RAJADA(2L, "Rajada"),
    AUTOMATICO(3L, "Automatico");

    private Long id;
    private String descricao;
    ModoDisparo(Long id, String descricao) {
        this.id = id;
        this.descricao = descricao;
    }
    public Long getId() {
        return id;
    }
    public String getDescricao() {
        return descricao;
    }
        public static ModoDisparo fromDescricao(String descricao) {
            for (ModoDisparo m : values()) {
                if (m.descricao.equalsIgnoreCase(descricao)) {
                    return m;
                }
            }
            throw new IllegalArgumentException("Modo de disparo inválido: " + descricao);
        }
}
