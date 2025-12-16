package preaccountingsystem.repository;

import preaccountingsystem.entity.Unit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UnitRepository extends JpaRepository<Unit, Long> {

    Optional<Unit> findByCode(String code);

    List<Unit> findByActive(Boolean active);

    boolean existsByCode(String code);
}
