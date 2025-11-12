package preaccountingsystem.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AIReportResponse {

    private String raporTuru;
    private String markdownRapor;
    private String jsonOzet;
    private boolean basarili;
    private String hata;
}
