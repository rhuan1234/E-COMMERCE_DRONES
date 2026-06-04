package armas.model.usuario;

import java.util.ArrayList;
import java.util.List;

import armas.model.fornecedor.Endereco;
import armas.model.fornecedor.Telefone;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

@Entity
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String login;

    @Column(name = "senha_hash", nullable = false)
    private String senhaHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Perfil perfil;

    @NotBlank(message = "Email é obrigatório")
    @Email(message = "Email inválido")
    @Column(unique = true)
    private String email;


    private String nomeCompleto;

    @Pattern(regexp = "(\\d{3}\\.\\d{3}\\.\\d{3}-\\d{2}|\\d{11})", 
             message = "CPF deve estar no formato XXX.XXX.XXX-XX ou conter apenas 11 dígitos")
    @Column(unique = true)
    private String cpf;

    @OneToMany(
        cascade = CascadeType.ALL,
        orphanRemoval = true
    )
    @JoinColumn(name = "usuario_id")
    private List<Endereco> enderecos = new ArrayList<>();

    private Long enderecoPrincipalId;

    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "telefone_id")
    private Telefone telefone;

    private String registroAtirador;

    public Usuario() {
        
    }


    public String getLogin() {
        return login;
    }

    public void setLogin(String login) {
        this.login = login;
    }

    public String getSenhaHash() {
        return senhaHash;
    }

    public void setSenhaHash(String senhaHash) {
        this.senhaHash = senhaHash;
    }

    public Perfil getPerfil() {
        return perfil;
    }

    public void setPerfil(Perfil perfil) {
        this.perfil = perfil;
    }

    public Long getId() {
        return id;
    }

    public String getNomeCompleto() {
        return nomeCompleto;
    }

    public void setNomeCompleto(String nomeCompleto) {
        this.nomeCompleto = nomeCompleto;
    }

    public String getCpf() {
        return cpf;
    }

    public void setCpf(String cpf) {
        this.cpf = cpf;
    }

    public List<Endereco> getEnderecos() {
        return enderecos;
    }
    public void setEnderecos(List<Endereco> enderecos) {
        this.enderecos = enderecos;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Long getEnderecoPrincipalId() {
        return enderecoPrincipalId;
    }
    public void setEnderecoPrincipalId(Long enderecoPrincipalId) {
        this.enderecoPrincipalId = enderecoPrincipalId;
    }


    public Telefone getTelefone() {
        return telefone;
    }


    public void setTelefone(Telefone telefone) {
        this.telefone = telefone;
    }


    public String getRegistroAtirador() {
        return registroAtirador;
    }


    public void setRegistroAtirador(String registroAtirador) {
        this.registroAtirador = registroAtirador;
    }
    
    

}