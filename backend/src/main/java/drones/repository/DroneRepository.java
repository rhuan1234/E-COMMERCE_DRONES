package drones.repository;

import java.util.List;
import java.util.HashMap;
import java.util.Map;

import drones.dto.drones.DroneCatalogFilters;
import drones.model.drones.Drone;
import io.quarkus.hibernate.orm.panache.PanacheQuery;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.persistence.LockModeType;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class DroneRepository implements PanacheRepository<Drone> {
    private record Range(Integer lowerBound, boolean lowerInclusive, Integer upperInclusive) {
    }

    private static final Map<String, Range> ALCANCE_FILTERS = Map.of(
            "ATE_10KM", new Range(50, false, 10_000),
            "DE_10_A_20KM", new Range(10_000, false, 20_000),
            "DE_20_A_50KM", new Range(20_000, false, 50_000),
            "ACIMA_50KM", new Range(50_000, false, null));

    private static final Map<String, Range> AUTONOMIA_FILTERS = Map.of(
            "ATE_20_MIN", new Range(null, false, 20),
            "DE_20_A_40_MIN", new Range(20, true, 40),
            "ACIMA_40_MIN", new Range(40, false, null));

    @Transactional
    public void salvar(Drone drone){
        persist(drone);
    }

    public Drone findByIdForUpdate(Long id) {
        return findById(id, LockModeType.PESSIMISTIC_WRITE);
    }

    public final PanacheQuery<Drone> findByFiltros(
            String nome,
            String marca,
            String modelo,
            Double precoMin,
            Double precoMax) {
        StringBuilder query = new StringBuilder("1 = 1");
        Map<String, Object> params = new HashMap<>();

        if (nome != null && !nome.isBlank()) {
            query.append(" AND nome ILIKE :nome");
            params.put("nome", "%" + nome.trim() + "%");
        }
        if (marca != null && !marca.isBlank()) {
            query.append(" AND marca.nome ILIKE :marca");
            params.put("marca", "%" + marca.trim() + "%");
        }
        if (modelo != null && !modelo.isBlank()) {
            query.append(" AND modelo.nome ILIKE :modelo");
            params.put("modelo", "%" + modelo.trim() + "%");
        }
        if (precoMin != null) {
            query.append(" AND preco >= :precoMin");
            params.put("precoMin", precoMin);
        }
        if (precoMax != null) {
            query.append(" AND preco <= :precoMax");
            params.put("precoMax", precoMax);
        }

        return find(query.toString(), params);
    }

    public final PanacheQuery<Drone> findByCatalogoFiltros(DroneCatalogFilters filtros) {
        StringBuilder query = new StringBuilder("ativa = true");
        Map<String, Object> params = new HashMap<>();

        adicionarFiltroTexto(query, params, "nome", filtros.nome(), "nome");
        adicionarFiltroTexto(query, params, "marca.nome", filtros.marca(), "marca");
        adicionarFiltroTexto(query, params, "modelo.nome", filtros.modelo(), "modelo");

        if (filtros.min() != null) {
            query.append(" AND preco >= :precoMin");
            params.put("precoMin", filtros.min());
        }
        if (filtros.max() != null) {
            query.append(" AND preco <= :precoMax");
            params.put("precoMax", filtros.max());
        }

        adicionarFiltroFaixas(query, params, filtros.alcances(), ALCANCE_FILTERS, "alcanceTransmissao", "alcance");
        adicionarFiltroFaixas(query, params, filtros.autonomias(), AUTONOMIA_FILTERS, "tempoVooPratico", "autonomia");
        adicionarFiltroCamera(query, params, filtros.cameras());
        adicionarFiltroBooleano(query, params, "possuiGPS", filtros.possuiGPS());
        adicionarFiltroBooleano(query, params, "comControleRemoto", filtros.comControleRemoto());
        adicionarFiltroBooleano(query, params, "controladoPorAplicativo", filtros.controladoPorAplicativo());

        return find(query.toString(), params);
    }

    private void adicionarFiltroTexto(
            StringBuilder query,
            Map<String, Object> params,
            String propriedade,
            String valor,
            String parametro) {
        if (valor != null && !valor.isBlank()) {
            query.append(" AND ").append(propriedade).append(" ILIKE :").append(parametro);
            params.put(parametro, "%" + valor.trim() + "%");
        }
    }

    private void adicionarFiltroFaixas(
            StringBuilder query,
            Map<String, Object> params,
            List<String> selecoes,
            Map<String, Range> faixas,
            String propriedade,
            String prefixo) {
        if (selecoes == null || selecoes.isEmpty()) {
            return;
        }

        query.append(" AND (");
        for (int i = 0; i < selecoes.size(); i++) {
            if (i > 0) {
                query.append(" OR ");
            }

            Range faixa = faixas.get(selecoes.get(i));
            query.append("(");
            if (faixa.lowerBound() != null) {
                String parametroInferior = prefixo + "Min" + i;
                query.append(propriedade)
                        .append(faixa.lowerInclusive() ? " >= :" : " > :")
                        .append(parametroInferior);
                params.put(parametroInferior, faixa.lowerBound());
            }
            if (faixa.upperInclusive() != null) {
                if (faixa.lowerBound() != null) {
                    query.append(" AND ");
                }
                String parametroSuperior = prefixo + "Max" + i;
                query.append(propriedade).append(" <= :").append(parametroSuperior);
                params.put(parametroSuperior, faixa.upperInclusive());
            }
            query.append(")");
        }
        query.append(")");
    }

    private void adicionarFiltroCamera(
            StringBuilder query,
            Map<String, Object> params,
            List<String> selecoes) {
        if (selecoes == null || selecoes.isEmpty()) {
            return;
        }

        query.append(" AND (");
        for (int i = 0; i < selecoes.size(); i++) {
            if (i > 0) {
                query.append(" OR ");
            }

            switch (selecoes.get(i)) {
                case "FULL_HD" -> {
                    query.append("(camera.resolucao ILIKE :fullHd").append(i)
                            .append(" OR camera.resolucao ILIKE :fullHdPixels").append(i).append(")");
                    params.put("fullHd" + i, "%full hd%");
                    params.put("fullHdPixels" + i, "%1080%");
                }
                case "4K" -> {
                    query.append("(camera.resolucao ILIKE :resolucao4k").append(i)
                            .append(" OR camera.resolucao ILIKE :resolucao2160").append(i).append(")");
                    params.put("resolucao4k" + i, "%4k%");
                    params.put("resolucao2160" + i, "%2160%");
                }
                case "ESTABILIZACAO" -> query.append("camera.estabilizacao = true");
            }
        }
        query.append(")");
    }

    private void adicionarFiltroBooleano(
            StringBuilder query,
            Map<String, Object> params,
            String propriedade,
            Boolean valor) {
        if (valor != null) {
            query.append(" AND ").append(propriedade).append(" = :").append(propriedade);
            params.put(propriedade, valor);
        }
    }

    public final PanacheQuery<Drone> findByMarca(String marca) {
        return find("marca.nome ILIKE ?1", "%" + marca + "%");
    }

    public final Drone findByNome(String nome) {
        return find("nome ILIKE ?1", "%" + nome + "%").firstResult();
    }

    public final PanacheQuery<Drone> findByModelo(String modelo) {
        return find("modelo.nome ILIKE ?1", "%" + modelo + "%");
    }

    public final PanacheQuery<Drone> findByPrecoRange(double precoMin, double precoMax) {
        return find("preco >= ?1 AND preco <= ?2", precoMin, precoMax);
    }
}