package armas.services;

import io.quarkus.mailer.Mail;
import io.quarkus.mailer.Mailer;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

@ApplicationScoped
public class EmailService {

    @Inject
    Mailer mailer;

    public void enviarEmailRecuperacao(String destinatario, String token) {


        String conteudo = """
            Olá!

            Você solicitou recuperação de senha.

            Utilize o token abaixo para redefinir sua senha:

            %s

            Caso não tenha solicitado, ignore este email.
            """.formatted(token);

        mailer.send(
            Mail.withText(
                destinatario,
                "Recuperação de senha",
                conteudo
            )
        );
    }
}