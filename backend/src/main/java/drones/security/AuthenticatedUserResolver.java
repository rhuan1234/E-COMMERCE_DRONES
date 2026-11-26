package drones.security;

import java.util.Optional;
import java.util.Set;

import org.eclipse.microprofile.jwt.JsonWebToken;

import drones.exception.UnauthorizedException;
import io.quarkus.security.identity.SecurityIdentity;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

/**
 * Resolve o usuário autenticado a partir do SecurityIdentity (OIDC/Keycloak ou @TestSecurity).
 */
@ApplicationScoped
public class AuthenticatedUserResolver {

    @Inject
    SecurityIdentity securityIdentity;

    public String getLogin() {
        if (!isAuthenticated() || securityIdentity.getPrincipal() == null) {
            throw new UnauthorizedException("Usuário não autenticado");
        }
        String login = securityIdentity.getPrincipal().getName();
        if (login == null || login.isBlank()) {
            throw new UnauthorizedException("Usuário não autenticado");
        }
        return login;
    }

    public Optional<String> getKeycloakId() {
        if (!isAuthenticated()) {
            return Optional.empty();
        }
        if (securityIdentity.getPrincipal() instanceof JsonWebToken jwt) {
            String subject = jwt.getSubject();
            if (subject != null && !subject.isBlank()) {
                return Optional.of(subject);
            }
        }
        return Optional.empty();
    }

    public Set<String> getRoles() {
        if (!isAuthenticated()) {
            return Set.of();
        }
        return securityIdentity.getRoles();
    }

    public boolean isAuthenticated() {
        return securityIdentity != null && !securityIdentity.isAnonymous();
    }
}
