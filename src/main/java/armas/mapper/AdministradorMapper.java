package armas.mapper;

import armas.dto.administrador.AdministradorRequestDTO;
import armas.dto.administrador.AdministradorResponseDTO;
import armas.model.administrador.Administrador;


public class AdministradorMapper {
    public static Administrador toEntity(AdministradorRequestDTO dto){
        Administrador administrador = new Administrador();

        administrador.setNome(dto.nome());
        administrador.setEmail(dto.email());
        administrador.setTelefone(dto.telefone());
        administrador.setCpf(dto.cpf());
        administrador.setSenha(dto.senha());
       

    return administrador;
    }

    public static AdministradorResponseDTO toResponseDTO(Administrador administrador){
        
    return new AdministradorResponseDTO(
        administrador.getId(),
        administrador.getNome(),
        administrador.getEmail(),
        administrador.getTelefone(),
        administrador.getCpf()
        // administrador.getTelefones().stream().map(telefone -> telefone.getId().toString()).toList()    
    );
    }
}