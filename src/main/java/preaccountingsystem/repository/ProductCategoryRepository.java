package preaccountingsystem.repository;

import preaccountingsystem.entity.ProductCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductCategoryRepository extends JpaRepository<ProductCategory, Long> {

    Optional<ProductCategory> findByCode(String code);

    List<ProductCategory> findByActive(Boolean active);

    boolean existsByCode(String code);
}
