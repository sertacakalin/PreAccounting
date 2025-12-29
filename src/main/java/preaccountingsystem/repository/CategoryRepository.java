package preaccountingsystem.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import preaccountingsystem.entity.Category;
import preaccountingsystem.entity.CategoryType;

import java.util.List;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    List<Category> findByType(CategoryType type);
    List<Category> findByTypeAndActiveTrue(CategoryType type);
}
