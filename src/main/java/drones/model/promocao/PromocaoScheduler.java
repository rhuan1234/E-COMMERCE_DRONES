package drones.model.promocao;

import java.time.LocalDateTime;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;
import io.quarkus.scheduler.Scheduled;

@ApplicationScoped
public class PromocaoScheduler {

    @Inject
    EntityManager entityManager;

    @Scheduled(every = "1m")
    @Transactional
    public void removerPromocoesExpiradas() {

        entityManager.createQuery("""
            UPDATE Drone d
            SET d.promocao = null
            WHERE d.promocao IS NOT NULL
            AND d.promocao.dataFim < :agora
        """)
        .setParameter("agora", LocalDateTime.now())
        .executeUpdate();
    }
}