package armas.repository;

import armas.model.administrador.Administrador;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class AdministradorRepository implements PanacheRepository<Administrador> {

    @Transactional
    public void salvar(Administrador administrador){
        persist(administrador);
    }

}
