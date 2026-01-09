package preaccountingsystem;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;
import preaccountingsystem.entity.*;
import preaccountingsystem.repository.CategoryRepository;
import preaccountingsystem.repository.CustomerRepository;
import preaccountingsystem.repository.UserRepository;

@Slf4j
@SpringBootApplication
public class PreAccountingSystemApplication {

    public static void main(String[] args) {
        SpringApplication.run(PreAccountingSystemApplication.class, args);
    }

    @Bean
    public CommandLineRunner commandLineRunner(
            UserRepository userRepository,
            CustomerRepository customerRepository,
            CategoryRepository categoryRepository,
            PasswordEncoder passwordEncoder,
            preaccountingsystem.service.SystemSettingsService systemSettingsService) {
        return args -> {
            // 1. Create Admin User
            User adminUser = userRepository.findByUsername("admin")
                    .orElse(User.builder().username("admin").build());

            adminUser.setPassword(passwordEncoder.encode("admin123"));
            adminUser.setRole(Role.ADMIN);

            userRepository.save(adminUser);
            log.info("Admin user ensured to exist with username 'admin' and password 'admin123'");

            // 2. Create Demo Customer User
            User customerUser = userRepository.findByUsername("testcustomer").orElse(null);

            if (customerUser == null) {
                customerUser = User.builder()
                        .username("testcustomer")
                        .password(passwordEncoder.encode("password123"))
                        .role(Role.CUSTOMER)
                        .build();
                customerUser = userRepository.save(customerUser);
                log.info("Demo customer user created with username 'testcustomer' and password 'password123'");
            }

            // 3. Create Demo Company (Customer entity) if not exists
            Customer demoCompany = customerUser.getCustomer();

            if (demoCompany == null) {
                demoCompany = Customer.builder()
                        .name("Demo Company Inc.")
                        .email("demo@example.com")
                        .phone("+1234567890")
                        .taxNo("TAX123456789")
                        .address("123 Demo Street, Demo City, DC 12345")
                        .status(CompanyStatus.ACTIVE)
                        .user(customerUser)
                        .build();
                demoCompany = customerRepository.save(demoCompany);

                customerUser.setCustomer(demoCompany);
                userRepository.save(customerUser);
                log.info("Demo company created and linked to testcustomer user");
            }

            // 4. Create Default Categories if they don't exist
            long categoryCount = categoryRepository.count();

            if (categoryCount == 0) {
                // Income Categories
                createCategory(categoryRepository, demoCompany, "Sales Revenue", CategoryType.INCOME);
                createCategory(categoryRepository, demoCompany, "Consulting Services", CategoryType.INCOME);
                createCategory(categoryRepository, demoCompany, "Product Sales", CategoryType.INCOME);
                createCategory(categoryRepository, demoCompany, "Other Income", CategoryType.INCOME);

                // Expense Categories
                createCategory(categoryRepository, demoCompany, "Rent", CategoryType.EXPENSE);
                createCategory(categoryRepository, demoCompany, "Utilities", CategoryType.EXPENSE);
                createCategory(categoryRepository, demoCompany, "Salaries", CategoryType.EXPENSE);
                createCategory(categoryRepository, demoCompany, "Office Supplies", CategoryType.EXPENSE);
                createCategory(categoryRepository, demoCompany, "Marketing", CategoryType.EXPENSE);
                createCategory(categoryRepository, demoCompany, "Travel", CategoryType.EXPENSE);
                createCategory(categoryRepository, demoCompany, "Software & Subscriptions", CategoryType.EXPENSE);
                createCategory(categoryRepository, demoCompany, "Other Expenses", CategoryType.EXPENSE);

                log.info("Default income and expense categories created");
            }

            // 5. Initialize system settings
            systemSettingsService.initializeDefaultSettings();
            log.info("System settings initialized");
        };
    }

    private void createCategory(CategoryRepository categoryRepository, Customer company, String name, CategoryType type) {
        Category category = Category.builder()
                .name(name)
                .type(type)
                .company(company)
                .active(true)
                .build();
        categoryRepository.save(category);
    }
}
