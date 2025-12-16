package preaccountingsystem.repository;

import preaccountingsystem.entity.Product;
import preaccountingsystem.entity.ProductType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    Optional<Product> findByCode(String code);

    List<Product> findByType(ProductType type);

    List<Product> findByActive(Boolean active);

    List<Product> findByCategoryId(Long categoryId);

    boolean existsByCode(String code);

    List<Product> findByNameContainingIgnoreCase(String name);
}
