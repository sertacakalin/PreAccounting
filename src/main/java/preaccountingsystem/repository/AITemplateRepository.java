package preaccountingsystem.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import preaccountingsystem.entity.AITemplate;

import java.util.List;

@Repository
public interface AITemplateRepository extends JpaRepository<AITemplate, Long> {
    List<AITemplate> findByActiveTrue();
}
