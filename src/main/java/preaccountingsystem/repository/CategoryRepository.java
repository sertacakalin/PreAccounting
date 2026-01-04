package preaccountingsystem.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import preaccountingsystem.entity.Category;
import preaccountingsystem.entity.CategoryType;

import java.util.List;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    List<Category> findByCompanyIdAndType(Long companyId, CategoryType type);

    List<Category> findByCompanyId(Long companyId);
}
