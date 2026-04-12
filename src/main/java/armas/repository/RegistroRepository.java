package armas.repository;

import armas.model.registro.Registro;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class RegistroRepository implements PanacheRepository<Registro> {

    @Transactional
    public void salvar(Registro registro){
        persist(registro);
    }

}