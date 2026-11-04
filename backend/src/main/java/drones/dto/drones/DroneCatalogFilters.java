package drones.dto.drones;

import java.util.List;

public record DroneCatalogFilters(
        String nome,
        String marca,
        String modelo,
        Double min,
        Double max,
        List<String> alcances,
        List<String> autonomias,
        List<String> cameras,
        Boolean possuiGPS,
        Boolean comControleRemoto,
        Boolean controladoPorAplicativo) {
}
