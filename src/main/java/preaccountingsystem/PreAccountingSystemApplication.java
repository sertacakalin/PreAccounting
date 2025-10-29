package preaccountingsystem;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;
import preaccountingsystem.entity.Role;
import preaccountingsystem.entity.User;
import preaccountingsystem.repository.UserRepository;

@SpringBootApplication
public class PreAccountingSystemApplication {

    public static void main(String[] args) {
        SpringApplication.run(PreAccountingSystemApplication.class, args);
    }

    @Bean
    public CommandLineRunner commandLineRunner(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            User adminUser = userRepository.findByUsername("admin")
                    .orElse(User.builder().username("admin").build());

            adminUser.setPassword(passwordEncoder.encode("admin123"));
            adminUser.setRole(Role.ADMIN);

            userRepository.save(adminUser);
            System.out.println("Admin user ensured to exist with username 'admin' and password 'admin123'");
        };
    }
}
